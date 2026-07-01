-- Migration: Create saved_routes table

CREATE TABLE saved_routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    route_id TEXT NOT NULL,
    route_type TEXT NOT NULL CHECK (route_type IN ('bus', 'metro')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, route_id, route_type)
);

-- Enable RLS
ALTER TABLE saved_routes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own saved routes
CREATE POLICY "Users can view their own saved routes"
ON saved_routes FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own saved routes
CREATE POLICY "Users can insert their own saved routes"
ON saved_routes FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own saved routes
CREATE POLICY "Users can delete their own saved routes"
ON saved_routes FOR DELETE
USING (auth.uid() = user_id);
