import { z } from "zod";

const DBPatientSchema = z.object({
	title: z.string().nullable(),
	first_name: z.string().nullable(),
	last_name: z.string().nullable(),
	birth_date: z.string().nullable(),
	phone_landline: z.string().nullable(),
	phone_mobile: z.string().nullable(),
	email: z.string().nullable(),
	street: z.string().nullable(),
	house_number: z.string().nullable(),
	postal_code: z.string().nullable(),
	city: z.string().nullable(),
	insurance_type: z.string().nullable(),
	insurance_provider_id: z.string().nullable(),
	has_beihilfe: z.string().nullable(),
});

const PatientDataSchema = DBPatientSchema.transform((data) => ({
	title: data.title || undefined,
	name: data.first_name || undefined,
	surname: data.last_name || undefined,
	birthdate: data.birth_date || undefined,
	contact: {
		phone: data.phone_landline || data.phone_mobile || undefined,
		mobile: data.phone_mobile || undefined,
		email: data.email || undefined,
	},
	address: {
		street: data.street || undefined,
		houseNumber: data.house_number || undefined,
		zipCode: data.postal_code || undefined,
		city: data.city || undefined,
		country: undefined, // Add a default or map if available
	},
	insurance: {
		privateInsurance:
			data.insurance_type === "Private Krankenversicherung (PKV)"
				? data.insurance_provider_id || undefined
				: undefined,
		eligibleForAid: data.has_beihilfe === "true", // Convert string to boolean
	},
}));

// Infer TypeScript type from the Zod schema
export type Patient = z.infer<typeof PatientDataSchema>;
export type DBPatient = z.infer<typeof DBPatientSchema>;
