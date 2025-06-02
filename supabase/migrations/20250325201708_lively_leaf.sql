/*
  # Add form submissions schema with individual fields

  1. New Tables
    - Create separate tables for each form type
    - Add proper foreign key relationships
    - Add indexes for performance

  2. Security
    - Enable RLS on all tables
    - Add policies for all operations
*/

-- Create tables
DO $$ 
BEGIN
  -- Create registration form submissions table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'registration_form_submissions') THEN
    CREATE TABLE registration_form_submissions (
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

    -- Create policies
    CREATE POLICY "Enable read access for all users" ON registration_form_submissions
        FOR SELECT TO public USING (true);

    CREATE POLICY "Enable insert access for all users" ON registration_form_submissions
        FOR INSERT TO public WITH CHECK (true);

    CREATE POLICY "Enable update access for all users" ON registration_form_submissions
        FOR UPDATE TO public USING (true) WITH CHECK (true);

    CREATE POLICY "Enable delete access for all users" ON registration_form_submissions
        FOR DELETE TO public USING (true);

    -- Add updated_at trigger
    CREATE TRIGGER update_registration_form_submissions_updated_at
        BEFORE UPDATE ON registration_form_submissions
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Create cost reimbursement form submissions table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'cost_reimbursement_form_submissions') THEN
    CREATE TABLE cost_reimbursement_form_submissions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      appointment_id uuid REFERENCES appointments(id) ON DELETE CASCADE,
      patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now(),
      
      confirmed boolean NOT NULL
    );

    -- Enable RLS
    ALTER TABLE cost_reimbursement_form_submissions ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Enable read access for all users" ON cost_reimbursement_form_submissions
        FOR SELECT TO public USING (true);

    CREATE POLICY "Enable insert access for all users" ON cost_reimbursement_form_submissions
        FOR INSERT TO public WITH CHECK (true);

    CREATE POLICY "Enable update access for all users" ON cost_reimbursement_form_submissions
        FOR UPDATE TO public USING (true) WITH CHECK (true);

    CREATE POLICY "Enable delete access for all users" ON cost_reimbursement_form_submissions
        FOR DELETE TO public USING (true);

    -- Add updated_at trigger
    CREATE TRIGGER update_cost_reimbursement_form_submissions_updated_at
        BEFORE UPDATE ON cost_reimbursement_form_submissions
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Create privacy form submissions table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'privacy_form_submissions') THEN
    CREATE TABLE privacy_form_submissions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      appointment_id uuid REFERENCES appointments(id) ON DELETE CASCADE,
      patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now(),
      
      privacy_consent boolean NOT NULL,
      email_consent boolean
    );

    -- Enable RLS
    ALTER TABLE privacy_form_submissions ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Enable read access for all users" ON privacy_form_submissions
        FOR SELECT TO public USING (true);

    CREATE POLICY "Enable insert access for all users" ON privacy_form_submissions
        FOR INSERT TO public WITH CHECK (true);

    CREATE POLICY "Enable update access for all users" ON privacy_form_submissions
        FOR UPDATE TO public USING (true) WITH CHECK (true);

    CREATE POLICY "Enable delete access for all users" ON privacy_form_submissions
        FOR DELETE TO public USING (true);

    -- Add updated_at trigger
    CREATE TRIGGER update_privacy_form_submissions_updated_at
        BEFORE UPDATE ON privacy_form_submissions
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Create examination form submissions table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'examination_form_submissions') THEN
    CREATE TABLE examination_form_submissions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      appointment_id uuid REFERENCES appointments(id) ON DELETE CASCADE,
      patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now(),
      
      gender text NOT NULL,
      first_name text NOT NULL,
      last_name text NOT NULL,
      height numeric NOT NULL,
      weight numeric NOT NULL
    );

    -- Enable RLS
    ALTER TABLE examination_form_submissions ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Enable read access for all users" ON examination_form_submissions
        FOR SELECT TO public USING (true);

    CREATE POLICY "Enable insert access for all users" ON examination_form_submissions
        FOR INSERT TO public WITH CHECK (true);

    CREATE POLICY "Enable update access for all users" ON examination_form_submissions
        FOR UPDATE TO public USING (true) WITH CHECK (true);

    CREATE POLICY "Enable delete access for all users" ON examination_form_submissions
        FOR DELETE TO public USING (true);

    -- Add updated_at trigger
    CREATE TRIGGER update_examination_form_submissions_updated_at
        BEFORE UPDATE ON examination_form_submissions
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Create CT consent form submissions table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'ct_consent_form_submissions') THEN
    CREATE TABLE ct_consent_form_submissions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      appointment_id uuid REFERENCES appointments(id) ON DELETE CASCADE,
      patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now(),
      
      gender text NOT NULL,
      last_name text NOT NULL,
      first_name text NOT NULL,
      height numeric NOT NULL,
      weight numeric NOT NULL,
      previous_contrast_media boolean NOT NULL,
      contrast_media_side_effects boolean,
      allergies boolean NOT NULL,
      allergies_description text,
      asthma boolean NOT NULL,
      prelim_exams boolean NOT NULL,
      prelim_exams_description text,
      prelim_exams_date text,
      thyroid_overfunction boolean NOT NULL,
      thyroid_medication boolean NOT NULL,
      thyroid_medication_description text,
      thyroid_surgery boolean NOT NULL,
      diabetes boolean NOT NULL,
      metformin boolean NOT NULL,
      kidney_impairment boolean NOT NULL,
      blood_thinners boolean NOT NULL,
      blood_thinners_description text,
      blood_thinners_date text,
      infectious_disease boolean NOT NULL,
      infectious_disease_description text,
      no_pregnancy boolean,
      last_period text,
      breastfeeding boolean
    );

    -- Enable RLS
    ALTER TABLE ct_consent_form_submissions ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Enable read access for all users" ON ct_consent_form_submissions
        FOR SELECT TO public USING (true);

    CREATE POLICY "Enable insert access for all users" ON ct_consent_form_submissions
        FOR INSERT TO public WITH CHECK (true);

    CREATE POLICY "Enable update access for all users" ON ct_consent_form_submissions
        FOR UPDATE TO public USING (true) WITH CHECK (true);

    CREATE POLICY "Enable delete access for all users" ON ct_consent_form_submissions
        FOR DELETE TO public USING (true);

    -- Add updated_at trigger
    CREATE TRIGGER update_ct_consent_form_submissions_updated_at
        BEFORE UPDATE ON ct_consent_form_submissions
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Create CT therapy form submissions table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'ct_therapy_form_submissions') THEN
    CREATE TABLE ct_therapy_form_submissions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      appointment_id uuid REFERENCES appointments(id) ON DELETE CASCADE,
      patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now(),
      
      gender text NOT NULL,
      title text,
      first_name text NOT NULL,
      last_name text NOT NULL,
      birth_date date NOT NULL,
      height numeric NOT NULL,
      weight numeric NOT NULL,
      previous_contrast_media boolean NOT NULL,
      contrast_media_side_effects boolean,
      allergies boolean NOT NULL,
      allergies_description text,
      thyroid_overfunction boolean NOT NULL,
      osteoporosis boolean NOT NULL,
      hepatitis boolean NOT NULL,
      diabetes boolean NOT NULL,
      high_blood_pressure boolean NOT NULL,
      glaucoma boolean NOT NULL,
      stomach_ulcer boolean NOT NULL,
      thrombosis boolean NOT NULL,
      blood_thinners boolean NOT NULL,
      blood_thinners_description text,
      no_pregnancy boolean,
      last_period text
    );

    -- Enable RLS
    ALTER TABLE ct_therapy_form_submissions ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Enable read access for all users" ON ct_therapy_form_submissions
        FOR SELECT TO public USING (true);

    CREATE POLICY "Enable insert access for all users" ON ct_therapy_form_submissions
        FOR INSERT TO public WITH CHECK (true);

    CREATE POLICY "Enable update access for all users" ON ct_therapy_form_submissions
        FOR UPDATE TO public USING (true) WITH CHECK (true);

    CREATE POLICY "Enable delete access for all users" ON ct_therapy_form_submissions
        FOR DELETE TO public USING (true);

    -- Add updated_at trigger
    CREATE TRIGGER update_ct_therapy_form_submissions_updated_at
        BEFORE UPDATE ON ct_therapy_form_submissions
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Create MRT/CT consent form submissions table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'mrt_ct_consent_form_submissions') THEN
    CREATE TABLE mrt_ct_consent_form_submissions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      appointment_id uuid REFERENCES appointments(id) ON DELETE CASCADE,
      patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now(),
      
      gender text NOT NULL,
      title text,
      first_name text NOT NULL,
      last_name text NOT NULL,
      birth_date date NOT NULL,
      height numeric NOT NULL,
      weight numeric NOT NULL,
      heart_device boolean NOT NULL,
      metal_implants boolean NOT NULL,
      operations text,
      allergies boolean NOT NULL,
      kidney_disease boolean NOT NULL,
      thyroid_disease boolean NOT NULL,
      diabetes boolean NOT NULL,
      pregnancy boolean
    );

    -- Enable RLS
    ALTER TABLE mrt_ct_consent_form_submissions ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Enable read access for all users" ON mrt_ct_consent_form_submissions
        FOR SELECT TO public USING (true);

    CREATE POLICY "Enable insert access for all users" ON mrt_ct_consent_form_submissions
        FOR INSERT TO public WITH CHECK (true);

    CREATE POLICY "Enable update access for all users" ON mrt_ct_consent_form_submissions
        FOR UPDATE TO public USING (true) WITH CHECK (true);

    CREATE POLICY "Enable delete access for all users" ON mrt_ct_consent_form_submissions
        FOR DELETE TO public USING (true);

    -- Add updated_at trigger
    CREATE TRIGGER update_mrt_ct_consent_form_submissions_updated_at
        BEFORE UPDATE ON mrt_ct_consent_form_submissions
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Create prostate questionnaire submissions table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'prostate_questionnaire_submissions') THEN
    CREATE TABLE prostate_questionnaire_submissions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      appointment_id uuid REFERENCES appointments(id) ON DELETE CASCADE,
      patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now(),
      
      age integer NOT NULL,
      psa_value numeric,
      psa_date date,
      previous_biopsies boolean NOT NULL,
      biopsy_results text,
      family_history boolean NOT NULL,
      family_history_details text,
      symptoms text[],
      medications text[],
      previous_treatments text[]
    );

    -- Enable RLS
    ALTER TABLE prostate_questionnaire_submissions ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Enable read access for all users" ON prostate_questionnaire_submissions
        FOR SELECT TO public USING (true);

    CREATE POLICY "Enable insert access for all users" ON prostate_questionnaire_submissions
        FOR INSERT TO public WITH CHECK (true);

    CREATE POLICY "Enable update access for all users" ON prostate_questionnaire_submissions
        FOR UPDATE TO public USING (true) WITH CHECK (true);

    CREATE POLICY "Enable delete access for all users" ON prostate_questionnaire_submissions
        FOR DELETE TO public USING (true);

    -- Add updated_at trigger
    CREATE TRIGGER update_prostate_questionnaire_submissions_updated_at
        BEFORE UPDATE ON prostate_questionnaire_submissions
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

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

-- Create trigger
DROP TRIGGER IF EXISTS sync_registration_form_with_patient ON registration_form_submissions;
CREATE TRIGGER sync_registration_form_with_patient
  AFTER INSERT OR UPDATE ON registration_form_submissions
  FOR EACH ROW
  EXECUTE FUNCTION sync_registration_form_with_patient();

-- Create helpful indexes
CREATE INDEX IF NOT EXISTS idx_registration_form_submissions_patient_id 
  ON registration_form_submissions(patient_id);
CREATE INDEX IF NOT EXISTS idx_registration_form_submissions_appointment_id 
  ON registration_form_submissions(appointment_id);

-- Add helpful comments
COMMENT ON TABLE registration_form_submissions IS 
'Stores registration form submissions with individual fields and patient sync';

COMMENT ON TABLE cost_reimbursement_form_submissions IS 
'Stores cost reimbursement consent form submissions';

COMMENT ON TABLE privacy_form_submissions IS 
'Stores privacy consent form submissions';

COMMENT ON TABLE examination_form_submissions IS 
'Stores examination questionnaire submissions';

COMMENT ON TABLE ct_consent_form_submissions IS 
'Stores CT consent form submissions';

COMMENT ON TABLE ct_therapy_form_submissions IS 
'Stores CT therapy consent form submissions';

COMMENT ON TABLE mrt_ct_consent_form_submissions IS 
'Stores MRT/CT consent form submissions';

COMMENT ON TABLE prostate_questionnaire_submissions IS 
'Stores prostate questionnaire submissions';