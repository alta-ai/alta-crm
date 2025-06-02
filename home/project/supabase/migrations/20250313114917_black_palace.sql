/*
  # Update devices table RLS policies

  1. Changes
    - Add RLS policies for both authenticated and anon roles
    - Ensure full access for all operations

  2. Security
    - Enable RLS on devices table
    - Add policies for both authenticated and anon users
*/

-- Create devices table if it doesn't exist
CREATE TABLE IF NOT EXISTS devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and create new ones
DO $$ 
BEGIN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Allow full access for authenticated users" ON devices;
    DROP POLICY IF EXISTS "Allow full access for anon users" ON devices;
    
    -- Create new policies for both authenticated and anon users
    CREATE POLICY "Allow full access for authenticated users"
      ON devices
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);

    CREATE POLICY "Allow full access for anon users"
      ON devices
      FOR ALL
      TO anon
      USING (true)
      WITH CHECK (true);
END $$;

-- Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS update_devices_updated_at ON devices;
CREATE TRIGGER update_devices_updated_at
  BEFORE UPDATE ON devices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();