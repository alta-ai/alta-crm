import { z } from "zod";

export const ProstateFollowUpFormSchema = z.object({
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

	// Treatment information
	prostate_treatment_types: z.array(z.string()).nullable(),
	prostate_not_treated_reason: z.string().nullable(),

	// Enlargement treatment
	enlargement_therapy_type: z.array(z.string()).nullable(),
	enlargement_therapy_other: z.string().nullable(),
	enlargement_therapy_date: z.string().nullable(),
	enlargement_medication_type: z.array(z.string()).nullable(),
	enlargement_medication_other: z.string().nullable(),
	enlargement_medication_since: z.string().nullable(),

	// Inflammation treatment
	inflammation_therapy_type: z.array(z.string()).nullable(),
	inflammation_therapy_other: z.string().nullable(),
	inflammation_therapy_date: z.string().nullable(),
	inflammation_therapy_duration: z.string().nullable(),

	// Cancer treatment
	cancer_therapy_type: z.array(z.string()).nullable(),
	cancer_therapy_other: z.string().nullable(),
	cancer_therapy_date: z.string().nullable(),

	// Urination symptoms
	urination_symptoms: z.array(z.string()).nullable(),
	urination_pain_location: z.string().nullable(),
	night_urination_frequency: z.string().nullable(),
	urination_symptoms_duration: z.string().nullable(),
	urination_satisfaction_level: z.string().nullable(),

	// Other problems
	has_other_problems: z.boolean().nullable(),
	other_problems_description: z.string().nullable(),
	other_problems_since: z.string().nullable(),

	// Biopsy information
	biopsy_types: z.array(z.string()).nullable(),
	last_alta_biopsy_date: z.string().nullable(),
	last_usg_biopsy_date: z.string().nullable(),
	last_fusion_biopsy_date: z.string().nullable(),
	last_saturation_biopsy_date: z.string().nullable(),
	last_unknown_biopsy_date: z.string().nullable(),
	last_biopsy_access_route: z.string().nullable(),
	biopsy_count: z.number().int().nullable(),
	last_biopsy_result: z.string().nullable(),
	biopsy_gleason_score: z.array(z.string()).nullable(),
});

// Infer TypeScript type from the Zod schema
export type ProstateFollowUpForm = z.infer<typeof ProstateFollowUpFormSchema>;

// New default object export for ProstateFollowUpForm
export const defaultProstateFollowUpForm: Partial<ProstateFollowUpForm> = {
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

	// Treatment information
	prostate_treatment_types: null,
	prostate_not_treated_reason: null,

	// Enlargement treatment
	enlargement_therapy_type: null,
	enlargement_therapy_other: null,
	enlargement_therapy_date: null,
	enlargement_medication_type: null,
	enlargement_medication_other: null,
	enlargement_medication_since: null,

	// Inflammation treatment
	inflammation_therapy_type: null,
	inflammation_therapy_other: null,
	inflammation_therapy_date: null,
	inflammation_therapy_duration: null,

	// Cancer treatment
	cancer_therapy_type: null,
	cancer_therapy_other: null,
	cancer_therapy_date: null,

	// Urination symptoms
	urination_symptoms: null,
	urination_pain_location: null,
	night_urination_frequency: null,
	urination_symptoms_duration: null,
	urination_satisfaction_level: null,

	// Other problems
	has_other_problems: null,
	other_problems_description: null,
	other_problems_since: null,

	// Biopsy information
	biopsy_types: null,
	last_alta_biopsy_date: null,
	last_usg_biopsy_date: null,
	last_fusion_biopsy_date: null,
	last_saturation_biopsy_date: null,
	last_unknown_biopsy_date: null,
	last_biopsy_access_route: null,
	biopsy_count: null,
	last_biopsy_result: null,
	biopsy_gleason_score: null,
};
