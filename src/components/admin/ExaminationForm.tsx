import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import { AlertCircle, GripVertical, Info, Plus, Trash2 } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { cn } from '../../lib/utils';

interface Device {
  id: string;
  name: string;
}

interface Form {
  id: string;
  name: string;
  description: string;
}

interface ExaminationFormData {
  name: string;
  description: string;
  category: string;
  report_title: string;
  report_title_template: string;
  requires_body_side: boolean;
  billing_info: string;
  self_payer_without_contrast: number;
  self_payer_with_contrast: number;
  private_patient_without_contrast: number;
  private_patient_with_contrast: number;
  foreign_patient_without_contrast: number;
  foreign_patient_with_contrast: number;
  duration: number;
  devices: string[];
  forms: {
    id: string;
    billing_types: string[];
  }[];
  sequences_without_contrast: {
    name: string;
    is_standard: boolean;
  }[];
  sequences_with_contrast: {
    name: string;
    is_standard: boolean;
  }[];
  prompt: string;
}

const DURATION_OPTIONS = [15, 30, 45, 60, 75, 90];

const CATEGORIES = [
  'MRT',
  'CT',
  'Biopsie',
  'TULSA-PRO',
  'DaVinci-OP',
  'HoLEP',
  'TURP',
  'Urologie',
  'Kardiologie',
  'Checkup-Frau',
  'Checkup-Mann'
];

const BILLING_TYPES = [
  { value: 'self_payer', label: 'Selbstzahler' },
  { value: 'private_patient', label: 'Privatpatient' },
  { value: 'foreign_patient', label: 'Ausländischer Patient' },
  { value: 'work_accident', label: 'Arbeitsunfall (BG)' }
];

const ExaminationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [devices, setDevices] = useState<Device[]>([]);
  const [allForms, setAllForms] = useState<Form[]>([]);
  const [selectedForms, setSelectedForms] = useState<Form[]>([]);
  const [formBillingTypes, setFormBillingTypes] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors }
  } = useForm<ExaminationFormData>({
    defaultValues: {
      devices: [],
      forms: [],
      duration: 30,
      sequences_without_contrast: [],
      sequences_with_contrast: []
    }
  });

  const watchedForms = watch('forms') || [];
  const sequencesWithoutContrast = watch('sequences_without_contrast') || [];
  const sequencesWithContrast = watch('sequences_with_contrast') || [];
  const requiresBodySide = watch('requires_body_side');

  // Update selectedForms when watchedForms changes
  useEffect(() => {
    const newSelectedForms = watchedForms
      .map(form => allForms.find(f => f.id === form.id))
      .filter((form): form is Form => form !== undefined);
    setSelectedForms(newSelectedForms);
  }, [watchedForms, allForms]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch devices
        const { data: devicesData, error: devicesError } = await supabase
          .from('devices')
          .select('id, name')
          .order('name');

        if (devicesError) throw devicesError;
        setDevices(devicesData || []);

        // Fetch forms
        const { data: formsData, error: formsError } = await supabase
          .from('forms')
          .select('id, name, description')
          .order('name');

        if (formsError) throw formsError;
        setAllForms(formsData || []);

        // If editing, fetch examination data
        if (id) {
          const { data: examination, error: examinationError } = await supabase
            .from('examinations')
            .select(`
              *,
              examination_devices(device_id),
              examination_forms(
                form_id,
                order,
                billing_type
              ),
              examination_sequences(
                id,
                name,
                with_contrast,
                is_standard
              )
            `)
            .eq('id', id)
            .maybeSingle();

          if (examinationError) throw examinationError;
          
          if (examination) {
            const formattedForms = examination.examination_forms
              .sort((a: any, b: any) => a.order - b.order)
              .map((ef: any) => ({
                id: ef.form_id,
                billing_types: ef.billing_type || BILLING_TYPES.map(bt => bt.value)
              }));

            // Create billing types mapping
            const billingTypesMap: Record<string, string[]> = {};
            examination.examination_forms.forEach((ef: any) => {
              billingTypesMap[ef.form_id] = ef.billing_type || BILLING_TYPES.map(bt => bt.value);
            });
            setFormBillingTypes(billingTypesMap);

            // Split sequences by contrast medium
            const sequencesWithout = examination.examination_sequences
              .filter((seq: any) => !seq.with_contrast)
              .map((seq: any) => ({
                name: seq.name,
                is_standard: seq.is_standard
              }));

            const sequencesWith = examination.examination_sequences
              .filter((seq: any) => seq.with_contrast)
              .map((seq: any) => ({
                name: seq.name,
                is_standard: seq.is_standard
              }));

            reset({
              ...examination,
              devices: examination.examination_devices.map((ed: any) => ed.device_id),
              forms: formattedForms,
              sequences_without_contrast: sequencesWithout,
              sequences_with_contrast: sequencesWith
            });
          }
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, reset]);

  const onSubmit = async (data: ExaminationFormData) => {
    setError(null);
    setLoading(true);
    try {
      if (id) {
        // Update existing examination
        const { error: examError } = await supabase
          .from('examinations')
          .update({
            name: data.name,
            description: data.description,
            category: data.category,
            report_title: data.report_title,
            report_title_template: data.report_title_template,
            requires_body_side: data.requires_body_side,
            billing_info: data.billing_info,
            self_payer_without_contrast: data.self_payer_without_contrast,
            self_payer_with_contrast: data.self_payer_with_contrast,
            private_patient_without_contrast: data.private_patient_without_contrast,
            private_patient_with_contrast: data.private_patient_with_contrast,
            foreign_patient_without_contrast: data.foreign_patient_without_contrast,
            foreign_patient_with_contrast: data.foreign_patient_with_contrast,
            duration: data.duration,
            prompt: data.prompt
          })
          .eq('id', id);

        if (examError) throw examError;

        // Update device associations
        await supabase
          .from('examination_devices')
          .delete()
          .eq('examination_id', id);

        if (data.devices && data.devices.length > 0) {
          const deviceAssociations = data.devices.map(deviceId => ({
            examination_id: id,
            device_id: deviceId
          }));

          const { error: devicesError } = await supabase
            .from('examination_devices')
            .insert(deviceAssociations);

          if (devicesError) throw devicesError;
        }

        // Update form associations
        await supabase
          .from('examination_forms')
          .delete()
          .eq('examination_id', id);

        if (data.forms && data.forms.length > 0) {
          const formAssociations = data.forms.map((form, index) => ({
            examination_id: id,
            form_id: form.id,
            order: index + 1,
            billing_type: formBillingTypes[form.id] || BILLING_TYPES.map(bt => bt.value)
          }));

          const { error: formsError } = await supabase
            .from('examination_forms')
            .insert(formAssociations);

          if (formsError) throw formsError;
        }

        // Update sequences
        await supabase
          .from('examination_sequences')
          .delete()
          .eq('examination_id', id);

        const sequences = [
          ...data.sequences_without_contrast.map(seq => ({
            examination_id: id,
            name: seq.name,
            with_contrast: false,
            is_standard: seq.is_standard
          })),
          ...data.sequences_with_contrast.map(seq => ({
            examination_id: id,
            name: seq.name,
            with_contrast: true,
            is_standard: seq.is_standard
          }))
        ];

        if (sequences.length > 0) {
          const { error: sequencesError } = await supabase
            .from('examination_sequences')
            .insert(sequences);

          if (sequencesError) throw sequencesError;
        }

      } else {
        // Create new examination
        const { data: examination, error: examError } = await supabase
          .from('examinations')
          .insert({
            name: data.name,
            description: data.description,
            category: data.category,
            report_title: data.report_title,
            report_title_template: data.report_title_template,
            requires_body_side: data.requires_body_side,
            billing_info: data.billing_info,
            self_payer_without_contrast: data.self_payer_without_contrast,
            self_payer_with_contrast: data.self_payer_with_contrast,
            private_patient_without_contrast: data.private_patient_without_contrast,
            private_patient_with_contrast: data.private_patient_with_contrast,
            foreign_patient_without_contrast: data.foreign_patient_without_contrast,
            foreign_patient_with_contrast: data.foreign_patient_with_contrast,
            duration: data.duration,
            prompt: data.prompt
          })
          .select()
          .single();

        if (examError) throw examError;

        if (examination) {
          // Create device associations
          if (data.devices && data.devices.length > 0) {
            const deviceAssociations = data.devices.map(deviceId => ({
              examination_id: examination.id,
              device_id: deviceId
            }));

            const { error: devicesError } = await supabase
              .from('examination_devices')
              .insert(deviceAssociations);

            if (devicesError) throw devicesError;
          }

          // Create form associations
          if (data.forms && data.forms.length > 0) {
            const formAssociations = data.forms.map((form, index) => ({
              examination_id: examination.id,
              form_id: form.id,
              order: index + 1,
              billing_type: formBillingTypes[form.id] || BILLING_TYPES.map(bt => bt.value)
            }));

            const { error: formsError } = await supabase
              .from('examination_forms')
              .insert(formAssociations);

            if (formsError) throw formsError;
          }

          // Create sequences
          const sequences = [
            ...data.sequences_without_contrast.map(seq => ({
              examination_id: examination.id,
              name: seq.name,
              with_contrast: false,
              is_standard: seq.is_standard
            })),
            ...data.sequences_with_contrast.map(seq => ({
              examination_id: examination.id,
              name: seq.name,
              with_contrast: true,
              is_standard: seq.is_standard
            }))
          ];

          if (sequences.length > 0) {
            const { error: sequencesError } = await supabase
              .from('examination_sequences')
              .insert(sequences);

            if (sequencesError) throw sequencesError;
          }
        }
      }

      navigate('/admin');
    } catch (error: any) {
      console.error('Error saving examination:', error);
      setError(error.message || 'Failed to save examination. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const addSequence = (withContrast: boolean) => {
    const field = withContrast ? 'sequences_with_contrast' : 'sequences_without_contrast';
    const currentSequences = watch(field) || [];
    setValue(field, [...currentSequences, { name: '', is_standard: false }]);
  };

  const removeSequence = (index: number, withContrast: boolean) => {
    const field = withContrast ? 'sequences_with_contrast' : 'sequences_without_contrast';
    const currentSequences = watch(field) || [];
    setValue(field, currentSequences.filter((_, i) => i !== index));
  };

  const toggleBillingType = (formId: string, billingType: string) => {
    const currentTypes = formBillingTypes[formId] || BILLING_TYPES.map(bt => bt.value);
    let newTypes: string[];

    if (currentTypes.includes(billingType)) {
      // Don't allow removing the last billing type
      if (currentTypes.length === 1) return;
      newTypes = currentTypes.filter(t => t !== billingType);
    } else {
      newTypes = [...currentTypes, billingType];
    }

    setFormBillingTypes(prev => ({
      ...prev,
      [formId]: newTypes
    }));

    // Update the forms array in react-hook-form
    const currentForms = watchedForms;
    const updatedForms = currentForms.map(form => {
      if (form.id === formId) {
        return {
          ...form,
          billing_types: newTypes
        };
      }
      return form;
    });
    setValue('forms', updatedForms);
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
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">
        {id ? 'Untersuchung bearbeiten' : 'Neue Untersuchung'}
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
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Kategorie *
              </label>
              <select
                {...register('category', { required: 'Kategorie ist erforderlich' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              >
                <option value="">Bitte wählen</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Körperseite erforderlich
              </label>
              <div className="mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    {...register('requires_body_side')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Körperseite (links/rechts) muss bei der Terminbuchung angegeben werden
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Titel für den Befund
              </label>
              <input
                type="text"
                {...register('report_title_template')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                placeholder={requiresBodySide ? "z.B. MRT Kopf {{bodyside}}" : "z.B. MRT Kopf"}
              />
              <p className="mt-1 text-sm text-gray-500">
                Verfügbare Platzhalter: {'{{bodyside}}'} für die Körperseite, {'{{date}}'} für das Datum
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Verfügbare Geräte *
              </label>
              <div className="mt-2 space-y-2">
                {devices.map((device) => (
                  <label key={device.id} className="flex items-center">
                    <input
                      type="checkbox"
                      value={device.id}
                      {...register('devices', { required: 'Mindestens ein Gerät muss ausgewählt werden' })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{device.name}</span>
                  </label>
                ))}
              </div>
              {errors.devices && (
                <p className="mt-1 text-sm text-red-600">{errors.devices.message}</p>
              )}
            </div>

            {/* Examination Sequences */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Untersuchungssequenzen</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sequences without contrast */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-700">Ohne Kontrastmittel</h4>
                    <button
                      type="button"
                      onClick={() => addSequence(false)}
                      className="inline-flex items-center px-2 py-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Hinzufügen
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {sequencesWithoutContrast.map((sequence, index) => (
                      <div key={index} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                        <input
                          type="text"
                          {...register(`sequences_without_contrast.${index}.name` as const)}
                          placeholder="Sequenzname"
                          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
                        />
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            {...register(`sequences_without_contrast.${index}.is_standard` as const)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">Standard</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => removeSequence(index, false)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sequences with contrast */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-700">Mit Kontrastmittel</h4>
                    <button
                      type="button"
                      onClick={() => addSequence(true)}
                      className="inline-flex items-center px-2 py-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Hinzufügen
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {sequencesWithContrast.map((sequence, index) => (
                      <div key={index} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                        <input
                          type="text"
                          {...register(`sequences_with_contrast.${index}.name` as const)}
                          placeholder="Sequenzname"
                          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
                        />
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            {...register(`sequences_with_contrast.${index}.is_standard` as const)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">Standard</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => removeSequence(index, true)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Abrechnung
              </label>
              <div className="mt-1 prose prose-sm max-w-none">
                <p className="text-sm text-gray-500 mb-2">
                  Verfügbare Platzhalter für Kosten:
                  <br />
                  {'{self_payer_without_contrast}'} - Selbstzahler ohne KM
                  <br />
                  {'{self_payer_with_contrast}'} - Selbstzahler mit KM
                  <br />
                  {'{private_patient_without_contrast}'} - Privatpatient ohne KM
                  <br />
                  {'{private_patient_with_contrast}'} - Privatpatient mit KM
                  <br />
                  {'{foreign_patient_without_contrast}'} - Ausländer ohne KM
                  <br />
                  {'{foreign_patient_with_contrast}'} - Ausländer mit KM
                </p>
              </div>
              <textarea
                {...register('billing_info')}
                rows={6}
                placeholder="Geben Sie hier die Abrechnungsinformationen ein. Nutzen Sie die Platzhalter oben, um dynamisch die korrekten Preise einzufügen."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Selbstzahler ohne KM (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('self_payer_without_contrast', { 
                    required: 'Preis ist erforderlich',
                    min: { value: 0, message: 'Preis muss positiv sein' }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
                {errors.self_payer_without_contrast && (
                  <p className="mt-1 text-sm text-red-600">{errors.self_payer_without_contrast.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Selbstzahler mit KM (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('self_payer_with_contrast', { 
                    required: 'Preis ist erforderlich',
                    min: { value: 0, message: 'Preis muss positiv sein' }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
                {errors.self_payer_with_contrast && (
                  <p className="mt-1 text-sm text-red-600">{errors.self_payer_with_contrast.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Privatpatient ohne KM (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('private_patient_without_contrast', { 
                    required: 'Preis ist erforderlich',
                    min: { value: 0, message: 'Preis muss positiv sein' }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
                {errors.private_patient_without_contrast && (
                  <p className="mt-1 text-sm text-red-600">{errors.private_patient_without_contrast.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Privatpatient mit KM (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('private_patient_with_contrast', { 
                    required: 'Preis ist erforderlich',
                    min: { value: 0, message: 'Preis muss positiv sein' }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
                {errors.private_patient_with_contrast && (
                  <p className="mt-1 text-sm text-red-600">{errors.private_patient_with_contrast.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ausländer ohne KM (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('foreign_patient_without_contrast', { 
                    required: 'Preis ist erforderlich',
                    min: { value: 0, message: 'Preis muss positiv sein' }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
                {errors.foreign_patient_without_contrast && (
                  <p className="mt-1 text-sm text-red-600">{errors.foreign_patient_without_contrast.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ausländer mit KM (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('foreign_patient_with_contrast', { 
                    required: 'Preis ist erforderlich',
                    min: { value: 0, message: 'Preis muss positiv sein' }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
                {errors.foreign_patient_with_contrast && (
                  <p className="mt-1 text-sm text-red-600">{errors.foreign_patient_with_contrast.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Dauer (Minuten) *
              </label>
              <select
                {...register('duration', { required: 'Dauer ist erforderlich' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              >
                {DURATION_OPTIONS.map((duration) => (
                  <option key={duration} value={duration}>
                    {duration} Minuten
                  </option>
                ))}
              </select>
              {errors.duration && (
                <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Benötigte Formulare
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Verfügbare Formulare</h4>
                  <div className="space-y-2">
                    {allForms
                      .filter(form => !watchedForms.some(wf => wf.id === form.id))
                      .map((form) => (
                        <label key={form.id} className="flex items-center">
                          <input
                            type="checkbox"
                            value={form.id}
                            onChange={(e) => {
                              const currentForms = watchedForms || [];
                              if (e.target.checked) {
                                setValue('forms', [
                                  ...currentForms,
                                  {
                                    id: form.id,
                                    billing_types: BILLING_TYPES.map(bt => bt.value)
                                  }
                                ]);
                              }
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{form.name}</span>
                        </label>
                    ))}
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Ausgewählte Formulare</h4>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                    <div className="flex">
                      <Info className="h-5 w-5 text-blue-500 mr-2" />
                      <p className="text-sm text-blue-700">
                        Wählen Sie für jedes Formular die Abrechnungsarten aus, bei denen es verwendet werden soll.
                      </p>
                    </div>
                  </div>
                  <DragDropContext onDragEnd={() => {}}>
                    <Droppable droppableId="selected-forms">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-4"
                        >
                          {selectedForms.map((form, index) => (
                            <Draggable
                              key={form.id}
                              draggableId={form.id}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="bg-white border border-gray-200 rounded-lg p-4"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center">
                                      <div {...provided.dragHandleProps}>
                                        <GripVertical className="h-4 w-4 text-gray-400 mr-2" />
                                      </div>
                                      <span className="font-medium">{form.name}</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const currentForms = watchedForms.filter(f => f.id !== form.id);
                                        setValue('forms', currentForms);
                                      }}
                                      className="text-sm text-red-600 hover:text-red-700"
                                    >
                                      Entfernen
                                    </button>
                                  </div>
                                  <div className="space-y-2">
                                    {BILLING_TYPES.map((billingType) => (
                                      <label key={billingType.value} className="flex items-center">
                                        <input
                                          type="checkbox"
                                          checked={(formBillingTypes[form.id] || BILLING_TYPES.map(bt => bt.value)).includes(billingType.value)}
                                          onChange={() => toggleBillingType(form.id, billingType.value)}
                                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">{billingType.label}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Prompt
              </label>
              <textarea
                {...register('prompt')}
                rows={6}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                placeholder="Geben Sie hier den Prompt für die KI-gestützte Befundgenerierung ein"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/admin')}
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
            {loading ? 'Speichern...' : 'Speichern'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExaminationForm;