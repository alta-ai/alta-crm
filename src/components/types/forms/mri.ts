import { z } from "zod";

export const MRIFormSchema = z.object({
	id: z.string().uuid(),
	created_at: z.coerce.date(),
	updated_at: z.coerce.date(),

	// Medical history - Cardiac/Implants
	wearing_interfearing_devices: z.boolean().nullable(),
	interfearing_devices: z.string().nullable(),
	had_brain_or_heart_op: z.boolean().nullable(),
	which_op: z.string().nullable(),
	when_op: z.string().nullable(),

	// Organ removal
	had_organ_removed: z.boolean().nullable(),
	which_organ: z.string().nullable(),
	when_organ: z.string().nullable(),

	// Medical conditions
	has_kidney_disease: z.boolean().nullable(),
	which_kidney_disease: z.string().nullable(),

	// Implants and metal objects
	wearing_interfearing_implants_or_metal_objects: z.boolean().nullable(),
	which_interfearing_implants: z.string().nullable(),
	when_interfearing_implants: z.string().nullable(),

	// Injuries from metal objects
	has_injuries_by_metallic_objects: z.boolean().nullable(),
	which_injuries: z.string().nullable(),

	// Allergies
	has_allergies: z.boolean(),
	which_allergies: z.string().nullable(),

	has_glaucoma: z.boolean(),

	// preliminary examinations
	has_preliminary_examinations: z.boolean(),
	preliminary_examinations_details: z.string().nullable(),
	preliminary_examinations_date: z.string().nullable(),

	// infectious diseases
	has_infectious_disease: z.boolean(),
	infectious_disease_details: z.string().nullable(),

	// Medications
	taking_blood_thinners: z.boolean(),
	blood_thinners_details: z.string().nullable(),
	blood_thinners_since: z.string().nullable(),
	taking_other_medications: z.boolean(),
	other_medications_details: z.string().nullable(),

	// pregnancy
	pregnant: z.boolean().nullable(),
	last_menstruation: z.string().nullable(),
	breastfeeding: z.boolean().nullable(),

	has_claustrophobia: z.boolean(),
	height: z.number(),
	weight: z.number(),

	// consent
	consent_form_read: z.boolean(),
});

// Infer TypeScript type from the Zod schema
export type MRIForm = z.infer<typeof MRIFormSchema>;
