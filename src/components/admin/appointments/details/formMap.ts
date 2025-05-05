import { CTForm, CTFormData } from "../../../forms/ct";
import { CTTherapyForm, CTTherapyFormData } from "../../../forms/ct_therapy";
import { PrivacyForm, PrivacyFormData } from "../../../forms/privacy";

import {
	RegistrationFormData,
	RegistrationForm,
} from "../../../forms/registration";

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

import {
	MRIForm as MRIFormPDF,
	RegistrationForm as RegistrationFormPDF,
	RegistrationBGForm as RegistrationBGFormPDF,
	PrivacyForm as PrivacyFormPDF,
	BiopsyForm as BiopsyFormPDF,
	CTForm as CTFormPDF,
} from "../../../pdf";

type FormMapEntry = {
	data: unknown;
	editForm: unknown;
	pdfForm?: unknown;
	label: string;
	tableName: string;
};

export const FormMap: Record<FormType, FormMapEntry> = {
	[FormType.REGISTRATION]: {
		data: RegistrationFormData,
		editForm: RegistrationForm,
		pdfForm: RegistrationFormPDF,
		label: "Anmeldeformular",
		tableName: "registration_form_submissions",
	},
	[FormType.REGISTRATION_BG]: {
		data: RegistrationBGFormData,
		editForm: RegistrationBGForm,
		pdfForm: RegistrationBGFormPDF,
		label: "Anmeldeformular (Berufsgenossenschaft)",
		tableName: "registration_bg_form_submissions",
	},
	[FormType.PRIVACY]: {
		data: PrivacyFormData,
		editForm: PrivacyForm,
		pdfForm: PrivacyFormPDF,
		label: "Datenschutzformular",
		tableName: "privacy_form_submissions",
	},
	[FormType.CT_CONSENT]: {
		data: CTFormData,
		editForm: CTForm,
		label: "CT Aufklärungsbogen",
		pdfForm: CTFormPDF,
		tableName: "ct_form_submissions",
	},
	[FormType.CT_THERAPY]: {
		data: CTTherapyFormData,
		editForm: CTTherapyForm,
		label: "CT-Therapie Aufklärungsbogen",
		tableName: "ct_therapy_form_submissions",
	},
	[FormType.PROSTATE_NEW_PATIENT]: {
		data: ProstateNewPatientFormData,
		editForm: ProstateNewPatientForm,
		label: "Prostata-Fragebogen (Neupatient)",
		tableName: "prostate_new_patient_form_submissions",
	},
	[FormType.PROSTATE_FOLLOWUP]: {
		data: ProstateFollowUpFormData,
		editForm: ProstateFollowUpForm,
		label: "Prostata-Fragebogen (Folgeuntersuchung)",
		tableName: "prostate_followup_form_submissions",
	},
	[FormType.PROSTATE_TULSA]: {
		data: ProstateTULSAFormData,
		editForm: ProstateTULSAForm,
		label: "Prostata-Fragebogen (TULSA)",
		tableName: "prostate_tulsa_form_submissions",
	},
	[FormType.PROSTATE_HOLEP]: {
		data: ProstateHoLEPFormData,
		editForm: ProstateHoLEPForm,
		label: "Prostata-Fragebogen (HoLEP)",
		tableName: "prostate_holep_form_submissions",
	},
	[FormType.MRI_CONSENT]: {
		data: MRIFormData,
		editForm: MRIForm,
		pdfForm: MRIFormPDF,
		label: "MRT Aufklärungsbogen",
		tableName: "mri_form_submissions",
	},
	[FormType.MRI_CT_CONSENT]: {
		data: MRICTFormData,
		editForm: MRICTForm,
		label: "MRT/CT Aufklärungsbogen",
		tableName: "mri_ct_form_submissions",
	},
	[FormType.BIOPSY]: {
		data: BiopsyFormData,
		editForm: BiopsyForm,
		label: "Biopsieformular",
		pdfForm: BiopsyFormPDF,
		tableName: "biopsy_form_submissions",
	},
};
