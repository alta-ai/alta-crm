# Lösung für den SQL-Fehler "column reference is ambiguous"

## Problem

Bei der Verwendung der Stored Procedure `save_billing_form` trat folgender Fehler auf:

```
column reference "form_id" is ambiguous
```

Dieser Fehler erscheint, wenn PostgreSQL nicht zwischen zwei gleichnamigen Spalten oder Bezeichnern unterscheiden kann. In diesem Fall gab es eine Mehrdeutigkeit zwischen:

1. Dem Parameter `form_id` der Funktion
2. Der Spalte `form_id` in der Tabelle `billing_form_questions`

## Lösung

Die Lösung besteht darin, die Parameternamen mit einem eindeutigen Präfix zu versehen, um Mehrdeutigkeiten zu vermeiden:

1. **SQL-Funktion aktualisieren**:
   - Alle Parameternamen mit dem Präfix `p_` versehen
   - `form_id` → `p_form_id`
   - `form_name` → `p_form_name`
   - usw.

2. **Funktionsaufruf im Frontend anpassen**:
   - Die Parameter beim Aufruf mit den neuen Namen verwenden

### Implementierte Änderungen

In der SQL-Funktion:

```sql
CREATE OR REPLACE FUNCTION save_billing_form(
  p_form_id UUID,            -- Parameter mit p_ Präfix zur Vermeidung von Ambiguität
  p_form_name TEXT,
  p_form_description TEXT,
  p_form_category_id UUID,
  p_questions JSONB
)
...
```

Im Frontend-Code:

```typescript
const { data: result, error: saveError } = await supabase.rpc('save_billing_form', {
  p_form_id: id || null,
  p_form_name: data.name,
  p_form_description: data.description,
  p_form_category_id: data.category_id,
  p_questions: questionsJson
});
```

### Grant-Berechtigungen

Bei der Erteilung von Berechtigungen auf die Funktion müssen die Parametertypen angegeben werden:

```sql
GRANT EXECUTE ON FUNCTION save_billing_form(UUID, TEXT, TEXT, UUID, JSONB) TO authenticated;
```

## Warum ist die Qualifizierung wichtig?

In SQL können mehrdeutige Spaltenreferenzen auftreten, wenn:

1. Mehrere Tabellen in einer Abfrage dieselbe Spalte haben
2. Eine Spalte und ein Parameter denselben Namen haben

Durch Verwendung eindeutiger Namen oder Aliase können solche Mehrdeutigkeiten vermieden werden. Dies ist besonders wichtig bei komplexen Funktionen, die mehrere Tabellen oder Parameter verwenden.

# Lösung für den PostgreSQL-Fehler "cannot change name of input parameter"

## Problem

Bei dem Versuch, die Funktion `save_billing_form` zu aktualisieren, um die Parameter mit dem Präfix `p_` zu versehen, trat folgender Fehler auf:

```
ERROR: 42P13: cannot change name of input parameter "form_id"
HINT: Use DROP FUNCTION save_billing_form(uuid,text,text,uuid,jsonb) first.
```

PostgreSQL erlaubt es nicht, die Namen von Funktionsparametern zu ändern, ohne die Funktion zuerst zu löschen. Dies ist eine Sicherheitsmaßnahme, um unbeabsichtigte Änderungen an der Funktionssignatur zu vermeiden.

## Lösung

Die Lösung besteht darin, die bestehende Funktion zuerst zu löschen, bevor die neue Version erstellt wird:

1. **Funktion löschen**:
   ```sql
   DROP FUNCTION IF EXISTS save_billing_form(UUID, TEXT, TEXT, UUID, JSONB);
   ```

2. **Funktion neu erstellen**:
   ```sql
   CREATE OR REPLACE FUNCTION save_billing_form(
     p_form_id UUID,
     p_form_name TEXT,
     ...
   )
   ...
   ```

### Wichtige Hinweise

1. Die Angabe der Parametertypen beim DROP FUNCTION-Befehl ist wichtig, da PostgreSQL Funktionsüberladung unterstützt und mehrere Funktionen mit demselben Namen, aber unterschiedlichen Parametertypen haben kann.

2. Der Befehl `CREATE OR REPLACE FUNCTION` funktioniert nur, wenn die Parameter-Datentypen unverändert bleiben, nicht jedoch wenn sich die Parameternamen ändern.

3. Beim Löschen einer Funktion sollten Sie sicherstellen, dass keine Anwendungen oder andere Datenbankobjekte auf diese Funktion verweisen, während Sie die Änderung vornehmen.

### Komplette Lösung

Die Lösung wurde in eine neue SQL-Datei implementiert:

```sql
-- Zuerst die bestehende Funktion löschen
DROP FUNCTION IF EXISTS save_billing_form(UUID, TEXT, TEXT, UUID, JSONB);

-- Dann die korrigierte Version erstellen
CREATE OR REPLACE FUNCTION save_billing_form(
  p_form_id UUID,
  p_form_name TEXT,
  p_form_description TEXT,
  p_form_category_id UUID,
  p_questions JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
-- Funktionskörper
$$;
```

# Lösung für den Fehler "cannot extract elements from a scalar"

## Problem

Beim Verwenden der `save_billing_form` Funktion im Frontend trat folgender Fehler auf:

```
cannot extract elements from a scalar
```

Dieser Fehler tritt auf, wenn PostgreSQL versucht, ein JSON-Array zu durchlaufen (mit `jsonb_array_elements`), aber stattdessen einen JSON-Skalar (eine einfache Zeichenkette) erhält.

## Lösung

Der Fehler entstand, weil das Frontend das JavaScript-Array mit `JSON.stringify()` in einen JSON-String umwandelte, bevor es an die Datenbank gesendet wurde.

Stattdessen sollte das Array direkt übergeben werden, ohne `JSON.stringify()` zu verwenden:

```typescript
// Vorher (fehlerhaft):
const questionsJson = JSON.stringify(data.questions);

// Nachher (korrigiert):
const questionsJson = data.questions;
```

Mit dieser Änderung konvertiert Supabase das JavaScript-Array automatisch in das richtige PostgreSQL JSONB-Array-Format.

# Lösung für den Fehler "violates foreign key constraint"

## Problem

Bei der Verwendung der `save_billing_form` Funktion trat folgender Fehler auf:

```
insert or update on table "billing_form_questions" violates foreign key constraint "billing_form_questions_depends_on_question_id_fkey"
```

Dieser Fehler tritt auf, weil die Funktion versucht, Abhängigkeiten zwischen Fragen (Fremdschlüssel) zu setzen, bevor alle Fragen in der Datenbank existieren.

## Lösung

Es gibt zwei Hauptlösungsansätze für dieses Problem:

### Lösung 1: Deferred Constraints

1. **Constraints als aufschiebbar einrichten**:
   ```sql
   ALTER TABLE billing_form_questions 
   DROP CONSTRAINT IF EXISTS billing_form_questions_depends_on_question_id_fkey;

   ALTER TABLE billing_form_questions
   ADD CONSTRAINT billing_form_questions_depends_on_question_id_fkey
   FOREIGN KEY (depends_on_question_id) REFERENCES billing_form_questions(id) ON DELETE SET NULL
   DEFERRABLE INITIALLY DEFERRED;
   ```

2. **In der Funktion die Constraints explizit aufschieben**:
   ```sql
   SET CONSTRAINTS billing_form_questions_depends_on_question_id_fkey DEFERRED;
   ```

### Lösung 2: Zwei-Phasen-Ansatz

Eine robustere Lösung ist ein zweiphasiger Ansatz:

1. **Phase 1**: Alle Fragen und Optionen zuerst ohne Abhängigkeiten erstellen
2. **Phase 2**: In einem separaten Durchlauf die Abhängigkeiten aktualisieren

```sql
-- Phase 1: Erstelle alle Fragen ohne Abhängigkeiten
FOR question_data IN SELECT * FROM jsonb_array_elements(p_questions)
LOOP
  INSERT INTO billing_form_questions (
    -- Felder...
    depends_on_question_id, -- NULL
    depends_on_option_id    -- NULL
  ) VALUES (
    -- Werte...
    NULL,
    NULL
  );
END LOOP;

-- Phase 2: Aktualisiere Abhängigkeiten
FOR i IN 1..array_length(questions, 1)
LOOP
  UPDATE billing_form_questions
  SET depends_on_question_id = ...,
      depends_on_option_id = ...
  WHERE id = ...;
END LOOP;
```

### Implementierte Lösung

Die implementierte Lösung kombiniert beide Ansätze:

1. Die Constraints werden als DEFERRABLE INITIALLY DEFERRED konfiguriert
2. Die Abhängigkeiten werden in einem separaten Durchlauf gesetzt
3. Die Abhängigkeiten werden erst aufgelöst, nachdem alle Fragen erstellt wurden

Dies ermöglicht die zirkuläre Abhängigkeit, die auftreten kann, wenn Fragen voneinander abhängen. 