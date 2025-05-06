import { z } from "zod";

export const CTFormSchema = z.object({
	id: z.string().uuid(),
	created_at: z.coerce.date(),
	updated_at: z.coerce.date(),

	had_previous_exam_with_contrast_media: z.boolean(),
	had_side_effects_from_contrast_media: z.boolean().nullable(),

	has_allergies: z.boolean(),
	which_allergies: z.string().nullable(),

	// preliminary examinations
	has_preliminary_examinations: z.boolean().nullable(),
	preliminary_examinations_details: z.string().nullable(),
	preliminary_examinations_date: z.string().nullable(),

	has_known_hyperthyroidism: z.boolean(),
	taking_medication_for_hyperthyroidism: z.boolean(),
	which_hyperthyroidism_medication: z.string().nullable(),
	had_thyroid_surgery_or_radioactive_iodine_therapy: z.boolean(),

	has_asthma: z.boolean(),
	has_diabetes: z.boolean(),
	taking_metformin_or_similar: z.boolean(),
	has_renal_impairment: z.boolean(),

	taking_blood_thinners: z.boolean(),
	blood_thinners_details: z.string().nullable(),
	blood_thinners_since: z.string().nullable(),

	// infectious diseases
	has_infectious_disease: z.boolean(),
	infectious_disease_details: z.string().nullable(),

	// pregnancy
	pregnant: z.boolean().nullable(),
	last_menstruation: z.string().nullable(),
	breastfeeding: z.boolean().nullable(),

	height: z.number(),
	weight: z.number(),
});

// Infer TypeScript type from the Zod schema
export type CTForm = z.infer<typeof CTFormSchema>;
