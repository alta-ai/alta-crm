/*
  # Fix patient search function

  1. Changes
    - Simplify search function to use basic text comparison
    - Remove complex date parsing logic that was causing errors
    - Add proper error handling
    - Ensure consistent date format handling

  2. Security
    - Maintain RLS policies
    - Use safe text operations
*/

-- Create or replace the search function with simpler logic
CREATE OR REPLACE FUNCTION search_patients_by_birthdate(search_term text)
RETURNS SETOF patients AS $$
BEGIN
  -- First try exact date match if the input looks like a date
  IF search_term ~ '^\d{1,2}\.\d{1,2}\.\d{4}$' THEN
    RETURN QUERY 
    SELECT * FROM patients 
    WHERE TO_CHAR(birth_date, 'DD.MM.YYYY') = search_term
    ORDER BY last_name, first_name;
    
    IF FOUND THEN
      RETURN;
    END IF;
  END IF;

  -- Then try partial text match
  RETURN QUERY 
  SELECT * FROM patients 
  WHERE TO_CHAR(birth_date, 'DD.MM.YYYY') LIKE '%' || search_term || '%'
  ORDER BY last_name, first_name;

  -- If still no results and search term is numeric, try matching parts
  IF NOT FOUND AND search_term ~ '^\d+$' THEN
    RETURN QUERY 
    SELECT * FROM patients 
    WHERE 
      TO_CHAR(birth_date, 'DD') = search_term OR
      TO_CHAR(birth_date, 'MM') = search_term OR 
      TO_CHAR(birth_date, 'YYYY') = search_term
    ORDER BY last_name, first_name;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Add helpful comment
COMMENT ON FUNCTION search_patients_by_birthdate(text) IS 
'Search patients by birth date using:
1. Exact match for DD.MM.YYYY format
2. Partial text match in formatted date
3. Match individual components (day, month, year)
Returns results ordered by patient name.';