import { z } from "zod";
import { GENDER, INSURANCE_TYPE } from "./constants";

const DBRegistrationFormSchema = z.object({
	id: z.string().uuid(),
	patient_number: z.number(),
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
	postal_code: z.number(),
	city: z.string().nullable(),
	country: z.string().nullable(),
	insurance: z.object({
		id: z.string().uuid(),
		name: z.string(),
		type: z.enum(INSURANCE_TYPE),
	}),
});

export const RegistrationFormSchema = DBRegistrationFormSchema.transform(
	(data) => ({
		id: data.id,
		patientID: data.patient_number,
		title: data.title,
		name: data.first_name,
		surname: data.last_name,
		birthdate: data.birth_date,
		contact: {
			phone: data.phone,
			mobile: data.mobile,
			email: data.email,
		},
		address: {
			street: data.street,
			houseNumber: data.house_number,
			zipCode: data.postal_code,
			city: data.city,
			country: data.country,
		},
		insurance: data.insurance,
	})
);

// Infer TypeScript type from the Zod schema
export type Patient = z.infer<typeof RegistrationFormSchema>;
export type DBPatient = z.infer<typeof DBRegistrationFormSchema>;
