-- Add type column to insurance_providers
ALTER TABLE insurance_providers 
ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'private' 
CHECK (type IN ('private', 'statutory'));

-- Add comment explaining the type column
COMMENT ON COLUMN insurance_providers.type IS 
'Type of insurance provider: private (private insurance) or statutory (gesetzliche Krankenversicherung)';

-- Insert statutory insurance providers
INSERT INTO insurance_providers (name, type)
SELECT name, 'statutory'
FROM (VALUES
  ('AOK'),
  ('Audi BKK'),
  ('Bahn-BKK'),
  ('Barmer Ersatzkasse'),
  ('Bertelsmann BKK'),
  ('Betriebskrankenkasse BPW Bergische Achsen KG'),
  ('Betriebskrankenkasse der BMW AG'),
  ('Betriebskrankenkasse der G. M. Pfaff AG'),
  ('Betriebskrankenkasse Firmus'),
  ('Betriebskrankenkasse Groz-Beckert'),
  ('Betriebskrankenkasse Mahle'),
  ('Betriebskrankenkasse Miele'),
  ('Betriebskrankenkasse Mobil'),
  ('Betriebskrankenkasse Schwarzwald-Baar-Heuberg'),
  ('Betriebskrankenkasse Vereinigte Deutsche Nickel-Werke'),
  ('Betriebskrankenkasse WMF Württembergische Metallwarenfabrik AG'),
  ('BKK Akzo Nobel Bayern'),
  ('BKK B. Braun Aesculap'),
  ('BKK Deutsche Bank AG'),
  ('BKK Diakonie'),
  ('BKK Dürkopp Adler'),
  ('BKK Euregio'),
  ('BKK evm'),
  ('BKK EWE'),
  ('BKK exklusiv'),
  ('BKK Faber-Castell & Partner'),
  ('BKK Freudenberg'),
  ('BKK Gildemeister Seidensticker'),
  ('BKK Herkules'),
  ('BKK Linde'),
  ('BKK Melitta HMR'),
  ('BKK MTU'),
  ('BKK Pfalz'),
  ('BKK Provita'),
  ('BKK Public'),
  ('BKK PwC'),
  ('BKK Rieker Ricosta Weisser'),
  ('BKK Salzgitter'),
  ('BKK Scheufelen'),
  ('BKK Technoform'),
  ('BKK VBU'),
  ('BKK Verbundplus'),
  ('BKK Voralb Heller Index Leuze'),
  ('BKK Werra-Meissner'),
  ('BKK Wirtschaft & Finanzen'),
  ('BKK Würth'),
  ('BKK ZF & Partner'),
  ('BKK24'),
  ('Bosch BKK'),
  ('Bundesinnungskrankenkasse Gesundheit'),
  ('Continentale Betriebskrankenkasse'),
  ('DAK-Gesundheit'),
  ('Debeka BKK'),
  ('Die Bergische Krankenkasse'),
  ('Energie-Betriebskrankenkasse'),
  ('Ernst & Young BKK'),
  ('Gemeinsame Betriebskrankenkasse der Gesellschaften der Textilgruppe Hof'),
  ('Handelskrankenkasse'),
  ('Heimat Krankenkasse'),
  ('HEK – Hanseatische Krankenkasse'),
  ('IKK'),
  ('Innungskrankenkasse Brandenburg und Berlin'),
  ('Karl Mayer Betriebskrankenkasse'),
  ('Kaufmännische Krankenkasse'),
  ('Knappschaft'),
  ('Koenig & Bauer BKK'),
  ('Krones Betriebskrankenkasse'),
  ('Landwirtschaftliche Krankenkasse'),
  ('Mercedes-Benz Betriebskrankenkasse'),
  ('Merck BKK'),
  ('Mhplus Betriebskrankenkasse'),
  ('Novitas BKK'),
  ('Pronova BKK'),
  ('R+V Betriebskrankenkasse'),
  ('Salus BKK'),
  ('Securvita BKK'),
  ('Siemens-Betriebskrankenkasse'),
  ('SKD BKK'),
  ('Südzucker BKK'),
  ('Techniker Krankenkasse'),
  ('TUI BKK'),
  ('Viactiv BKK'),
  ('Vivida BKK')
) AS v(name)
WHERE NOT EXISTS (
  SELECT 1 FROM insurance_providers 
  WHERE name = v.name AND type = 'statutory'
);

-- Update existing providers to be private type if not already set
UPDATE insurance_providers 
SET type = 'private' 
WHERE type IS NULL;