-- Alternative Lösung für das Problem mit dem Foreign-Key-Constraint

-- Prüfen wir zuerst, ob die Constraints als DEFERRABLE eingerichtet sind
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    tc.constraint_type,
    tc.is_deferrable,
    tc.initially_deferred
FROM 
    information_schema.table_constraints tc
WHERE 
    tc.table_name = 'billing_form_questions'
    AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY 
    tc.constraint_name;

-- Falls notwendig, Constraints als DEFERRABLE INITIALLY DEFERRED neu erstellen
ALTER TABLE billing_form_questions 
DROP CONSTRAINT IF EXISTS billing_form_questions_depends_on_question_id_fkey;

ALTER TABLE billing_form_questions
DROP CONSTRAINT IF EXISTS billing_form_questions_depends_on_option_id_fkey;

ALTER TABLE billing_form_questions
ADD CONSTRAINT billing_form_questions_depends_on_question_id_fkey
FOREIGN KEY (depends_on_question_id) REFERENCES billing_form_questions(id) ON DELETE SET NULL
DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE billing_form_questions
ADD CONSTRAINT billing_form_questions_depends_on_option_id_fkey
FOREIGN KEY (depends_on_option_id) REFERENCES billing_form_options(id) ON DELETE SET NULL
DEFERRABLE INITIALLY DEFERRED;

-- Neue Version der gespeicherten Prozedur, die auf UPDATE verzichtet
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
  q_id UUID;
  o_id UUID;
  result JSONB;
  dependency_pairs JSONB[] := '{}';  -- Speichert Frage-ID und Abhängigkeiten für späteren INSERT
BEGIN
  -- Als Transaktion ausführen
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
    
    -- Erstelle neue Fragen und sammle Abhängigkeitsinformationen
    question_index := 0;
    FOR question_data IN SELECT * FROM jsonb_array_elements(p_questions)
    LOOP
      -- Extrahiere Abhängigkeitsinformationen für spätere Verwendung
      DECLARE
        depends_on_question_id_tmp TEXT := question_data->>'depends_on_question_id';
        depends_on_option_id_tmp TEXT := question_data->>'depends_on_option_id';
        dependency_pair JSONB;
      BEGIN
        -- Erstelle Frage OHNE Abhängigkeiten
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
          NULL,  -- Keine Abhängigkeiten hier
          NULL   -- Keine Abhängigkeiten hier
        )
        RETURNING id INTO new_question_id;
        
        -- Speichere die Abhängigkeiten und die Frage-ID für späteren Gebrauch
        dependency_pair := jsonb_build_object(
          'question_id', new_question_id,
          'depends_on_question_id', depends_on_question_id_tmp,
          'depends_on_option_id', depends_on_option_id_tmp,
          'index', question_index
        );
        
        dependency_pairs := array_append(dependency_pairs, dependency_pair);
        
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
      END;
      
      question_index := question_index + 1;
    END LOOP;
    
    -- Jetzt aktualisiere alle Fragen mit Abhängigkeiten in einem einzelnen Zug
    -- Erstelle ein temporäres Array für die Abhängigkeiten
    DECLARE
      dependency_array JSONB[] := '{}';
    BEGIN
      -- Durchlaufe alle Abhängigkeitspaare
      FOR i IN 1..array_length(dependency_pairs, 1)
      LOOP
        DECLARE
          pair JSONB := dependency_pairs[i];
          question_id UUID := (pair->>'question_id')::uuid;
          depends_on_question_id_tmp TEXT := pair->>'depends_on_question_id';
          depends_on_option_id_tmp TEXT := pair->>'depends_on_option_id';
          dep_q_id UUID := NULL;
          dep_o_id UUID := NULL;
        BEGIN
          -- Konvertiere depends_on_question_id von temporären IDs in echte IDs
          IF depends_on_question_id_tmp IS NOT NULL THEN
            IF depends_on_question_id_tmp LIKE 'new-%' THEN
              -- Für neue Fragen, verwende das Mapping
              dep_q_id := (question_mapping->>REPLACE(depends_on_question_id_tmp, 'new-', ''))::uuid;
            ELSE
              -- Für bestehende Fragen, verwende die ID direkt
              dep_q_id := depends_on_question_id_tmp::uuid;
            END IF;
          END IF;
          
          -- Konvertiere depends_on_option_id von temporären IDs in echte IDs
          IF depends_on_option_id_tmp IS NOT NULL THEN
            IF depends_on_option_id_tmp LIKE 'new-option-%' THEN
              -- Für neue Optionen, verwende das Mapping basierend auf dem Format 'new-option-QINDEX-OINDEX'
              DECLARE
                parts TEXT[];
                option_key TEXT;
              BEGIN
                parts := string_to_array(REPLACE(depends_on_option_id_tmp, 'new-option-', ''), '-');
                IF array_length(parts, 1) >= 2 THEN
                  option_key := parts[1] || '_' || parts[2];
                  dep_o_id := (option_mapping->>option_key)::uuid;
                END IF;
              END;
            ELSE
              -- Für bestehende Optionen, verwende die ID direkt
              dep_o_id := depends_on_option_id_tmp::uuid;
            END IF;
          END IF;
          
          -- Nur wenn wirklich Abhängigkeiten bestehen, füge Eintrag hinzu
          IF dep_q_id IS NOT NULL OR dep_o_id IS NOT NULL THEN
            dependency_array := array_append(dependency_array, jsonb_build_object(
              'question_id', question_id,
              'depends_on_question_id', dep_q_id,
              'depends_on_option_id', dep_o_id
            ));
          END IF;
        END;
      END LOOP;
      
      -- Jetzt aktualisiere alle Abhängigkeiten auf einmal in einer Schleife
      FOR i IN 1..array_length(dependency_array, 1)
      LOOP
        DECLARE
          dep JSONB := dependency_array[i];
          q_id UUID := (dep->>'question_id')::uuid;
          dep_q_id UUID := (dep->>'depends_on_question_id')::uuid;
          dep_o_id UUID := (dep->>'depends_on_option_id')::uuid;
        BEGIN
          -- Aktualisiere die Frage
          UPDATE billing_form_questions
          SET depends_on_question_id = dep_q_id,
              depends_on_option_id = dep_o_id
          WHERE id = q_id;
        END;
      END LOOP;
    END;
    
    -- Erstelle Ergebnis
    result := jsonb_build_object(
      'success', true,
      'form_id', created_form_id,
      'question_ids', question_ids,
      'option_ids', option_ids
    );
    
    RETURN result;
    
  EXCEPTION WHEN OTHERS THEN
    -- Bei Fehler: Rollback und Fehlermeldung zurückgeben
    RAISE INFO 'Error in transaction: %', SQLERRM;
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
  END;
END;
$$;

-- Gewähre Ausführungsrechte für die Funktion
GRANT EXECUTE ON FUNCTION save_billing_form(UUID, TEXT, TEXT, UUID, JSONB) TO authenticated; 