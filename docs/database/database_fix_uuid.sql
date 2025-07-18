-- SQL script to fix UUID column types in NYC Feral Bee Survey
-- Run this in your Supabase SQL Editor to ensure all ID columns are proper UUIDs

-- First, let's see the current column types
-- You can run these SELECT statements individually to check your current schema

-- Check markers table structure
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'markers' AND table_schema = 'public';

-- Check comments table structure  
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'comments' AND table_schema = 'public';

-- If the ID columns are not UUID type, run these ALTER statements:

-- Fix markers table ID column (if it's not already UUID)
-- ALTER TABLE markers ALTER COLUMN id SET DATA TYPE UUID USING id::UUID;

-- Fix comments table marker_id column (if it's not already UUID)
-- ALTER TABLE comments ALTER COLUMN marker_id SET DATA TYPE UUID USING marker_id::UUID;

-- Add proper constraints
-- ALTER TABLE comments DROP CONSTRAINT IF EXISTS fk_comments_marker_id;
-- ALTER TABLE comments ADD CONSTRAINT fk_comments_marker_id 
--   FOREIGN KEY (marker_id) REFERENCES markers(id) ON DELETE CASCADE;

-- Create indexes for performance
-- CREATE INDEX IF NOT EXISTS idx_markers_id ON markers USING btree (id);
-- CREATE INDEX IF NOT EXISTS idx_comments_marker_id ON comments USING btree (marker_id);

-- Note: Uncomment and run the statements above one by one after checking your current schema
-- The commented out SELECT statements will show you the current column types
