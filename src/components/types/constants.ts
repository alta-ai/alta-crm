export const GENDER = ["M", "F", "D"] as const;

export const INSURANCE_TYPE = [
	"private",
	"statutory",
	"Berufsgenossenschft",
	"Foreigners",
] as const;

export const BODY_SIDE = ["left", "right", "both_sides"] as const;

export enum FormType {
	REGISTRATION = "registration",
	REGISTRATION_BG = "registration_bg",
	COST_REIMBURSEMENT = "cost_reimbursement",
	PRIVACY = "privacy",
	EXAMINATION = "examination",
	CT_CONSENT = "ct_consent",
	CT_THERAPY = "ct_therapy",
	MRI_CT_CONSENT = "mri_ct_consent",
	MRI_CONSENT = "mri_consent",
	PROSTATE_NEW_PATIENT = "prostate_new_patient",
}
