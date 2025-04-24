-- Notfalllösung - ohne Abhängigkeiten
DROP FUNCTION IF EXISTS save_billing_form(UUID, TEXT, TEXT, UUID, JSONB);

CREATE OR REPLACE FUNCTION save_billing_form(
  p_form_id UUID,
  p_form_name TEXT,
  p_form_description TEXT,
  p_form_category_id UUID,
  p_questions JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  created_form_id UUID;
  question_data JSONB;
  new_question_id UUID;
  option_data JSONB;
  new_option_id UUID;
  question_index INTEGER;
  option_index INTEGER;
  question_mapping JSONB := '{}';
  option_mapping JSONB := '{}';
  question_ids UUID[] := '{}';
  option_ids UUID[] := '{}';
  billing_code_val UUID;
  result JSONB;
BEGIN
  -- Wenn form_id null ist, erstelle einen neuen Abrechnungsbogen
  IF p_form_id IS NULL THEN
    INSERT INTO billing_forms (name, description, category_id)
    VALUES (p_form_name, p_form_description, p_form_category_id)
    RETURNING id INTO created_form_id;
  ELSE
    -- Andernfalls aktualisiere den bestehenden Bogen
    UPDATE billing_forms
    SET name = p_form_name,
        description = p_form_description,
        category_id = p_form_category_id
    WHERE id = p_form_id;
    
    created_form_id := p_form_id;
    
    -- Lösche bestehende Fragen (Optionen werden via CASCADE gelöscht)
    DELETE FROM billing_form_questions
    WHERE form_id = created_form_id;
  END IF;
  
  -- Erstelle neue Fragen und Optionen ohne Abhängigkeiten
  question_index := 0;
  FOR question_data IN SELECT * FROM jsonb_array_elements(p_questions)
  LOOP
    -- Erstelle Frage OHNE Abhängigkeiten - diese werden vorerst ignoriert
    INSERT INTO billing_form_questions (
      form_id,
      question_text,
      question_type,
      required,
      order_index,
      depends_on_question_id,
      depends_on_option_id
    )
    VALUES (
      created_form_id,
      question_data->>'question_text',
      question_data->>'question_type',
      (question_data->>'required')::boolean,
      question_index,
      NULL,  -- IMMER NULL für Abhängigkeiten
      NULL   -- IMMER NULL für Abhängigkeiten
    )
    RETURNING id INTO new_question_id;
    
    -- Speichere die Zuordnung zwischen Index und ID (für zukünftige Verwendung)
    question_mapping := question_mapping || jsonb_build_object(question_index::text, new_question_id);
    question_ids := array_append(question_ids, new_question_id);
    
    -- Erstelle Optionen für diese Frage
    option_index := 0;
    FOR option_data IN SELECT * FROM jsonb_array_elements(question_data->'options')
    LOOP
      -- Vorsichtige Typkonvertierung für billing_code_id
      billing_code_val := NULL;
      
      BEGIN
        IF option_data->>'billing_code_id' IS NOT NULL AND option_data->>'billing_code_id' != '' THEN
          billing_code_val := (option_data->>'billing_code_id')::uuid;
        END IF;
      EXCEPTION WHEN OTHERS THEN
        billing_code_val := NULL;
      END;
      
      INSERT INTO billing_form_options (
        question_id,
        option_text,
        billing_code_id,
        order_index,
        option_type
      )
      VALUES (
        new_question_id,
        option_data->>'option_text',
        billing_code_val,
        option_index,
        option_data->>'option_type'
      )
      RETURNING id INTO new_option_id;
      
      -- Speichere die Zuordnung zwischen Frageindex, Optionsindex und ID
      option_mapping := option_mapping || jsonb_build_object(
        question_index::text || '_' || option_index::text, 
        new_option_id
      );
      option_ids := array_append(option_ids, new_option_id);
      
      option_index := option_index + 1;
    END LOOP;
    
    question_index := question_index + 1;
  END LOOP;
  
  -- Erstelle Ergebnis
  result := jsonb_build_object(
    'success', true,
    'form_id', created_form_id,
    'question_ids', question_ids,
    'option_ids', option_ids,
    'mapping', jsonb_build_object(
      'questions', question_mapping,
      'options', option_mapping
    )
  );

  RETURN result;

EXCEPTION WHEN OTHERS THEN
  -- Bei Fehler: Ergebnisdaten mit Fehlermeldung erstellen
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- Gewähre Ausführungsrechte für die Funktion
GRANT EXECUTE ON FUNCTION save_billing_form(UUID, TEXT, TEXT, UUID, JSONB) TO authenticated; 