import { z } from "zod";

export const BiopsyFormSchema = z.object({
	id: z.string().uuid(),
	created_at: z.coerce.date(),
	updated_at: z.coerce.date(),

	// Consent for procedures
	consent_pelvis_ct: z.boolean().nullable(),

	// Medical history and risk factors
	has_disorders_of_metabolism_or_organs: z.boolean().nullable(),
	which_disorders: z.string().nullable(),
	risk_factors: z.array(z.string()).nullable(),
	further_risk_factors: z.string().nullable(),

	// Infectious diseases
	has_acute_infectious_disease: z.boolean().nullable(),
	which_acute_infectious_disease: z.string().nullable(),
	has_infectious_disease: z.boolean().nullable(),
	which_infectious_disease: z.string().nullable(),

	// Blood-thinning medications
	taking_blood_thinning_medication: z.boolean().nullable(),
	which_blood_thinning_medication: z.string().nullable(),
	since_when_taking_medication: z.string().nullable(),
	stopped_medication: z
		.enum(["Ja, abgesetzt", "Ja, umgestellt", "Nein"])
		.nullable(),
	when_stopped_medication_in_days: z.number().nullable(),
	when_adapted_medication_in_days: z.number().nullable(),
	which_new_medication: z.string().nullable(),

	// Regular medications
	taking_regular_medication: z.boolean().nullable(),
	which_regular_medication: z.string().nullable(),

	// Recent medication history
	taken_aspirin_or_blood_thinner: z.boolean().nullable(),
	when_taken_aspirin_or_blood_thinner: z.number().nullable(),

	// Medical history related to surgeries and bleeding
	increased_bleeding: z.boolean().nullable(),
	suppuration_or_abscesses: z.boolean().nullable(),
	surgery_on_urinary_organs: z.boolean().nullable(),
	which_surgery: z.string().nullable(),
	increased_bleeding_tendency: z.boolean().nullable(),
	has_allergies: z.boolean().nullable(),
});

// Infer TypeScript type from the Zod schema
export type BiopsyForm = z.infer<typeof BiopsyFormSchema>;

export const defaultBiopsyForm: Partial<BiopsyForm> = {
	// Consent for procedures
	consent_pelvis_ct: null,

	// Medical history and risk factors
	has_disorders_of_metabolism_or_organs: null,
	which_disorders: null,
	risk_factors: null,
	further_risk_factors: null,

	// Infectious diseases
	has_acute_infectious_disease: null,
	which_acute_infectious_disease: null,
	has_infectious_disease: null,
	which_infectious_disease: null,

	// Blood-thinning medications
	taking_blood_thinning_medication: null,
	which_blood_thinning_medication: null,
	since_when_taking_medication: null,
	stopped_medication: null,
	when_stopped_medication_in_days: null,
	when_adapted_medication_in_days: null,
	which_new_medication: null,

	// Regular medications
	taking_regular_medication: null,
	which_regular_medication: null,

	// Recent medication history
	taken_aspirin_or_blood_thinner: null,
	when_taken_aspirin_or_blood_thinner: null,

	// Medical history related to surgeries and bleeding
	increased_bleeding: null,
	suppuration_or_abscesses: null,
	surgery_on_urinary_organs: null,
	which_surgery: null,
	increased_bleeding_tendency: null,
	has_allergies: null,
};
