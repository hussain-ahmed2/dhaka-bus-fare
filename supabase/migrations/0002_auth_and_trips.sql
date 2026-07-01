-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- 2. User Trips Table
create table if not exists public.user_trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  start_location geometry(Point, 4326),
  end_location geometry(Point, 4326),
  start_time timestamp with time zone default timezone('utc'::text, now()) not null,
  end_time timestamp with time zone,
  status text default 'in_progress', -- 'in_progress', 'completed'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.user_trips enable row level security;
create policy "Users can view own trips." on public.user_trips for select using (auth.uid() = user_id);
create policy "Users can insert own trips." on public.user_trips for insert with check (auth.uid() = user_id);
create policy "Users can update own trips." on public.user_trips for update using (auth.uid() = user_id);

-- 3. Update raw_user_locations to link to users
alter table public.raw_user_locations add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.raw_user_locations add column if not exists is_valid boolean default true;

-- Update RLS for raw_user_locations to allow authenticated users to insert with their user_id
create policy "Allow authenticated inserts to raw locations" 
on public.raw_user_locations for insert 
to authenticated
with check (true);

-- 4. Geofencing Validation (Trigger)
-- We check if the point is within 50 meters (approx 0.0005 degrees) of any metro_lines path.
create or replace function validate_location_on_track()
returns trigger as $$
declare
  is_near boolean;
begin
  select exists (
    select 1 
    from public.metro_lines 
    where ST_DWithin(NEW.location, path, 0.0005)
  ) into is_near;

  NEW.is_valid := is_near;
  
  -- We can optionally reject the insert if we don't even want to store bad data:
  -- if not is_near then return null; end if;

  return NEW;
end;
$$ language plpgsql;

create trigger validate_location_trigger
before insert on public.raw_user_locations
for each row execute function validate_location_on_track();

-- 5. Auto-create profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
