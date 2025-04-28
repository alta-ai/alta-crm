import { z } from "zod";

export const ProstateNewPatientFormSchema = z.object({
	id: z.string().uuid(),
	created_at: z.coerce.date(),
	updated_at: z.coerce.date(),

	// PSA test values
	psa_value_1: z.number().nullable(),
	psa_date_1: z.string().nullable(),
	psa_value_2: z.number().nullable(),
	psa_date_2: z.string().nullable(),
	psa_value_3: z.number().nullable(),
	psa_date_3: z.string().nullable(),
	psa_value_4: z.number().nullable(),
	psa_date_4: z.string().nullable(),
	psa_value_5: z.number().nullable(),
	psa_date_5: z.string().nullable(),
	psa_value_6: z.number().nullable(),
	psa_date_6: z.string().nullable(),
	psa_value_7: z.number().nullable(),
	psa_date_7: z.string().nullable(),
	psa_value_8: z.number().nullable(),
	psa_date_8: z.string().nullable(),
	psa_value_9: z.number().nullable(),
	psa_date_9: z.string().nullable(),
	psa_value_10: z.number().nullable(),
	psa_date_10: z.string().nullable(),
	free_psa_value: z.number().nullable(),

	// Family history
	family_prostate_disease: z.boolean().nullable(),
	family_member: z.array(z.string()).nullable(),
	family_disease_type: z.array(z.string()).nullable(),

	// Urologist information
	urologist_treatment: z.boolean().nullable(),
	urologist_recommendation: z.array(z.string()).nullable(),

	// Diagnosis and treatment
	known_diagnosis: z.boolean().nullable(),
	diagnosis_type: z.array(z.string()).nullable(),
	prostate_treated: z.boolean().nullable(),
	prostate_not_treated_reason: z.string().nullable(),

	// Treatment details - Enlargement
	enlargement_therapy_type: z.array(z.string()).nullable(),
	enlargement_therapy_other: z.string().nullable(),
	enlargement_therapy_date: z.string().nullable(),
	enlargement_medication_type: z.array(z.string()).nullable(),
	enlargement_medication_other: z.string().nullable(),
	enlargement_medication_since: z.string().nullable(),

	// Treatment details - Inflammation
	inflammation_therapy_type: z.array(z.string()).nullable(),
	inflammation_therapy_other: z.string().nullable(),
	inflammation_therapy_date: z.string().nullable(),
	inflammation_therapy_duration: z.string().nullable(),

	// Treatment details - Cancer
	cancer_therapy_type: z.array(z.string()).nullable(),
	cancer_therapy_other: z.string().nullable(),
	cancer_therapy_date: z.string().nullable(),

	// Urination symptoms
	urination_symptoms: z.array(z.string()).nullable(),
	urination_pain_location: z.string().nullable(),
	night_urination_frequency: z.string().nullable(),
	urination_symptoms_duration: z.string().nullable(),
	urination_satisfaction_level: z.string().nullable(),

	// Diagnostic procedures
	urologist_palpation: z.array(z.string()).nullable(),
	urologist_ultrasound: z.array(z.string()).nullable(),

	// MRI information
	had_mri: z.boolean().nullable(),
	mri_date: z.string().nullable(),
	brings_mri_cd: z.string().nullable(),

	// Biopsy information
	biopsy_types: z.array(z.string()).nullable(),
	last_usg_biopsy_date: z.string().nullable(),
	last_fusion_biopsy_date: z.string().nullable(),
	last_saturation_biopsy_date: z.string().nullable(),
	last_unknown_biopsy_date: z.string().nullable(),
	last_biopsy_access_route: z.string().nullable(),
	biopsy_count: z.number().int().nullable(),
	last_biopsy_result: z.string().nullable(),
	biopsy_gleason_score: z.array(z.string()).nullable(),
});

export const defaultProstateNewPatientForm: Partial<ProstateNewPatientForm> = {
	// PSA test values
	psa_value_1: null,
	psa_date_1: null,
	psa_value_2: null,
	psa_date_2: null,
	psa_value_3: null,
	psa_date_3: null,
	psa_value_4: null,
	psa_date_4: null,
	psa_value_5: null,
	psa_date_5: null,
	psa_value_6: null,
	psa_date_6: null,
	psa_value_7: null,
	psa_date_7: null,
	psa_value_8: null,
	psa_date_8: null,
	psa_value_9: null,
	psa_date_9: null,
	psa_value_10: null,
	psa_date_10: null,
	free_psa_value: null,

	// Family history
	family_prostate_disease: null,
	family_member: [],
	family_disease_type: [],

	// Urologist information
	urologist_treatment: null,
	urologist_recommendation: [],

	// Diagnosis and treatment
	known_diagnosis: null,
	diagnosis_type: [],
	prostate_treated: null,
	prostate_not_treated_reason: null,

	// Treatment details - Enlargement
	enlargement_therapy_type: [],
	enlargement_therapy_other: null,
	enlargement_therapy_date: null,
	enlargement_medication_type: [],
	enlargement_medication_other: null,
	enlargement_medication_since: null,

	// Treatment details - Inflammation
	inflammation_therapy_type: [],
	inflammation_therapy_other: null,
	inflammation_therapy_date: null,
	inflammation_therapy_duration: null,

	// Treatment details - Cancer
	cancer_therapy_type: [],
	cancer_therapy_other: null,
	cancer_therapy_date: null,

	// Urination symptoms
	urination_symptoms: [],
	urination_pain_location: null,
	night_urination_frequency: null,
	urination_symptoms_duration: null,
	urination_satisfaction_level: null,

	// Diagnostic procedures
	urologist_palpation: [],
	urologist_ultrasound: [],

	// MRI information
	had_mri: null,
	mri_date: null,
	brings_mri_cd: null,

	// Biopsy information
	biopsy_types: [],
	last_usg_biopsy_date: null,
	last_fusion_biopsy_date: null,
	last_saturation_biopsy_date: null,
	last_unknown_biopsy_date: null,
	last_biopsy_access_route: null,
	biopsy_count: null,
	last_biopsy_result: null,
	biopsy_gleason_score: [],
};

// Infer TypeScript type from the Zod schema
export type ProstateNewPatientForm = z.infer<
	typeof ProstateNewPatientFormSchema
>;
