-- SQL script to add photo support to NYC Feral Bee Survey
-- Run this in your Supabase SQL Editor

-- Add photo_url column to existing markers table
ALTER TABLE markers ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Create a storage bucket for bee photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('bee-photos', 'bee-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for the bee-photos bucket

-- Policy to allow anyone to view photos
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'bee-photos');

-- Policy to allow anyone to upload photos
CREATE POLICY "Anyone can upload bee photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'bee-photos');

-- Policy to allow users to update their own photos (optional for now)
CREATE POLICY "Anyone can update bee photos" ON storage.objects
FOR UPDATE USING (bucket_id = 'bee-photos');

-- Policy to allow users to delete photos (optional for now)
CREATE POLICY "Anyone can delete bee photos" ON storage.objects
FOR DELETE USING (bucket_id = 'bee-photos');
