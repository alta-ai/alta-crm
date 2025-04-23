import { z } from "zod";

export const CTFormSchema = z.object({
	id: z.string().uuid(),
	height: z.number(),
	weight: z.number(),
	previous_contrast_media: z.boolean(),
	contrast_media_side_effects: z.boolean().nullable(),
	allergies: z.boolean(),
	allergies_description: z.string().nullable(),
	asthma: z.boolean(),
	prelim_exams: z.boolean(),
	prelim_exams_description: z.string().nullable(),
	prelim_exams_date: z.string().nullable(),
	thyroid_overfunction: z.boolean(),
	thyroid_medication: z.boolean(),
	thyroid_medication_description: z.string().nullable(),
	thyroid_surgery: z.boolean(),
	diabetes: z.boolean(),
	metformin: z.boolean(),
	kidney_impairment: z.boolean(),
	blood_thinners: z.boolean(),
	blood_thinners_description: z.string().nullable(),
	blood_thinners_date: z.string().nullable(),
	infectious_disease: z.boolean(),
	infectious_disease_description: z.string().nullable(),
	no_pregnancy: z.boolean().nullable(),
	last_period: z.string().nullable(),
	breastfeeding: z.boolean().nullable(),
	created_at: z.coerce.date(),
	updated_at: z.coerce.date(),
});

// Infer TypeScript type from the Zod schema
export type CTForm = z.infer<typeof CTFormSchema>;
