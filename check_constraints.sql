-- Prüfen, ob die FK-Constraints als DEFERRABLE INITIALLY DEFERRED konfiguriert sind
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    tc.constraint_type,
    tc.is_deferrable,
    tc.initially_deferred
FROM 
    information_schema.table_constraints tc
WHERE 
    tc.table_name = 'billing_form_questions'
    AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY 
    tc.constraint_name; 