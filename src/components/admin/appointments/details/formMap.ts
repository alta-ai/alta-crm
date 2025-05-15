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
import { IPSSForm, IPSSFormData } from "../../../forms/ipss";
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
	CTTherapyForm as CTTherapyFormPDF,
	CTMRIForm as CTMRIFormPDF,
	ProstateNewPatientForm as ProstateNewPatientFormPDF,
	ProstateTULSAForm as ProstateTULSAFormPDF,
	ProstateFollowUpForm as ProstateFollowUpFormPDF,
	ProstateHoLEPForm as ProstateHoLEPFormPDF,
	IPSSForm as IPSSFormPDF,
} from "../../../pdf";

import {
	PSADiagramContextProvider,
	SignatureContextProvider,
} from "../../../pdf/contexts";
import React from "react";

type FormMapEntry = {
	data: unknown;
	editForm: React.FC;
	pdfForm: React.ComponentType<any>;
	customContexts?: React.FC<{
		children?: React.ReactNode;
	}>[];
	label: string;
	tableName: string;
};

export const FormMap: Record<FormType, FormMapEntry> = {
	[FormType.REGISTRATION]: {
		data: RegistrationFormData,
		editForm: RegistrationForm,
		pdfForm: RegistrationFormPDF,
		customContexts: [SignatureContextProvider as any],
		label: "Anmeldeformular",
		tableName: "registration_form_submissions",
	},
	[FormType.REGISTRATION_BG]: {
		data: RegistrationBGFormData,
		editForm: RegistrationBGForm,
		pdfForm: RegistrationBGFormPDF,
		customContexts: [SignatureContextProvider as any],
		label: "Anmeldeformular (Berufsgenossenschaft)",
		tableName: "registration_bg_form_submissions",
	},
	[FormType.PRIVACY]: {
		data: PrivacyFormData,
		editForm: PrivacyForm,
		pdfForm: PrivacyFormPDF,
		customContexts: [SignatureContextProvider as any],
		label: "Datenschutzformular",
		tableName: "privacy_form_submissions",
	},
	[FormType.CT_CONSENT]: {
		data: CTFormData,
		editForm: CTForm,
		label: "CT Aufklärungsbogen",
		pdfForm: CTFormPDF,
		customContexts: [SignatureContextProvider as any],
		tableName: "ct_form_submissions",
	},
	[FormType.CT_THERAPY]: {
		data: CTTherapyFormData,
		editForm: CTTherapyForm,
		label: "CT-Therapie Aufklärungsbogen",
		pdfForm: CTTherapyFormPDF,
		customContexts: [SignatureContextProvider as any],
		tableName: "ct_therapy_form_submissions",
	},
	[FormType.PROSTATE_NEW_PATIENT]: {
		data: ProstateNewPatientFormData,
		editForm: ProstateNewPatientForm,
		label: "Prostata-Fragebogen (Neupatient)",
		pdfForm: ProstateNewPatientFormPDF,
		customContexts: [
			SignatureContextProvider as any,
			PSADiagramContextProvider as any,
		],
		tableName: "prostate_new_patient_form_submissions",
	},
	[FormType.PROSTATE_FOLLOWUP]: {
		data: ProstateFollowUpFormData,
		editForm: ProstateFollowUpForm,
		label: "Prostata-Fragebogen (Folgeuntersuchung)",
		pdfForm: ProstateFollowUpFormPDF,
		customContexts: [
			SignatureContextProvider as any,
			PSADiagramContextProvider as any,
		],
		tableName: "prostate_followup_form_submissions",
	},
	[FormType.PROSTATE_TULSA]: {
		data: ProstateTULSAFormData,
		editForm: ProstateTULSAForm,
		label: "Prostata-Fragebogen (TULSA)",
		pdfForm: ProstateTULSAFormPDF,
		customContexts: [
			SignatureContextProvider as any,
			PSADiagramContextProvider as any,
		],
		tableName: "prostate_tulsa_form_submissions",
	},
	[FormType.PROSTATE_HOLEP]: {
		data: ProstateHoLEPFormData,
		editForm: ProstateHoLEPForm,
		label: "Prostata-Fragebogen (HoLEP)",
		pdfForm: ProstateHoLEPFormPDF,
		customContexts: [
			SignatureContextProvider as any,
			PSADiagramContextProvider as any,
		],
		tableName: "prostate_holep_form_submissions",
	},
	[FormType.MRI_CONSENT]: {
		data: MRIFormData,
		editForm: MRIForm,
		pdfForm: MRIFormPDF,
		customContexts: [SignatureContextProvider as any],
		label: "MRT Aufklärungsbogen",
		tableName: "mri_form_submissions",
	},
	[FormType.MRI_CT_CONSENT]: {
		data: MRICTFormData,
		editForm: MRICTForm,
		label: "MRT/CT Aufklärungsbogen",
		pdfForm: CTMRIFormPDF,
		customContexts: [SignatureContextProvider as any],
		tableName: "mri_ct_form_submissions",
	},
	[FormType.BIOPSY]: {
		data: BiopsyFormData,
		editForm: BiopsyForm,
		label: "Biopsieformular",
		pdfForm: BiopsyFormPDF,
		customContexts: [SignatureContextProvider as any],
		tableName: "biopsy_form_submissions",
	},
	[FormType.IPSS]: {
		data: IPSSFormData,
		editForm: IPSSForm,
		label: "IPSS Formular",
		pdfForm: IPSSFormPDF,
		customContexts: [SignatureContextProvider as any],
		tableName: "ipss_form_submissions",
	},
};
