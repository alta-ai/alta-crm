/*
  # Add date handling functions for patients

  1. Changes
    - Set timezone to Europe/Berlin
    - Add functions for consistent date handling
    - Add helper functions for patient operations
    
  2. Security
    - Ensure safe date parsing and formatting
    - Add input validation
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
  -- First try European format (DD.MM.YYYY)
  BEGIN
    RETURN TO_DATE(input_date, 'DD.MM.YYYY');
  EXCEPTION
    WHEN OTHERS THEN
      -- Then try ISO format (YYYY-MM-DD)
      BEGIN
        RETURN TO_DATE(input_date, 'YYYY-MM-DD');
      EXCEPTION
        WHEN OTHERS THEN
          -- Finally try other common formats
          BEGIN
            RETURN TO_DATE(input_date, 'DD.MM.YY');
          EXCEPTION
            WHEN OTHERS THEN
              RAISE EXCEPTION 'Invalid date format. Please use DD.MM.YYYY or YYYY-MM-DD';
          END;
      END;
  END;
END;
$$ LANGUAGE plpgsql;

-- Create function to find patients by birth date
CREATE OR REPLACE FUNCTION find_patients_by_birth_date(date_string text)
RETURNS SETOF patients AS $$
DECLARE
  parsed_date date;
BEGIN
  -- Try to parse the input date using the handle_date_input function
  BEGIN
    parsed_date := handle_date_input(date_string);
    RETURN QUERY SELECT * FROM patients 
      WHERE birth_date = parsed_date
      ORDER BY last_name, first_name;
  EXCEPTION
    WHEN OTHERS THEN
      -- If exact match fails, try fuzzy matching
      RETURN QUERY SELECT * FROM patients 
        WHERE birth_date::text ILIKE '%' || date_string || '%'
        ORDER BY last_name, first_name;
  END;
END;
$$ LANGUAGE plpgsql;

-- Create function to update patient safely with date handling
CREATE OR REPLACE FUNCTION update_patient(p_id uuid, p_data jsonb)
RETURNS uuid AS $$
DECLARE
  birth_date_text text;
  parsed_date date;
BEGIN
  -- Extract birth_date from JSON
  birth_date_text := p_data->>'birth_date';
  
  -- Parse the date using our helper function
  parsed_date := handle_date_input(birth_date_text);
  
  -- Update the patient data with the correctly parsed date
  UPDATE patients 
  SET 
    gender = (p_data->>'gender')::text,
    title = (p_data->>'title')::text,
    first_name = (p_data->>'first_name')::text,
    last_name = (p_data->>'last_name')::text,
    birth_date = parsed_date,
    phone = (p_data->>'phone')::text,
    email = (p_data->>'email')::text,
    updated_at = now()
  WHERE id = p_id;
  
  RETURN p_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to create new patient safely with date handling
CREATE OR REPLACE FUNCTION create_patient(p_data jsonb)
RETURNS uuid AS $$
DECLARE
  birth_date_text text;
  parsed_date date;
  new_id uuid;
BEGIN
  -- Extract birth_date from JSON
  birth_date_text := p_data->>'birth_date';
  
  -- Parse the date using our helper function
  parsed_date := handle_date_input(birth_date_text);
  
  -- Insert the new patient with the correctly parsed date
  INSERT INTO patients (
    gender,
    title,
    first_name,
    last_name,
    birth_date,
    phone,
    email
  ) VALUES (
    (p_data->>'gender')::text,
    (p_data->>'title')::text,
    (p_data->>'first_name')::text,
    (p_data->>'last_name')::text,
    parsed_date,
    (p_data->>'phone')::text,
    (p_data->>'email')::text
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;