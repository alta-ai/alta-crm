-- SQL-Befehle zum Aktualisieren des CHECK-Constraints und Hinzufügen der neuen Versicherungstypen

-- 1. Zuerst den bestehenden CHECK-Constraint auf der type-Spalte entfernen
ALTER TABLE insurance_providers DROP CONSTRAINT IF EXISTS insurance_providers_type_check;

-- 2. Neuen CHECK-Constraint mit allen erlaubten Typen erstellen
ALTER TABLE insurance_providers ADD CONSTRAINT insurance_providers_type_check 
  CHECK (type IN ('private', 'statutory', 'Berufsgenossenschft', 'Foreigners'));

-- 3. Hinzufügen eines Beispieleintrags für Berufsgenossenschaft
INSERT INTO insurance_providers (name, type) 
VALUES ('BG Bau', 'Berufsgenossenschft')
ON CONFLICT (name) DO NOTHING;

-- 4. Hinzufügen eines Beispieleintrags für Ausländer
INSERT INTO insurance_providers (name, type) 
VALUES ('International Health Insurance', 'Foreigners')
ON CONFLICT (name) DO NOTHING;

-- 5. Hinzufügen von Standardfaktoren für die neuen Einträge
WITH new_providers AS (
  SELECT id, type FROM insurance_providers 
  WHERE type IN ('Berufsgenossenschft', 'Foreigners')
  AND NOT EXISTS (
    SELECT 1 FROM insurance_billing_factors 
    WHERE insurance_provider_id = insurance_providers.id
  )
)
INSERT INTO insurance_billing_factors 
  (insurance_provider_id, billing_category_id, factor)
SELECT 
  np.id AS insurance_provider_id, 
  bc.id AS billing_category_id,
  CASE 
    WHEN np.type = 'Berufsgenossenschft' THEN 1.2  -- Beispielfaktor für Berufsgenossenschaften
    WHEN np.type = 'Foreigners' THEN 1.5           -- Beispielfaktor für Ausländer
    ELSE 1.0
  END AS factor
FROM 
  new_providers np
CROSS JOIN 
  billing_categories bc
WHERE 
  -- Nur einfügen, wenn noch kein Eintrag für diese Kombination existiert
  NOT EXISTS (
    SELECT 1 FROM insurance_billing_factors 
    WHERE insurance_provider_id = np.id 
    AND billing_category_id = bc.id
  );

-- Um alle Versicherungen nach Typ anzuzeigen, können Sie folgende Abfrage ausführen:
-- SELECT name, type FROM insurance_providers ORDER BY type, name; 