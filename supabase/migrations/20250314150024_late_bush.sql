/*
  # Create view for appointment forms

  1. New Views
    - `appointment_forms_view`
      - Combines appointment data with required forms based on billing type
      - Filters forms by billing type
      - Includes form token for secure access

  2. Security
    - Add RLS policies for underlying tables
*/

-- Create view for appointment forms
CREATE OR REPLACE VIEW appointment_forms_view AS
SELECT 
  a.id AS appointment_id,
  a.patient_id,
  a.examination_id,
  a.billing_type,
  a.start_time,
  a.device_id,
  a.location_id,
  ef.form_id,
  f.name AS form_name,
  f.description AS form_description,
  f.form_type,
  f.form_data,
  f.form_fields,
  ft.token AS form_token
FROM 
  appointments a
  JOIN examination_forms ef ON ef.examination_id = a.examination_id
  JOIN forms f ON f.id = ef.form_id
  LEFT JOIN form_tokens ft ON ft.appointment_id = a.id
WHERE 
  a.billing_type = ANY(ef.billing_type);

-- Create RLS policies for the underlying tables if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'appointments' AND policyname = 'Enable read access for all users'
  ) THEN
    CREATE POLICY "Enable read access for all users" ON appointments FOR SELECT TO public USING (true);
  END IF;
END $$;