-- Tabelle für Abrechnungsbögen
CREATE TABLE IF NOT EXISTS billing_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID NOT NULL REFERENCES examination_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Tabelle für Fragen im Abrechnungsbogen
CREATE TABLE IF NOT EXISTS billing_form_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES billing_forms(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('yes_no', 'single_choice')),
  order_index INTEGER NOT NULL,
  required BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Tabelle für Antwortoptionen zu den Fragen
CREATE TABLE IF NOT EXISTS billing_form_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES billing_form_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  billing_code_id UUID REFERENCES billing_codes(id) ON DELETE SET NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Tabelle für ausgefüllte Abrechnungsbögen
CREATE TABLE IF NOT EXISTS examination_billing_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  examination_id UUID NOT NULL REFERENCES examinations(id) ON DELETE CASCADE,
  form_id UUID NOT NULL REFERENCES billing_forms(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_by UUID REFERENCES auth.users(id)
);

-- Tabelle für die Antworten in ausgefüllten Abrechnungsbögen
CREATE TABLE IF NOT EXISTS examination_billing_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  examination_billing_form_id UUID NOT NULL REFERENCES examination_billing_forms(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES billing_form_questions(id),
  option_id UUID NOT NULL REFERENCES billing_form_options(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- RLS (Row Level Security) für die Tabellen aktivieren
ALTER TABLE billing_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_form_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_form_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE examination_billing_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE examination_billing_answers ENABLE ROW LEVEL SECURITY;

-- RLS-Richtlinien für Abrechnungsbögen
CREATE POLICY "Billing forms are viewable by authenticated users" 
ON billing_forms FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can create billing forms" 
ON billing_forms FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = auth.uid() AND r.name = 'admin'
));

CREATE POLICY "Only admins can update billing forms" 
ON billing_forms FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = auth.uid() AND r.name = 'admin'
));

CREATE POLICY "Only admins can delete billing forms" 
ON billing_forms FOR DELETE
USING (EXISTS (
  SELECT 1 FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = auth.uid() AND r.name = 'admin'
));

-- Ähnliche Richtlinien für die anderen Tabellen...
-- Für billing_form_questions
CREATE POLICY "Questions are viewable by authenticated users" 
ON billing_form_questions FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can create questions" 
ON billing_form_questions FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = auth.uid() AND r.name = 'admin'
));

CREATE POLICY "Only admins can update questions" 
ON billing_form_questions FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = auth.uid() AND r.name = 'admin'
));

CREATE POLICY "Only admins can delete questions" 
ON billing_form_questions FOR DELETE
USING (EXISTS (
  SELECT 1 FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = auth.uid() AND r.name = 'admin'
));

-- Für billing_form_options
CREATE POLICY "Options are viewable by authenticated users" 
ON billing_form_options FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can create options" 
ON billing_form_options FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = auth.uid() AND r.name = 'admin'
));

CREATE POLICY "Only admins can update options" 
ON billing_form_options FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = auth.uid() AND r.name = 'admin'
));

CREATE POLICY "Only admins can delete options" 
ON billing_form_options FOR DELETE
USING (EXISTS (
  SELECT 1 FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = auth.uid() AND r.name = 'admin'
));

-- Für ausgefüllte Abrechnungsbögen und Antworten
CREATE POLICY "Filled forms are viewable by authenticated users" 
ON examination_billing_forms FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create filled forms" 
ON examination_billing_forms FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Answers are viewable by authenticated users" 
ON examination_billing_answers FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create answers" 
ON examination_billing_answers FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Indizes für bessere Performance
CREATE INDEX IF NOT EXISTS billing_forms_category_id_idx ON billing_forms(category_id);
CREATE INDEX IF NOT EXISTS billing_form_questions_form_id_idx ON billing_form_questions(form_id);
CREATE INDEX IF NOT EXISTS billing_form_questions_order_idx ON billing_form_questions(order_index);
CREATE INDEX IF NOT EXISTS billing_form_options_question_id_idx ON billing_form_options(question_id);
CREATE INDEX IF NOT EXISTS billing_form_options_order_idx ON billing_form_options(order_index);
CREATE INDEX IF NOT EXISTS examination_billing_forms_examination_id_idx ON examination_billing_forms(examination_id);
CREATE INDEX IF NOT EXISTS examination_billing_answers_form_id_idx ON examination_billing_answers(examination_billing_form_id);

-- Trigger für automatisches Aktualisieren von updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_billing_forms_updated_at
BEFORE UPDATE ON billing_forms
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_billing_form_questions_updated_at
BEFORE UPDATE ON billing_form_questions
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_billing_form_options_updated_at
BEFORE UPDATE ON billing_form_options
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column(); 