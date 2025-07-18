-- SQL script to add status system to NYC Feral Bee Survey
-- Run this in your Supabase SQL Editor

-- Add status column to existing markers table
ALTER TABLE markers ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Unverified';

-- Update any existing markers to have default status
UPDATE markers SET status = 'Unverified' WHERE status IS NULL;

-- Optional: Add a check constraint to ensure only valid statuses
-- ALTER TABLE markers ADD CONSTRAINT valid_status 
-- CHECK (status IN ('Unverified', 'Active', 'Checked', 'Gone', 'Removed'));

-- Add index for filtering by status
CREATE INDEX IF NOT EXISTS idx_markers_status ON markers(status);
