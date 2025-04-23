import { CTForm, CTFormData } from "../../../forms/ct";
import { PrivacyForm, PrivacyFormData } from "../../../forms/privacy";
import {
	RegistrationFormData,
	RegistrationForm,
} from "../../../forms/registration";
import { FormType } from "../../../types/constants";

export const FormMap = {
	[FormType.REGISTRATION]: {
		data: RegistrationFormData,
		editForm: RegistrationForm,
	},
	[FormType.PRIVACY]: {
		data: PrivacyFormData,
		editForm: PrivacyForm,
	},
	[FormType.CT_CONSENT]: {
		data: CTFormData,
		editForm: CTForm,
	},
};
