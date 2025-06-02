/*
  # Add body side validation for appointments

  1. Changes
    - Add validation function for body side in patient_data
    - Add trigger to validate body side on insert/update
    
  2. Security
    - Maintain existing RLS policies
*/

-- Create function to validate body side in patient_data
CREATE OR REPLACE FUNCTION validate_patient_data_body_side()
RETURNS trigger AS $$
BEGIN
  -- Check if examination requires body side
  IF EXISTS (
    SELECT 1 FROM examinations e
    WHERE e.id = NEW.examination_id
    AND e.requires_body_side = true
  ) THEN
    -- Ensure body_side is present and valid when required
    IF NOT (
      NEW.patient_data->>'body_side' IN ('links', 'rechts')
    ) THEN
      RAISE EXCEPTION 'body_side must be either "links" or "rechts" when required';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for validation
DROP TRIGGER IF EXISTS validate_appointment_body_side ON appointments;
CREATE TRIGGER validate_appointment_body_side
  BEFORE INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION validate_patient_data_body_side();

-- Add helpful comment
COMMENT ON FUNCTION validate_patient_data_body_side() IS 'Validates that body_side is present and valid in patient_data when required by examination';