import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { X } from 'lucide-react';
import { cn } from '../../../lib/utils';
import AppointmentDetails from './details/AppointmentDetails';
import AppointmentComments from './details/AppointmentComments';
import DocumentUpload from './DocumentUpload';
import ReferringDoctorSection from './ReferringDoctorSection';
import ReportSection from './ReportSection';
import FormSection from './details/FormSection';
import PatientPhotoModal from './details/PatientPhotoModal';
import { AppointmentDetailsProps } from './types';

const AppointmentDetailsModal: React.FC<AppointmentDetailsProps & {
  isOpen: boolean;
  onClose: () => void;
}> = ({
  isOpen,
  onClose,
  appointment,
  onReschedule,
  refetchAppointments
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'forms' | 'documents' | 'comments' | 'referringDoctor' | 'report'>('details');
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentStatusId, setCurrentStatusId] = useState(appointment.status_id);
  const [isStatusChanging, setIsStatusChanging] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const queryClient = useQueryClient();

  // Fetch appointment statuses
  const { data: statuses } = useQuery({
    queryKey: ['appointmentStatuses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointment_statuses')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    }
  });

  // Load patient photo
  const { data: patientPhoto } = useQuery({
    queryKey: ['patient-photo', appointment.patient.id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('patient_photos')
          .select('photo_data')
          .eq('patient_id', appointment.patient.id)
          .eq('active', true)
          .maybeSingle();
        
        if (error) {
          console.error('Fehler beim Laden des Patientenfotos:', error);
          return null;
        }
        
        return data?.photo_data || null;
      } catch (err) {
        console.error('Fehler bei der Foto-Abfrage:', err);
        return null;
      }
    },
    retry: false,
    staleTime: 60000
  });

  const handleCancel = async () => {
    try {
      setIsDeleting(true);
      setError(null);

      const { error } = await supabase
        .from('appointments')
        .update({
          status_id: (await supabase
            .from('appointment_statuses')
            .select('id')
            .eq('name', 'Storniert')
            .single()
          ).data?.id
        })
        .eq('id', appointment.id);

      if (error) throw error;

      refetchAppointments?.();
      onClose();
    } catch (error: any) {
      console.error('Error cancelling appointment:', error);
      setError('Der Termin konnte nicht storniert werden. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (statusId: string) => {
    try {
      setIsStatusChanging(true);
      setError(null);
      setCurrentStatusId(statusId);

      const { error } = await supabase
        .from('appointments')
        .update({ status_id: statusId })
        .eq('id', appointment.id);

      if (error) throw error;
      
      refetchAppointments?.();
    } catch (error: any) {
      console.error('Error updating appointment status:', error);
      setError('Der Status konnte nicht aktualisiert werden');
      setCurrentStatusId(appointment.status_id);
    } finally {
      setIsStatusChanging(false);
    }
  };

  if (!isOpen) return null;

  const currentStatus = statuses?.find(s => s.id === currentStatusId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Termin Details
            </h2>
            <div className="border-l border-gray-200 pl-4">
              <nav className="flex space-x-4">
                <button
                  onClick={() => setActiveTab('details')}
                  className={cn(
                    'px-3 py-2 text-sm font-medium rounded-md',
                    activeTab === 'details'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  Details
                </button>
                <button
                  onClick={() => setActiveTab('forms')}
                  className={cn(
                    'px-3 py-2 text-sm font-medium rounded-md',
                    activeTab === 'forms'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  Formulare
                </button>
                <button
                  onClick={() => setActiveTab('documents')}
                  className={cn(
                    'px-3 py-2 text-sm font-medium rounded-md',
                    activeTab === 'documents'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  Dokumente
                </button>
                <button
                  onClick={() => setActiveTab('comments')}
                  className={cn(
                    'px-3 py-2 text-sm font-medium rounded-md',
                    activeTab === 'comments'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  Kommentare
                </button>
                <button
                  onClick={() => setActiveTab('referringDoctor')}
                  className={cn(
                    'px-3 py-2 text-sm font-medium rounded-md',
                    activeTab === 'referringDoctor'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  Überweiser
                </button>
                <button
                  onClick={() => setActiveTab('report')}
                  className={cn(
                    'px-3 py-2 text-sm font-medium rounded-md',
                    activeTab === 'report'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  Befund
                </button>
              </nav>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          {activeTab === 'details' ? (
            <AppointmentDetails
              appointment={appointment}
              error={error}
              setError={setError}
              isDeleting={isDeleting}
              handleCancel={handleCancel}
              handleStatusChange={handleStatusChange}
              currentStatus={currentStatus}
              isStatusChanging={isStatusChanging}
              statuses={statuses || []}
              onReschedule={onReschedule}
              patientPhoto={patientPhoto}
              setShowPhotoModal={setShowPhotoModal}
            />
          ) : activeTab === 'forms' ? (
            <FormSection
              appointmentId={appointment.id}
              patientId={appointment.patient.id}
              patientName={`${appointment.patient.first_name} ${appointment.patient.last_name}`}
              patientEmail={appointment.patient.email}
              appointmentDate={appointment.start_time}
              examinationName={appointment.examination.name}
              examinationId={appointment.examination.id}
              billingType={appointment.billing_type}
              onPhotoUpdated={() => {
                queryClient.invalidateQueries(['patient-photo', appointment.patient.id]);
              }}
            />
          ) : activeTab === 'documents' ? (
            <DocumentUpload appointmentId={appointment.id} />
          ) : activeTab === 'comments' ? (
            <AppointmentComments appointmentId={appointment.id} />
          ) : activeTab === 'referringDoctor' ? (
            <ReferringDoctorSection 
              appointmentId={appointment.id} 
              onUpdateComplete={() => {
                queryClient.invalidateQueries(['appointment-referring-doctor', appointment.id]);
                if (refetchAppointments) {
                  refetchAppointments();
                }
              }} 
            />
          ) : (
            <ReportSection 
              appointmentId={appointment.id}
              patientId={appointment.patient.id}
            />
          )}
        </div>
      </div>

      {/* Photo Modal */}
      {showPhotoModal && patientPhoto && (
        <PatientPhotoModal 
          photoUrl={patientPhoto} 
          onClose={() => setShowPhotoModal(false)} 
        />
      )}
    </div>
  );
};

export default AppointmentDetailsModal;