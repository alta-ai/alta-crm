import React, { createContext, useContext } from "react";

import { PatientData, AppointmentData } from "./types";

interface FormDataContextType<TFormData> {
	formData: TFormData;
	patientData: PatientData;
	appointmentData: AppointmentData;
}

// Provider component
interface FormDataProviderProps<TFormData> {
	children: React.ReactNode;
	initialFormData?: TFormData;
	initialPatientData?: PatientData;
	initialAppointmentData?: AppointmentData;
}

// Create context with default values
const FormDataContext = createContext<FormDataContextType<any>>({
	formData: {},
	patientData: {},
	appointmentData: {},
});

export const FormDataProvider = <TFormData,>({
	children,
	initialFormData = {} as TFormData,
	initialPatientData = {},
	initialAppointmentData = {},
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
