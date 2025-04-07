-- Überprüfe die bestehende Fremdschlüsselbeziehung
SELECT
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu 
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name='billing_codes';

-- Falls die Fremdschlüsselbeziehung nicht korrekt ist, hier ist der Code, um sie neu zu erstellen
ALTER TABLE billing_codes 
DROP CONSTRAINT IF EXISTS billing_codes_category_id_fkey;

ALTER TABLE billing_codes
ADD CONSTRAINT billing_codes_category_id_fkey 
FOREIGN KEY (category_id) 
REFERENCES billing_categories(id); 