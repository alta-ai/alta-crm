import { nullable, z } from "zod";

export const MRICTFormSchema = z.object({
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
	has_allergies: z.boolean().nullable(),
	which_allergies: z.string().nullable(),

	// Contrast media history
	had_previous_exam_with_contrast_media: z.boolean().nullable(),
	had_side_effects_from_contrast_media: z.boolean().nullable(),

	// Medical conditions
	has_asthma: z.boolean().nullable(),
	has_known_hyperthyroidism: z.boolean().nullable(),
	taking_medication_for_hyperthyroidism: z.boolean().nullable(),
	which_hyperthyroidism_medication: z.string().nullable(),
	had_thyroid_surgery_or_radioactive_iodine_therapy: z.boolean().nullable(),
	has_diabetes: z.boolean().nullable(),
	taking_metformin_or_similar: z.boolean().nullable(),
	has_renal_impairment: z.boolean().nullable(),
	has_glaucoma: z.boolean().nullable(),

	// preliminary examinations
	has_preliminary_examinations: z.boolean().nullable(),
	preliminary_examinations_details: z.string().nullable(),
	preliminary_examinations_date: z.string().nullable(),

	// infectious diseases
	has_infectious_disease: z.boolean().nullable(),
	infectious_disease_details: z.string().nullable(),

	// Medications
	taking_blood_thinners: z.boolean().nullable(),
	blood_thinners_details: z.string().nullable(),
	blood_thinners_since: z.string().nullable(),
	taking_other_medications: z.boolean().nullable(),
	other_medications_details: z.string().nullable(),

	// Other relevant information
	has_claustrophobia: z.boolean().nullable(),
	height: z.number().int().nullable(),
	weight: z.number().int().nullable(),

	// Consent
	consent_form_read: z.boolean().nullable(),
});

// Infer TypeScript type from the Zod schema
export type MRICTForm = z.infer<typeof MRICTFormSchema>;

export const defaultMRICTForm: Partial<MRICTForm> = {
	wearing_interfearing_devices: null,
	interfearing_devices: null,
	had_brain_or_heart_op: null,
	which_op: null,
	when_op: null,
	had_organ_removed: null,
	which_organ: null,
	when_organ: null,
	has_kidney_disease: null,
	which_kidney_disease: null,
	wearing_interfearing_implants_or_metal_objects: null,
	which_interfearing_implants: null,
	when_interfearing_implants: null,
	has_injuries_by_metallic_objects: null,
	which_injuries: null,
	has_allergies: null,
	which_allergies: null,
	had_previous_exam_with_contrast_media: null,
	had_side_effects_from_contrast_media: null,
	has_asthma: null,
	has_known_hyperthyroidism: null,
	taking_medication_for_hyperthyroidism: null,
	which_hyperthyroidism_medication: null,
	had_thyroid_surgery_or_radioactive_iodine_therapy: null,
	has_diabetes: null,
	taking_metformin_or_similar: null,
	has_renal_impairment: null,
	has_glaucoma: null,
	has_preliminary_examinations: null,
	preliminary_examinations_details: null,
	preliminary_examinations_date: null,
	has_infectious_disease: null,
	infectious_disease_details: null,
	taking_blood_thinners: null,
	blood_thinners_details: null,
	blood_thinners_since: null,
	taking_other_medications: null,
	other_medications_details: null,
	has_claustrophobia: null,
	height: null,
	weight: null,
	consent_form_read: null,
};
