import { RegistrationFormData } from "./registration";

export type { RegistrationFormData };

interface FormProps {
	onRender?: () => void;
}

// Define types for the data
interface PatientData {
	patientNumber?: string; // Patienten-ID (patient_id)
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
		country?: string;
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
	bodySide?: string;
}

interface WithSignature {
	signature?: {
		data?: string;
		signedAtDate?: string;
		signedAtTime?: string;
	};
}

export type { FormProps, PatientData, AppointmentData, WithSignature };
