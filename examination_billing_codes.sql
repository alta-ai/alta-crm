-- SQL-Skript zum Erstellen der Tabelle für die Zuordnung zwischen Untersuchungen und Abrechnungsziffern

-- Tabelle für die Zuordnung zwischen Untersuchungen und Abrechnungsziffern
CREATE TABLE IF NOT EXISTS examination_billing_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  examination_id UUID NOT NULL REFERENCES examinations(id) ON DELETE CASCADE,
  billing_code_id UUID NOT NULL REFERENCES billing_codes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  -- Unique constraint, um doppelte Zuordnungen zu vermeiden
  UNIQUE (examination_id, billing_code_id)
);

-- Indizes für bessere Performance
CREATE INDEX IF NOT EXISTS examination_billing_codes_examination_id_idx ON examination_billing_codes(examination_id);
CREATE INDEX IF NOT EXISTS examination_billing_codes_billing_code_id_idx ON examination_billing_codes(billing_code_id);

-- Trigger für automatisches Aktualisieren von updated_at
CREATE OR REPLACE TRIGGER update_examination_billing_codes_updated_at
BEFORE UPDATE ON examination_billing_codes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) für die Tabelle aktivieren
ALTER TABLE examination_billing_codes ENABLE ROW LEVEL SECURITY;

-- RLS-Richtlinien
CREATE POLICY "Examination billing codes are viewable by authenticated users" 
ON examination_billing_codes FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can create examination billing codes" 
ON examination_billing_codes FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = auth.uid() AND r.name = 'admin'
));

CREATE POLICY "Only admins can update examination billing codes" 
ON examination_billing_codes FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = auth.uid() AND r.name = 'admin'
));

CREATE POLICY "Only admins can delete examination billing codes" 
ON examination_billing_codes FOR DELETE
USING (EXISTS (
  SELECT 1 FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = auth.uid() AND r.name = 'admin'
)); 