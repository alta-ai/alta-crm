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

export const FormMap = {
	[FormType.REGISTRATION]: {
		data: RegistrationFormData,
		editForm: RegistrationForm,
	},
	[FormType.REGISTRATION_BG]: {
		data: RegistrationBGFormData,
		editForm: RegistrationBGForm,
	},
	[FormType.PRIVACY]: {
		data: PrivacyFormData,
		editForm: PrivacyForm,
	},
	[FormType.CT_CONSENT]: {
		data: CTFormData,
		editForm: CTForm,
	},
	[FormType.CT_THERAPY]: {
		data: CTTherapyFormData,
		editForm: CTTherapyForm,
	},
	[FormType.PROSTATE_NEW_PATIENT]: {
		data: ProstateNewPatientFormData,
		editForm: ProstateNewPatientForm,
	},
	[FormType.PROSTATE_FOLLOWUP]: {
		data: ProstateFollowUpFormData,
		editForm: ProstateFollowUpForm,
	},
	[FormType.PROSTATE_TULSA]: {
		data: ProstateTULSAFormData,
		editForm: ProstateTULSAForm,
	},
	[FormType.PROSTATE_HOLEP]: {
		data: ProstateHoLEPFormData,
		editForm: ProstateHoLEPForm,
	},
	[FormType.MRI_CONSENT]: {
		data: MRIFormData,
		editForm: MRIForm,
	},
	[FormType.MRI_CT_CONSENT]: {
		data: MRICTFormData,
		editForm: MRICTForm,
	},
};
