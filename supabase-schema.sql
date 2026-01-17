-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- First, drop existing table if it exists
DROP TABLE IF EXISTS job_sources;

-- Create job_sources table
CREATE TABLE job_sources (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  name TEXT NOT NULL,
  favicon TEXT,
  notes TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  is_rss_feed BOOLEAN DEFAULT FALSE,
  is_favorite BOOLEAN DEFAULT FALSE,
  last_opened TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE job_sources ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read (including anonymous users)
CREATE POLICY "Anyone can read job_sources"
  ON job_sources
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert
CREATE POLICY "Authenticated users can insert"
  ON job_sources
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Authenticated users can update
CREATE POLICY "Authenticated users can update"
  ON job_sources
  FOR UPDATE
  TO authenticated
  USING (true);

-- Policy: Authenticated users can delete
CREATE POLICY "Authenticated users can delete"
  ON job_sources
  FOR DELETE
  TO authenticated
  USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER job_sources_updated_at
  BEFORE UPDATE ON job_sources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
