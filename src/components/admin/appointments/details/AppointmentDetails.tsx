import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../../lib/supabase';
import { Camera, Maximize, X } from 'lucide-react';
import { AppointmentDetailsProps } from '../types';

const BILLING_TYPE_LABELS: Record<string, string> = {
  self_payer: 'Selbstzahler',
  private_patient: 'Privatpatient',
  foreign_patient: 'Ausländischer Patient',
  work_accident: 'Arbeitsunfall (Berufsgenossenschaft)'
};

interface AppointmentDetailsComponentProps extends AppointmentDetailsProps {
  error: string | null;
  setError: (error: string | null) => void;
  isDeleting: boolean;
  handleCancel: () => void;
  handleStatusChange: (statusId: string) => void;
  currentStatus: any;
  isStatusChanging: boolean;
  statuses: any[];
  patientPhoto: string | null;
  setShowPhotoModal: (show: boolean) => void;
}

const AppointmentDetails: React.FC<AppointmentDetailsComponentProps> = ({
  appointment,
  error,
  setError,
  isDeleting,
  handleCancel,
  handleStatusChange,
  currentStatus,
  isStatusChanging,
  statuses,
  onReschedule,
  patientPhoto,
  setShowPhotoModal
}) => {
  // Load current referring doctor
  const { data: currentReferringDoctor } = useQuery({
    queryKey: ['appointment-referring-doctor', appointment.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointment_referring_doctors')
        .select(`
          referring_doctor:referring_doctors(
            id,
            title,
            gender,
            first_name,
            last_name,
            specialty:medical_specialties(
              id,
              name
            )
          )
        `)
        .eq('appointment_id', appointment.id)
        .maybeSingle();

      if (error) {
        console.error('Fehler beim Laden des Überweisers:', error);
        return null;
      }
      
      return data?.referring_doctor || null;
    }
  });

  return (
    <>
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Details */}
      <div className="mb-6 bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="flex items-center text-sm text-gray-600">
          <span>
            {format(new Date(appointment.start_time), "EEEE, d. MMMM yyyy 'um' HH:mm 'Uhr'", { locale: de })}
          </span>
          {appointment.previous_appointment_date && (
            <div className="ml-2 text-sm text-blue-600">
              (Verschoben vom {format(parseISO(appointment.previous_appointment_date), "dd.MM.yyyy HH:mm", { locale: de })})
            </div>
          )}
        </div>
        <div className="text-sm text-gray-600">
          {appointment.location.name}
        </div>
        <div className="text-sm text-gray-600">
          {appointment.device.name}
        </div>
        <div className="text-sm text-gray-600 pl-7">
          {appointment.examination.name} ({appointment.examination.duration} Minuten)
        </div>
      </div>

      {/* Status Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700">
          Behandlungsstatus {isStatusChanging && <span className="text-sm text-blue-600 ml-2">(wird geändert...)</span>}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {statuses?.map((status) => (
            <button
              key={status.id}
              onClick={() => handleStatusChange(status.id)}
              disabled={isStatusChanging}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentStatus?.id === status.id
                  ? "bg-opacity-100 text-white"
                  : "bg-opacity-50 hover:bg-opacity-60 text-gray-900"
              } ${isStatusChanging && "opacity-50 cursor-not-allowed"}`}
              style={{
                backgroundColor: currentStatus?.id === status.id 
                  ? status.color 
                  : `${status.color}80`,
                borderColor: status.color,
                borderWidth: '1px'
              }}
            >
              {status.name}
            </button>
          ))}
        </div>
      </div>

      {/* Patient Info */}
      <div className="space-y-4 mb-6">
        <h3 className="text-sm font-medium text-gray-700">Patient</h3>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between">
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Name: </span>
                {appointment.patient.first_name} {appointment.patient.last_name}
              </p>
              <p className="text-sm">
                <span className="font-medium">E-Mail: </span>
                {appointment.patient.email}
              </p>
              <p className="text-sm">
                <span className="font-medium">Telefon: </span>
                {appointment.patient.phone}
              </p>
              <p className="text-sm">
                <span className="font-medium">Abrechnungsart: </span>
                {BILLING_TYPE_LABELS[appointment.billing_type]}
              </p>
              {appointment.patient_data?.has_transfer && (
                <p className="text-sm">
                  <span className="font-medium">Überweisender Arzt: </span>
                  {appointment.patient_data.referring_doctor}
                </p>
              )}
              {currentReferringDoctor && (
                <p className="text-sm">
                  <span className="font-medium">Überweiser: </span>
                  {currentReferringDoctor.title && (
                    <span>{currentReferringDoctor.title} </span>
                  )}
                  {currentReferringDoctor.first_name} {currentReferringDoctor.last_name}
                </p>
              )}
              {appointment.patient_data?.with_contrast_medium && (
                <p className="text-sm text-blue-600">Mit Kontrastmittel</p>
              )}
            </div>
            
            {/* Patientenfoto rechts */}
            <div className="flex flex-col items-center">
              {patientPhoto ? (
                <div className="relative">
                  <img 
                    src={patientPhoto} 
                    alt="Patientenfoto" 
                    className="h-24 w-24 rounded-full object-cover cursor-pointer border-2 border-gray-200"
                    onClick={() => setShowPhotoModal(true)}
                  />
                  <button 
                    className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1 shadow-md hover:bg-blue-600"
                    onClick={() => setShowPhotoModal(true)}
                  >
                    <Maximize className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center">
                  <Camera className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          onClick={handleCancel}
          disabled={isDeleting}
          className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-md shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeleting ? 'Wird storniert...' : 'Termin stornieren'}
        </button>
        <button
          onClick={onReschedule}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Termin verschieben
        </button>
      </div>
    </>
  );
};

export default AppointmentDetails;