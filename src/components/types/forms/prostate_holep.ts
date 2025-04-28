import { z } from "zod";

export const ProstateHoLEPFormSchema = z.object({
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

	// Post-HoLEP complaints and symptoms
	has_complaints: z.boolean().nullable(),
	complaints_description: z.string().nullable(),
	has_potency_problems: z.boolean(),
	has_incontinence: z.boolean(),
	templates_per_day: z.string().nullable(),
	has_normal_ejaculation: z.boolean(),
	has_other_complaints: z.boolean().nullable(),
	other_complaints_description: z.string().nullable(),
	night_toilet_usage: z.string(),

	// Medication information
	taking_phosphodiesterase_inhibitors: z.boolean(),
	phosphodiesterase_inhibitors_details: z.string().nullable(),
	taking_prostate_medication: z.boolean(),
	prostate_medication_description: z.string().nullable(),
	prostate_medication_since_when: z.string().nullable(),
	had_antibiotic_therapy: z.boolean(),
	antibiotic_therapy_when: z.string().nullable(),
	antibiotic_therapy_duration: z.string().nullable(),
	taking_blood_thinners: z.boolean(),
	blood_thinners_description: z.string().nullable(),
	blood_thinners_since_when: z.string().nullable(),
});

// Infer TypeScript type from the Zod schema
export type ProstateHoLEPForm = z.infer<typeof ProstateHoLEPFormSchema>;

// Default object for ProstateTULSAForm
export const defaultProstateHoLEPForm: Partial<ProstateHoLEPForm> = {
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

	// Complaints and symptoms
	has_complaints: null,
	complaints_description: null,
	has_incontinence: false,
	has_normal_ejaculation: false,
	has_other_complaints: null,
	other_complaints_description: null,

	// Medications
	taking_phosphodiesterase_inhibitors: false,
	phosphodiesterase_inhibitors_details: null,
	night_toilet_usage: "",
	taking_prostate_medication: false,
	prostate_medication_description: null,
	prostate_medication_since_when: null,

	// Antibiotic therapy
	had_antibiotic_therapy: false,
	antibiotic_therapy_when: null,
	antibiotic_therapy_duration: null,

	// Blood thinners
	taking_blood_thinners: false,
	blood_thinners_description: null,
	blood_thinners_since_when: null,
};
