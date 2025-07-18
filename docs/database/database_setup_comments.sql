-- SQL script to create the comments table for NYC Feral Bee Survey
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS comments (
  id BIGSERIAL PRIMARY KEY,
  marker_id BIGINT NOT NULL,
  comment_text TEXT NOT NULL,
  author_name VARCHAR(255) DEFAULT 'Anonymous',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create an index on marker_id for faster queries
CREATE INDEX IF NOT EXISTS idx_comments_marker_id ON comments(marker_id);

-- Create an index on timestamp for ordered retrieval
CREATE INDEX IF NOT EXISTS idx_comments_timestamp ON comments(timestamp);

-- Add Row Level Security (RLS) - optional but recommended
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read comments (adjust as needed)
CREATE POLICY comments_select_policy 
ON comments FOR SELECT 
USING (true);

-- Create a policy that allows anyone to insert comments (adjust as needed)
CREATE POLICY comments_insert_policy 
ON comments FOR INSERT 
WITH CHECK (true);

-- Optional: Add foreign key constraint if you want referential integrity
-- (Uncomment the line below if your markers table is set up properly)
-- ALTER TABLE comments ADD CONSTRAINT fk_comments_marker_id FOREIGN KEY (marker_id) REFERENCES markers(id) ON DELETE CASCADE;
