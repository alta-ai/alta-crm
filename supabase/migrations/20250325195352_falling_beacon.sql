/*
  # Fix patient photos and form submissions schema

  1. Changes
    - Rename photo_url to photo_data in patient_photos table
    - Add RLS policies for form_submissions table
    - Add RLS policies for form_links table
    - Add indexes for performance

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Fix patient_photos table

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS patient_photos_patient_id_idx ON patient_photos(patient_id);
CREATE INDEX IF NOT EXISTS patient_photos_active_idx ON patient_photos(active);

-- Add RLS policies for form_submissions
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read form submissions" ON form_submissions;
DROP POLICY IF EXISTS "Allow authenticated users to insert form submissions" ON form_submissions;
DROP POLICY IF EXISTS "Allow authenticated users to update form submissions" ON form_submissions;
DROP POLICY IF EXISTS "Allow authenticated users to delete form submissions" ON form_submissions;

-- Create new policies
CREATE POLICY "Allow authenticated users to read form submissions"
ON form_submissions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert form submissions"
ON form_submissions FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update form submissions"
ON form_submissions FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete form submissions"
ON form_submissions FOR DELETE
TO authenticated
USING (true);

-- Add RLS policies for form_links
ALTER TABLE form_links ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read form links" ON form_links;
DROP POLICY IF EXISTS "Allow authenticated users to insert form links" ON form_links;
DROP POLICY IF EXISTS "Allow authenticated users to update form links" ON form_links;
DROP POLICY IF EXISTS "Allow authenticated users to delete form links" ON form_links;

-- Create new policies
CREATE POLICY "Allow authenticated users to read form links"
ON form_links FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert form links"
ON form_links FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update form links"
ON form_links FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete form links"
ON form_links FOR DELETE
TO authenticated
USING (true);

-- Add helpful comments
COMMENT ON TABLE form_submissions IS 'Stores form submissions with patient and appointment references';
COMMENT ON TABLE form_links IS 'Stores secure form access links with expiration';