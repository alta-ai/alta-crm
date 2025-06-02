/*
  # Fix patient search date handling

  1. Changes
    - Add function to safely convert dates between formats
    - Add function to search patients by birth date
    - Add function to handle fuzzy date searches
    
  2. Features
    - Support multiple date formats (DD.MM.YYYY, YYYY-MM-DD, DD.MM.YY)
    - Support partial date searches
    - Return results ordered by name
*/

-- Create function to safely convert dates between formats
CREATE OR REPLACE FUNCTION safe_date_convert(input_date text)
RETURNS date AS $$
BEGIN
  -- Try European format (DD.MM.YYYY)
  BEGIN
    RETURN TO_DATE(input_date, 'DD.MM.YYYY');
  EXCEPTION
    WHEN OTHERS THEN
      -- Try ISO format (YYYY-MM-DD)
      BEGIN
        RETURN TO_DATE(input_date, 'YYYY-MM-DD');
      EXCEPTION
        WHEN OTHERS THEN
          -- Try short year format (DD.MM.YY)
          BEGIN
            RETURN TO_DATE(input_date, 'DD.MM.YY');
          EXCEPTION
            WHEN OTHERS THEN
              RAISE EXCEPTION 'Invalid date format: %', input_date;
          END;
      END;
  END;
END;
$$ LANGUAGE plpgsql;

-- Create function to search patients by birth date with fuzzy matching
CREATE OR REPLACE FUNCTION search_patients_by_birth_date(search_term text)
RETURNS TABLE (
  id uuid,
  patient_number integer,
  gender text,
  title text,
  first_name text,
  last_name text,
  birth_date date,
  phone text,
  email text,
  created_at timestamptz,
  updated_at timestamptz
) AS $$
BEGIN
  -- First try exact date match
  BEGIN
    RETURN QUERY
    SELECT p.*
    FROM patients p
    WHERE p.birth_date = safe_date_convert(search_term)
    ORDER BY p.last_name, p.first_name;
    
    IF FOUND THEN
      RETURN;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      -- Continue to fuzzy search if exact match fails
      NULL;
  END;

  -- Then try partial matches using formatted date string
  RETURN QUERY
  SELECT p.*
  FROM patients p
  WHERE TO_CHAR(p.birth_date, 'DD.MM.YYYY') LIKE '%' || search_term || '%'
  ORDER BY p.last_name, p.first_name;

  -- If still no results and search term is numeric, try matching parts
  IF NOT FOUND AND search_term ~ '^\d+$' THEN
    RETURN QUERY
    SELECT p.*
    FROM patients p
    WHERE 
      EXTRACT(DAY FROM p.birth_date)::text = search_term OR
      EXTRACT(MONTH FROM p.birth_date)::text = search_term OR
      EXTRACT(YEAR FROM p.birth_date)::text = search_term
    ORDER BY p.last_name, p.first_name;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Add comment explaining the search function
COMMENT ON FUNCTION search_patients_by_birth_date(text) IS 
'Search patients by birth date with support for:
- Exact matches in DD.MM.YYYY, YYYY-MM-DD, or DD.MM.YY format
- Partial matches in formatted date string
- Matching individual date components (day, month, year)
Returns results ordered by last name, first name';