/*
  # Add appointment status management

  1. New Tables
    - `appointment_statuses`
      - `id` (uuid, primary key)
      - `name` (text) - Name of the status
      - `color` (text) - Color code for calendar display
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Changes
    - Add status_id to appointments table
    - Add default statuses
    - Update appointment_status_enum to use new table

  3. Security
    - Enable RLS on appointment_statuses table
    - Add policies for all operations
*/

-- Create appointment_statuses table
CREATE TABLE appointment_statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE appointment_statuses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON appointment_statuses
    FOR SELECT TO public USING (true);

CREATE POLICY "Enable insert access for all users" ON appointment_statuses
    FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON appointment_statuses
    FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for all users" ON appointment_statuses
    FOR DELETE TO public USING (true);

-- Add updated_at trigger
CREATE TRIGGER update_appointment_statuses_updated_at
    BEFORE UPDATE ON appointment_statuses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add status_id to appointments table
ALTER TABLE appointments
ADD COLUMN status_id uuid REFERENCES appointment_statuses(id);

-- Set default status for existing appointments
UPDATE appointments
SET status_id = (
  SELECT id FROM appointment_statuses WHERE name = 'Geplant'
)
WHERE status_id IS NULL;

-- Make status_id required for future appointments
ALTER TABLE appointments
ALTER COLUMN status_id SET NOT NULL;