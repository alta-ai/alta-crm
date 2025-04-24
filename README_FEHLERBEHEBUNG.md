# Fehlerbehebung: Foreign Key Constraint Violation

## Problem

Bei der Erstellung oder Aktualisierung von Abrechnungsbogenformularen mit Abhängigkeiten zwischen Fragen trat folgender Fehler auf:

```
insert or update on table "billing_form_questions" violates foreign key constraint "billing_form_questions_depends_on_question_id_fkey"
```

## Ursache

Das Problem entsteht durch eine zirkuläre Abhängigkeit in der Datenbank. Bei der Erstellung neuer Fragen:

1. Eine neue Frage B soll von einer anderen neuen Frage A abhängig sein
2. Beide Fragen werden in derselben Operation erstellt
3. Beim Einfügen der Frage B mit `depends_on_question_id` auf die ID von Frage A, existiert diese ID noch nicht in der Datenbank
4. Dies führt zur Verletzung der Foreign-Key-Constraint

## Lösung

Die Lösung besteht aus drei Teilen:

### 1. Ändern der Foreign-Key-Constraints

Die Datei `fix_circular_dependency.sql` ändert die Constraints so, dass sie erst am Ende einer Transaktion überprüft werden:

```sql
ALTER TABLE billing_form_questions 
DROP CONSTRAINT IF EXISTS billing_form_questions_depends_on_question_id_fkey;

ALTER TABLE billing_form_questions
ADD CONSTRAINT billing_form_questions_depends_on_question_id_fkey
FOREIGN KEY (depends_on_question_id) REFERENCES billing_form_questions(id) ON DELETE SET NULL
DEFERRABLE INITIALLY DEFERRED;
```

### 2. Erstellen von Transaktionsfunktionen für Supabase

Die Datei `db_transaction_functions.sql` erstellt Stored Procedures für die Transaktionsverwaltung:

```sql
CREATE OR REPLACE FUNCTION begin_transaction()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  BEGIN;
END;
$$;

CREATE OR REPLACE FUNCTION commit_transaction()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  COMMIT;
END;
$$;

CREATE OR REPLACE FUNCTION rollback_transaction()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  ROLLBACK;
END;
$$;
```

### 3. Anpassen der Speicherfunktion im Frontend

Die Funktion `createQuestionsAndOptions` in `BillingFormEditor.tsx` wurde überarbeitet, um:

1. Eine Transaktion zu verwenden
2. Zuerst alle Fragen ohne Abhängigkeiten zu erstellen
3. Dann die Optionen für diese Fragen zu erstellen
4. Erst danach die Abhängigkeiten zu aktualisieren
5. Schließlich die Transaktion zu bestätigen

## Anwendung der Änderungen

Um die Änderungen anzuwenden:

1. Führen Sie zuerst `fix_circular_dependency.sql` aus, um die Constraints zu ändern
2. Führen Sie `db_transaction_functions.sql` aus, um die Transaktionsfunktionen zu erstellen
3. Aktualisieren Sie die Implementierung von `BillingFormEditor.tsx`

Nach diesen Änderungen sollte das Erstellen und Aktualisieren von Formularen mit Abhängigkeiten problemlos funktionieren. 