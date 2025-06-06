-- Beispiel SQL für Supabase Tabellenerstellung

-- SQL-Script für Supabase, um die Tabellen für das Abrechnungssystem zu erstellen

-- Tabelle für Abrechnungskategorien
CREATE TABLE billing_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabelle für Abrechnungsziffern
CREATE TABLE billing_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL CHECK (char_length(code) <= 4),
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  category_id UUID NOT NULL REFERENCES billing_categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index für schnellere Suche
CREATE INDEX billing_codes_code_idx ON billing_codes (code);
CREATE INDEX billing_codes_category_id_idx ON billing_codes (category_id);

-- Trigger für automatisches Aktualisieren von updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_billing_categories_updated_at
BEFORE UPDATE ON billing_categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_codes_updated_at
BEFORE UPDATE ON billing_codes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)-Richtlinien
-- Zunächst RLS deaktivieren, da es Probleme verursacht
ALTER TABLE billing_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE billing_codes DISABLE ROW LEVEL SECURITY;

-- Alternativ: RLS aktivieren, aber PUBLIC Zugriff gewähren
-- Falls Sie RLS benötigen, kommentieren Sie die obigen DISABLE-Befehle aus und verwenden Sie stattdessen folgendes:
/*
ALTER TABLE billing_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_codes ENABLE ROW LEVEL SECURITY;

-- Zugriff für alle Benutzer (auch nicht authentifizierte) erlauben
CREATE POLICY billing_categories_public_policy ON billing_categories
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY billing_codes_public_policy ON billing_codes
  FOR ALL
  USING (true)
  WITH CHECK (true);
*/

-- Beispieldaten für Kategorien (optional)
INSERT INTO billing_categories (name) VALUES 
  ('Standardleistungen'),
  ('Zusatzleistungen'),
  ('Materialkosten');
