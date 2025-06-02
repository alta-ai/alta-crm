/*
  # Add improved date search function

  1. Changes
    - Add new function for improved date searching
    - Support multiple date formats and partial matches
    - Return results ordered by last name and first name
    
  2. Features
    - Exact match for DD.MM.YYYY format
    - Fuzzy search in date string
    - Search by day, month, or year components
*/

-- Create improved date search function
CREATE OR REPLACE FUNCTION improved_date_search(search_term text)
RETURNS TABLE (
  id uuid, 
  patient_number int, 
  gender text, 
  title text, 
  first_name text, 
  last_name text, 
  birth_date date, 
  phone text, 
  email text, 
  created_at timestamptz
) AS $$
DECLARE
  parsed_date date;
  search_pattern text;
BEGIN
  -- 1. Versuche exakte Übereinstimmung
  BEGIN
    -- Für DD.MM.YYYY Format
    IF search_term ~ '^\d{1,2}\.\d{1,2}\.\d{4}$' THEN
      parsed_date := TO_DATE(search_term, 'DD.MM.YYYY');
      RETURN QUERY SELECT p.* FROM patients p
        WHERE p.birth_date = parsed_date
        ORDER BY p.last_name, p.first_name;
      
      -- Wenn wir Ergebnisse zurückgeben, beenden wir die Funktion
      IF FOUND THEN
        RETURN;
      END IF;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      -- Bei Fehlern mit der Datumsparsierung weitermachen
      NULL;
  END;
  
  -- 2. Fuzzy-Suche im Datumsstring
  RETURN QUERY 
  SELECT p.* FROM patients p
  WHERE TO_CHAR(p.birth_date, 'DD.MM.YYYY') ILIKE '%' || search_term || '%'
  ORDER BY p.last_name, p.first_name;
  
  -- 3. Wenn keine Ergebnisse gefunden wurden, versuche andere Teile des Datums
  IF NOT FOUND AND search_term ~ '^\d+$' THEN
    -- Könnte ein Tag, Monat oder Jahr sein
    RETURN QUERY 
    SELECT p.* FROM patients p
    WHERE 
      EXTRACT(DAY FROM p.birth_date) = search_term::int OR
      EXTRACT(MONTH FROM p.birth_date) = search_term::int OR
      EXTRACT(YEAR FROM p.birth_date) = search_term::int
    ORDER BY p.last_name, p.first_name;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Add comment to explain function usage
COMMENT ON FUNCTION improved_date_search(text) IS 
'Sucht Patienten nach Geburtsdatum mit verschiedenen Suchstrategien:
1. Exakte Übereinstimmung im Format DD.MM.YYYY
2. Fuzzy-Suche im formatierten Datumsstring
3. Suche nach einzelnen Datumsteilen (Tag, Monat, Jahr)';