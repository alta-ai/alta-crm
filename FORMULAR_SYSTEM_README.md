# Erweitertes Formular-System für ALTA CRM

Diese Dokumentation beschreibt die neuen Funktionen des erweiterten Formular-Systems für Abrechnungsbögen.

## Neue Funktionen

Das Formular-System wurde um folgende Funktionen erweitert:

1. **Abhängigkeiten zwischen Fragen**
   - Fragen können von anderen Fragen abhängig gemacht werden
   - Fragen werden nur angezeigt, wenn eine bestimmte Option ausgewählt wurde

2. **Neue Fragetypen**
   - **Ja/Nein-Fragen**: Einfache Auswahl zwischen Ja und Nein
   - **Einzelauswahl**: Radio-Buttons für die Auswahl einer Option
   - **Mehrfachauswahl**: Checkboxen für die Auswahl mehrerer Optionen
   - **Textfelder**: Für Freitext-Antworten
   - **Zahlenfelder**: Für numerische Antworten
   - **Aufzählungspunkte**: Checkboxen für Aufzählungspunkte

## Datenbank-Änderungen

Die folgenden Änderungen wurden an der Datenbankstruktur vorgenommen:

1. Erweiterung der `question_type`-Spalte in der `billing_form_questions`-Tabelle um neue Fragetypen
2. Hinzufügen von `depends_on_question_id` und `depends_on_option_id` in der `billing_form_questions`-Tabelle
3. Hinzufügen von `option_type` in der `billing_form_options`-Tabelle
4. Hinzufügen von `text_answer` und `number_answer` in der `examination_billing_answers`-Tabelle

## Verwendung der neuen Funktionen

### Erstellung von Abhängigkeiten zwischen Fragen

1. Erstellen Sie eine Frage A mit mehreren Antwortoptionen
2. Erstellen Sie eine Frage B, die nur angezeigt werden soll, wenn bei Frage A eine bestimmte Option ausgewählt wurde
3. Unter "Abhängigkeiten" bei Frage B:
   - Wählen Sie Frage A als "Diese Frage ist abhängig von"
   - Wählen Sie die Option, bei der Frage B angezeigt werden soll

### Verwendung der verschiedenen Fragetypen

- **Textfeld**: Verwenden Sie diesen Typ für längere Freitext-Antworten
- **Zahlenfeld**: Verwenden Sie diesen Typ für numerische Angaben
- **Mehrfachauswahl**: Ermöglicht die Auswahl mehrerer Optionen
- **Aufzählungspunkte**: Ideal für Listen oder Checklisten

## Beispiel-Anwendungsfälle

1. **Konditionale Fragen in medizinischen Formularen**:
   - Frage: "Hatten Sie schon einmal eine allergische Reaktion?" (Ja/Nein)
   - Abhängige Frage (nur bei "Ja"): "Bitte beschreiben Sie die allergische Reaktion" (Textfeld)

2. **Detaillierte Abrechnungsinformationen**:
   - Frage: "Welche Kontrastmittel wurden verwendet?" (Mehrfachauswahl)
   - Frage: "Wie viel ml wurden entnommen?" (Zahlenfeld, abhängig von der Auswahl des Kontrastmittels)

3. **Aufzählungspunkte für Checklisten**:
   - Frage: "Welche der folgenden Untersuchungen wurden durchgeführt?" (Aufzählungspunkte)

## Technische Implementierung

Die Änderungen wurden in folgenden Dateien implementiert:

- `update_billing_forms_schema.sql`: Datenbankmigrationen
- `src/components/admin/billing/BillingFormEditor.tsx`: Formular-Editor
- `src/components/admin/billing/BillingFormPreview.tsx`: Vorschau-Komponente
- `src/components/admin/billing/BillingFormFilledView.tsx`: Komponente zum Ausfüllen von Formularen

## Migration von bestehenden Daten

Bestehende Formulare und Antworten werden weiterhin unterstützt. Für die optimale Nutzung der neuen Funktionen empfehlen wir jedoch, die vorhandenen Formulare zu überarbeiten und die neuen Fragetypen zu verwenden. 