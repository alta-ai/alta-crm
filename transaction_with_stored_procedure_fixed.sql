-- Korrigierte Version der Stored Procedure für das Speichern von Abrechnungsbögen
-- Diese Funktion führt alle Operationen zum Speichern eines Formulars in einer Transaktion durch,
-- ohne die problematischen BEGIN/COMMIT Anweisungen

CREATE OR REPLACE FUNCTION save_billing_form(
  p_form_id UUID,            -- Parameter mit p_ Präfix zur Vermeidung von Ambiguität
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
  question_ids UUID[];
  option_ids UUID[];
  q_id UUID;
  result JSONB;
BEGIN
  -- PostgreSQL-Funktionen laufen bereits in einer Transaktion,
  -- daher ist kein BEGIN; erforderlich
  
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
      NULL,
      NULL
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
  
  -- Aktualisiere Abhängigkeiten
  question_index := 0;
  FOR question_data IN SELECT * FROM jsonb_array_elements(p_questions)
  LOOP
    -- Prüfe, ob diese Frage Abhängigkeiten hat
    IF (question_data->>'depends_on_question_id') IS NOT NULL THEN
      -- Finde die richtige Frage-ID
      IF (question_data->>'depends_on_question_id') LIKE 'new-%' THEN
        -- Es ist eine neu erstellte Frage
        q_id := question_mapping->>REPLACE(question_data->>'depends_on_question_id', 'new-', '');
      ELSE
        -- Es ist eine bestehende Frage-ID
        q_id := (question_data->>'depends_on_question_id')::uuid;
      END IF;
      
      -- Aktualisiere die Abhängigkeit
      UPDATE billing_form_questions
      SET depends_on_question_id = q_id
      WHERE id = question_ids[question_index + 1];
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
          parts := string_to_array(REPLACE(question_data->>'depends_on_option_id', 'new-option-', ''), '-');
          option_key := parts[1] || '_' || parts[2];
          
          UPDATE billing_form_questions
          SET depends_on_option_id = (option_mapping->>option_key)::uuid
          WHERE id = question_ids[question_index + 1];
        END;
      ELSE
        -- Es ist eine bestehende Option-ID
        UPDATE billing_form_questions
        SET depends_on_option_id = (question_data->>'depends_on_option_id')::uuid
        WHERE id = question_ids[question_index + 1];
      END IF;
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
  -- PostgreSQL macht automatisch einen Rollback wenn eine Exception auftritt
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- Gewähre Ausführungsrechte für die Funktion
GRANT EXECUTE ON FUNCTION save_billing_form(UUID, TEXT, TEXT, UUID, JSONB) TO authenticated; 