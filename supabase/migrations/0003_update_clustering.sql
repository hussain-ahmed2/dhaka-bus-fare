-- 6. Update process_metro_trains to only use valid locations
create or replace function process_metro_trains()
returns void as $$
declare
  cluster_record record;
  line_record record;
  train_uuid text;
begin
  -- 1. Create a temporary table with recent, moving users that are VALID (on track)
  create temp table if not exists recent_users on commit drop as
  select 
    id, 
    session_id, 
    location, 
    speed, 
    heading
  from public.raw_user_locations
  where created_at >= now() - interval '30 seconds'
    and is_valid = true -- NEW: Only process locations near the track
    and (speed > 4 or is_on_train = true);

  -- 2. Cluster the users using PostGIS ST_ClusterDBSCAN
  create temp table if not exists clustered_users on commit drop as
  select 
    session_id,
    location,
    speed,
    heading,
    ST_ClusterDBSCAN(location, eps := 0.001, minpoints := 1) over () as cluster_id
  from recent_users;

  -- 3. Clear existing active trains that haven't been updated recently
  delete from public.active_trains
  where last_updated < now() - interval '2 minutes';

  -- 4. Process each cluster
  for cluster_record in 
    select 
      cluster_id, 
      ST_Centroid(ST_Collect(location)) as centroid,
      avg(speed) as avg_speed,
      avg(heading) as avg_heading,
      count(*) as user_count
    from clustered_users
    group by cluster_id
  loop
    -- Snap the centroid to the nearest metro line
    select id, ST_ClosestPoint(path, cluster_record.centroid) as snapped_location
    into line_record
    from public.metro_lines
    order by path <-> cluster_record.centroid
    limit 1;

    if found then
      -- Try to find an existing active train within 500 meters moving in the same direction
      select train_id into train_uuid
      from public.active_trains
      where current_location <-> cluster_record.centroid < 0.005
        and line_id = line_record.id
        and abs(direction - coalesce(cluster_record.avg_heading, direction)) < 45
      order by current_location <-> cluster_record.centroid
      limit 1;

      if train_uuid is null then
        train_uuid := gen_random_uuid()::text;
        insert into public.active_trains (train_id, line_id, current_location, direction, speed, last_updated)
        values (
          train_uuid, 
          line_record.id, 
          line_record.snapped_location, 
          cluster_record.avg_heading, 
          cluster_record.avg_speed, 
          now()
        );
      else
        update public.active_trains
        set 
          current_location = line_record.snapped_location,
          direction = cluster_record.avg_heading,
          speed = cluster_record.avg_speed,
          last_updated = now()
        where train_id = train_uuid;
      end if;
    end if;
  end loop;
end;
$$ language plpgsql;
