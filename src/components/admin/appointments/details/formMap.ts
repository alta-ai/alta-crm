import { CTForm, CTFormData } from "../../../forms/ct";
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
};
