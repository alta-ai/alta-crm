import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../../lib/supabase';
import { format, parse, isValid } from 'date-fns';

type FormData = {
  [key: string]: string | boolean;
};

interface PatientFormProps {
  onComplete: (patientId: string) => void;
}

const PatientForm = ({ onComplete }: PatientFormProps) => {
  const [mode, setMode] = useState<'search' | 'create' | 'confirm'>('search');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [patientData, setPatientData] = useState<FormData | null>(null);
  const [patientId, setPatientId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<FormData>();

  const formValues = watch();

  const searchPatient = async (patientNumber: string) => {
    setIsSearching(true);
    setSearchError(null);

    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('patient_number', parseInt(patientNumber, 10))
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // Format date for the form
        const formattedDate = format(new Date(data.birth_date), 'yyyy-MM-dd');
        
        const patientData = {
          patientNumber: data.patient_number.toString(),
          gender: data.gender,
          title: data.title || '',
          firstName: data.first_name,
          lastName: data.last_name,
          birthDate: formattedDate,
          phone: data.phone,
          email: data.email
        };

        // Fill the form with patient data
        Object.entries(patientData).forEach(([key, value]) => {
          setValue(key as keyof FormData, value);
        });

        setPatientData(patientData);
        setPatientId(data.id);
        setMode('confirm');
      } else {
        setSearchError('Patient nicht gefunden');
        setMode('create');
      }
    } catch (error: any) {
      console.error('Error searching for patient:', error);
      setSearchError('Fehler bei der Patientensuche');
      setMode('create');
    } finally {
      setIsSearching(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (mode === 'search' && data.patientNumber) {
        await searchPatient(data.patientNumber);
        return;
      }

      if (mode === 'create') {
        setPatientData(data);
        setMode('confirm');
        return;
      }

      // Create new patient if we're confirming a new patient
      if (mode === 'confirm' && !patientId) {
        // Format date to DD.MM.YYYY before sending to API
        let formattedDate;
        try {
          // Parse date from form (YYYY-MM-DD)
          const date = parse(patientData?.birthDate || '', 'yyyy-MM-dd', new Date());
          if (isValid(date)) {
            formattedDate = format(date, 'dd.MM.yyyy');
          } else {
            throw new Error('Invalid date');
          }
        } catch (err) {
          console.error('Error formatting date:', err);
          formattedDate = patientData?.birthDate;
        }

        // Use RPC function to create patient with proper date handling
        const { data: newPatient, error } = await supabase
          .rpc('create_patient', {
            p_data: {
              gender: patientData?.gender,
              title: patientData?.title,
              first_name: patientData?.firstName,
              last_name: patientData?.lastName,
              birth_date: formattedDate,
              phone: patientData?.phone,
              email: patientData?.email
            }
          });

        if (error) throw error;

        if (newPatient) {
          onComplete(newPatient);
        } else {
          throw new Error('Fehler beim Erstellen des Patienten: Keine ID zurückgegeben');
        }
      } else if (mode === 'confirm' && patientId) {
        // Complete with existing patient
        onComplete(patientId);
      }
    } catch (error: any) {
      console.error('Error creating patient:', error);
      setSearchError('Fehler beim Speichern der Patientendaten');
    }
  };

  const renderConfirmation = () => {
    if (!patientData) return null;

    const genderLabels: Record<string, string> = {
      'F': 'Weiblich',
      'M': 'Männlich',
      'D': 'Divers'
    };

    // Parse and format the birth date for display
    let displayDate = patientData.birthDate;
    try {
      const date = parse(patientData.birthDate as string, 'yyyy-MM-dd', new Date());
      if (isValid(date)) {
        displayDate = format(date, 'dd.MM.yyyy');
      }
    } catch (err) {
      console.error('Error formatting date for display:', err);
    }

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Patientendaten bestätigen
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Bitte überprüfen Sie die eingegebenen Daten
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Geschlecht</dt>
                <dd className="mt-1 text-sm text-gray-900">{genderLabels[patientData.gender as string]}</dd>
              </div>

              {patientData.title && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Titel</dt>
                  <dd className="mt-1 text-sm text-gray-900">{patientData.title}</dd>
                </div>
              )}

              <div>
                <dt className="text-sm font-medium text-gray-500">Vorname</dt>
                <dd className="mt-1 text-sm text-gray-900">{patientData.firstName}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Nachname</dt>
                <dd className="mt-1 text-sm text-gray-900">{patientData.lastName}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Geburtsdatum</dt>
                <dd className="mt-1 text-sm text-gray-900">{displayDate}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Telefon</dt>
                <dd className="mt-1 text-sm text-gray-900">{patientData.phone}</dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">E-Mail</dt>
                <dd className="mt-1 text-sm text-gray-900">{patientData.email}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => {
              setMode(patientId ? 'search' : 'create');
              setPatientData(null);
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Zurück
          </button>
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Termin buchen
          </button>
        </div>
      </div>
    );
  };

  if (mode === 'confirm') {
    return renderConfirmation();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {mode === 'search' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Patientennummer
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="text"
                {...register('patientNumber', {
                  pattern: {
                    value: /^\d+$/,
                    message: 'Bitte geben Sie eine gültige Patientennummer ein'
                  }
                })}
                className="block w-full rounded-md border-gray-300 pr-10 focus:border-blue-500 focus:ring-blue-500"
                placeholder="48000"
              />
            </div>
            {errors.patientNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.patientNumber.message}</p>
            )}
          </div>

          {searchError && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{searchError}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={isSearching}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isSearching ? 'Suche...' : 'Patient suchen'}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('create');
                reset();
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Neuer Patient
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6">
            {/* Gender Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Geschlecht *
              </label>
              <div className="space-x-4">
                {[
                  { label: "Weiblich", value: "F" },
                  { label: "Männlich", value: "M" },
                  { label: "Divers", value: "D" }
                ].map((option) => (
                  <label key={option.value} className="inline-flex items-center">
                    <input
                      type="radio"
                      value={option.value}
                      {...register("gender", { required: "Geschlecht ist erforderlich" })}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2 text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.gender && (
                <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Titel
              </label>
              <select
                {...register('title')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              >
                <option value="">Kein Titel</option>
                <option value="Dr.">Dr.</option>
                <option value="Dr. med.">Dr. med.</option>
                <option value="Prof. Dr.">Prof. Dr.</option>
                <option value="Prof. Dr. med.">Prof. Dr. med.</option>
              </select>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Vorname *
                </label>
                <input
                  type="text"
                  {...register('firstName', { required: 'Vorname ist erforderlich' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nachname *
                </label>
                <input
                  type="text"
                  {...register('lastName', { required: 'Nachname ist erforderlich' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Birth Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Geburtsdatum *
              </label>
              <input
                type="date"
                {...register('birthDate', { required: 'Geburtsdatum ist erforderlich' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
              {errors.birthDate && (
                <p className="mt-1 text-sm text-red-600">{errors.birthDate.message}</p>
              )}
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Telefon *
                </label>
                <input
                  type="tel"
                  {...register('phone', { required: 'Telefonnummer ist erforderlich' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  E-Mail *
                </label>
                <input
                  type="email"
                  {...register('email', {
                    required: 'E-Mail ist erforderlich',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Ungültige E-Mail-Adresse'
                    }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setMode('search');
                reset();
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Zurück zur Suche
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Weiter
            </button>
          </div>
        </>
      )}
    </form>
  );
};

export default PatientForm;