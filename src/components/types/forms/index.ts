export type * from "./registration";
export { RegistrationFormSchema } from "./registration";

export type * from "./registration_bg";
export { RegistrationBGFormSchema } from "./registration_bg";

export type * from "./form";
export { FormSchema } from "./form";

export type * from "./ct";
export { CTFormSchema } from "./ct";

export type * from "./privacy";
export { PrivacyFormSchema } from "./privacy";

export type * from "./prostate_new_patient";
export {
	ProstateNewPatientFormSchema,
	defaultProstateNewPatientForm,
} from "./prostate_new_patient";

export type * from "./prostate_follow_up";
export {
	ProstateFollowUpFormSchema,
	defaultProstateFollowUpForm,
} from "./prostate_follow_up";
