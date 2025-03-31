import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { supabase } from '../../../lib/supabase';
import { AlertCircle } from 'lucide-react';

interface ReferringDoctorFormData {
  title?: string;
  gender: string;
  first_name: string;
  last_name: string;
  street: string;
  house_number: string;
  postal_code: string;
  city: string;
  phone: string;
  fax?: string;
  email?: string;
  specialty_id: string;
  report_preference: 'email' | 'fax' | 'both';
}

const ReferringDoctorForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [specialties, setSpecialties] = useState<Array<{ id: string; name: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<ReferringDoctorFormData>();

  // Watch email and fax fields for validation
  const reportPreference = watch('report_preference');
  const email = watch('email');
  const fax = watch('fax');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch specialties
        const { data: specialtiesData, error: specialtiesError } = await supabase
          .from('medical_specialties')
          .select('id, name')
          .order('name');

        if (specialtiesError) throw specialtiesError;
        setSpecialties(specialtiesData || []);

        // If editing, fetch doctor data
        if (id) {
          const { data: doctor, error: doctorError } = await supabase
            .from('referring_doctors')
            .select('*')
            .eq('id', id)
            .single();

          if (doctorError) throw doctorError;
          if (doctor) {
            reset(doctor);
          }
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, reset]);

  const onSubmit = async (data: ReferringDoctorFormData) => {
    setError(null);
    setLoading(true);

    try {
      // Validiere E-Mail/Fax basierend auf report_preference
      if (data.report_preference === 'email' && !data.email) {
        throw new Error('E-Mail-Adresse ist erforderlich für E-Mail-Befundübermittlung');
      }
      if (data.report_preference === 'fax' && !data.fax) {
        throw new Error('Faxnummer ist erforderlich für Fax-Befundübermittlung');
      }
      if (data.report_preference === 'both' && (!data.email || !data.fax)) {
        throw new Error('E-Mail-Adresse und Faxnummer sind erforderlich für kombinierte Befundübermittlung');
      }

      if (id) {
        // Update existing doctor
        const { error: updateError } = await supabase
          .from('referring_doctors')
          .update(data)
          .eq('id', id);

        if (updateError) throw updateError;
      } else {
        // Create new doctor
        const { error: createError } = await supabase
          .from('referring_doctors')
          .insert([data]);

        if (createError) throw createError;
      }

      navigate('/admin/referring-doctors');
    } catch (error: any) {
      console.error('Error saving doctor:', error);
      setError(error.message || 'Failed to save doctor');
    } finally {
      setLoading(false);
    }
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
        {id ? 'Überweiser bearbeiten' : 'Neuer Überweiser'}
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
                <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>
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
                  {...register('first_name', { required: 'Vorname ist erforderlich' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
                {errors.first_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nachname *
                </label>
                <input
                  type="text"
                  {...register('last_name', { required: 'Nachname ist erforderlich' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
                {errors.last_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            {/* Specialty */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fachrichtung *
              </label>
              <select
                {...register('specialty_id', { required: 'Fachrichtung ist erforderlich' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              >
                <option value="">Bitte wählen</option>
                {specialties.map((specialty) => (
                  <option key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </option>
                ))}
              </select>
              {errors.specialty_id && (
                <p className="text-red-500 text-sm mt-1">{errors.specialty_id.message}</p>
              )}
            </div>

            {/* Address */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Straße *
                </label>
                <input
                  type="text"
                  {...register('street', { required: 'Straße ist erforderlich' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
                {errors.street && (
                  <p className="text-red-500 text-sm mt-1">{errors.street.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Hausnummer *
                </label>
                <input
                  type="text"
                  {...register('house_number', { required: 'Hausnummer ist erforderlich' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
                {errors.house_number && (
                  <p className="text-red-500 text-sm mt-1">{errors.house_number.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  PLZ *
                </label>
                <input
                  type="text"
                  {...register('postal_code', { required: 'PLZ ist erforderlich' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
                {errors.postal_code && (
                  <p className="text-red-500 text-sm mt-1">{errors.postal_code.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Ort *
                </label>
                <input
                  type="text"
                  {...register('city', { required: 'Ort ist erforderlich' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
                {errors.city && (
                  <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fax
                </label>
                <input
                  type="tel"
                  {...register('fax')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  E-Mail
                </label>
                <input
                  type="email"
                  {...register('email')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
              </div>
            </div>

            {/* Report Preference */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Befundübermittlung - Präferenz *
              </label>
              <select
                {...register('report_preference', { required: 'Bitte wählen Sie eine Präferenz' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              >
                <option value="email">E-Mail</option>
                <option value="fax">Fax</option>
                <option value="both">E-Mail und Fax</option>
              </select>
              {errors.report_preference && (
                <p className="text-red-500 text-sm mt-1">{errors.report_preference.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/admin/referring-doctors')}
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

export default ReferringDoctorForm;