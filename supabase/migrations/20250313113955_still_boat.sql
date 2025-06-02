/*
  # Create examination management tables

  1. New Tables
    - `devices`
      - `id` (uuid, primary key)
      - `name` (text) - Name of the device (e.g., "MRT Skyra")
      - `type` (text) - Type of device (e.g., "MRT", "CT")
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `forms`
      - `id` (uuid, primary key)
      - `name` (text) - Name of the form
      - `description` (text) - Description of the form
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `examinations`
      - `id` (uuid, primary key)
      - `name` (text) - Name of the examination
      - `description` (text) - Description of the examination
      - `cost` (numeric) - Cost of the examination
      - `duration` (interval) - Duration of the examination
      - `device_id` (uuid, foreign key) - Reference to devices table
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `examination_forms`
      - `id` (uuid, primary key)
      - `examination_id` (uuid, foreign key)
      - `form_id` (uuid, foreign key)
      - `order` (integer) - Order in which forms should be presented
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated admin users
*/

-- Create devices table
CREATE TABLE devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access for authenticated users"
  ON devices
  FOR ALL
  TO authenticated
  USING (true);

-- Create forms table
CREATE TABLE forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access for authenticated users"
  ON forms
  FOR ALL
  TO authenticated
  USING (true);

-- Create examinations table
CREATE TABLE examinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  cost numeric NOT NULL,
  duration interval NOT NULL,
  device_id uuid REFERENCES devices(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE examinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access for authenticated users"
  ON examinations
  FOR ALL
  TO authenticated
  USING (true);

-- Create examination_forms table
CREATE TABLE examination_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  examination_id uuid REFERENCES examinations(id) ON DELETE CASCADE,
  form_id uuid REFERENCES forms(id) ON DELETE CASCADE,
  "order" integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(examination_id, form_id)
);

ALTER TABLE examination_forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access for authenticated users"
  ON examination_forms
  FOR ALL
  TO authenticated
  USING (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_devices_updated_at
  BEFORE UPDATE ON devices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forms_updated_at
  BEFORE UPDATE ON forms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_examinations_updated_at
  BEFORE UPDATE ON examinations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();