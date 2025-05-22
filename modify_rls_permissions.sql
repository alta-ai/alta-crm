-- Deaktivierung der Row-Level-Security für die Abrechnungsbögen-Tabellen

-- RLS für billing_forms deaktivieren
ALTER TABLE billing_forms DISABLE ROW LEVEL SECURITY;

-- RLS für billing_form_questions deaktivieren
ALTER TABLE billing_form_questions DISABLE ROW LEVEL SECURITY;

-- RLS für billing_form_options deaktivieren
ALTER TABLE billing_form_options DISABLE ROW LEVEL SECURITY;

-- RLS für examination_billing_forms deaktivieren
ALTER TABLE examination_billing_forms DISABLE ROW LEVEL SECURITY;

-- RLS für examination_billing_answers deaktivieren
ALTER TABLE examination_billing_answers DISABLE ROW LEVEL SECURITY;

-- Optional: Wenn du später die RLS wieder aktivieren möchtest:
-- ALTER TABLE billing_forms ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE billing_form_questions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE billing_form_options ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE examination_billing_forms ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE examination_billing_answers ENABLE ROW LEVEL SECURITY; 