import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import { AlertCircle, Info, Plus, Trash2, Key, ArrowDown, ArrowUp } from 'lucide-react';
import { Editor } from '@tinymce/tinymce-react';
import { cn } from '../../lib/utils';

interface FormEditorData {
  name: string;
  description: string;
  form_type: string;
  api_endpoint?: string;
  api_auth_token?: string;
  api_mappings: Array<{
    fieldId: string;
    apiKey: string;
  }>;
  pdf_mappings?: Array<{
    fieldId: string;
    pdfField: string;
    section?: string;
  }>;
}

interface FormField {
  id: string;
  label: string;
}

interface PDFField {
  id: string;
  label: string;
  section: string;
}

const PREDEFINED_FORMS = [
  {
    id: 'registration',
    name: 'Anmeldeformular',
    description: 'Standardformular für die Patientenanmeldung',
    component: 'RegistrationForm',
    fields: [
      { id: '53g98e1a27d292f', label: 'Geschlecht' },
      { id: '8fe678834e872d6', label: 'Titel' },
      { id: 'vlkrd4584483f76', label: 'Vorname' },
      { id: 'foa1ua5ecf990f9', label: 'Nachname' },
      { id: '8r2cb', label: 'Straße' },
      { id: '7eg42', label: 'Hausnummer' },
      { id: 'zqwy3030b8a0d6e', label: 'PLZ' },
      { id: 'p7tkx947ac1c079', label: 'Wohnort' },
      { id: 'i7umqfb15f2c09f', label: 'Telefon (Festnetz)' },
      { id: 'vbuf55d3f7f3b86', label: 'Mobil' },
      { id: 'qjdlhbe3ed1d5f0', label: 'E-Mail' },
      { id: 'mynui', label: 'Geburtstag' }
    ]
  }
];

// PDF field definitions for each form type
const PDF_FIELDS: Record<string, PDFField[]> = {
  registration: [
    { id: 'patientName', label: 'Name des Patienten', section: 'Persönliche Daten' },
    { id: 'patientBirthDate', label: 'Geburtsdatum', section: 'Persönliche Daten' },
    { id: 'patientAddress', label: 'Anschrift', section: 'Persönliche Daten' },
    { id: 'patientPhone', label: 'Telefonnummer', section: 'Kontakt' },
    { id: 'patientEmail', label: 'E-Mail', section: 'Kontakt' },
    { id: 'insuranceType', label: 'Versicherungsart', section: 'Versicherung' },
    { id: 'insuranceProvider', label: 'Versicherung', section: 'Versicherung' },
    { id: 'hasBeihilfe', label: 'Beihilfeberechtigt', section: 'Versicherung' }
  ],
  cost_reimbursement: [
    { id: 'confirmationDate', label: 'Bestätigungsdatum', section: 'Bestätigung' },
    { id: 'patientSignature', label: 'Unterschrift', section: 'Bestätigung' }
  ],
  privacy: [
    { id: 'privacyConsent', label: 'Datenschutzerklärung akzeptiert', section: 'Einwilligung' },
    { id: 'emailConsent', label: 'E-Mail-Marketing Einwilligung', section: 'Einwilligung' }
  ]
};

const API_DEFAULTS = {
  method: 'POST',
  format: 'JSON',
  charset: 'UTF-8'
};

const FormEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [editorContent, setEditorContent] = useState('');
  const [pdfMappings, setPdfMappings] = useState<FormEditorData['pdf_mappings']>([]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors }
  } = useForm<FormEditorData>({
    defaultValues: {
      api_mappings: [],
      pdf_mappings: []
    }
  });

  const selectedFormType = watch('form_type');
  const apiMappings = watch('api_mappings');

  useEffect(() => {
    if (selectedFormType) {
      const predefinedForm = PREDEFINED_FORMS.find(form => form.id === selectedFormType);
      if (predefinedForm) {
        setFormFields(predefinedForm.fields);
      } else {
        setFormFields([]);
      }
    }
  }, [selectedFormType]);

  useEffect(() => {
    const fetchForm = async () => {
      if (id) {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('forms')
            .select('*')
            .eq('id', id)
            .single();

          if (error) throw error;
          if (data) {
            reset({
              ...data,
              api_mappings: data.api_mappings || [],
              pdf_mappings: data.pdf_mappings || []
            });
            setEditorContent(data.body);
            setPdfMappings(data.pdf_mappings || []);
            
            // Set form fields based on form type
            const predefinedForm = PREDEFINED_FORMS.find(form => form.id === data.form_type);
            if (predefinedForm) {
              setFormFields(predefinedForm.fields);
            }
          }
        } catch (error) {
          console.error('Error fetching form:', error);
          setError('Failed to load form data. Please try again later.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchForm();
  }, [id, reset]);

  const onSubmit = async (data: FormEditorData) => {
    setError(null);
    setLoading(true);
    try {
      const predefinedForm = PREDEFINED_FORMS.find(form => form.id === data.form_type);
      const formData = {
        ...data,
        form_data: predefinedForm ? {
          component: predefinedForm.component,
          api: {
            ...API_DEFAULTS,
            endpoint: data.api_endpoint,
            auth_token: data.api_auth_token
          }
        } : {},
        form_fields: { fields: formFields },
        pdf_mappings: pdfMappings
      };

      if (id) {
        const { error } = await supabase
          .from('forms')
          .update(formData)
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('forms')
          .insert([formData]);

        if (error) throw error;
      }

      navigate('/admin/forms');
    } catch (error: any) {
      console.error('Error saving form:', error);
      setError(error.message || 'Failed to save form. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const addPdfMapping = () => {
    setPdfMappings(prev => [...(prev || []), { fieldId: '', pdfField: '', section: '' }]);
  };

  const removePdfMapping = (index: number) => {
    setPdfMappings(prev => (prev || []).filter((_, i) => i !== index));
  };

  const updatePdfMapping = (index: number, field: keyof FormEditorData['pdf_mappings'][0], value: string) => {
    setPdfMappings(prev => {
      const newMappings = [...(prev || [])];
      newMappings[index] = { ...newMappings[index], [field]: value };
      return newMappings;
    });
  };

  const movePdfMapping = (index: number, direction: 'up' | 'down') => {
    setPdfMappings(prev => {
      if (!prev) return prev;
      const newMappings = [...prev];
      if (direction === 'up' && index > 0) {
        [newMappings[index - 1], newMappings[index]] = [newMappings[index], newMappings[index - 1]];
      } else if (direction === 'down' && index < newMappings.length - 1) {
        [newMappings[index], newMappings[index + 1]] = [newMappings[index + 1], newMappings[index]];
      }
      return newMappings;
    });
  };

  if (loading && id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  const availablePdfFields = selectedFormType ? PDF_FIELDS[selectedFormType] || [] : [];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">
        {id ? 'Formular bearbeiten' : 'Neues Formular'}
      </h1>

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
          <div className="grid grid-cols-1 gap-6">
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

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Formulartyp *
              </label>
              <select
                {...register('form_type', { required: 'Formular ist erforderlich' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              >
                <option value="">Bitte wählen</option>
                {PREDEFINED_FORMS.map((form) => (
                  <option key={form.id} value={form.id}>
                    {form.name}
                  </option>
                ))}
              </select>
              {errors.form_type && (
                <p className="mt-1 text-sm text-red-600">{errors.form_type.message}</p>
              )}
            </div>

            {selectedFormType && selectedFormType !== 'custom' && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <div className="flex">
                  <Info className="h-5 w-5 text-blue-400" />
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      {PREDEFINED_FORMS.find(form => form.id === selectedFormType)?.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* PDF Field Mappings */}
            {selectedFormType && availablePdfFields.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">PDF-Feldzuordnung</h3>
                  <button
                    type="button"
                    onClick={addPdfMapping}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Neue Zuordnung
                  </button>
                </div>

                <div className="space-y-3">
                  {pdfMappings?.map((mapping, index) => (
                    <div key={index} className="flex items-start space-x-3 bg-gray-50 p-4 rounded-lg">
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Formularfeld
                          </label>
                          <select
                            value={mapping.fieldId}
                            onChange={(e) => updatePdfMapping(index, 'fieldId', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                          >
                            <option value="">Bitte wählen</option>
                            {formFields.map((field) => (
                              <option key={field.id} value={field.id}>
                                {field.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            PDF-Feld
                          </label>
                          <select
                            value={mapping.pdfField}
                            onChange={(e) => updatePdfMapping(index, 'pdfField', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                          >
                            <option value="">Bitte wählen</option>
                            {availablePdfFields.map((field) => (
                              <option key={field.id} value={field.id}>
                                {field.section} - {field.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-1">
                        <button
                          type="button"
                          onClick={() => movePdfMapping(index, 'up')}
                          disabled={index === 0}
                          className={cn(
                            "p-1 rounded hover:bg-gray-200",
                            index === 0 && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => movePdfMapping(index, 'down')}
                          disabled={index === (pdfMappings?.length || 0) - 1}
                          className={cn(
                            "p-1 rounded hover:bg-gray-200",
                            index === (pdfMappings?.length || 0) - 1 && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removePdfMapping(index)}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* API Configuration */}
            {selectedFormType && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">API-Konfiguration</h3>
                
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm text-gray-600">
                  <p><strong>Methode:</strong> POST</p>
                  <p><strong>Datenformat:</strong> JSON</p>
                  <p><strong>Zeichensatz:</strong> UTF-8</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    API Endpoint URL
                  </label>
                  <input
                    type="url"
                    {...register('api_endpoint')}
                    placeholder="https://api.example.com/data"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Basis-Authentifizierung
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      {...register('api_auth_token')}
                      placeholder="API Token"
                      className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-700">
                      Feld-Zuordnungen
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const currentMappings = apiMappings || [];
                        setValue('api_mappings', [...currentMappings, { fieldId: '', apiKey: '' }]);
                      }}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Neue Zuordnung
                    </button>
                  </div>

                  <div className="space-y-3">
                    {apiMappings?.map((mapping, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700">
                            Formularfeld
                          </label>
                          <select
                            {...register(`api_mappings.${index}.fieldId` as const)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                          >
                            <option value="">Bitte wählen</option>
                            {formFields.map((field) => (
                              <option key={field.id} value={field.id}>
                                {field.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700">
                            API-Schlüssel
                          </label>
                          <input
                            type="text"
                            {...register(`api_mappings.${index}.apiKey` as const)}
                            placeholder="z.B. patientId"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const currentMappings = apiMappings || [];
                            setValue(
                              'api_mappings',
                              currentMappings.filter((_, i) => i !== index)
                            );
                          }}
                          className="mt-6 p-1 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/admin/forms')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading}
          >
            Abbrechen
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
    </div>
  );
};

export default FormEditor;