import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { supabase } from '../../../lib/supabase';
import { 
  AlertCircle, 
  Info, 
  Link as LinkIcon, 
  Eye, 
  X, 
  Calendar, 
  Clock, 
  PlusCircle, 
  Trash2, 
  Check, 
  Mail,
  AlertTriangle
} from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { cn } from '../../../lib/utils';
import { addDays, addMonths, addWeeks, addHours, format } from 'date-fns';
import { de } from 'date-fns/locale';

// Erweiterte Schnittstelle um Trigger und Scheduling zu unterstützen
interface EmailTemplateFormData {
  name: string;
  description: string;
  trigger_form: string;
  trigger_type: string;
  recipient_field: string;
  sender_email: string;
  subject: string;
  body: string;
  conditions: any;
  schedule_type: string;
  schedule_time_value: number;
  schedule_time_unit: string;
  send_only_workdays: boolean;
  send_time_start: string;
  send_time_end: string;
}

interface FormField {
  id: string;
  label: string;
}

// Datenstruktur für Vorschaudaten
interface PreviewData {
  appointment?: any;
  patient?: any;
  examination?: any;
  location?: any;
  device?: any;
  previewSendDate?: Date;
  conditionsMet?: boolean;
}

// Bestehende Formular-Typen
const FORM_TYPES = [
  {
    id: 'appointment',
    name: 'Terminbuchung',
    fields: [
      { id: 'appointment.email', label: 'E-Mail' },
      { id: 'appointment.patient_data.firstName', label: 'Vorname' },
      { id: 'appointment.patient_data.lastName', label: 'Nachname' },
      { id: 'appointment.patient_data.birthDate', label: 'Geburtsdatum' },
      { id: 'appointment.patient_data.phone', label: 'Telefon' },
      { id: 'appointment.start_time', label: 'Termin Datum/Uhrzeit' },
      { id: 'appointment.billing_type', label: 'Abrechnungsart' },
      { id: 'appointment.patient_data.has_transfer', label: 'Mit Überweisung' },
      { id: 'appointment.patient_data.referring_doctor', label: 'Überweisender Arzt' },
      { id: 'appointment.patient_data.with_contrast_medium', label: 'Mit Kontrastmittel' },
      { id: 'appointment.patient_data.has_beihilfe', label: 'Beihilfeberechtigt' }
    ]
  },
  {
    id: 'registration',
    name: 'Anmeldeformular',
    fields: [
      { id: 'vlkrd4584483f76', label: 'Vorname' },
      { id: 'foa1ua5ecf990f9', label: 'Nachname' },
      { id: 'qjdlhbe3ed1d5f0', label: 'E-Mail' }
    ]
  },
  {
    id: 'cost_reimbursement',
    name: 'Kostenerstattungsformular',
    fields: [
      { id: 'fgmo', label: 'Kostenerstattung bestätigt' }
    ]
  },
  {
    id: 'privacy',
    name: 'Datenschutzerklärung',
    fields: [
      { id: 'privacy_consent', label: 'Datenschutzerklärung bestätigt' },
      { id: 'email_consent', label: 'E-Mail-Marketing Einwilligung' }
    ]
  }
];

// Neue Trigger-Typen für Termine
const TRIGGER_TYPES = [
  { id: 'form_submission', name: 'Bei Formular-Einreichung' },
  { id: 'appointment_created', name: 'Bei Terminbuchung' },
  { id: 'appointment_updated', name: 'Bei Terminänderung' },
  { id: 'appointment_cancelled', name: 'Bei Terminabsage' }
];

// Zeiteinheiten für die Zeitplanung
const TIME_UNITS = [
  { id: 'hours', name: 'Stunden' },
  { id: 'days', name: 'Tage' },
  { id: 'weeks', name: 'Wochen' },
  { id: 'months', name: 'Monate' }
];

// Bedingungsfelder für die Logik
const CONDITION_FIELDS = {
  patient: [
    { id: 'patient.gender', label: 'Geschlecht', type: 'select', options: [
      { value: 'male', label: 'Männlich' },
      { value: 'female', label: 'Weiblich' },
      { value: 'diverse', label: 'Divers' }
    ]},
    { id: 'patient.insurance_type', label: 'Versicherungstyp', type: 'select', options: [
      { value: 'private', label: 'Privat' },
      { value: 'public', label: 'Gesetzlich' }
    ]},
    { id: 'patient.has_beihilfe', label: 'Hat Beihilfe', type: 'boolean' }
  ],
  examination: [
    { id: 'examination.type', label: 'Untersuchungstyp', type: 'select', options: [
      { value: 'mrt', label: 'MRT' },
      { value: 'ct', label: 'CT' },
      { value: 'xray', label: 'Röntgen' },
      { value: 'ultrasound', label: 'Ultraschall' }
    ]},
    { id: 'examination.with_contrast_medium', label: 'Mit Kontrastmittel', type: 'boolean' }
  ],
  location: [
    { id: 'location.id', label: 'Standort', type: 'select', options: [
      { value: 'location1', label: 'Hauptstandort' },
      { value: 'location2', label: 'Zweigstelle 1' }
    ]}
  ]
};

// Platzhalter-Kategorien
const PLACEHOLDERS = {
  patient: [
    { id: 'patient.title', label: 'Titel' },
    { id: 'patient.salutation', label: 'Anrede (Sehr geehrte/r basierend auf Geschlecht)' },
    { id: 'patient.gender', label: 'Geschlecht' },
    { id: 'patient.firstName', label: 'Vorname' },
    { id: 'patient.lastName', label: 'Nachname' },
    { id: 'patient.email', label: 'E-Mail' },
    { id: 'patient.phone', label: 'Telefon' },
    { id: 'patient.birthDate', label: 'Geburtsdatum' }
  ],
  examination: [
    { id: 'examination.name', label: 'Name der Untersuchung' },
    { id: 'examination.duration', label: 'Dauer' },
    { id: 'examination.category', label: 'Kategorie' },
    { id: 'examination.billing_info', label: 'Abrechnungsinformationen' },
    { id: 'examination.price', label: 'Preis' }
  ],
  appointment: [
    { id: 'appointment.start_time', label: 'Termin Datum/Uhrzeit' },
    { id: 'appointment.billing_type', label: 'Abrechnungsart' },
    { id: 'appointment.with_contrast_medium', label: 'Mit Kontrastmittel' },
    { id: 'appointment.has_transfer', label: 'Mit Überweisung' },
    { id: 'appointment.referring_doctor', label: 'Überweisender Arzt' },
    { id: 'appointment.has_beihilfe', label: 'Beihilfeberechtigt' },
    { id: 'appointment.forms_url', label: 'Link zu den Formularen' }
  ],
  location: [
    { id: 'location.name', label: 'Name des Standorts' },
    { id: 'location.address', label: 'Adresse' },
    { id: 'location.phone', label: 'Telefon' },
    { id: 'location.email', label: 'E-Mail' },
    { id: 'location.directions', label: 'Anfahrt' }
  ],
  device: [
    { id: 'device.name', label: 'Name des Geräts' },
    { id: 'device.type', label: 'Gerätetyp' }
  ]
};

// Vollständiges Mapping zwischen Platzhaltern und Datenbankfeldnamen
const FIELD_MAPPING: Record<string, string> = {
  // Patient Felder (snake_case in der Datenbank)
  'patient.firstName': 'patient.first_name',
  'patient.lastName': 'patient.last_name',
  'patient.birthDate': 'patient.birth_date',
  'patient.email': 'patient.email',
  'patient.phone': 'patient.phone',
  'patient.gender': 'patient.gender',
  'patient.title': 'patient.title',
  
  // Appointment Felder - für Felder aus dem patient_data JSONB
  'appointment.billing_type': 'appointment.billing_type',
  'appointment.start_time': 'appointment.start_time',
  'appointment.end_time': 'appointment.end_time',
  
  // Diese JSONB Felder könnten anders angesprochen werden müssen
  'appointment.with_contrast_medium': 'appointment.patient_data.with_contrast_medium',
  'appointment.has_transfer': 'appointment.patient_data.has_transfer',
  'appointment.referring_doctor': 'appointment.patient_data.referring_doctor',
  'appointment.has_beihilfe': 'appointment.patient_data.has_beihilfe',
  
  // Weitere Felder je nach Bedarf
};

const EmailTemplateForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [availableFields, setAvailableFields] = useState<FormField[]>([]);
  const [editorContent, setEditorContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [previewData, setPreviewData] = useState<PreviewData>({});
  const [visiblePlaceholders, setVisiblePlaceholders] = useState<string[]>(['patient', 'examination', 'appointment', 'location', 'device']);
  const [debugMode, setDebugMode] = useState(false);
  
  // Zustand für die Bedingungslogik
  const [conditionGroups, setConditionGroups] = useState<any[]>([]);
  
  // Quill Editor Module mit Schriftgröße
  const quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'size': ['small', false, 'large', 'huge'] }],  // Schriftgrößen
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const quillFormats = [
    'bold', 'italic', 'underline', 'strike',
    'size',
    'list', 'bullet',
    'color', 'background',
    'align',
    'link', 'image'
  ];

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors }
  } = useForm<EmailTemplateFormData>({
    defaultValues: {
      schedule_type: 'immediate',
      schedule_time_value: 24,
      schedule_time_unit: 'hours',
      send_only_workdays: true,
      send_time_start: '08:00',
      send_time_end: '18:00'
    }
  });

  const selectedFormType = watch('trigger_form');
  const selectedTriggerType = watch('trigger_type');
  const selectedScheduleType = watch('schedule_type');
  const scheduleTimeValue = watch('schedule_time_value');
  const scheduleTimeUnit = watch('schedule_time_unit');
  const subject = watch('subject');

  // Aktualisiere verfügbare Felder basierend auf Formulartyp
  useEffect(() => {
    if (selectedFormType) {
      const predefinedForm = FORM_TYPES.find(form => form.id === selectedFormType);
      if (predefinedForm) {
        setAvailableFields(predefinedForm.fields);
      } else {
        setAvailableFields([]);
      }
    }
  }, [selectedFormType]);

  // Wenn der Trigger-Typ wechselt, aktualisiere die sichtbaren Platzhalter und Form-Felder
  useEffect(() => {
    if (selectedTriggerType) {
      if (selectedTriggerType === 'form_submission') {
        // Nur Platzhalter für das ausgewählte Formular anzeigen
        if (selectedFormType) {
          setVisiblePlaceholders(['patient']);
        } else {
          setVisiblePlaceholders([]);
        }
      } else {
        // Bei Terminbezogenen Triggern alle Platzhalter anzeigen
        setVisiblePlaceholders(['patient', 'examination', 'appointment', 'location', 'device']);
      }
      
      // Wenn Trigger nicht form_submission, leere das Formularfeld
      if (selectedTriggerType !== 'form_submission') {
        setValue('trigger_form', '');
        setAvailableFields([]);
      }
    }
  }, [selectedTriggerType, selectedFormType, setValue]);

  // Lade E-Mail-Template und setze Formulardaten
  useEffect(() => {
    const fetchTemplate = async () => {
      if (id) {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('email_templates')
            .select('*')
            .eq('id', id)
            .single();

          if (error) throw error;
          if (data) {
            reset(data);
            setEditorContent(data.body);
            
            // Lade Bedingungen, falls vorhanden
            if (data.conditions) {
              setConditionGroups(data.conditions);
            }
            
            // Setze sichtbare Platzhalter basierend auf dem Trigger-Typ
            if (data.trigger_type === 'form_submission') {
              if (data.trigger_form) {
                setVisiblePlaceholders(['patient']);
              } else {
                setVisiblePlaceholders([]);
              }
            } else {
              setVisiblePlaceholders(['patient', 'examination', 'appointment', 'location', 'device']);
            }
          }
        } catch (error) {
          console.error('Error fetching template:', error);
          setError('Failed to load template data. Please try again later.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTemplate();
  }, [id, reset]);

  // Submit-Handler für das Formular
  const onSubmit = async (data: EmailTemplateFormData) => {
    setError(null);
    setLoading(true);
    try {
      const formData = {
        ...data,
        body: editorContent,
        conditions: conditionGroups
      };

      if (id) {
        const { error } = await supabase
          .from('email_templates')
          .update(formData)
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('email_templates')
          .insert([formData]);

        if (error) throw error;
      }

      navigate('/admin/emails');
    } catch (error: any) {
      console.error('Error saving template:', error);
      setError(error.message || 'Failed to save template. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Füge Platzhalter in den Editor ein
  const insertPlaceholder = (placeholder: string) => {
    const content = `{{${placeholder}}}`;
    
    if (window.quillInstance) {
      const quill = window.quillInstance;
      const range = quill.getSelection();
      if (range) {
        quill.insertText(range.index, content);
      } else {
        setEditorContent(prev => prev + content);
      }
    } else {
      setEditorContent(prev => prev + content);
    }
  };

  // Hilfsfunktion: Berechnet das Versanddatum basierend auf Terminzeitpunkt und Zeitplanung
  const calculateSendDate = (appointmentDate: Date, scheduleType: string, value: number, unit: string): Date => {
    const appointmentDateTime = new Date(appointmentDate);
    
    if (scheduleType === 'immediate') {
      return new Date(); // Sofort (aktuelles Datum/Uhrzeit)
    }
    
    if (scheduleType === 'before_appointment') {
      switch (unit) {
        case 'hours':
          return addHours(appointmentDateTime, -value);
        case 'days':
          return addDays(appointmentDateTime, -value);
        case 'weeks':
          return addWeeks(appointmentDateTime, -value);
        case 'months':
          return addMonths(appointmentDateTime, -value);
        default:
          return appointmentDateTime;
      }
    } else { // after_appointment
      switch (unit) {
        case 'hours':
          return addHours(appointmentDateTime, value);
        case 'days':
          return addDays(appointmentDateTime, value);
        case 'weeks':
          return addWeeks(appointmentDateTime, value);
        case 'months':
          return addMonths(appointmentDateTime, value);
        default:
          return appointmentDateTime;
      }
    }
  };

  // Prüfe, ob die Bedingungen erfüllt sind
  const evaluateConditions = (conditions: any[], data: any): boolean => {
    if (!conditions || conditions.length === 0) {
      return true; // Keine Bedingungen = immer wahr
    }
    
    // Auswerten jeder Bedingungsgruppe (verbunden durch OR)
    return conditions.some(group => {
      const { operator, conditions } = group;
      
      if (!conditions || conditions.length === 0) {
        return true; // Leere Gruppe = immer wahr
      }
      
      // Auswerten der Bedingungen innerhalb der Gruppe (verbunden durch AND oder OR)
      return conditions[operator === 'AND' ? 'every' : 'some'](
        (condition: any) => {
          const { field, operator: condOperator, value } = condition;
          
          // Wert aus dem Datenobjekt extrahieren
          const parts = field.split('.');
          let actualValue = data;
          for (const part of parts) {
            if (actualValue === undefined || actualValue === null) return false;
            actualValue = actualValue[part];
          }
          
          // Typkonvertierung für Vergleiche
          let expectedValue = value;
          if (value === 'true') expectedValue = true;
          if (value === 'false') expectedValue = false;
          
          // Vergleichsoperator anwenden
          switch (condOperator) {
            case '=':
              return actualValue == expectedValue;
            case '!=':
              return actualValue != expectedValue;
            default:
              return false;
          }
        }
      );
    });
  };

  // Debug-Hilfsfunktion zum Anzeigen der Objektstruktur
  const logObjectStructure = (obj: any, prefix = '', maxDepth = 3, depth = 0) => {
    if (!obj || typeof obj !== 'object' || depth > maxDepth) return;
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const path = prefix ? `${prefix}.${key}` : key;
        const value = obj[key];
        console.log(`${path}: ${typeof value} ${value === null ? '(null)' : ''}`);
        
        if (typeof value === 'object' && value !== null) {
          logObjectStructure(value, path, maxDepth, depth + 1);
        }
      }
    }
  };

  // Funktion zum Erstellen der E-Mail-Vorschau
  const handlePreview = async () => {
    try {
      setLoading(true);
      
      // Lade den letzten angelegten Termin als Vorschaudaten
      const { data: latestAppointment, error: appointmentError } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patient_id (*),
          examination:examination_id (*),
          location:location_id (*),
          device:device_id (*)
        `)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (appointmentError) throw appointmentError;
      if (!latestAppointment) throw new Error('Kein Termin gefunden für die Vorschau');
      
      // Ausführliches Debug-Logging der geladenen Daten
      if (debugMode) {
        console.log('Gefundener Termin für Vorschau:', latestAppointment);
        console.log('PATIENT DATEN:');
        logObjectStructure(latestAppointment.patient);
        console.log('PATIENT_DATA JSONB:');
        logObjectStructure(latestAppointment.patient_data);
      }
      
      // Berechne, wann die E-Mail gesendet werden würde
      const sendDate = calculateSendDate(
        new Date(latestAppointment.start_time),
        selectedScheduleType,
        scheduleTimeValue || 24,
        scheduleTimeUnit || 'hours'
      );
      
      // Stelle die Daten für die Vorschau zusammen
      const data = {
        patient: latestAppointment.patient,
        examination: latestAppointment.examination,
        appointment: latestAppointment,
        location: latestAppointment.location,
        device: latestAppointment.device
      };
      
      // Debugging für ALLE Daten
      if (debugMode) {
        console.log('Patient:', data.patient);
        console.log('Examination:', data.examination);
        console.log('Appointment:', data.appointment);
        console.log('Location:', data.location);
        console.log('Device:', data.device);
      }
      
      // Prüfe, ob die Bedingungen erfüllt wären
      const conditionsMet = evaluateConditions(conditionGroups, data);
      
      // Speichere die Vorschaudaten für die Anzeige
      setPreviewData({
        ...data,
        previewSendDate: sendDate,
        conditionsMet: conditionsMet
      });
      
      // Ersetze Platzhalter im Text
      let content = editorContent;
      
      // Alle Platzhalter mit tatsächlichen Werten ersetzen
      Object.entries(PLACEHOLDERS).forEach(([category, fields]) => {
        fields.forEach(field => {
          const placeholderRegex = new RegExp(`{{${field.id}}}`, 'g');
          const actualValue = getActualValue(category, field.id, data);
          
          if (debugMode) {
            console.log(`Ersetze {{${field.id}}} mit:`, actualValue);
          }
          
          content = content.replace(placeholderRegex, actualValue);
        });
      });
      
      setPreviewContent(content);
      setShowPreview(true);
    } catch (error) {
      console.error('Error generating preview:', error);
      setError('Fehler beim Erstellen der Vorschau. Bitte versuche es später noch einmal.');
    } finally {
      setLoading(false);
    }
  };

  // Verbesserte Funktion zum Abrufen von Werten
  const getActualValue = (category: string, fieldId: string, data: any): string => {
    // Spezialfall für Anrede
    if (fieldId === 'patient.salutation') {
      const patient = data.patient;
      if (!patient) return '[Anrede]';
      
      const gender = patient.gender;
      const title = patient.title || '';
      const lastName = patient.last_name || '';  // Beachte: snake_case in der DB
      
      if (gender === 'male') {
        return `Sehr geehrter Herr${title ? ' ' + title : ''} ${lastName}`;
      } else if (gender === 'female') {
        return `Sehr geehrte Frau${title ? ' ' + title : ''} ${lastName}`;
      } else {
        return `Sehr geehrte(r) ${title ? title + ' ' : ''}${lastName}`;
      }
    }
    
    // Falls ein Mapping existiert, verwende dieses
    const mappedFieldId = FIELD_MAPPING[fieldId] || fieldId;
    const parts = mappedFieldId.split('.');
    
    // Debug-Ausgabe
    if (debugMode) {
      console.log(`Versuche Wert zu holen für: ${fieldId} (gemappt zu: ${mappedFieldId})`);
    }
    
    // Spezialbehandlung für appointment.patient_data Felder
    if (parts.length > 2 && parts[0] === 'appointment' && parts[1] === 'patient_data') {
      const fieldName = parts[2];
      if (data.appointment && data.appointment.patient_data && 
          typeof data.appointment.patient_data === 'object') {
        const value = data.appointment.patient_data[fieldName];
        if (value !== undefined && value !== null) {
          return String(value);
        }
      }
    }
    
    // Normaler Pfad für alle anderen Felder
    let objCategory = data[parts[0]];
    if (!objCategory) {
      if (debugMode) {
        console.warn(`Kategorie ${parts[0]} nicht in Daten gefunden`);
      }
      return `[${getExampleValue(category, fieldId)}]`;
    }
    
    // Navigiere durch die restlichen Teile des Pfades
    for (let i = 1; i < parts.length; i++) {
      if (!objCategory || objCategory[parts[i]] === undefined) {
        if (debugMode) {
          console.warn(`Feld ${parts[i]} nicht in ${parts.slice(0, i).join('.')} gefunden`);
        }
        return `[${getExampleValue(category, fieldId)}]`;
      }
      objCategory = objCategory[parts[i]];
    }
    
    // Wenn der Wert null oder undefined ist
    if (objCategory === null || objCategory === undefined) {
      if (debugMode) {
        console.warn(`Wert für ${mappedFieldId} ist null oder undefined`);
      }
      return `[${getExampleValue(category, fieldId)}]`;
    }
    
    // Besondere Formatierung für Datumsfelder
    if (fieldId === 'appointment.start_time' && objCategory) {
      try {
        return format(new Date(objCategory), 'dd.MM.yyyy, HH:mm \'Uhr\'', { locale: de });
      } catch (e) {
        if (debugMode) {
          console.error('Fehler beim Formatieren des Datums:', e);
        }
        return String(objCategory);
      }
    }
    
    // Konvertiere Booleans in lesbaren Text
    if (typeof objCategory === 'boolean') {
      return objCategory ? 'Ja' : 'Nein';
    }
    
    return String(objCategory || '');
  };

  // Beispielwerte für Platzhalter generieren (Fallback)
  const getExampleValue = (category: string, fieldId: string) => {
    switch (category) {
      case 'patient':
        if (fieldId === 'patient.firstName') return 'Max';
        if (fieldId === 'patient.lastName') return 'Mustermann';
        if (fieldId === 'patient.email') return 'max.mustermann@example.com';
        if (fieldId === 'patient.phone') return '0123 456789';
        if (fieldId === 'patient.birthDate') return '01.01.1980';
        if (fieldId === 'patient.title') return 'Dr.';
        if (fieldId === 'patient.salutation') return 'Sehr geehrter Herr';
        if (fieldId === 'patient.gender') return 'männlich';
        break;
      case 'examination':
        if (fieldId === 'examination.name') return 'MRT Knie';
        if (fieldId === 'examination.duration') return '30 Minuten';
        if (fieldId === 'examination.category') return 'Orthopädie';
        if (fieldId === 'examination.billing_info') return 'Privatleistung';
        if (fieldId === 'examination.price') return '250€';
        break;
      case 'appointment':
        if (fieldId === 'appointment.start_time') return '15.04.2025, 14:30 Uhr';
        if (fieldId === 'appointment.billing_type') return 'Privat';
        if (fieldId === 'appointment.with_contrast_medium') return 'Ja';
        if (fieldId === 'appointment.has_transfer') return 'Ja';
        if (fieldId === 'appointment.referring_doctor') return 'Dr. Schmidt';
        if (fieldId === 'appointment.has_beihilfe') return 'Nein';
        if (fieldId === 'appointment.forms_url') return 'https://klinik.de/formulare/123';
        break;
      case 'location':
        if (fieldId === 'location.name') return 'Radiologie Zentrum Mitte';
        if (fieldId === 'location.address') return 'Hauptstraße 1, 10115 Berlin';
        if (fieldId === 'location.phone') return '030 123456';
        if (fieldId === 'location.email') return 'kontakt@radiologie-zentrum.de';
        if (fieldId === 'location.directions') return 'U-Bahn Linie U2, Haltestelle Stadtmitte';
        break;
      case 'device':
        if (fieldId === 'device.name') return 'Siemens Magnetom Sola';
        if (fieldId === 'device.type') return 'MRT 1.5 Tesla';
        break;
    }
    
    return `${fieldId}`; // Fallback
  };

  // Bedingungsgruppen verwalten
  const addConditionGroup = () => {
    setConditionGroups([...conditionGroups, { operator: 'AND', conditions: [] }]);
  };

  const removeConditionGroup = (groupIndex: number) => {
    setConditionGroups(conditionGroups.filter((_, index) => index !== groupIndex));
  };

  const addCondition = (groupIndex: number) => {
    const updatedGroups = [...conditionGroups];
    updatedGroups[groupIndex].conditions.push({ field: '', operator: '=', value: '' });
    setConditionGroups(updatedGroups);
  };

  const removeCondition = (groupIndex: number, conditionIndex: number) => {
    const updatedGroups = [...conditionGroups];
    updatedGroups[groupIndex].conditions.splice(conditionIndex, 1);
    setConditionGroups(updatedGroups);
  };

  const updateConditionField = (groupIndex: number, conditionIndex: number, field: string, value: any) => {
    const updatedGroups = [...conditionGroups];
    updatedGroups[groupIndex].conditions[conditionIndex][field] = value;
    setConditionGroups(updatedGroups);
  };

  const updateGroupOperator = (groupIndex: number, operator: string) => {
    const updatedGroups = [...conditionGroups];
    updatedGroups[groupIndex].operator = operator;
    setConditionGroups(updatedGroups);
  };

  // Rendere die Bedingungsfelder basierend auf dem ausgewählten Feld
  const renderConditionValueField = (groupIndex: number, conditionIndex: number, condition: any) => {
    if (!condition.field) return null;

    // Finde die Feldkonfiguration für das ausgewählte Feld
    let fieldConfig: any = null;
    for (const category in CONDITION_FIELDS) {
      const field = CONDITION_FIELDS[category as keyof typeof CONDITION_FIELDS].find(
        f => f.id === condition.field
      );
      if (field) {
        fieldConfig = field;
        break;
      }
    }

    if (!fieldConfig) return null;

    switch (fieldConfig.type) {
      case 'boolean':
        return (
          <select
            value={condition.value}
            onChange={(e) => updateConditionField(groupIndex, conditionIndex, 'value', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
          >
            <option value="">Bitte wählen</option>
            <option value="true">Ja</option>
            <option value="false">Nein</option>
          </select>
        );
      case 'select':
        return (
          <select
            value={condition.value}
            onChange={(e) => updateConditionField(groupIndex, conditionIndex, 'value', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
          >
            <option value="">Bitte wählen</option>
            {fieldConfig.options.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      default:
        return (
          <input
            type="text"
            value={condition.value}
            onChange={(e) => updateConditionField(groupIndex, conditionIndex, 'value', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            placeholder="Wert"
          />
        );
    }
  };

  // Formatiere das Datum für die Vorschau
  const formatPreviewDate = (date: Date | undefined): string => {
    if (!date) return '';
    
    try {
      return format(date, 'dd.MM.yyyy \'um\' HH:mm \'Uhr\'', { locale: de });
    } catch (e) {
      if (debugMode) {
        console.error('Fehler beim Formatieren des Datums:', e);
      }
      return '';
    }
  };

  // Debug-Modus umschalten (versteckt)
  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
  };

  if (loading && id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-8 relative">
        {id ? 'E-Mail-Vorlage bearbeiten' : 'Neue E-Mail-Vorlage'}
        <span 
          className="absolute -top-1 -right-1 w-2 h-2 cursor-pointer" 
          onClick={toggleDebugMode}
          title="Debug-Modus umschalten"
        />
      </h1>

      {debugMode && (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-4">
          <p className="text-yellow-700 text-sm">
            Debug-Modus aktiviert. Detaillierte Logs werden in der Konsole angezeigt.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name *
              </label>
              <input
                type="text"
                {...register('name', { required: 'Name ist erforderlich' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                placeholder="z.B. Terminbestätigung"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Beschreibung
              </label>
              <textarea
                {...register('description')}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                placeholder="Kurze Beschreibung der Vorlage"
              />
            </div>
          </div>

          {/* Trigger-Einstellungen */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Trigger und Zeitsteuerung</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Trigger-Typ *
                  </label>
                  <select
                    {...register('trigger_type', { required: 'Trigger-Typ ist erforderlich' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  >
                    <option value="">Bitte wählen</option>
                    {TRIGGER_TYPES.map((trigger) => (
                      <option key={trigger.id} value={trigger.id}>
                        {trigger.name}
                      </option>
                    ))}
                  </select>
                  {errors.trigger_type && (
                    <p className="mt-1 text-sm text-red-600">{errors.trigger_type.message}</p>
                  )}
                </div>

                {selectedTriggerType === 'form_submission' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Auslösendes Formular *
                    </label>
                    <select
                      {...register('trigger_form', { required: selectedTriggerType === 'form_submission' ? 'Formular ist erforderlich' : false })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    >
                      <option value="">Bitte wählen</option>
                      {FORM_TYPES.map((form) => (
                        <option key={form.id} value={form.id}>
                          {form.name}
                        </option>
                      ))}
                    </select>
                    {errors.trigger_form && (
                      <p className="mt-1 text-sm text-red-600">{errors.trigger_form.message}</p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Zeitpunkt für den Versand *
                  </label>
                  <select
                    {...register('schedule_type')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  >
                    <option value="immediate">Sofort</option>
                    <option value="before_appointment">Vor dem Termin</option>
                    <option value="after_appointment">Nach dem Termin</option>
                  </select>
                </div>

                {selectedScheduleType !== 'immediate' && (
                  <div className="flex space-x-3">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Zeitwert
                      </label>
                      <input
                        type="number"
                        min="1"
                        {...register('schedule_time_value', { 
                          valueAsNumber: true,
                          min: { value: 1, message: 'Wert muss mindestens 1 sein' }
                        })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Einheit
                      </label>
                      <select
                        {...register('schedule_time_unit')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                      >
                        {TIME_UNITS.map((unit) => (
                          <option key={unit.id} value={unit.id}>
                            {unit.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="workdays-only"
                      {...register('send_only_workdays')}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="workdays-only" className="ml-2 block text-sm text-gray-700">
                      Nur an Werktagen senden
                    </label>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-500 mr-2" />
                    <label className="block text-sm text-gray-700">
                      Frühestens
                    </label>
                    <input
                      type="time"
                      {...register('send_time_start')}
                      className="ml-2 block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-500 mr-2" />
                    <label className="block text-sm text-gray-700">
                      Spätestens
                    </label>
                    <input
                      type="time"
                      {...register('send_time_end')}
                      className="ml-2 block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* E-Mail-Empfänger-Feld */}
          {selectedTriggerType === 'form_submission' && selectedFormType && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700">
                E-Mail-Empfänger Feld *
              </label>
              <select
                {...register('recipient_field', { required: 'Empfänger-Feld ist erforderlich' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              >
                <option value="">Bitte wählen</option>
                {availableFields.map((field) => (
                  <option key={field.id} value={field.id}>
                    {field.label}
                  </option>
                ))}
              </select>
              {errors.recipient_field && (
                <p className="mt-1 text-sm text-red-600">{errors.recipient_field.message}</p>
              )}
            </div>
          )}

          {/* Bedingungen */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Bedingungen</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-4">
                Definiere Bedingungen, unter denen diese E-Mail gesendet werden soll.
              </p>

              {conditionGroups.length === 0 ? (
                <div className="text-center p-8">
                  <p className="text-gray-500 mb-4">Keine Bedingungen definiert. Diese E-Mail wird immer gesendet.</p>
                  <button
                    type="button"
                    onClick={addConditionGroup}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Bedingungsgruppe hinzufügen
                  </button>
                </div>
              ) : (
                <>
                  {conditionGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="mb-6 border border-gray-300 rounded-lg p-4 bg-white">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center">
                          <span className="text-sm font-medium mr-2">Gruppe {groupIndex + 1}</span>
                          {groupIndex > 0 && (
                            <select
                              value={group.operator}
                              onChange={(e) => updateGroupOperator(groupIndex, e.target.value)}
                              className="text-sm rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                            >
                              <option value="AND">UND</option>
                              <option value="OR">ODER</option>
                            </select>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeConditionGroup(groupIndex)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {group.conditions.length === 0 ? (
                        <p className="text-gray-500 text-sm mb-2">Keine Bedingungen in dieser Gruppe.</p>
                      ) : (
                        group.conditions.map((condition: any, conditionIndex: number) => (
                          <div key={conditionIndex} className="mb-3 grid grid-cols-12 gap-2 items-center">
                            {conditionIndex > 0 && (
                              <div className="col-span-1 text-center">
                                <span className="text-xs font-medium">
                                  {group.operator === 'AND' ? 'UND' : 'ODER'}
                                </span>
                              </div>
                            )}
                            <div className={conditionIndex === 0 ? 'col-span-5' : 'col-span-4'}>
                              <select
                                value={condition.field}
                                onChange={(e) => updateConditionField(groupIndex, conditionIndex, 'field', e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
                              >
                                <option value="">Feld wählen</option>
                                <optgroup label="Patient">
                                  {CONDITION_FIELDS.patient.map(field => (
                                    <option key={field.id} value={field.id}>{field.label}</option>
                                  ))}
                                </optgroup>
                                <optgroup label="Untersuchung">
                                  {CONDITION_FIELDS.examination.map(field => (
                                    <option key={field.id} value={field.id}>{field.label}</option>
                                  ))}
                                </optgroup>
                                <optgroup label="Standort">
                                  {CONDITION_FIELDS.location.map(field => (
                                    <option key={field.id} value={field.id}>{field.label}</option>
                                  ))}
                                </optgroup>
                              </select>
                            </div>
                            <div className="col-span-2">
                              <select
                                value={condition.operator}
                                onChange={(e) => updateConditionField(groupIndex, conditionIndex, 'operator', e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
                              >
                                <option value="=">=</option>
                                <option value="!=">≠</option>
                              </select>
                            </div>
                            <div className="col-span-4">
                              {renderConditionValueField(groupIndex, conditionIndex, condition)}
                            </div>
                            <div className="col-span-1 text-center">
                              <button
                                type="button"
                                onClick={() => removeCondition(groupIndex, conditionIndex)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}

                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => addCondition(groupIndex)}
                          className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <PlusCircle className="h-3 w-3 mr-1" />
                          Bedingung hinzufügen
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={addConditionGroup}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Weitere Gruppe hinzufügen
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* E-Mail-Einstellungen */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">E-Mail-Inhalt</h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Absender E-Mail *
                </label>
                <input
                  type="email"
                  {...register('sender_email', { 
                    required: 'Absender E-Mail ist erforderlich',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Ungültige E-Mail-Adresse'
                    }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  placeholder="noreply@example.com"
                />
                {errors.sender_email && (
                  <p className="mt-1 text-sm text-red-600">{errors.sender_email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Betreff *
                </label>
                <input
                  type="text"
                  {...register('subject', { required: 'Betreff ist erforderlich' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  placeholder="Ihr Termin bei ALTA Klinik"
                />
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  E-Mail-Text *
                </label>
                <div className="mt-1 bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                    <div>
                      <p className="font-medium">Verfügbare Platzhalter:</p>
                      <div className="mt-2 space-y-4">
                        {/* Nur die sichtbaren Platzhalter-Kategorien anzeigen */}
                        {Object.entries(PLACEHOLDERS)
                          .filter(([category]) => visiblePlaceholders.includes(category))
                          .map(([category, fields]) => (
                            <div key={category}>
                              <p className="font-medium text-gray-700 mb-1">
                                {category === 'patient' ? 'Patient' : 
                                 category === 'examination' ? 'Untersuchung' :
                                 category === 'appointment' ? 'Termin' :
                                 category === 'device' ? 'Gerät' :
                                 'Standort'}:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {fields.map((field) => (
                                  <button
                                    key={field.id}
                                    type="button"
                                    onClick={() => insertPlaceholder(field.id)}
                                    className={cn(
                                      "inline-flex items-center px-2 py-1 rounded-md bg-white border text-xs font-medium hover:bg-gray-50",
                                      field.id === 'appointment.forms_url' 
                                        ? "border-blue-300 text-blue-700 hover:bg-blue-50"
                                        : "border-gray-300 text-gray-700"
                                    )}
                                  >
                                    {field.id === 'appointment.forms_url' && (
                                      <LinkIcon className="h-3 w-3 mr-1" />
                                    )}
                                    {field.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <ReactQuill
                    theme="snow"
                    modules={quillModules}
                    formats={quillFormats}
                    value={editorContent}
                    onChange={setEditorContent}
                    ref={(el) => {
                      if (el) {
                        window.quillInstance = el.getEditor();
                      }
                    }}
                    style={{ height: '400px', marginBottom: '50px' }}
                  />
                </div>
                {errors.body && (
                  <p className="mt-1 text-sm text-red-600">{errors.body.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/admin/emails')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading}
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={handlePreview}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Eye className="h-4 w-4 mr-1 inline-block" />
            Vorschau
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Speichere...' : 'Speichern'}
          </button>
        </div>
      </form>

      {/* Vorschau-Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">E-Mail-Vorschau</h2>
              <button 
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Versandinformationen */}
            <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
                <div>
                  <p className="font-medium text-blue-800">Informationen zum Versand:</p>
                  {previewData.appointment && (
                    <div className="mt-1 text-sm text-blue-700">
                      <p>
                        <strong>Termin:</strong> {getActualValue('appointment', 'appointment.start_time', previewData)}
                      </p>
                      <p className="mt-1">
                        {selectedScheduleType === 'immediate' ? (
                          <span>Diese E-Mail wird sofort nach dem Trigger verschickt.</span>
                        ) : (
                          <span>
                            Diese E-Mail wird {selectedScheduleType === 'before_appointment' ? 'vor' : 'nach'} dem Termin verschickt: 
                            <strong> {formatPreviewDate(previewData.previewSendDate)}</strong>
                          </span>
                        )}
                      </p>
                      
                      {/* Hinweis zu Bedingungen */}
                      {conditionGroups.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-blue-200">
                          {previewData.conditionsMet ? (
                            <p className="flex items-center text-green-700">
                              <Check className="h-4 w-4 mr-1" />
                              Mit den aktuellen Bedingungen würde diese E-Mail für diesen Termin versendet werden.
                            </p>
                          ) : (
                            <p className="flex items-center text-red-700">
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              Mit den aktuellen Bedingungen würde diese E-Mail für diesen Termin NICHT versendet werden.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="bg-gray-100 p-3 rounded mb-2">
                <div><strong>Von:</strong> {watch('sender_email') || 'noreply@example.com'}</div>
                <div><strong>An:</strong> {previewData.patient?.email || 'patient@example.com'}</div>
                <div><strong>Betreff:</strong> {subject || 'Kein Betreff'}</div>
              </div>
            </div>
            
            <div 
              className="border p-4 rounded-md"
              dangerouslySetInnerHTML={{ __html: previewContent }}
            />
            
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// TypeScript-Erweiterung für den window-Zugriff
declare global {
  interface Window {
    quillInstance: any;
  }
}

export default EmailTemplateForm;