/*
  # Add referring doctors functionality

  1. New Tables
    - `medical_specialties`
      - `id` (uuid, primary key)
      - `name` (text) - Name of the specialty
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `referring_doctors`
      - `id` (uuid, primary key)
      - `title` (text) - Academic title
      - `gender` (text) - Gender (M/F/D)
      - `first_name` (text)
      - `last_name` (text)
      - `street` (text)
      - `house_number` (text)
      - `postal_code` (text)
      - `city` (text)
      - `phone` (text)
      - `fax` (text)
      - `email` (text)
      - `specialty_id` (uuid, foreign key)
      - `report_preference` (enum) - E-Mail/Fax/Both
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `appointment_referring_doctors`
      - `id` (uuid, primary key)
      - `appointment_id` (uuid, foreign key)
      - `referring_doctor_id` (uuid, foreign key)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for all operations
*/

-- Create report preference enum
CREATE TYPE report_preference_enum AS ENUM ('email', 'fax', 'both');

-- Create medical specialties table
CREATE TABLE medical_specialties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create referring doctors table
CREATE TABLE referring_doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  gender text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  street text NOT NULL,
  house_number text NOT NULL,
  postal_code text NOT NULL,
  city text NOT NULL,
  phone text NOT NULL,
  fax text,
  email text,
  specialty_id uuid REFERENCES medical_specialties(id) ON DELETE RESTRICT,
  report_preference report_preference_enum NOT NULL DEFAULT 'email',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create appointment referring doctors junction table
CREATE TABLE appointment_referring_doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid REFERENCES appointments(id) ON DELETE CASCADE,
  referring_doctor_id uuid REFERENCES referring_doctors(id) ON DELETE RESTRICT,
  created_at timestamptz DEFAULT now(),
  UNIQUE(appointment_id, referring_doctor_id)
);

-- Enable RLS
ALTER TABLE medical_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE referring_doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_referring_doctors ENABLE ROW LEVEL SECURITY;

-- Create policies for medical_specialties
CREATE POLICY "Enable read access for all users" ON medical_specialties
    FOR SELECT TO public USING (true);

CREATE POLICY "Enable insert access for all users" ON medical_specialties
    FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON medical_specialties
    FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for all users" ON medical_specialties
    FOR DELETE TO public USING (true);

-- Create policies for referring_doctors
CREATE POLICY "Enable read access for all users" ON referring_doctors
    FOR SELECT TO public USING (true);

CREATE POLICY "Enable insert access for all users" ON referring_doctors
    FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON referring_doctors
    FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for all users" ON referring_doctors
    FOR DELETE TO public USING (true);

-- Create policies for appointment_referring_doctors
CREATE POLICY "Enable read access for all users" ON appointment_referring_doctors
    FOR SELECT TO public USING (true);

CREATE POLICY "Enable insert access for all users" ON appointment_referring_doctors
    FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON appointment_referring_doctors
    FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for all users" ON appointment_referring_doctors
    FOR DELETE TO public USING (true);

-- Add updated_at triggers
CREATE TRIGGER update_medical_specialties_updated_at
    BEFORE UPDATE ON medical_specialties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referring_doctors_updated_at
    BEFORE UPDATE ON referring_doctors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE medical_specialties IS 'Liste der medizinischen Fachrichtungen';
COMMENT ON TABLE referring_doctors IS 'Überweisende Ärzte mit Kontaktdaten und Präferenzen';
COMMENT ON TABLE appointment_referring_doctors IS 'Verknüpfung zwischen Terminen und überweisenden Ärzten';

-- Insert default medical specialties
INSERT INTO medical_specialties (name) VALUES
  ('Allgemeinmedizin'),
  ('Anästhesiologie'),
  ('Augenheilkunde'),
  ('Chirurgie'),
  ('Dermatologie'),
  ('Frauenheilkunde und Geburtshilfe'),
  ('Hals-Nasen-Ohrenheilkunde'),
  ('Innere Medizin'),
  ('Kardiologie'),
  ('Kinderchirurgie'),
  ('Kinder- und Jugendmedizin'),
  ('Neurochirurgie'),
  ('Neurologie'),
  ('Orthopädie'),
  ('Psychiatrie und Psychotherapie'),
  ('Radiologie'),
  ('Urologie')
ON CONFLICT (name) DO NOTHING;