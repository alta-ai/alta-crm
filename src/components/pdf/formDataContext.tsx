import React, { createContext, useContext } from 'react';

// Define types for the data
interface FormData {
  urologicInformation?: {
    currentlyUndergoingTreatment?: boolean;
    recommendationOfUrologist?: string;
    visitDueToRecommendation?: boolean;
    nameOfUrologist?: string;
    gotTransfer?: boolean;
    sendReportToUrologist?: boolean;
  };
  personalInformation?: {
    gender?: string;
    title?: string;
    firstName?: string;
    lastName?: string;
    birthDate?: string;
    street?: string;
    houseNumber?: string;
    postalCode?: string;
    city?: string;
    phone?: string;
    mobile?: string;
    email?: string;
  };
  insuranceInformation?: {
    type?: string;
    provider?: string;
    hasBeihilfe?: boolean;
  };
  medicalInformation?: {
    hasTransfer?: boolean;
    referringDoctorName?: string;
    currentTreatment?: boolean;
    treatmentRecommendations?: string[];
    doctorRecommendation?: boolean;
    sendReportToDoctor?: boolean;
    reportDeliveryMethod?: string;
    foundThrough?: string[];
  };
}

interface PatientData {
  title?: string;
  name?: string; // Vorname (first_name)
  surname?: string; // Nachname (last_name)
  birthdate?: string;
  contact?: {
    phone?: string;
    mobile?: string;
    email?: string;
  };
  address?: {
    street?: string;
    houseNumber?: string;
    zipCode?: string;
    city?: string;
  };
  insurance?: {
    privateInsurance?: string;
    publicInsurance?: string;
    eligibleForAid?: boolean;
  };
}

interface AppointmentData {
  examination?: string;
  date?: string;
  time?: string;
  location?: string;
}

interface PdfMappings {
  fieldId: string;
  pdfField: string;
  section?: string;
}

interface FormDataContextType {
  formData: FormData;
  patientData: PatientData;
  appointmentData: AppointmentData;
  pdfMappings: PdfMappings[];
}

// Create context with default values
const FormDataContext = createContext<FormDataContextType>({
  formData: {},
  patientData: {},
  appointmentData: {},
  pdfMappings: []
});

// Provider component
interface FormDataProviderProps {
  children: React.ReactNode;
  initialFormData?: FormData;
  initialPatientData?: PatientData;
  initialAppointmentData?: AppointmentData;
  pdfMappings?: PdfMappings[];
}

export const FormDataProvider: React.FC<FormDataProviderProps> = ({ 
  children,
  initialFormData = {},
  initialPatientData = {},
  initialAppointmentData = {},
  pdfMappings = []
}) => {
  return (
    <FormDataContext.Provider 
      value={{ 
        formData: initialFormData, 
        patientData: initialPatientData, 
        appointmentData: initialAppointmentData,
        pdfMappings
      }}
    >
      {children}
    </FormDataContext.Provider>
  );
};

// Custom Hook for easy access
export const useFormData = () => useContext(FormDataContext);