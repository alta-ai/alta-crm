/*
  # Add insurance providers and update appointment billing types

  1. New Tables
    - `insurance_providers`
      - `id` (uuid, primary key)
      - `name` (text) - Name of the insurance provider
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Changes
    - Add billing_type column to appointments table
    - Add insurance_provider_id column to appointments table

  3. Security
    - Enable RLS on insurance_providers table
    - Add policies for all operations
*/

-- Create insurance_providers table
CREATE TABLE insurance_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE insurance_providers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON insurance_providers
    FOR SELECT TO public USING (true);

CREATE POLICY "Enable insert access for all users" ON insurance_providers
    FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON insurance_providers
    FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for all users" ON insurance_providers
    FOR DELETE TO public USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_insurance_providers_updated_at
    BEFORE UPDATE ON insurance_providers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add billing type enum
CREATE TYPE billing_type_enum AS ENUM (
  'self_payer',
  'private_patient',
  'foreign_patient',
  'work_accident'
);

-- Add new columns to appointments table
ALTER TABLE appointments
ADD COLUMN billing_type billing_type_enum NOT NULL DEFAULT 'self_payer',
ADD COLUMN insurance_provider_id uuid REFERENCES insurance_providers(id);

-- Insert insurance providers
INSERT INTO insurance_providers (name) VALUES
  ('Allianz'),
  ('Alte Oldenburger'),
  ('ARAG'),
  ('ASSTEL'),
  ('AXA'),
  ('Barmenia'),
  ('Bayrische'),
  ('BBKK'),
  ('Berlin-Kölnische'),
  ('Berufsgenossenschaft'),
  ('Central'),
  ('Concordia'),
  ('Continentale'),
  ('DBV'),
  ('Debeka'),
  ('Deutscher'),
  ('DEVK'),
  ('DKV'),
  ('DÜSSELDORFER'),
  ('Envivas'),
  ('ERGO'),
  ('EUROPA'),
  ('Evang. Pfarrverein Württemberg'),
  ('FREIE ARZT- UND MEDIZINKASSE (FAMK)'),
  ('Generali'),
  ('Globale'),
  ('Gothaer'),
  ('HALLESCHE'),
  ('HanseMerkur'),
  ('HUK-Coburg'),
  ('Inter'),
  ('KarstadtQuelle'),
  ('Kranken- und Sterbekasse'),
  ('Krankenunterstützungskasse Berufsfeuerwehr Hannover (KUK)'),
  ('Krankenversorgung der Bundesbeamten (KVB I - III)'),
  ('Krankenversorgung der Bundesbeamten (KVB IV)'),
  ('Krankenversorgung der Bundesbeamten (KVB)'),
  ('LIGA Krankenversicherung katholischer Priester'),
  ('LKH'),
  ('LVM'),
  ('Mannheimer'),
  ('Mecklenburgische'),
  ('Münchener Verein'),
  ('Nürnberger'),
  ('ottonova'),
  ('PAX-Familienfürsorge'),
  ('Postbeamtenkrankenkasse (PBeaKK)'),
  ('Provinzial'),
  ('R+V'),
  ('Signal Iduna'),
  ('SONO'),
  ('ST. MARTINUS Priesterverein der Diözese Rottenburg-Stuttgart'),
  ('Süddeutsche'),
  ('UKV'),
  ('Universa'),
  ('Verein Pfälzischer Pfarrerinnen und Pfarrer'),
  ('Versicherungskammer Bayern (BK / VKB)'),
  ('VGH'),
  ('VICTORIA'),
  ('vigo'),
  ('Volksfürsorge'),
  ('Württembergische'),
  ('Zürich Agrippina');