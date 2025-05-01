import { CTForm, CTFormData } from "../../../forms/ct";
import { CTTherapyForm, CTTherapyFormData } from "../../../forms/ct_therapy";
import { PrivacyForm, PrivacyFormData } from "../../../forms/privacy";
import {
	RegistrationFormData,
	RegistrationForm,
} from "../../../forms/registration";
import { RegistrationForm as RegistrationFormPDF } from "../../../pdf";
import {
	RegistrationBGForm,
	RegistrationBGFormData,
} from "../../../forms/registration_bg";
import {
	ProstateNewPatientForm,
	ProstateNewPatientFormData,
} from "../../../forms/prostate_new_patient";
import {
	ProstateFollowUpForm,
	ProstateFollowUpFormData,
} from "../../../forms/prostate_follow_up";
import {
	ProstateTULSAForm,
	ProstateTULSAFormData,
} from "../../../forms/prostate_tulsa";
import {
	ProstateHoLEPForm,
	ProstateHoLEPFormData,
} from "../../../forms/prostate_holep";
import { MRIForm, MRIFormData } from "../../../forms/mri";
import { MRICTForm, MRICTFormData } from "../../../forms/mri_ct";

import { FormType } from "../../../types/constants";
import { BiopsyForm, BiopsyFormData } from "../../../forms/biopsy";

export const FormMap = {
	[FormType.REGISTRATION]: {
		data: RegistrationFormData,
		editForm: RegistrationForm,
		pdfForm: RegistrationFormPDF,
		label: "Anmeldeformular",
	},
	[FormType.REGISTRATION_BG]: {
		data: RegistrationBGFormData,
		editForm: RegistrationBGForm,
		label: "Anmeldeformular (Berufsgenossenschaft)",
	},
	[FormType.PRIVACY]: {
		data: PrivacyFormData,
		editForm: PrivacyForm,
		label: "Datenschutzformular",
	},
	[FormType.CT_CONSENT]: {
		data: CTFormData,
		editForm: CTForm,
		label: "CT Aufklärungsbogen",
	},
	[FormType.CT_THERAPY]: {
		data: CTTherapyFormData,
		editForm: CTTherapyForm,
		label: "CT-Therapie Aufklärungsbogen",
	},
	[FormType.PROSTATE_NEW_PATIENT]: {
		data: ProstateNewPatientFormData,
		editForm: ProstateNewPatientForm,
		label: "Prostata-Fragebogen (Neupatient)",
	},
	[FormType.PROSTATE_FOLLOWUP]: {
		data: ProstateFollowUpFormData,
		editForm: ProstateFollowUpForm,
		label: "Prostata-Fragebogen (Folgeuntersuchung)",
	},
	[FormType.PROSTATE_TULSA]: {
		data: ProstateTULSAFormData,
		editForm: ProstateTULSAForm,
		label: "Prostata-Fragebogen (TULSA)",
	},
	[FormType.PROSTATE_HOLEP]: {
		data: ProstateHoLEPFormData,
		editForm: ProstateHoLEPForm,
		label: "Prostata-Fragebogen (HoLEP)",
	},
	[FormType.MRI_CONSENT]: {
		data: MRIFormData,
		editForm: MRIForm,
		label: "MRT Aufklärungsbogen",
	},
	[FormType.MRI_CT_CONSENT]: {
		data: MRICTFormData,
		editForm: MRICTForm,
		label: "MRT/CT Aufklärungsbogen",
	},
	[FormType.BIOPSY]: {
		data: BiopsyFormData,
		editForm: BiopsyForm,
		label: "Biopsieformular",
	},
};
