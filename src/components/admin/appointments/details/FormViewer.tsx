import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../../lib/supabase';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Info } from 'lucide-react';
import RegistrationForm from '../../../RegistrationForm';

interface FormViewerProps {
  formId: string;
  appointmentId: string;
  formType: string;
}

const FormViewer: React.FC<FormViewerProps> = ({
  formId,
  appointmentId,
  formType
}) => {
  const queryClient = useQueryClient();

  // Load form submission if it exists
  const { data: submission, isLoading: isLoadingSubmission } = useQuery({
    queryKey: ['registration-form-submission', appointmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('registration_form_submissions')
        .select('*')
        .eq('appointment_id', appointmentId)
        .maybeSingle();

      if (error) throw error;

      // Convert boolean fields to strings for form
      if (data) {
        return {
          ...data,
          has_beihilfe: data.has_beihilfe?.toString(),
          has_transfer: data.has_transfer?.toString(),
          current_treatment: data.current_treatment?.toString(),
          doctor_recommendation: data.doctor_recommendation?.toString(),
          send_report_to_doctor: data.send_report_to_doctor?.toString()
        };
      }

      return data;
    }
  });

  // Load form data
  const { data: form, isLoading: isLoadingForm } = useQuery({
    queryKey: ['form', formId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .single();

      if (error) throw error;
      return data;
    }
  });

  // Load appointment data for form context
  const { data: appointment, isLoading: isLoadingAppointment } = useQuery({
    queryKey: ['appointment', appointmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(
            id,
            gender,
            title,
            first_name,
            last_name,
            email,
            phone,
            birth_date
          ),
          examination:examinations(
            id,
            name
          )
        `)
        .eq('id', appointmentId)
        .single();

      if (error) throw error;
      return data;
    }
  });

  // Mutation for saving form data
  const saveMutation = useMutation({
    mutationFn: async (formData: any) => {
      // Convert string boolean values to actual booleans
      const submissionData = {
        ...formData,
        appointment_id: appointmentId,
        patient_id: appointment?.patient.id,
        has_beihilfe: formData.has_beihilfe === 'true',
        has_transfer: formData.has_transfer === 'true',
        current_treatment: formData.current_treatment === 'true',
        doctor_recommendation: formData.doctor_recommendation === 'true',
        send_report_to_doctor: formData.send_report_to_doctor === 'true'
      };

      if (submission) {
        // Update existing submission
        const { error } = await supabase
          .from('registration_form_submissions')
          .update(submissionData)
          .eq('id', submission.id);

        if (error) throw error;
      } else {
        // Create new submission
        const { error } = await supabase
          .from('registration_form_submissions')
          .insert([submissionData]);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries(['registration-form-submission', appointmentId]);
      queryClient.invalidateQueries(['patients']);
    }
  });

  if (isLoadingForm || isLoadingSubmission || isLoadingAppointment) {
    return <div className="text-gray-500">Formular wird geladen...</div>;
  }

  if (!form || !appointment) {
    return <div className="text-red-500">Formular konnte nicht geladen werden</div>;
  }

  // Prepare initial data from patient if no submission exists
  const initialData = submission || {
    gender: appointment.patient.gender,
    title: appointment.patient.title,
    first_name: appointment.patient.first_name,
    last_name: appointment.patient.last_name,
    email: appointment.patient.email,
    phone_mobile: appointment.patient.phone,
    birth_date: format(new Date(appointment.patient.birth_date), 'yyyy-MM-dd')
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{form.name}</h3>
        {form.description && (
          <p className="text-sm text-gray-500">{form.description}</p>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        {submission ? (
          <div className="mb-6">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-900">
                  Formular wurde am {format(new Date(submission.created_at), 'dd.MM.yyyy HH:mm', { locale: de })} ausgefüllt
                </p>
                {submission.updated_at !== submission.created_at && (
                  <p className="text-sm text-gray-500">
                    Zuletzt bearbeitet: {format(new Date(submission.updated_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-500 mt-0.5" />
              <p className="text-sm text-gray-900">
                Dieses Formular wurde noch nicht ausgefüllt.
              </p>
            </div>
          </div>
        )}

        <RegistrationForm
          initialData={initialData}
          onSubmit={saveMutation.mutate}
          appointment={appointment}
          readOnly={false}
        />
      </div>
    </div>
  );
};

export default FormViewer;