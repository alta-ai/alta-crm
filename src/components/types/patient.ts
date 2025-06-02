import { z } from "zod";
import { GENDER } from "./constants";
import { InsuranceSchema } from "./insurance";

export const PatientSchema = z.object({
	id: z.string().uuid(),
	patient_number: z.string(),
	gender: z.enum(GENDER),
	title: z.string().nullable(),
	first_name: z.string(),
	last_name: z.string(),
	birth_date: z.coerce.date(),
	phone: z.string().nullable(),
	mobile: z.string().nullable(),
	email: z.string().nullable(),
	street: z.string(),
	house_number: z.string(),
	postal_code: z.string(),
	city: z.string(),
	country: z.string().nullable(),
	has_beihilfe: z.boolean().optional().nullable(),
	insurance: InsuranceSchema.partial().nullable(),
});

// Infer TypeScript type from the Zod schema
export type Patient = z.infer<typeof PatientSchema>;
