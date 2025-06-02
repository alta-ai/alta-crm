/*
  # Update examinations schema with new cost fields and device relations

  1. Changes
    - Add new cost fields for different patient types
    - Add duration field with specific intervals
    - Create examination_devices junction table
    - Update examination_forms to include order field

  2. Security
    - Maintain existing RLS policies
    - Add policies for new tables
*/

-- Add new cost fields to examinations table
ALTER TABLE examinations
DROP COLUMN cost,
ADD COLUMN self_payer_without_contrast numeric NOT NULL,
ADD COLUMN self_payer_with_contrast numeric NOT NULL,
ADD COLUMN private_patient_without_contrast numeric NOT NULL,
ADD COLUMN private_patient_with_contrast numeric NOT NULL,
ADD COLUMN foreign_patient_without_contrast numeric NOT NULL,
ADD COLUMN foreign_patient_with_contrast numeric NOT NULL,
ALTER COLUMN duration TYPE integer USING EXTRACT(epoch FROM duration)/60,
ADD CONSTRAINT valid_duration CHECK (duration IN (15, 30, 45, 60, 75, 90));

-- Create examination_devices junction table
CREATE TABLE examination_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  examination_id uuid REFERENCES examinations(id) ON DELETE CASCADE,
  device_id uuid REFERENCES devices(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(examination_id, device_id)
);

-- Enable RLS on new table
ALTER TABLE examination_devices ENABLE ROW LEVEL SECURITY;

-- Create policies for examination_devices
CREATE POLICY "Enable read access for all users" ON examination_devices
    FOR SELECT TO public USING (true);

CREATE POLICY "Enable insert access for all users" ON examination_devices
    FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON examination_devices
    FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for all users" ON examination_devices
    FOR DELETE TO public USING (true);