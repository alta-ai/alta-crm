import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../../lib/supabase';
import { Camera, Eye, Pencil } from 'lucide-react';
import { cn } from '../../../../lib/utils';

interface FormListProps {
  appointmentId: string;
  examinationId: string;
  billingType: string;
  onPhotoCapture: () => void;
  onViewForm: (formId: string) => void;
  onPreviewForm: (formId: string) => void;
}

const FormList: React.FC<FormListProps> = ({
  appointmentId,
  examinationId,
  billingType,
  onPhotoCapture,
  onViewForm,
  onPreviewForm
}) => {
  // Load available forms for this examination and billing type
  const { data: forms, isLoading } = useQuery({
    queryKey: ['examination-forms', examinationId, billingType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('examination_forms')
        .select(`
          form:forms(
            id,
            name,
            description,
            form_type
          ),
          billing_type
        `)
        .eq('examination_id', examinationId)
        .order('order');

      if (error) throw error;

      // Filter forms by billing type
      return data.filter(ef => ef.billing_type.includes(billingType))
        .map(ef => ef.form);
    }
  });

  // Load form submissions for this appointment
  const { data: submissions, isLoading: isLoadingSubmissions } = useQuery({
    queryKey: ['form-submissions', appointmentId],
    queryFn: async () => {
      // Load all form submissions for this appointment
      const [
        { data: registrationData },
        { data: costReimbursementData },
        { data: privacyData },
        { data: examinationData },
        { data: ctConsentData },
        { data: ctTherapyData },
        { data: mrtCtConsentData },
        { data: prostateData }
      ] = await Promise.all([
        supabase
          .from('registration_form_submissions')
          .select('*')
          .eq('appointment_id', appointmentId)
          .maybeSingle(),
        supabase
          .from('cost_reimbursement_form_submissions')
          .select('*')
          .eq('appointment_id', appointmentId)
          .maybeSingle(),
        supabase
          .from('privacy_form_submissions')
          .select('*')
          .eq('appointment_id', appointmentId)
          .maybeSingle(),
        supabase
          .from('examination_form_submissions')
          .select('*')
          .eq('appointment_id', appointmentId)
          .maybeSingle(),
        supabase
          .from('ct_consent_form_submissions')
          .select('*')
          .eq('appointment_id', appointmentId)
          .maybeSingle(),
        supabase
          .from('ct_therapy_form_submissions')
          .select('*')
          .eq('appointment_id', appointmentId)
          .maybeSingle(),
        supabase
          .from('mrt_ct_consent_form_submissions')
          .select('*')
          .eq('appointment_id', appointmentId)
          .maybeSingle(),
        supabase
          .from('prostate_questionnaire_submissions')
          .select('*')
          .eq('appointment_id', appointmentId)
          .maybeSingle()
      ]);

      return {
        registration: registrationData,
        cost_reimbursement: costReimbursementData,
        privacy: privacyData,
        examination: examinationData,
        ct_consent: ctConsentData,
        ct_therapy: ctTherapyData,
        mrt_ct_consent: mrtCtConsentData,
        prostate_questionnaire: prostateData
      };
    }
  });

  if (isLoading || isLoadingSubmissions) {
    return <div className="text-gray-500">Formulare werden geladen...</div>;
  }

  return (
    <div className="space-y-3">
      {/* Photo Capture Button */}
      <button
        onClick={onPhotoCapture}
        className="w-full flex items-center p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
      >
        <Camera className="h-5 w-5 mr-3 text-blue-600" />
        <span>Patientenfoto aufnehmen</span>
      </button>

      {/* Form List */}
      {forms?.map((form) => {
        const isSubmitted = submissions && submissions[form.form_type];

        return (
          <div
            key={form.id}
            className={cn(
              "w-full flex items-center justify-between p-3 text-left border rounded-lg transition-colors",
              isSubmitted 
                ? "border-green-200 bg-green-50 hover:bg-green-100"
                : "border-gray-200 hover:bg-gray-50"
            )}
          >
            <div>
              <span className="font-medium">{form.name}</span>
              {form.description && (
                <p className="text-sm text-gray-500 mt-1">{form.description}</p>
              )}
              {isSubmitted && (
                <p className="text-sm text-green-600 mt-1">Ausgefüllt</p>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPreviewForm(form.id);
                }}
                title="PDF Vorschau"
                className="text-gray-400 hover:text-gray-600"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewForm(form.id);
                }}
                title="Formular bearbeiten"
                className="text-gray-400 hover:text-gray-600"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FormList;