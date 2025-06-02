/*
  # Add patient photos functionality with safe table creation

  1. Changes
    - Create patient_photos table if it doesn't exist
    - Add RLS policies safely
    - Add updated_at trigger
    
  2. Security
    - Enable RLS
    - Add policies for all operations
*/

-- Safely create patient_photos table
DO $$ 
BEGIN
  -- Create table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'patient_photos') THEN
    CREATE TABLE patient_photos (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
      photo_data text NOT NULL,
      active boolean NOT NULL DEFAULT true,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );

    -- Enable RLS
    ALTER TABLE patient_photos ENABLE ROW LEVEL SECURITY;

    -- Add helpful comment
    COMMENT ON TABLE patient_photos IS 'Stores patient photos as base64 encoded strings';
  END IF;
END $$;

-- Drop existing policies if they exist
DO $$
BEGIN
  DROP POLICY IF EXISTS "Enable read access for all users" ON patient_photos;
  DROP POLICY IF EXISTS "Enable insert access for all users" ON patient_photos;
  DROP POLICY IF EXISTS "Enable update access for all users" ON patient_photos;
  DROP POLICY IF EXISTS "Enable delete access for all users" ON patient_photos;
EXCEPTION
  WHEN undefined_table THEN
    NULL;
END $$;

-- Create policies
CREATE POLICY "Enable read access for all users" ON patient_photos
    FOR SELECT TO public USING (true);

CREATE POLICY "Enable insert access for all users" ON patient_photos
    FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON patient_photos
    FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for all users" ON patient_photos
    FOR DELETE TO public USING (true);

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_patient_photos_updated_at ON patient_photos;

-- Add updated_at trigger
CREATE TRIGGER update_patient_photos_updated_at
    BEFORE UPDATE ON patient_photos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();