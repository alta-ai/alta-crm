import { WithSignature } from ".";

export interface RegistrationFormData extends WithSignature {
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
