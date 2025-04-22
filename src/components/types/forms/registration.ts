import { z } from "zod";
import { GENDER, INSURANCE_TYPE } from "../constants";

export const RegistrationFormSchema = z.object({
	id: z.string().uuid(),
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
	city: z.string().nullable(),
	country: z.string().nullable(),
	insurance_type: z.string().nullable(),
	insurance_provider_id: z.string().uuid().optional().nullable(),
	insurance: z
		.object({
			id: z.string().uuid(),
			name: z.string(),
			type: z.enum(INSURANCE_TYPE).optional().nullable(),
		})
		.optional()
		.nullable(),
	has_beihilfe: z.boolean().optional().nullable(),
	has_transfer: z.boolean().optional().nullable(),
	referring_doctor_name: z.string().optional().nullable(),
	current_treatment: z.boolean().optional().nullable(),
	treatment_recommendations: z.array(z.string()).optional().nullable(),
	doctor_recommendation: z.boolean().optional().nullable(),
	send_report_to_doctor: z.boolean().optional().nullable(),
	report_delivery_method: z.string().optional().nullable(),
	found_through: z.array(z.string()).optional().nullable(),
	created_at: z.coerce.date(),
	updated_at: z.coerce.date(),
});

// Infer TypeScript type from the Zod schema
export type RegistrationForm = z.infer<typeof RegistrationFormSchema>;
