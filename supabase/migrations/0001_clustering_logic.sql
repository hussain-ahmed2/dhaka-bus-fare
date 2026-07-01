-- We will use a PostgreSQL function to process raw_user_locations and update active_trains.
-- This function can be called via pg_cron every few seconds.

-- Ensure pg_cron is enabled (this requires superuser on Supabase, usually enabled via the dashboard)
create extension if not exists pg_cron;

create or replace function process_metro_trains()
returns void as $$
declare
  cluster_record record;
  line_record record;
  train_uuid text;
begin
  -- 1. Create a temporary table with recent, moving users
  -- We assume users moving > 4 m/s (14.4 km/h) might be on a train,
  -- or those who explicitly set is_on_train = true.
  create temp table if not exists recent_users on commit drop as
  select 
    id, 
    session_id, 
    location, 
    speed, 
    heading
  from public.raw_user_locations
  where created_at >= now() - interval '30 seconds'
    and (speed > 4 or is_on_train = true);

  -- 2. Cluster the users using PostGIS ST_ClusterDBSCAN
  -- eps: ~100 meters (approx 0.001 degrees)
  -- minpoints: 1 (even a single user can represent a train if they are moving fast enough)
  create temp table if not exists clustered_users on commit drop as
  select 
    session_id,
    location,
    speed,
    heading,
    ST_ClusterDBSCAN(location, eps := 0.001, minpoints := 1) over () as cluster_id
  from recent_users;

  -- 3. Clear existing active trains that haven't been updated recently to avoid ghosts
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
      -- Generate a deterministic train ID based on the cluster's location and direction
      -- This ensures we update the same train as it moves, rather than creating new ones
      -- In a production system, we'd use a tracking algorithm (like Kalman filter) to track objects over time.
      -- For simplicity, we use a hash of the nearest station/segment or just a persistent ID.
      -- Here we'll generate a UUID for the train, but in reality we need to associate this cluster
      -- with an existing active train if they are close.

      -- Try to find an existing active train within 500 meters moving in the same direction
      select train_id into train_uuid
      from public.active_trains
      where current_location <-> cluster_record.centroid < 0.005 -- ~500m
        and line_id = line_record.id
        and abs(direction - coalesce(cluster_record.avg_heading, direction)) < 45 -- Moving same way
      order by current_location <-> cluster_record.centroid
      limit 1;

      if train_uuid is null then
        -- New train detected
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
        -- Update existing train
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

-- Schedule the processing function to run every 10 seconds via pg_cron
-- Note: pg_cron requires the cron extension to be enabled in Supabase,
-- and scheduling tasks usually runs at a minimum of 1 minute intervals using standard cron.
-- For true 10-second intervals in Supabase, Edge Functions triggered by a dedicated 
-- external poller or a persistent worker are recommended. 
-- However, we will set up the pg_cron for 1-minute intervals as a baseline.
select cron.schedule('process-metro-trains-every-minute', '* * * * *', 'select process_metro_trains()');
