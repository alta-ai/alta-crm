# Notfall-Lösung für Abrechnungsbogen-Abhängigkeiten

Da wir weiterhin Probleme mit dem Foreign-Key-Constraint haben, schlage ich folgenden Ansatz vor:

## 1. Einfache Datenbank-Funktion ohne Abhängigkeiten

Die neue Funktion `save_billing_form` erzeugt Fragen und Optionen, ignoriert aber die Abhängigkeiten (setzt `depends_on_question_id` und `depends_on_option_id` auf NULL).

## 2. Abhängigkeiten im Frontend verwalten

Die Funktion gibt die Mappings zwischen temporären IDs (im Frontend) und echten IDs (in der Datenbank) zurück. Das Frontend kann mit dieser Information die Abhängigkeiten nachträglich verarbeiten.

### Schritte im Frontend

1. Rufe die Funktion `save_billing_form` auf und speichere den Bogen ohne Abhängigkeiten.

2. Erhalte das Mapping aus der Antwort:
   ```typescript
   const { data: result, error: saveError } = await supabase.rpc('save_billing_form', {
     p_form_id: id || null,
     p_form_name: data.name,
     p_form_description: data.description,
     p_form_category_id: data.category_id,
     p_questions: data.questions
   });
   
   if (saveError) {
     console.error('Fehler beim Speichern:', saveError);
     return;
   }
   
   // Hole die Mappings
   const questionMapping = result.mapping.questions;
   const optionMapping = result.mapping.options;
   ```

3. Erstelle ein Array mit den Abhängigkeiten:
   ```typescript
   const dependencies = [];
   
   data.questions.forEach((question, questionIndex) => {
     if (question.depends_on_question_id || question.depends_on_option_id) {
       // Suche die echte Frage-ID im Mapping
       const realQuestionId = questionMapping[questionIndex];
       
       // Echte Abhängigkeits-IDs auflösen
       let realDependsOnQuestionId = null;
       if (question.depends_on_question_id) {
         if (question.depends_on_question_id.startsWith('new-')) {
           // Index aus "new-X" extrahieren
           const index = question.depends_on_question_id.replace('new-', '');
           realDependsOnQuestionId = questionMapping[index];
         } else {
           // Bereits bestehende UUID verwenden
           realDependsOnQuestionId = question.depends_on_question_id;
         }
       }
       
       let realDependsOnOptionId = null;
       if (question.depends_on_option_id) {
         if (question.depends_on_option_id.startsWith('new-option-')) {
           // Indizes aus "new-option-X-Y" extrahieren
           const parts = question.depends_on_option_id.replace('new-option-', '').split('-');
           const key = parts[0] + '_' + parts[1];
           realDependsOnOptionId = optionMapping[key];
         } else {
           // Bereits bestehende UUID verwenden
           realDependsOnOptionId = question.depends_on_option_id;
         }
       }
       
       dependencies.push({
         question_id: realQuestionId,
         depends_on_question_id: realDependsOnQuestionId,
         depends_on_option_id: realDependsOnOptionId
       });
     }
   });
   ```

4. Aktualisiere die Abhängigkeiten in der Datenbank:
   ```typescript
   if (dependencies.length > 0) {
     for (const dep of dependencies) {
       const { error: updateError } = await supabase
         .from('billing_form_questions')
         .update({
           depends_on_question_id: dep.depends_on_question_id,
           depends_on_option_id: dep.depends_on_option_id
         })
         .eq('id', dep.question_id);
         
       if (updateError) {
         console.error('Fehler beim Aktualisieren der Abhängigkeit:', updateError);
       }
     }
   }
   ```

## Vorteile dieses Ansatzes

1. Wir umgehen das komplexe Problem mit zirkulären Abhängigkeiten in der Datenbank.
2. Die Lösung ist einfacher und robuster.
3. Das Frontend hat mehr Kontrolle über den Prozess.
4. Bei Fehlern können wir präzisere Fehlermeldungen anzeigen.

## Langfristige Lösung

Sobald das System stabil läuft, können wir eine umfassendere Lösung implementieren:

1. Die Schema-Änderung (`schema_fix.sql`) anwenden, um die Constraints als DEFERRABLE einzurichten.
2. Eine verbesserte Version der Stored Procedure entwickeln, die korrekt mit DEFERRABLE Constraints arbeitet.

Für den Moment ist es wichtiger, dass das System funktioniert und Benutzer Abrechnungsbögen erstellen können. 