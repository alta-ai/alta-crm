/*
  # Add appointments table and relations

  1. New Tables
    - `appointments`
      - `id` (uuid, primary key)
      - `location_id` (uuid, foreign key) - Reference to locations
      - `device_id` (uuid, foreign key) - Reference to devices
      - `examination_id` (uuid, foreign key) - Reference to examinations
      - `start_time` (timestamptz) - Start time of the appointment
      - `end_time` (timestamptz) - End time of the appointment
      - `status` (enum) - Status of the appointment (scheduled, completed, cancelled)
      - `patient_data` (jsonb) - Patient information from the form
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on appointments table
    - Add policies for all operations
*/

-- Create appointment status enum
CREATE TYPE appointment_status_enum AS ENUM (
  'scheduled',
  'completed',
  'cancelled'
);

-- Create appointments table
CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid REFERENCES locations(id) ON DELETE RESTRICT,
  device_id uuid REFERENCES devices(id) ON DELETE RESTRICT,
  examination_id uuid REFERENCES examinations(id) ON DELETE RESTRICT,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status appointment_status_enum NOT NULL DEFAULT 'scheduled',
  patient_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure end_time is after start_time
  CONSTRAINT valid_appointment_times CHECK (end_time > start_time)
);

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON appointments
    FOR SELECT TO public USING (true);

CREATE POLICY "Enable insert access for all users" ON appointments
    FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON appointments
    FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for all users" ON appointments
    FOR DELETE TO public USING (true);

-- Add updated_at trigger
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();