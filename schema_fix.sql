-- Permanente Schema-Änderung zur Behebung des Foreign-Key-Constraint-Problems

-- 1. Constraints entfernen und neu erstellen
ALTER TABLE billing_form_questions 
DROP CONSTRAINT IF EXISTS billing_form_questions_depends_on_question_id_fkey;

ALTER TABLE billing_form_questions
DROP CONSTRAINT IF EXISTS billing_form_questions_depends_on_option_id_fkey;

-- 2. Neue, aufschiebbare Constraints hinzufügen
ALTER TABLE billing_form_questions
ADD CONSTRAINT billing_form_questions_depends_on_question_id_fkey
FOREIGN KEY (depends_on_question_id) REFERENCES billing_form_questions(id) ON DELETE SET NULL
DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE billing_form_questions
ADD CONSTRAINT billing_form_questions_depends_on_option_id_fkey
FOREIGN KEY (depends_on_option_id) REFERENCES billing_form_options(id) ON DELETE SET NULL
DEFERRABLE INITIALLY DEFERRED;

-- 3. Indexe für bessere Performance
CREATE INDEX IF NOT EXISTS idx_billing_form_questions_depends_on_question_id
ON billing_form_questions(depends_on_question_id)
WHERE depends_on_question_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_billing_form_questions_depends_on_option_id
ON billing_form_questions(depends_on_option_id)
WHERE depends_on_option_id IS NOT NULL; 