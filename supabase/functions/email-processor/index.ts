// supabase/functions/email-processor/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PostmarkClient } from "https://esm.sh/postmark";

// Konfiguration
const POSTMARK_API_TOKEN = Deno.env.get("POSTMARK_API_TOKEN") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_KEY") || "";

// Postmark Client initialisieren
const postmarkClient = new PostmarkClient(POSTMARK_API_TOKEN);

// Supabase Client initialisieren
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Hilfsfunktion: Prüfen, ob innerhalb der erlaubten Sendezeit
function isWithinSendingHours(
  start: string,
  end: string,
  now = new Date()
): boolean {
  // Keine Überprüfung am Wochenende
  const day = now.getDay();
  if (day === 0 || day === 6) return false; // 0 = Sonntag, 6 = Samstag

  // Überprüfung der Uhrzeit
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  
  const hourNow = now.getHours();
  const minuteNow = now.getMinutes();
  
  const startTime = startHour * 60 + startMinute;
  const endTime = endHour * 60 + endMinute;
  const nowTime = hourNow * 60 + minuteNow;
  
  return nowTime >= startTime && nowTime <= endTime;
}

// NEUE FUNKTIONEN FÜR BEDINGTE AUSDRÜCKE //

// Funktion zur Verarbeitung von E-Mail-Templates mit bedingten Ausdrücken
function processEmailTemplate(template: string, data: any): string {
  if (!template) return "";
  
  // Schritt 1: Bedingte Ausdrücke verarbeiten
  let processedTemplate = processConditionalExpressions(template, data);
  
  // Schritt 2: Platzhalter ersetzen
  processedTemplate = replacePlaceholders(processedTemplate, data);
  
  return processedTemplate;
}

// Funktion für bedingte Ausdrücke
function processConditionalExpressions(text: string, data: any): string {
  if (!text) return "";
  
  let result = text;
  
  // Regulärer Ausdruck für einfache if/else-Bedingungen
  const simpleIfRegex = /{{if\s+([^}]+?)}}(.*?)(?:{{else}}(.*?))?{{endif}}/gs;
  
  // Text nach einfachen if/else-Ausdrücken durchsuchen
  result = result.replace(simpleIfRegex, (match, condition, ifContent, elseContent = '') => {
    try {
      if (evaluateCondition(condition, data)) {
        return ifContent;
      } else {
        return elseContent;
      }
    } catch (error) {
      console.error('Fehler beim Auswerten der Bedingung:', error);
      return match; // Bei Fehler den ursprünglichen Text belassen
    }
  });
  
  // Komplexer regulärer Ausdruck für if/else if/else-Bedingungen
  const elseIfRegex = /{{if\s+([^}]+?)}}(.*?){{else if\s+([^}]+?)}}(.*?)(?:{{else}}(.*?))?{{endif}}/gs;
  
  // Text nach komplexeren if/else if/else-Ausdrücken durchsuchen
  result = result.replace(elseIfRegex, (match, condition1, content1, condition2, content2, elseContent = '') => {
    try {
      if (evaluateCondition(condition1, data)) {
        return content1;
      } else if (evaluateCondition(condition2, data)) {
        return content2;
      } else {
        return elseContent;
      }
    } catch (error) {
      console.error('Fehler beim Auswerten der komplexen Bedingung:', error);
      return match; // Bei Fehler den ursprünglichen Text belassen
    }
  });
  
  return result;
}

// Funktion zur Auswertung einer einzelnen Bedingung
function evaluateCondition(condition: string, data: any): boolean {
  try {
    // Bedingung parsen
    const conditionParts = condition.trim().split(/\s*(==|!=|>=|<=|>|<)\s*/);
    
    if (conditionParts.length < 3) {
      console.error('Ungültiges Bedingungsformat:', condition);
      return false;
    }
    
    const fieldPath = conditionParts[0];
    const operator = conditionParts[1];
    const rawValue = conditionParts.slice(2).join(''); // Falls der Wert Leerzeichen enthält
    
    // Entferne Anführungszeichen aus dem Wert
    const value = rawValue.replace(/^['"](.*)['"]$/, '$1');
    
    // Feldwert aus den Daten extrahieren
    const fieldValue = getNestedValue(data, fieldPath);
    
    // Operator anwenden
    switch (operator) {
      case '==': return String(fieldValue) === value;
      case '!=': return String(fieldValue) !== value;
      case '>': return Number(fieldValue) > Number(value);
      case '<': return Number(fieldValue) < Number(value);
      case '>=': return Number(fieldValue) >= Number(value);
      case '<=': return Number(fieldValue) <= Number(value);
      default: return false;
    }
  } catch (error) {
    console.error('Fehler beim Auswerten der Bedingung:', error);
    return false;
  }
}

// Hilfsfunktion zum Extrahieren verschachtelter Werte
function getNestedValue(obj: any, path: string): any {
  const parts = path.split('.');
  let value = obj;
  
  for (const part of parts) {
    if (!value || value[part] === undefined) {
      return undefined;
    }
    value = value[part];
  }
  
  return value;
}

// ERSATZ FÜR DIE ALTE PLATZHALTER-FUNKTION //
// Hilfsfunktion: Platzhalter in Text ersetzen
function replacePlaceholders(text: string, data: any): string {
  if (!text) return "";
  
  return text.replace(/{{([^}]+)}}/g, (match, path) => {
    // Ignoriere Platzhalter, die Teil einer Bedingung sind (if, else, endif)
    if (path.startsWith('if ') || path === 'else' || path === 'endif' || path.startsWith('else if ')) {
      return match;
    }
    
    try {
      // Wert aus verschachteltem Objekt extrahieren
      const value = getNestedValue(data, path);
      
      // Wenn der Wert undefined oder null ist, gib leeren String zurück
      if (value === undefined || value === null) {
        return '';
      }
      
      // Besondere Formatierung für bestimmte Felder
      if (path === 'appointment.start_time' && value) {
        try {
          const date = new Date(value);
          return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth()+1).toString().padStart(2, '0')}.${date.getFullYear()}, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} Uhr`;
        } catch (e) {
          console.error('Fehler beim Formatieren des Datums:', e);
          return String(value);
        }
      }
      
      // Boolean-Werte in Ja/Nein umwandeln
      if (typeof value === 'boolean') {
        return value ? 'Ja' : 'Nein';
      }
      
      return String(value);
    } catch (error) {
      console.error(`Fehler beim Ersetzen des Platzhalters {{${path}}}:`, error);
      return ''; // Bei Fehler leeren String zurückgeben
    }
  });
}

// Hilfsfunktion: Auswerten der Bedingungsgruppen
function evaluateConditions(conditionGroups: any[], data: any): boolean {
  if (!conditionGroups || conditionGroups.length === 0) {
    return true; // Keine Bedingungen = immer wahr
  }
  
  // Auswerten jeder Bedingungsgruppe (verbunden durch OR)
  return conditionGroups.some(group => {
    const { operator, conditions } = group;
    
    if (!conditions || conditions.length === 0) {
      return true; // Leere Gruppe = immer wahr
    }
    
    // Auswerten der Bedingungen innerhalb der Gruppe (verbunden durch AND oder OR)
    return conditions[operator === 'AND' ? 'every' : 'some'](
      (condition: any) => {
        const { field, operator: condOperator, value } = condition;
        
        // Wert aus dem Datenobjekt extrahieren
        const fieldValue = getNestedValue(data, field);
        
        // Typkonvertierung für Vergleiche
        let expectedValue = value;
        if (value === 'true') expectedValue = true;
        if (value === 'false') expectedValue = false;
        
        // Vergleichsoperator anwenden
        switch (condOperator) {
          case '=':
            return fieldValue == expectedValue;
          case '!=':
            return fieldValue != expectedValue;
          default:
            return false;
        }
      }
    );
  });
}

// Hauptfunktion: Verarbeite ausstehende E-Mails
async function processScheduledEmails() {
  const now = new Date();
  
  try {
    // 1. Finde ausstehende E-Mails, die jetzt gesendet werden müssen
    const { data: scheduledEmails, error: fetchError } = await supabase
      .from('scheduled_emails')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', now.toISOString());
      
    if (fetchError) throw fetchError;
    
    // 2. Verarbeite jede ausstehende E-Mail
    for (const email of scheduledEmails || []) {
      try {
        // Sende die E-Mail mit Postmark
        const response = await postmarkClient.sendEmail({
          From: email.sender_email,
          To: email.recipient_email,
          Subject: email.subject,
          HtmlBody: email.body,
          MessageStream: 'outbound'
        });
        
        // Aktualisiere den Status in der Datenbank
        await supabase
          .from('scheduled_emails')
          .update({ 
            status: 'processed',
            processed_at: new Date().toISOString()
          })
          .eq('id', email.id);
          
        // Erstelle einen Eintrag im E-Mail-Log
        await supabase
          .from('email_logs')
          .insert([{
            template_id: email.template_id,
            appointment_id: email.appointment_id,
            patient_id: email.patient_id,
            recipient_email: email.recipient_email,
            subject: email.subject,
            body: email.body,
            status: 'sent',
            scheduled_for: email.scheduled_for,
            sent_at: new Date().toISOString()
          }]);
        
        console.log(`E-Mail ${email.id} erfolgreich versendet an ${email.recipient_email}`);
      } catch (error) {
        console.error(`Fehler beim Versenden der E-Mail ${email.id}:`, error);
        
        // Aktualisiere den Status auf Fehler
        await supabase
          .from('scheduled_emails')
          .update({ 
            status: 'error',
            error_message: error.message || 'Unbekannter Fehler'
          })
          .eq('id', email.id);
          
        // Erstelle einen Eintrag im E-Mail-Log
        await supabase
          .from('email_logs')
          .insert([{
            template_id: email.template_id,
            appointment_id: email.appointment_id,
            patient_id: email.patient_id,
            recipient_email: email.recipient_email,
            subject: email.subject,
            body: email.body,
            status: 'failed',
            error_message: error.message || 'Unbekannter Fehler',
            scheduled_for: email.scheduled_for
          }]);
          
        // Erstelle einen Kommentar zum Termin, falls vorhanden
        if (email.appointment_id) {
          await supabase
            .from('appointment_comments')
            .insert([{
              appointment_id: email.appointment_id,
              comment: `E-Mail konnte nicht verschickt werden: ${error.message || 'Unbekannter Fehler'}`,
              created_by: 'system'
            }]);
        }
      }
    }
    
    return { success: true, processed: scheduledEmails?.length || 0 };
  } catch (error) {
    console.error('Fehler bei der Verarbeitung ausstehender E-Mails:', error);
    return { success: false, error: error.message };
  }
}

// Hauptfunktion: Plane E-Mails basierend auf Trigger-Ereignissen
async function scheduleEmailsForAppointment(appointmentId: string, triggerType: string) {
  try {
    // 1. Lade Termin-Daten
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:patient_id (*),
        examination:examination_id (*),
        location:location_id (*),
        device:device_id (*)
      `)
      .eq('id', appointmentId)
      .single();
      
    if (appointmentError) throw appointmentError;
    if (!appointment) throw new Error('Termin nicht gefunden');
    
    // 2. Lade alle E-Mail-Vorlagen für diesen Trigger-Typ
    const { data: templates, error: templatesError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('trigger_type', triggerType);
      
    if (templatesError) throw templatesError;
    
    // 3. Für jede passende Vorlage E-Mail planen
    for (const template of templates || []) {
      // Stelle die Daten für die Vorlagen zusammen
      const data = {
        patient: appointment.patient,
        examination: appointment.examination,
        appointment: appointment,
        location: appointment.location,
        device: appointment.device
      };
      
      // Prüfe, ob die Bedingungen erfüllt sind
      const conditionsMet = evaluateConditions(template.conditions, data);
      
      if (!conditionsMet) {
        console.log(`Bedingungen für Template ${template.name} nicht erfüllt, überspringe`);
        continue;
      }
      
      // Berechne Sendezeitpunkt basierend auf Zeitplan
      let scheduledFor = new Date();
      
      if (template.schedule_type === 'before_appointment') {
        const appointmentDate = new Date(appointment.start_time);
        const value = template.schedule_time_value || 24;
        const unit = template.schedule_time_unit || 'hours';
        
        switch (unit) {
          case 'hours':
            appointmentDate.setHours(appointmentDate.getHours() - value);
            break;
          case 'days':
            appointmentDate.setDate(appointmentDate.getDate() - value);
            break;
          case 'weeks':
            appointmentDate.setDate(appointmentDate.getDate() - (value * 7));
            break;
          case 'months':
            appointmentDate.setMonth(appointmentDate.getMonth() - value);
            break;
        }
        
        scheduledFor = appointmentDate;
      } else if (template.schedule_type === 'after_appointment') {
        const appointmentDate = new Date(appointment.start_time);
        const value = template.schedule_time_value || 24;
        const unit = template.schedule_time_unit || 'hours';
        
        switch (unit) {
          case 'hours':
            appointmentDate.setHours(appointmentDate.getHours() + value);
            break;
          case 'days':
            appointmentDate.setDate(appointmentDate.getDate() + value);
            break;
          case 'weeks':
            appointmentDate.setDate(appointmentDate.getDate() + (value * 7));
            break;
          case 'months':
            appointmentDate.setMonth(appointmentDate.getMonth() + value);
            break;
        }
        
        scheduledFor = appointmentDate;
      }
      
      // Prüfe Sendezeit-Einschränkungen (Werktag, Uhrzeiten)
      if (template.send_only_workdays) {
        // Verschiebe auf nächsten Werktag, falls Wochenende
        const day = scheduledFor.getDay();
        if (day === 0) { // Sonntag
          scheduledFor.setDate(scheduledFor.getDate() + 1);
        } else if (day === 6) { // Samstag
          scheduledFor.setDate(scheduledFor.getDate() + 2);
        }
      }
      
      // Setze die richtige Uhrzeit
      if (template.send_time_start) {
        const [hour, minute] = template.send_time_start.split(':').map(Number);
        scheduledFor.setHours(hour, minute, 0, 0);
      }
      
      // Ersetze Platzhalter im Betreff und Inhalt - JETZT MIT BEDINGUNGEN
      const subject = processEmailTemplate(template.subject, data);
      const body = processEmailTemplate(template.body, data);
      
      // Füge geplante E-Mail in die Datenbank ein
      const { error: insertError } = await supabase
        .from('scheduled_emails')
        .insert([{
          template_id: template.id,
          appointment_id: appointmentId,
          patient_id: appointment.patient_id,
          recipient_email: appointment.patient.email,
          sender_email: template.sender_email,
          subject: subject,
          body: body,
          status: 'pending',
          scheduled_for: scheduledFor.toISOString()
        }]);
        
      if (insertError) throw insertError;
      
      console.log(`E-Mail für Termin ${appointmentId} mit Vorlage ${template.name} geplant für ${scheduledFor.toISOString()}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Fehler beim Planen von E-Mails:', error);
    return { success: false, error: error.message };
  }
}

// HTTP-Handler für Edge Function
serve(async (req) => {
  try {
    const url = new URL(req.url);
    const path = url.pathname;
    
    // Verarbeite ausstehende E-Mails (für Cron-Job)
    if (path === "/process") {
      const result = await processScheduledEmails();
      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" }
      });
    }
    
    // Plane E-Mails für einen neuen/geänderten/gelöschten Termin
    if (path === "/schedule" && req.method === "POST") {
      const { appointmentId, triggerType } = await req.json();
      
      if (!appointmentId || !triggerType) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "appointmentId und triggerType sind erforderlich" 
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      
      const result = await scheduleEmailsForAppointment(appointmentId, triggerType);
      
      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" }
      });
    }
    
    return new Response(
      JSON.stringify({ error: "Endpoint nicht gefunden" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});