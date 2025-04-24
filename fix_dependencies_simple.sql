-- Korrigierte Version der gespeicherten Prozedur für die Abhängigkeiten
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
  temp_depends_on_question_id TEXT;
  temp_depends_on_option_id TEXT;
  temp_q_id UUID;
  temp_o_id UUID;
  result JSONB;
BEGIN
  -- Protokollierung für Debugging
  RAISE NOTICE 'Starte save_billing_form mit form_id: %', p_form_id;
  
  -- Wenn form_id null ist, erstelle einen neuen Abrechnungsbogen
  IF p_form_id IS NULL THEN
    INSERT INTO billing_forms (name, description, category_id)
    VALUES (p_form_name, p_form_description, p_form_category_id)
    RETURNING id INTO created_form_id;
    
    RAISE NOTICE 'Neuer Abrechnungsbogen erstellt mit ID: %', created_form_id;
  ELSE
    -- Andernfalls aktualisiere den bestehenden Bogen
    UPDATE billing_forms
    SET name = p_form_name,
        description = p_form_description,
        category_id = p_form_category_id
    WHERE id = p_form_id;
    
    created_form_id := p_form_id;
    
    RAISE NOTICE 'Bestehender Abrechnungsbogen aktualisiert mit ID: %', created_form_id;
    
    -- Lösche bestehende Fragen (Optionen werden via CASCADE gelöscht)
    DELETE FROM billing_form_questions
    WHERE form_id = created_form_id;
    
    RAISE NOTICE 'Bestehende Fragen für Abrechnungsbogen gelöscht';
  END IF;
  
  -- Erstelle neue Fragen und Optionen ohne Abhängigkeiten
  question_index := 0;
  RAISE NOTICE 'Beginne mit der Erstellung von % Fragen', jsonb_array_length(p_questions);
  
  FOR question_data IN SELECT * FROM jsonb_array_elements(p_questions)
  LOOP
    -- Erstelle Frage ohne Abhängigkeiten
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
    
    RAISE NOTICE 'Frage % erstellt: ID=%, Text=%, Type=%', 
      question_index, new_question_id, question_data->>'question_text', question_data->>'question_type';
    
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
      
      RAISE NOTICE 'Option %_% erstellt: ID=%, Text=%', 
        question_index, option_index, new_option_id, option_data->>'option_text';
      
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
  
  -- Jetzt aktualisiere alle Abhängigkeiten in einem zweiten Durchlauf
  RAISE NOTICE 'Beginne mit der Aktualisierung der Abhängigkeiten';
  question_index := 0;
  
  FOR question_data IN SELECT * FROM jsonb_array_elements(p_questions)
  LOOP
    -- Extrahiere Abhängigkeitsinformationen
    temp_depends_on_question_id := question_data->>'depends_on_question_id';
    temp_depends_on_option_id := question_data->>'depends_on_option_id';
    temp_q_id := NULL;
    temp_o_id := NULL;
    
    RAISE NOTICE 'Verarbeite Abhängigkeiten für Frage %: depends_on_question_id=%, depends_on_option_id=%', 
      question_index, temp_depends_on_question_id, temp_depends_on_option_id;
    
    -- Verarbeite Question-ID-Abhängigkeit
    IF temp_depends_on_question_id IS NOT NULL AND temp_depends_on_question_id != '' THEN
      IF temp_depends_on_question_id LIKE 'new-%' THEN
        -- Neue Frage-ID
        DECLARE
          index_str TEXT := REPLACE(temp_depends_on_question_id, 'new-', '');
        BEGIN
          RAISE NOTICE 'Versuche, neue Frage-ID zu finden für Index %', index_str;
          temp_q_id := (question_mapping->>index_str)::uuid;
          RAISE NOTICE 'Gefundene Question-ID für Index %: %', index_str, temp_q_id;
        END;
      ELSE
        -- Bestehende Frage-ID
        BEGIN
          temp_q_id := temp_depends_on_question_id::uuid;
          RAISE NOTICE 'Verwende bestehende Question-ID: %', temp_q_id;
        EXCEPTION WHEN OTHERS THEN
          RAISE NOTICE 'Fehler beim Konvertieren der Question-ID: %', temp_depends_on_question_id;
        END;
      END IF;
    END IF;
    
    -- Verarbeite Option-ID-Abhängigkeit
    IF temp_depends_on_option_id IS NOT NULL AND temp_depends_on_option_id != '' THEN
      IF temp_depends_on_option_id LIKE 'new-option-%' THEN
        -- Neue Option-ID, Format: new-option-QINDEX-OINDEX
        DECLARE
          parts TEXT[];
          option_key TEXT;
          orig_key TEXT := REPLACE(temp_depends_on_option_id, 'new-option-', '');
        BEGIN
          RAISE NOTICE 'Versuche, neue Option-ID zu finden für %', orig_key;
          
          -- Versuche das Format new-option-INDEX zu verarbeiten
          IF orig_key ~ '^[0-9]+$' THEN
            option_key := '0_' || orig_key;  -- Nimm an, es ist die erste Frage
            RAISE NOTICE 'Einfacher Index, verwende Schlüssel: %', option_key;
          ELSE
            -- Versuche das Format new-option-QINDEX-OINDEX zu verarbeiten
            parts := string_to_array(orig_key, '-');
            IF array_length(parts, 1) >= 2 THEN
              option_key := parts[1] || '_' || parts[2];
              RAISE NOTICE 'Zusammengesetzter Index, verwende Schlüssel: %', option_key;
            ELSE
              option_key := orig_key;
              RAISE NOTICE 'Unbekanntes Format, verwende direkt: %', option_key;
            END IF;
          END IF;
          
          temp_o_id := (option_mapping->>option_key)::uuid;
          RAISE NOTICE 'Gefundene Option-ID für Schlüssel %: %', option_key, temp_o_id;
        END;
      ELSE
        -- Bestehende Option-ID
        BEGIN
          temp_o_id := temp_depends_on_option_id::uuid;
          RAISE NOTICE 'Verwende bestehende Option-ID: %', temp_o_id;
        EXCEPTION WHEN OTHERS THEN
          RAISE NOTICE 'Fehler beim Konvertieren der Option-ID: %', temp_depends_on_option_id;
        END;
      END IF;
    END IF;
    
    -- Aktualisiere die Abhängigkeiten nur, wenn sie gesetzt werden sollen
    IF temp_q_id IS NOT NULL OR temp_o_id IS NOT NULL THEN
      RAISE NOTICE 'Aktualisiere Abhängigkeiten für Frage %: question_id=%, depends_on_question_id=%, depends_on_option_id=%', 
        question_index, question_ids[question_index + 1], temp_q_id, temp_o_id;
      
      -- WICHTIGE KORREKTUR: question_index + 1 zu question_index geändert
      -- Arrays in PostgreSQL beginnen bei 1, nicht bei 0
      IF question_index < array_length(question_ids, 1) THEN
        UPDATE billing_form_questions
        SET depends_on_question_id = temp_q_id,
            depends_on_option_id = temp_o_id
        WHERE id = question_ids[question_index + 1];
        
        -- Überprüfe, ob das Update erfolgreich war
        DECLARE
          updated_rows INTEGER;
        BEGIN
          GET DIAGNOSTICS updated_rows = ROW_COUNT;
          RAISE NOTICE 'Update für Frage % abgeschlossen, % Zeilen betroffen', question_index, updated_rows;
        END;
      ELSE
        RAISE NOTICE 'Index % außerhalb des gültigen Bereichs für question_ids (Länge: %)', 
          question_index, array_length(question_ids, 1);
      END IF;
    END IF;
    
    question_index := question_index + 1;
  END LOOP;
  
  -- Zeige das finale Mapping für Debugging
  RAISE NOTICE 'Finales Question-Mapping: %', question_mapping;
  RAISE NOTICE 'Finales Option-Mapping: %', option_mapping;
  
  -- Erstelle Ergebnis
  result := jsonb_build_object(
    'success', true,
    'form_id', created_form_id,
    'question_ids', question_ids,
    'option_ids', option_ids,
    'debug', jsonb_build_object(
      'question_mapping', question_mapping,
      'option_mapping', option_mapping
    )
  );

  RETURN result;

EXCEPTION WHEN OTHERS THEN
  -- Bei Fehler: Ergebnisdaten mit Fehlermeldung erstellen
  RAISE NOTICE 'Fehler in save_billing_form: %', SQLERRM;
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- Gewähre Ausführungsrechte für die Funktion
GRANT EXECUTE ON FUNCTION save_billing_form(UUID, TEXT, TEXT, UUID, JSONB) TO authenticated; 