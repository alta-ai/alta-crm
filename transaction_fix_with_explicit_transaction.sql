-- Fix für das Problem mit der Foreign-Key-Constraint Verletzung bei Abrechnungsbögen

-- Zuerst die bestehende Funktion löschen
DROP FUNCTION IF EXISTS save_billing_form(UUID, TEXT, TEXT, UUID, JSONB);

-- Neue Version der Funktion mit expliziter Transaktion
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
  question_ids UUID[] := '{}';  -- Initialisiere als leeres Array
  option_ids UUID[] := '{}';    -- Initialisiere als leeres Array
  q_id UUID;
  o_id UUID;
  result JSONB;
BEGIN
  -- Constraints bis zum Ende der Transaktion aufschieben
  SET CONSTRAINTS billing_form_questions_depends_on_question_id_fkey DEFERRED;
  SET CONSTRAINTS billing_form_questions_depends_on_option_id_fkey DEFERRED;
  
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
  
  -- Erstelle neue Fragen und Optionen
  question_index := 0;
  FOR question_data IN SELECT * FROM jsonb_array_elements(p_questions)
  LOOP
    -- Erstelle Frage (zuerst ohne Abhängigkeiten)
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
      NULL,  -- Abhängigkeiten werden später gesetzt
      NULL   -- Abhängigkeiten werden später gesetzt
    )
    RETURNING id INTO new_question_id;
    
    -- Speichere die Zuordnung zwischen Index und ID
    question_mapping := question_mapping || jsonb_build_object(question_index::text, new_question_id);
    question_ids := array_append(question_ids, new_question_id);
    
    -- Erstelle Optionen für diese Frage
    option_index := 0;
    FOR option_data IN SELECT * FROM jsonb_array_elements(question_data->'options')
    LOOP
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
        (option_data->>'billing_code_id')::uuid,
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
  
  -- Aktualisiere Abhängigkeiten in einem separaten Durchlauf
  question_index := 0;
  FOR question_data IN SELECT * FROM jsonb_array_elements(p_questions)
  LOOP
    q_id := NULL;
    o_id := NULL;
    
    -- Prüfe, ob diese Frage Abhängigkeiten hat
    IF (question_data->>'depends_on_question_id') IS NOT NULL THEN
      -- Finde die richtige Frage-ID
      IF (question_data->>'depends_on_question_id') LIKE 'new-%' THEN
        -- Es ist eine neu erstellte Frage, ersetze 'new-' durch '' und finde im mapping
        q_id := question_mapping->>REPLACE(question_data->>'depends_on_question_id', 'new-', '');
      ELSE
        -- Es ist eine bestehende Frage-ID
        q_id := (question_data->>'depends_on_question_id')::uuid;
      END IF;
    END IF;
    
    -- Prüfe, ob diese Frage von einer Option abhängig ist
    IF (question_data->>'depends_on_option_id') IS NOT NULL THEN
      -- Finde die richtige Option-ID
      IF (question_data->>'depends_on_option_id') LIKE 'new-option-%' THEN
        -- Es ist eine neu erstellte Option
        -- Das Format ist "new-option-QINDEX-OINDEX"
        DECLARE
          option_key TEXT;
          parts TEXT[];
        BEGIN
          -- Extrahiere nur die Zahlen aus dem String
          parts := string_to_array(REPLACE(question_data->>'depends_on_option_id', 'new-option-', ''), '-');
          IF array_length(parts, 1) >= 2 THEN
            option_key := parts[1] || '_' || parts[2];
            o_id := (option_mapping->>option_key)::uuid;
          END IF;
        END;
      ELSE
        -- Es ist eine bestehende Option-ID
        o_id := (question_data->>'depends_on_option_id')::uuid;
      END IF;
    END IF;
    
    -- Aktualisiere die Abhängigkeiten nur wenn die Frage existiert und es Abhängigkeiten gibt
    IF question_ids[question_index + 1] IS NOT NULL AND (q_id IS NOT NULL OR o_id IS NOT NULL) THEN
      UPDATE billing_form_questions
      SET 
        depends_on_question_id = q_id,
        depends_on_option_id = o_id
      WHERE id = question_ids[question_index + 1];
    END IF;
    
    question_index := question_index + 1;
  END LOOP;
  
  -- Erstelle Ergebnis
  result := jsonb_build_object(
    'success', true,
    'form_id', created_form_id,
    'question_ids', question_ids,
    'option_ids', option_ids
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