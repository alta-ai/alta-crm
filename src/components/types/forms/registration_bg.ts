import { z } from "zod";
import { GENDER } from "../constants";

export const RegistrationBGFormSchema = z.object({
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
	datetime_of_accident: z.coerce.date(),
	name_of_company: z.string().nullable(),
	street_of_company: z.string().nullable(),
	house_number_of_company: z.string().nullable(),
	postal_code_of_company: z.string().nullable(),
	city_of_company: z.string().nullable(),
	profession: z.string().nullable(),
	time_of_employment: z.string().nullable(),
	referring_doctor_name: z.string().optional().nullable(),
	accident_consent: z.boolean().optional().nullable(),
	read_consent: z.boolean().optional().nullable(),
	created_at: z.coerce.date(),
	updated_at: z.coerce.date(),
});

// Infer TypeScript type from the Zod schema
export type RegistrationBGForm = z.infer<typeof RegistrationBGFormSchema>;
