-- Aktualisierung der Row-Level Security für die neuen Spalten in den Abrechnungsbögen-Tabellen

-- RLS-Richtlinien für die billing_form_questions Tabelle aktualisieren
DROP POLICY IF EXISTS "Questions are viewable by authenticated users" ON billing_form_questions;
CREATE POLICY "Questions are viewable by authenticated users" 
ON billing_form_questions FOR SELECT 
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Only admins can create questions" ON billing_form_questions;
CREATE POLICY "Only admins can create questions" 
ON billing_form_questions FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = auth.uid() AND r.name = 'admin'
));

DROP POLICY IF EXISTS "Only admins can update questions" ON billing_form_questions;
CREATE POLICY "Only admins can update questions" 
ON billing_form_questions FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = auth.uid() AND r.name = 'admin'
));

DROP POLICY IF EXISTS "Only admins can delete questions" ON billing_form_questions;
CREATE POLICY "Only admins can delete questions" 
ON billing_form_questions FOR DELETE
USING (EXISTS (
  SELECT 1 FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = auth.uid() AND r.name = 'admin'
));

-- RLS-Richtlinien für die billing_form_options Tabelle aktualisieren
DROP POLICY IF EXISTS "Options are viewable by authenticated users" ON billing_form_options;
CREATE POLICY "Options are viewable by authenticated users" 
ON billing_form_options FOR SELECT 
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Only admins can create options" ON billing_form_options;
CREATE POLICY "Only admins can create options" 
ON billing_form_options FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = auth.uid() AND r.name = 'admin'
));

DROP POLICY IF EXISTS "Only admins can update options" ON billing_form_options;
CREATE POLICY "Only admins can update options" 
ON billing_form_options FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = auth.uid() AND r.name = 'admin'
));

DROP POLICY IF EXISTS "Only admins can delete options" ON billing_form_options;
CREATE POLICY "Only admins can delete options" 
ON billing_form_options FOR DELETE
USING (EXISTS (
  SELECT 1 FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = auth.uid() AND r.name = 'admin'
));

-- RLS-Richtlinien für die examination_billing_answers Tabelle aktualisieren
DROP POLICY IF EXISTS "Answers are viewable by authenticated users" ON examination_billing_answers;
CREATE POLICY "Answers are viewable by authenticated users" 
ON examination_billing_answers FOR SELECT 
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can create answers" ON examination_billing_answers;
CREATE POLICY "Authenticated users can create answers" 
ON examination_billing_answers FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Optionale temporäre Deaktivierung der RLS für die Entwicklung
-- ALTER TABLE billing_forms DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE billing_form_questions DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE billing_form_options DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE examination_billing_forms DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE examination_billing_answers DISABLE ROW LEVEL SECURITY; 