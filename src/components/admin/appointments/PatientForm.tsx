import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../../lib/supabase';
import { format, parse, isValid } from 'date-fns';
import { de } from 'date-fns/locale';
import { Search, X, AlertTriangle } from 'lucide-react';
import { cn } from '../../../lib/utils';

type FormData = {
  [key: string]: string | boolean;
};

interface PatientFormProps {
  onComplete: (patientId: string) => void;
}

interface Patient {
  id: string;
  patient_number: number;
  gender: string;
  title: string | null;
  first_name: string;
  last_name: string;
  birth_date: string;
  phone: string;
  email: string;
}

const PatientForm = ({ onComplete }: PatientFormProps) => {
  const [mode, setMode] = useState<'search' | 'create' | 'confirm'>('search');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [patientData, setPatientData] = useState<FormData | null>(null);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [searchCriteria, setSearchCriteria] = useState<'name' | 'birth_date'>('name');
  const [searchTerm, setSearchTerm] = useState('');
  const [warning, setWarning] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<FormData>();

  const searchPatient = async () => {
    setIsSearching(true);
    setSearchError(null);
    setWarning(null);
    setSearchResults([]);

    try {
      let query = supabase.from('patients').select('*');

      if (searchCriteria === 'name') {
        // Search by last name (case-insensitive partial match)
        query = query.ilike('last_name', `%${searchTerm}%`);
      } else {
        // Search by birth date
        // First try exact date match if input looks like a date
        if (searchTerm.match(/^\d{1,2}\.\d{1,2}\.\d{4}$/)) {
          try {
            const date = parse(searchTerm, 'dd.MM.yyyy', new Date());
            if (isValid(date)) {
              query = query.eq('birth_date', format(date, 'yyyy-MM-dd'));
            }
          } catch (err) {
            console.error('Date parsing error:', err);
          }
        } else {
          // If not a valid date format, try text-based search
          query = query.filter('birth_date::text', 'ilike', `%${searchTerm}%`);
        }

        // Check if search term looks like a name when searching for date
        if (searchTerm.length > 2 && !searchTerm.match(/^\d/)) {
          setWarning('Die Eingabe sieht wie ein Name aus. Möchten Sie stattdessen nach Namen suchen?');
        }
      }

      // Order results
      query = query.order('last_name', { ascending: true });

      const { data, error } = await query;

      if (error) throw error;

      if (data && data.length > 0) {
        setSearchResults(data);
      } else {
        setSearchError(`Keine Patienten gefunden für: ${searchTerm}`);
      }
    } catch (error: any) {
      console.error('Error searching for patient:', error);
      setSearchError('Fehler bei der Patientensuche');
    } finally {
      setIsSearching(false);
    }
  };

  const selectPatient = (patient: Patient) => {
    // Format date for the form
    const formattedDate = format(new Date(patient.birth_date), 'yyyy-MM-dd');
    
    const patientData = {
      gender: patient.gender,
      title: patient.title || '',
      firstName: patient.first_name,
      lastName: patient.last_name,
      birthDate: formattedDate,
      phone: patient.phone,
      email: patient.email
    };

    // Fill the form with patient data
    Object.entries(patientData).forEach(([key, value]) => {
      setValue(key as keyof FormData, value);
    });

    setPatientData(patientData);
    setPatientId(patient.id);
    setMode('confirm');
  };

  const switchSearchCriteria = (newCriteria: 'name' | 'birth_date') => {
    setSearchCriteria(newCriteria);
    setSearchTerm('');
    setWarning(null);
    setSearchError(null);
    setSearchResults([]);
  };

  const resetSearch = () => {
    setSearchTerm('');
    setSearchError(null);
    setWarning(null);
    setSearchResults([]);
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (mode === 'search') {
        await searchPatient();
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {mode === 'search' ? (
        <div className="space-y-4">
          {/* Search Criteria Toggle */}
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Suchen nach:</label>
            <div className="space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={searchCriteria === 'name'}
                  onChange={() => switchSearchCriteria('name')}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">Nachname</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={searchCriteria === 'birth_date'}
                  onChange={() => switchSearchCriteria('birth_date')}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">Geburtsdatum</span>
              </label>
            </div>
          </div>

          {/* Search Input */}
          <div>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-10 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder={
                  searchCriteria === 'name'
                    ? "Nachname eingeben..."
                    : "Geburtsdatum (TT.MM.YYYY)"
                }
              />
              {searchTerm && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={resetSearch}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Warning Message */}
          {warning && (
            <div className="rounded-md bg-yellow-50 p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">{warning}</p>
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => switchSearchCriteria(searchCriteria === 'name' ? 'birth_date' : 'name')}
                      className="text-sm font-medium text-yellow-700 underline hover:text-yellow-600"
                    >
                      Klicken Sie hier, um nach {searchCriteria === 'name' ? 'Geburtsdatum' : 'Namen'} zu suchen
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Gefundene Patienten:</h3>
              <div className="space-y-2">
                {searchResults.map((patient) => (
                  <button
                    key={patient.id}
                    type="button"
                    onClick={() => selectPatient(patient)}
                    className="w-full text-left px-4 py-3 border rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">
                          {patient.title && <span className="text-gray-500">{patient.title} </span>}
                          {patient.first_name} {patient.last_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Geboren am {format(new Date(patient.birth_date), 'dd.MM.yyyy', { locale: de })}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500">
                        #{patient.patient_number}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

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
              disabled={!searchTerm || isSearching}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
      ) : mode === 'create' ? (
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
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Patient bestätigen</h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {patientData?.title && (
                    <span className="text-gray-500">{patientData.title} </span>
                  )}
                  {patientData?.firstName} {patientData?.lastName}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Geburtsdatum</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {patientData?.birthDate && format(new Date(patientData.birthDate), 'dd.MM.yyyy', { locale: de })}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Telefon</dt>
                <dd className="mt-1 text-sm text-gray-900">{patientData?.phone}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">E-Mail</dt>
                <dd className="mt-1 text-sm text-gray-900">{patientData?.email}</dd>
              </div>
            </dl>
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
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Termin buchen
            </button>
          </div>
        </div>
      )}
    </form>
  );
};

export default PatientForm;