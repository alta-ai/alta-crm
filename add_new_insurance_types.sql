-- SQL-Befehle zum Hinzufügen der neuen Versicherungstypen und Standardeinträge

-- 1. Hinzufügen eines Beispieleintrags für Berufsgenossenschaft
INSERT INTO insurance_providers (name, type) 
VALUES ('BG Bau', 'Berufsgenossenschft')
ON CONFLICT (name) DO NOTHING;

-- 2. Hinzufügen eines Beispieleintrags für Ausländer
INSERT INTO insurance_providers (name, type) 
VALUES ('International Health Insurance', 'Foreigners')
ON CONFLICT (name) DO NOTHING;

-- 3. Hinzufügen von Standardfaktoren für die neuen Einträge
-- Zuerst die IDs der neu eingefügten Einträge abrufen
WITH new_providers AS (
  SELECT id FROM insurance_providers 
  WHERE type IN ('Berufsgenossenschft', 'Foreigners')
)
INSERT INTO insurance_billing_factors 
  (insurance_provider_id, billing_category_id, factor)
SELECT 
  np.id AS insurance_provider_id, 
  bc.id AS billing_category_id,
  CASE 
    WHEN ip.type = 'Berufsgenossenschft' THEN 1.2  -- Beispielfaktor für Berufsgenossenschaften
    WHEN ip.type = 'Foreigners' THEN 1.5           -- Beispielfaktor für Ausländer
    ELSE 1.0
  END AS factor
FROM 
  new_providers np
CROSS JOIN 
  billing_categories bc
JOIN
  insurance_providers ip ON np.id = ip.id
WHERE 
  -- Nur einfügen, wenn noch kein Eintrag für diese Kombination existiert
  NOT EXISTS (
    SELECT 1 FROM insurance_billing_factors 
    WHERE insurance_provider_id = np.id 
    AND billing_category_id = bc.id
  );

-- Um alle Versicherungen nach Typ anzuzeigen, können Sie folgende Abfrage ausführen:
-- SELECT name, type FROM insurance_providers ORDER BY type, name; 