export const GENDER = ["M", "F", "D"] as const;

export const INSURANCE_TYPE = [
	"private",
	"statutory",
	"Berufsgenossenschft",
	"Foreigners",
] as const;

export enum BodySide {
	LEFT = "left",
	RIGHT = "right",
	BOTH_SIDES = "both_sides",
}

export enum FormType {
	REGISTRATION = "registration",
	REGISTRATION_BG = "registration_bg",
	PRIVACY = "privacy",
	CT_CONSENT = "ct_consent",
	CT_THERAPY = "ct_therapy",
	MRI_CT_CONSENT = "mri_ct_consent",
	MRI_CONSENT = "mri_consent",
	PROSTATE_NEW_PATIENT = "prostate_new_patient",
	PROSTATE_FOLLOWUP = "prostate_followup",
	PROSTATE_TULSA = "prostate_tulsa",
	PROSTATE_HOLEP = "prostate_holep",
	BIOPSY = "biopsy",
}
