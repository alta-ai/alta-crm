import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { supabase } from '../../../lib/supabase';
import { AlertCircle } from 'lucide-react';
import { format, parse, isValid } from 'date-fns';

interface PatientFormData {
  gender: string;
  title?: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  phone: string;
  email: string;
}

const PatientForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<PatientFormData>();

  useEffect(() => {
    const fetchPatient = async () => {
      if (id) {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('patients')
            .select('*')
            .eq('id', id)
            .single();

          if (error) throw error;
          if (data) {
            // Convert database date format (DD.MM.YYYY) to form input format (YYYY-MM-DD)
            let formattedDate;
            try {
              // Parse the European format date from the database
              const date = parse(data.birth_date, 'dd.MM.yyyy', new Date());
              if (isValid(date)) {
                formattedDate = format(date, 'yyyy-MM-dd');
              } else {
                // Fallback if date parsing fails
                formattedDate = format(new Date(data.birth_date), 'yyyy-MM-dd');
              }
            } catch (err) {
              console.error('Error parsing date:', err);
              // Fallback if date parsing fails
              formattedDate = format(new Date(data.birth_date), 'yyyy-MM-dd');
            }
            
            reset({
              ...data,
              birth_date: formattedDate
            });
          }
        } catch (error: any) {
          console.error('Error fetching patient:', error);
          setError('Failed to load patient data. Please try again later.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchPatient();
  }, [id, reset]);

  const onSubmit = async (data: PatientFormData) => {
    setError(null);
    setLoading(true);
    try {
      let formattedDate;
      
      try {
        // Parse date from form (YYYY-MM-DD) and format to European format (DD.MM.YYYY)
        const date = parse(data.birth_date, 'yyyy-MM-dd', new Date());
        if (isValid(date)) {
          formattedDate = format(date, 'dd.MM.yyyy');
        } else {
          throw new Error('Invalid date');
        }
      } catch (err) {
        console.error('Error formatting date:', err);
        // Use the database function directly with the RPC call if parsing fails
        formattedDate = data.birth_date;
      }
      
      const formData = {
        ...data,
        birth_date: formattedDate
      };

      // Use the RPC function to handle date correctly
      const saveData = async () => {
        if (id) {
          // Update existing patient using RPC function
          const { data, error } = await supabase
            .rpc('update_patient', {
              p_id: id,
              p_data: formData
            });

          if (error) throw error;
          return data;
        } else {
          // Create new patient using RPC function
          const { data, error } = await supabase
            .rpc('create_patient', {
              p_data: formData
            });

          if (error) throw error;
          return data;
        }
      };

      await saveData();
      navigate('/admin/patients');
    } catch (error: any) {
      console.error('Error saving patient:', error);
      setError(error.message || 'Failed to save patient. Please try again later.');
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
        {id ? 'Patient bearbeiten' : 'Neuer Patient'}
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
                Geschlecht *
              </label>
              <div className="mt-2 space-x-4">
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
                  <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
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
                  <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Geburtsdatum *
              </label>
              <input
                type="date"
                {...register('birth_date', { required: 'Geburtsdatum ist erforderlich' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
              {errors.birth_date && (
                <p className="mt-1 text-sm text-red-600">{errors.birth_date.message}</p>
              )}
            </div>

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
            onClick={() => navigate('/admin/patients')}
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

export default PatientForm;