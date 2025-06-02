/*
  # Add Previous Appointment Reference

  1. Changes
    - Add previous_appointment_id column to appointments table
    - Add foreign key constraint to reference original appointment

  2. Security
    - No changes to RLS policies needed
*/

-- Add previous_appointment_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' 
    AND column_name = 'previous_appointment_id'
  ) THEN
    ALTER TABLE appointments 
    ADD COLUMN previous_appointment_id uuid REFERENCES appointments(id);
  END IF;
END $$;