-- Fix für das Problem mit der zirkulären Abhängigkeit in den Abrechnungsbögen-Tabellen

-- 1. Löschen der bestehenden Foreign-Key-Constraints
ALTER TABLE billing_form_questions 
DROP CONSTRAINT IF EXISTS billing_form_questions_depends_on_question_id_fkey;

ALTER TABLE billing_form_questions
DROP CONSTRAINT IF EXISTS billing_form_questions_depends_on_option_id_fkey;

-- 2. Neu erstellen der Constraints mit DEFERRABLE INITIALLY DEFERRED
-- Dies ermöglicht es, die Constraints erst am Ende einer Transaktion zu überprüfen
ALTER TABLE billing_form_questions
ADD CONSTRAINT billing_form_questions_depends_on_question_id_fkey
FOREIGN KEY (depends_on_question_id) REFERENCES billing_form_questions(id) ON DELETE SET NULL
DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE billing_form_questions
ADD CONSTRAINT billing_form_questions_depends_on_option_id_fkey
FOREIGN KEY (depends_on_option_id) REFERENCES billing_form_options(id) ON DELETE SET NULL
DEFERRABLE INITIALLY DEFERRED;

-- Hinweis: Bei zukünftigen Einfüge- oder Update-Operationen sollte eine Transaktion verwendet werden
-- BEGIN;
-- -- Einfüge- oder Update-Operationen
-- COMMIT; 