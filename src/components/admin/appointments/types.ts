export interface AppointmentDetailsProps {
  appointment: {
    id: string;
    start_time: string;
    end_time: string;
    status: string;
    status_id: string;
    patient_data: any;
    billing_type: string;
    patient: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
    };
    examination: {
      id: string; // Hier fehlte die ID
      name: string;
      duration: number;
    };
    device: {
      name: string;
    };
    location: {
      name: string;
    };
    previous_appointment_date?: string;
  };
  onReschedule: () => void;
  refetchAppointments?: () => void;
}