import { z } from "zod";

export const CTTherapyFormSchema = z.object({
	id: z.string().uuid(),
	created_at: z.coerce.date(),
	updated_at: z.coerce.date(),

	// Previous contrast media experience
	had_previous_exam_with_contrast_media: z.boolean().nullable(),
	had_side_effects_from_contrast_media: z.boolean().nullable(),

	// Allergies
	has_allergies: z.boolean().nullable(),
	which_allergies: z.string().nullable(),

	// Medical conditions
	has_known_hyperthyroidism: z.boolean().nullable(),
	has_osteoporosis: z.boolean().nullable(),
	has_hepatitis: z.boolean().nullable(),
	has_diabetes: z.boolean().nullable(),
	has_high_blood_pressure: z.boolean().nullable(),
	has_increased_intraocular_pressure: z.boolean().nullable(),
	has_history_of_gastric_or_duodenal_ulcers: z.boolean().nullable(),
	has_history_of_thrombosis_or_pulmonary_embolism: z.boolean().nullable(),

	// Medication
	treated_with_anticoagulants: z.boolean().nullable(),
	which_anticoagulants: z.string().nullable(),

	// Physical measurements
	height_in_cm: z.number().nullable(),
	weight_in_kg: z.number().nullable(),

	// Female-specific information
	confirms_not_pregnant: z.boolean().nullable(),
	last_menstruation: z.string().nullable(),
});

// Infer TypeScript type from the Zod schema
export type CTTherapyForm = z.infer<typeof CTTherapyFormSchema>;

// Added default object
export const defaultCTTherapyForm: Partial<CTTherapyForm> = {
	// Previous contrast media experience
	had_previous_exam_with_contrast_media: null,
	had_side_effects_from_contrast_media: null,

	// Allergies
	has_allergies: null,
	which_allergies: null,

	// Medical conditions
	has_known_hyperthyroidism: null,
	has_osteoporosis: null,
	has_hepatitis: null,
	has_diabetes: null,
	has_high_blood_pressure: null,
	has_increased_intraocular_pressure: null,
	has_history_of_gastric_or_duodenal_ulcers: null,
	has_history_of_thrombosis_or_pulmonary_embolism: null,

	// Medication
	treated_with_anticoagulants: null,
	which_anticoagulants: null,

	// Physical measurements
	height_in_cm: null,
	weight_in_kg: null,

	// Female-specific information
	confirms_not_pregnant: null,
	last_menstruation: null,
};
