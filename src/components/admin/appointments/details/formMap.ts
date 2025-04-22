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
};
