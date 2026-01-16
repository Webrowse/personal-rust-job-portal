-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

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

-- Policy: Anyone can read
CREATE POLICY "Anyone can read job_sources"
  ON job_sources
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy: Only authenticated admin can insert
CREATE POLICY "Admin can insert job_sources"
  ON job_sources
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' = current_setting('app.admin_email', true));

-- Policy: Only authenticated admin can update
CREATE POLICY "Admin can update job_sources"
  ON job_sources
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'email' = current_setting('app.admin_email', true));

-- Policy: Only authenticated admin can delete
CREATE POLICY "Admin can delete job_sources"
  ON job_sources
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'email' = current_setting('app.admin_email', true));

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
