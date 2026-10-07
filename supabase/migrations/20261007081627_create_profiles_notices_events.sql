/*
# Create profiles, notices, and events tables

## Overview
This migration sets up the core schema for the Digital Notice Priority & AI Event Management System.

## New Tables

### 1. profiles
- Links to Supabase auth.users via user_id
- `user_id` (uuid, FK to auth.users, unique)
- `full_name` (text) - display name
- `role` (text) - 'student', 'faculty', or 'parent'
- `department` (text) - e.g. "Computer Science", "Electronics"
- `phone` (text, nullable)
- `created_at` (timestamptz)

### 2. events
- `id` (uuid PK)
- `title` (text, not null)
- `description` (text, not null)
- `event_type` (text) - college, inter_college, department, sports
- `department` (text, nullable)
- `location` (text, nullable)
- `start_date` (timestamptz, not null)
- `end_date` (timestamptz, nullable)
- `created_by` (uuid, FK to auth.users)
- `created_by_name` (text)
- `ai_suggested` (boolean, default false)
- `created_at` (timestamptz, default now())

### 3. notices
- `id` (uuid PK)
- `title` (text, not null)
- `description` (text, not null)
- `category` (text) - general, academic, department, exam, sports, event, emergency, placement
- `department` (text, nullable)
- `priority` (text) - low, medium, high, urgent
- `posted_by` (uuid, FK to auth.users) - the user who created the notice
- `posted_by_name` (text) - denormalized name for display
- `posted_by_role` (text) - denormalized role for display
- `target_audience` (text) - all_students, department_students, faculty, parents, everyone
- `attachment_url` (text, nullable)
- `attachment_name` (text, nullable)
- `expiry_date` (timestamptz, nullable)
- `event_id` (uuid, nullable, FK to events) - link notice to an event if applicable
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

## Security
- RLS enabled on all tables.
- profiles: users can read all profiles, update only their own.
- notices: all authenticated users can read; only faculty (role='faculty') can insert; faculty can update/delete notices they created.
- events: all authenticated users can read; faculty can insert/update/delete events they created.
*/

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('student', 'faculty', 'parent')),
  department text NOT NULL DEFAULT 'General',
  phone text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_read_all" ON profiles;
CREATE POLICY "profiles_read_all" ON profiles FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- EVENTS TABLE
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  event_type text NOT NULL DEFAULT 'college' CHECK (event_type IN ('college', 'inter_college', 'department', 'sports')),
  department text,
  location text,
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_by_name text NOT NULL DEFAULT '',
  ai_suggested boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "events_read_all" ON events;
CREATE POLICY "events_read_all" ON events FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "events_insert_faculty" ON events;
CREATE POLICY "events_insert_faculty" ON events FOR INSERT
TO authenticated WITH CHECK (
  auth.uid() = created_by
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'faculty'
  )
);

DROP POLICY IF EXISTS "events_update_own" ON events;
CREATE POLICY "events_update_own" ON events FOR UPDATE
TO authenticated
USING (
  auth.uid() = created_by
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'faculty'
  )
)
WITH CHECK (
  auth.uid() = created_by
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'faculty'
  )
);

DROP POLICY IF EXISTS "events_delete_own" ON events;
CREATE POLICY "events_delete_own" ON events FOR DELETE
TO authenticated USING (
  auth.uid() = created_by
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'faculty'
  )
);

-- NOTICES TABLE (created after events so the FK reference works)
CREATE TABLE IF NOT EXISTS notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'academic', 'department', 'exam', 'sports', 'event', 'emergency', 'placement')),
  department text,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  posted_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  posted_by_name text NOT NULL DEFAULT '',
  posted_by_role text NOT NULL DEFAULT '',
  target_audience text NOT NULL DEFAULT 'everyone' CHECK (target_audience IN ('all_students', 'department_students', 'faculty', 'parents', 'everyone')),
  attachment_url text,
  attachment_name text,
  expiry_date timestamptz,
  event_id uuid REFERENCES events(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notices_read_all" ON notices;
CREATE POLICY "notices_read_all" ON notices FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "notices_insert_faculty" ON notices;
CREATE POLICY "notices_insert_faculty" ON notices FOR INSERT
TO authenticated WITH CHECK (
  auth.uid() = posted_by
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'faculty'
  )
);

DROP POLICY IF EXISTS "notices_update_own" ON notices;
CREATE POLICY "notices_update_own" ON notices FOR UPDATE
TO authenticated
USING (
  auth.uid() = posted_by
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'faculty'
  )
)
WITH CHECK (
  auth.uid() = posted_by
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'faculty'
  )
);

DROP POLICY IF EXISTS "notices_delete_own" ON notices;
CREATE POLICY "notices_delete_own" ON notices FOR DELETE
TO authenticated USING (
  auth.uid() = posted_by
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'faculty'
  )
);

-- updated_at trigger for notices
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_notices_updated_at ON notices;
CREATE TRIGGER update_notices_updated_at BEFORE UPDATE ON notices
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notices_created_at ON notices (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notices_priority ON notices (priority);
CREATE INDEX IF NOT EXISTS idx_notices_category ON notices (category);
CREATE INDEX IF NOT EXISTS idx_notices_department ON notices (department);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events (start_date);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events (event_type);
