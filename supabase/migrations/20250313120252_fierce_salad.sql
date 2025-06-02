/*
  # Add locations table and relations

  1. New Tables
    - `locations`
      - `id` (uuid, primary key)
      - `name` (text) - Name of the location
      - `address` (text) - Rich text address
      - `phone` (text) - Phone number
      - `email` (text) - Email address
      - `directions` (text) - Rich text directions
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `location_devices`
      - `id` (uuid, primary key)
      - `location_id` (uuid, foreign key)
      - `device_id` (uuid, foreign key)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for all operations
*/

-- Create locations table
CREATE TABLE locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  directions text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create location_devices junction table
CREATE TABLE location_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid REFERENCES locations(id) ON DELETE CASCADE,
  device_id uuid REFERENCES devices(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(location_id, device_id)
);

-- Enable RLS
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_devices ENABLE ROW LEVEL SECURITY;

-- Create policies for locations
CREATE POLICY "Enable read access for all users" ON locations
    FOR SELECT TO public USING (true);

CREATE POLICY "Enable insert access for all users" ON locations
    FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON locations
    FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for all users" ON locations
    FOR DELETE TO public USING (true);

-- Create policies for location_devices
CREATE POLICY "Enable read access for all users" ON location_devices
    FOR SELECT TO public USING (true);

CREATE POLICY "Enable insert access for all users" ON location_devices
    FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON location_devices
    FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for all users" ON location_devices
    FOR DELETE TO public USING (true);

-- Add updated_at trigger for locations
CREATE TRIGGER update_locations_updated_at
    BEFORE UPDATE ON locations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();