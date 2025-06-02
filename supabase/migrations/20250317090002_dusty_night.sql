/*
  # Fix timezone settings for date handling

  1. Changes
    - Set timezone to Europe/Berlin for consistent date handling
    - Ensure dates are stored without timezone conversion
    - Add explicit timezone handling for date inputs
*/

-- Set timezone to Europe/Berlin
SET timezone TO 'Europe/Berlin';
ALTER DATABASE postgres SET timezone TO 'Europe/Berlin';

-- Ensure birth_date column uses date type without timezone
ALTER TABLE patients ALTER COLUMN birth_date TYPE date USING birth_date::date;

-- Create function to handle date inputs with timezone
CREATE OR REPLACE FUNCTION handle_date_input(input_date text)
RETURNS date AS $$
BEGIN
  -- Parse the input date in European format (DD.MM.YYYY)
  RETURN TO_DATE(input_date, 'DD.MM.YYYY');
EXCEPTION
  WHEN OTHERS THEN
    -- If parsing fails, try ISO format (YYYY-MM-DD)
    RETURN input_date::date;
END;
$$ LANGUAGE plpgsql;