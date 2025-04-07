-- SQL-Script für Supabase, um die Tabelle für Abrechnungsfaktoren zu erstellen

-- Tabelle für Abrechnungsfaktoren der Versicherungen
CREATE TABLE insurance_billing_factors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  insurance_provider_id UUID NOT NULL REFERENCES insurance_providers(id) ON DELETE CASCADE,
  billing_category_id UUID NOT NULL REFERENCES billing_categories(id) ON DELETE CASCADE,
  factor DECIMAL(10,2) NOT NULL DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint verhindert doppelte Einträge für dieselbe Versicherung und Kategorie
  UNIQUE (insurance_provider_id, billing_category_id)
);

-- Index für schnellere Suche
CREATE INDEX insurance_billing_factors_insurance_provider_id_idx ON insurance_billing_factors (insurance_provider_id);
CREATE INDEX insurance_billing_factors_billing_category_id_idx ON insurance_billing_factors (billing_category_id);

-- Trigger für automatisches Aktualisieren von updated_at
CREATE TRIGGER update_insurance_billing_factors_updated_at
BEFORE UPDATE ON insurance_billing_factors
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) deaktivieren
ALTER TABLE insurance_billing_factors DISABLE ROW LEVEL SECURITY;

-- Beispieldaten für Faktoren (optional)
INSERT INTO insurance_billing_factors (insurance_provider_id, billing_category_id, factor)
SELECT 
  ip.id, 
  bc.id, 
  CASE 
    WHEN bc.name = 'Standardleistungen' THEN 1.0
    ELSE 2.3
  END
FROM 
  insurance_providers ip
CROSS JOIN 
  billing_categories bc
WHERE 
  ip.type = 'private'
ON CONFLICT (insurance_provider_id, billing_category_id) DO NOTHING; 