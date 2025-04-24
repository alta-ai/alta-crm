-- Aktualisierung der Abrechnungsbögen-Tabellen für neue Funktionen

-- Erweitern des question_type Enums um neue Fragetypen
ALTER TABLE billing_form_questions 
DROP CONSTRAINT billing_form_questions_question_type_check;

ALTER TABLE billing_form_questions
ADD CONSTRAINT billing_form_questions_question_type_check 
CHECK (question_type IN ('yes_no', 'single_choice', 'multiple_choice', 'text', 'number', 'bullet_points'));

-- Hinzufügen einer Spalte für Abhängigkeiten zwischen Fragen
ALTER TABLE billing_form_questions
ADD COLUMN depends_on_question_id UUID REFERENCES billing_form_questions(id) ON DELETE SET NULL;

ALTER TABLE billing_form_questions
ADD COLUMN depends_on_option_id UUID REFERENCES billing_form_options(id) ON DELETE SET NULL;

-- Kommentare hinzufügen
COMMENT ON COLUMN billing_form_questions.depends_on_question_id IS 'ID der Frage, von der diese Frage abhängig ist';
COMMENT ON COLUMN billing_form_questions.depends_on_option_id IS 'ID der Option, bei der diese Frage angezeigt werden soll';

-- Zusätzliche Spalte für den Typ der Option (z.B. für Textfeld oder Zahlenfeld)
ALTER TABLE billing_form_options
ADD COLUMN option_type TEXT;

-- Änderung in der examination_billing_answers Tabelle, um Freitextantworten zu unterstützen
ALTER TABLE examination_billing_answers
ADD COLUMN text_answer TEXT;

ALTER TABLE examination_billing_answers
ADD COLUMN number_answer NUMERIC;

-- Option_id darf jetzt NULL sein (für Text- und Zahlenfelder)
ALTER TABLE examination_billing_answers
ALTER COLUMN option_id DROP NOT NULL;

-- Indizes für bessere Performance
CREATE INDEX IF NOT EXISTS billing_form_questions_depends_on_question_idx ON billing_form_questions(depends_on_question_id);
CREATE INDEX IF NOT EXISTS billing_form_questions_depends_on_option_idx ON billing_form_questions(depends_on_option_id);

-- RLS (Row Level Security) auch für die neuen Spalten aktivieren
ALTER TABLE billing_form_questions FORCE ROW LEVEL SECURITY;
ALTER TABLE billing_form_options FORCE ROW LEVEL SECURITY;
ALTER TABLE examination_billing_answers FORCE ROW LEVEL SECURITY; 