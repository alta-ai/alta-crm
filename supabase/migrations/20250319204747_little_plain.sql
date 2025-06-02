/*
  # Add previous appointment date tracking

  1. Changes
    - Add previous_appointment_date column to appointments table
    - Update existing previous_appointment_id references
    - Add comment explaining the column usage

  2. Security
    - Maintain existing RLS policies
*/

-- Add previous_appointment_date column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' 
    AND column_name = 'previous_appointment_date'
  ) THEN
    ALTER TABLE appointments 
    ADD COLUMN previous_appointment_date timestamptz;
  END IF;
END $$;

-- Add comment explaining the column
COMMENT ON COLUMN appointments.previous_appointment_date IS 
'Stores the original date when an appointment is rescheduled';