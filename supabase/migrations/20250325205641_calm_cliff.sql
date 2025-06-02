-- Drop old form_submissions table if it exists
DROP TABLE IF EXISTS form_submissions CASCADE;

-- Create registration form submissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS registration_form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Personal Information
  gender text NOT NULL,
  title text,
  first_name text NOT NULL,
  last_name text NOT NULL,
  street text NOT NULL,
  house_number text NOT NULL,
  postal_code text NOT NULL,
  city text NOT NULL,
  phone_landline text,
  phone_mobile text NOT NULL,
  email text NOT NULL,
  birth_date date NOT NULL,
  
  -- Insurance Information
  insurance_type text NOT NULL,
  insurance_provider_id uuid REFERENCES insurance_providers(id),
  has_beihilfe boolean,
  
  -- Medical Information
  has_transfer boolean NOT NULL,
  referring_doctor_name text,
  current_treatment boolean NOT NULL,
  treatment_recommendations text[],
  doctor_recommendation boolean NOT NULL,
  send_report_to_doctor boolean NOT NULL,
  report_delivery_method text NOT NULL,
  found_through text[],
  referring_doctor_id uuid REFERENCES referring_doctors(id)
);

-- Enable RLS
ALTER TABLE registration_form_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies with unique names
CREATE POLICY "registration_form_submissions_select_policy" ON registration_form_submissions
    FOR SELECT TO public USING (true);

CREATE POLICY "registration_form_submissions_insert_policy" ON registration_form_submissions
    FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "registration_form_submissions_update_policy" ON registration_form_submissions
    FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "registration_form_submissions_delete_policy" ON registration_form_submissions
    FOR DELETE TO public USING (true);

-- Create trigger to sync registration form with patients table
CREATE OR REPLACE FUNCTION sync_registration_form_with_patient()
RETURNS TRIGGER AS $$
BEGIN
  -- Update patient record with form data
  UPDATE patients
  SET
    gender = NEW.gender,
    title = NEW.title,
    first_name = NEW.first_name,
    last_name = NEW.last_name,
    phone = NEW.phone_mobile,
    email = NEW.email,
    birth_date = NEW.birth_date,
    updated_at = now()
  WHERE id = NEW.patient_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS sync_registration_form_with_patient ON registration_form_submissions;
DROP TRIGGER IF EXISTS update_registration_form_submissions_updated_at ON registration_form_submissions;

-- Create sync trigger
CREATE TRIGGER sync_registration_form_with_patient
  AFTER INSERT OR UPDATE ON registration_form_submissions
  FOR EACH ROW
  EXECUTE FUNCTION sync_registration_form_with_patient();

-- Create updated_at trigger
CREATE TRIGGER update_registration_form_submissions_updated_at
  BEFORE UPDATE ON registration_form_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create helpful indexes
CREATE INDEX IF NOT EXISTS idx_registration_form_submissions_patient_id 
  ON registration_form_submissions(patient_id);
CREATE INDEX IF NOT EXISTS idx_registration_form_submissions_appointment_id 
  ON registration_form_submissions(appointment_id);

-- Add helpful comments
COMMENT ON TABLE registration_form_submissions IS 
'Stores registration form submissions with individual fields and patient sync';