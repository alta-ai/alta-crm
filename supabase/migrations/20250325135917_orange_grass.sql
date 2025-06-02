/*
  # Add registration form tables

  1. Changes
    - Create tables if they don't exist
    - Add RLS policies
    - Add triggers and comments
    
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create tables if they don't exist
DO $$ 
BEGIN
  -- Create form_submissions table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'form_submissions') THEN
    CREATE TABLE form_submissions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      appointment_id uuid REFERENCES appointments(id) ON DELETE CASCADE,
      patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
      form_type text NOT NULL,
      form_data jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );

    -- Enable RLS
    ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

    -- Add comment
    COMMENT ON TABLE form_submissions IS 'Stores form submissions with patient and appointment references';
  END IF;

  -- Create form_links table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'form_links') THEN
    CREATE TABLE form_links (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      appointment_id uuid REFERENCES appointments(id) ON DELETE CASCADE,
      patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
      expires_at timestamptz NOT NULL,
      active boolean DEFAULT true,
      created_at timestamptz DEFAULT now()
    );

    -- Enable RLS
    ALTER TABLE form_links ENABLE ROW LEVEL SECURITY;

    -- Add comment
    COMMENT ON TABLE form_links IS 'Stores secure form access links with expiration';
  END IF;
END $$;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Authentifizierte Benutzer können alle form_submissions lesen" ON form_submissions;
  DROP POLICY IF EXISTS "Authentifizierte Benutzer können alle form_links lesen" ON form_links;
EXCEPTION
  WHEN undefined_table THEN
    NULL;
END $$;

-- Create new policies
CREATE POLICY "Authentifizierte Benutzer können alle form_submissions lesen"
  ON form_submissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authentifizierte Benutzer können alle form_links lesen"
  ON form_links FOR SELECT
  TO authenticated
  USING (true);

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_form_submissions_updated_at ON form_submissions;

-- Add updated_at trigger
CREATE TRIGGER update_form_submissions_updated_at
  BEFORE UPDATE ON form_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();