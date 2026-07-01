-- Enable PostGIS for geospatial features
create extension if not exists postgis with schema extensions;

-- Table for Metro Lines (the physical tracks)
create table if not exists public.metro_lines (
  id uuid primary key default gen_random_uuid(),
  name text not null, -- e.g., 'Line 6'
  path geometry(LineString, 4326) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table for Raw User Locations (highly ephemeral)
-- We use this to collect data, then process it to find trains.
create table if not exists public.raw_user_locations (
  id uuid primary key default gen_random_uuid(),
  session_id text not null, -- Anonymized identifier for a user's trip
  location geometry(Point, 4326) not null,
  speed numeric, -- Speed in m/s (from Geolocation API)
  heading numeric, -- Direction of travel (from Geolocation API)
  is_on_train boolean default false, -- Explicit toggle or inferred
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for spatial queries on raw locations
create index if not exists raw_user_locations_location_idx on public.raw_user_locations using gist(location);

-- Table for Active Trains (Aggregated from raw_user_locations)
-- This is what the frontend subscribes to via Realtime.
create table if not exists public.active_trains (
  train_id text primary key, -- Could be inferred or an arbitrary ID
  line_id uuid references public.metro_lines(id),
  current_location geometry(Point, 4326) not null,
  direction numeric, -- Degrees (0-360)
  speed numeric, -- Current estimated speed in m/s
  last_updated timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for spatial queries on active trains
create index if not exists active_trains_location_idx on public.active_trains using gist(current_location);

-- Enable Supabase Realtime for the active_trains table
alter publication supabase_realtime add table public.active_trains;

-- Row Level Security (RLS) setup
-- 1. Anyone can insert raw locations (anonymously)
alter table public.raw_user_locations enable row level security;
create policy "Allow anonymous inserts to raw locations" 
on public.raw_user_locations for insert 
to anon
with check (true);

-- 2. Anyone can read active trains
alter table public.active_trains enable row level security;
create policy "Allow anonymous read access to active trains" 
on public.active_trains for select 
to anon
using (true);

-- Function to clean up old raw data (e.g. older than 5 minutes)
-- Can be called via pg_cron or Supabase Edge Functions
create or replace function clean_old_locations()
returns void as $$
begin
  delete from public.raw_user_locations
  where created_at < now() - interval '5 minutes';
end;
$$ language plpgsql;
