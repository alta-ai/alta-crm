import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { generateFormToken, getFormsUrl } from '../../../lib/forms';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { AlertCircle, ExternalLink } from 'lucide-react';

interface TestFormFlowProps {
  appointmentId: string;
}

const TestFormFlow = ({ appointmentId }: TestFormFlowProps) => {
  const [error, setError] = useState<string | null>(null);
  const [formUrl, setFormUrl] = useState<string | null>(null);

  // Fetch appointment details with forms
  const { data: appointment, isLoading } = useQuery({
    queryKey: ['appointment-forms', appointmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          start_time,
          billing_type,
          patient:patients(
            first_name,
            last_name,
            email
          ),
          examination:examinations(
            id,
            name,
            examination_forms(
              form:forms(
                id,
                name,
                description,
                form_type
              ),
              billing_type
            )
          )
        `)
        .eq('id', appointmentId)
        .single();

      if (error) throw error;
      return data;
    }
  });

  // Generate form URL
  const handleGenerateUrl = async () => {
    try {
      setError(null);
      const token = await generateFormToken(appointmentId);
      const url = getFormsUrl(token);
      setFormUrl(url);
    } catch (error: any) {
      console.error('Error generating form URL:', error);
      setError(error.message || 'Fehler beim Generieren der Formular-URL');
    }
  };

  if (isLoading) {
    return <div className="text-gray-600">Lade Termin...</div>;
  }

  if (!appointment) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Termin konnte nicht gefunden werden
            </p>
          </div>
        </div>
      </div>
    );
  }

  const availableForms = appointment.examination.examination_forms
    .filter(ef => ef.billing_type.includes(appointment.billing_type))
    .map(ef => ef.form);

  return (
    <div className="space-y-6">
      {/* Appointment Details */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Termin Details
        </h3>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Patient</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {appointment.patient.first_name} {appointment.patient.last_name}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">E-Mail</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {appointment.patient.email}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Termin</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {format(new Date(appointment.start_time), "EEEE, d. MMMM yyyy 'um' HH:mm 'Uhr'", { locale: de })}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Untersuchung</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {appointment.examination.name}
            </dd>
          </div>
        </dl>
      </div>

      {/* Available Forms */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Verfügbare Formulare
        </h3>
        <div className="space-y-4">
          {availableForms.map(form => (
            <div
              key={form.id}
              className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">
                  {form.name}
                </h4>
                {form.description && (
                  <p className="mt-1 text-sm text-gray-500">
                    {form.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form URL Generation */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Formular-Link generieren
        </h3>
        
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {formUrl ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Unter folgendem Link können die Formulare ausgefüllt werden:
            </p>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={formUrl}
                className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
              />
              <a
                href={formUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Öffnen
              </a>
            </div>
          </div>
        ) : (
          <button
            onClick={handleGenerateUrl}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Link generieren
          </button>
        )}
      </div>
    </div>
  );
};

export default TestFormFlow;