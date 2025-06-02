/*
  # Fix form submissions RLS policies

  1. Changes
    - Enable RLS on form_submissions table
    - Add public access policies for all operations
    - Add indexes for performance
    - Add helpful comments

  2. Security
    - Allow public access to form submissions
    - Maintain data integrity through foreign keys
*/

-- Enable RLS on form_submissions
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read form submissions" ON form_submissions;
DROP POLICY IF EXISTS "Allow authenticated users to insert form submissions" ON form_submissions;
DROP POLICY IF EXISTS "Allow authenticated users to update form submissions" ON form_submissions;
DROP POLICY IF EXISTS "Allow authenticated users to delete form submissions" ON form_submissions;
DROP POLICY IF EXISTS "Authentifizierte Benutzer können alle form_submissions lesen" ON form_submissions;

-- Create new policies with public access
CREATE POLICY "Enable read access for all users"
ON form_submissions FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert access for all users"
ON form_submissions FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Enable update access for all users"
ON form_submissions FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete access for all users"
ON form_submissions FOR DELETE
TO public
USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_form_submissions_appointment_id 
ON form_submissions(appointment_id);

CREATE INDEX IF NOT EXISTS idx_form_submissions_patient_id 
ON form_submissions(patient_id);

CREATE INDEX IF NOT EXISTS idx_form_submissions_form_type 
ON form_submissions(form_type);

-- Add helpful comment
COMMENT ON TABLE form_submissions IS 
'Stores form submissions with patient and appointment references';