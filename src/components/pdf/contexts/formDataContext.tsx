import React, { createContext, useContext } from "react";

import { Patient, Appointment } from "../../types";

interface FormDataContextType<TFormData> {
	formData: TFormData;
	patientData: Partial<Patient>;
	appointmentData: Partial<Appointment>;
}

// Provider component
interface FormDataProviderProps<TFormData> {
	children: React.ReactNode;
	initialFormData?: TFormData;
	initialPatientData?: Partial<Patient>;
	initialAppointmentData?: Partial<Appointment>;
}

// Create context with default values
const FormDataContext = createContext<FormDataContextType<any>>({
	formData: {},
	patientData: {} as Partial<Patient>,
	appointmentData: {} as Partial<Appointment>,
});

export const FormDataProvider = <TFormData,>({
	children,
	initialFormData = {} as TFormData,
	initialPatientData = {} as Partial<Patient>,
	initialAppointmentData = {} as Partial<Appointment>,
}: FormDataProviderProps<TFormData>) => {
	return (
		<FormDataContext.Provider
			value={{
				formData: initialFormData,
				patientData: initialPatientData,
				appointmentData: initialAppointmentData,
			}}
		>
			{children}
		</FormDataContext.Provider>
	);
};

// Custom Hook for easy access with generic type
export const useFormData = <TFormData,>() =>
	useContext(FormDataContext) as FormDataContextType<TFormData>;
