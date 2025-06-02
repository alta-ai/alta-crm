/*
  # Add patient management

  1. New Tables
    - `patients`
      - `id` (uuid, primary key)
      - `patient_number` (integer) - Auto-incrementing patient number starting from 48000
      - `gender` (text) - Patient's gender
      - `title` (text) - Academic/professional title
      - `first_name` (text) - Patient's first name
      - `last_name` (text) - Patient's last name
      - `birth_date` (date) - Patient's date of birth
      - `phone` (text) - Phone number
      - `email` (text) - Email address
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Functions
    - Create function to generate next patient number
    - Add trigger to automatically set patient number on insert

  3. Security
    - Enable RLS
    - Add policies for all operations
*/

-- Create sequence for patient numbers starting at 48000
CREATE SEQUENCE IF NOT EXISTS patient_number_seq START WITH 48000;

-- Create patients table
CREATE TABLE patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_number integer UNIQUE NOT NULL,
  gender text NOT NULL,
  title text,
  first_name text NOT NULL,
  last_name text NOT NULL,
  birth_date date NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON patients
    FOR SELECT TO public USING (true);

CREATE POLICY "Enable insert access for all users" ON patients
    FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON patients
    FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for all users" ON patients
    FOR DELETE TO public USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to set patient number
CREATE OR REPLACE FUNCTION set_patient_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.patient_number IS NULL THEN
    NEW.patient_number = nextval('patient_number_seq');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set patient number
CREATE TRIGGER set_patient_number_trigger
    BEFORE INSERT ON patients
    FOR EACH ROW
    EXECUTE FUNCTION set_patient_number();

-- Add patient_id to appointments table
ALTER TABLE appointments
ADD COLUMN patient_id uuid REFERENCES patients(id) ON DELETE RESTRICT;