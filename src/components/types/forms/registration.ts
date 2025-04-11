import { z } from "zod";
import { GENDER, INSURANCE_TYPE } from "../constants";

export const DBRegistrationFormSchema = z.object({
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

export const RegistrationFormSchema = DBRegistrationFormSchema.transform(
	(data) => ({
		id: data.id,
		gender: data.gender,
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
		insuranceFreeText: data.insurance_type,
		insurance: data.insurance,
		details: {
			hasBeihilfe: data.has_beihilfe,
			hasTransfer: data.has_transfer,
			referringDoctorName: data.referring_doctor_name,
			currentTreatment: data.current_treatment,
			treatmentRecommendations: data.treatment_recommendations,
			doctorRecommendation: data.doctor_recommendation,
			sendReportToDoctor: data.send_report_to_doctor,
			reportDeliveryMethod: data.report_delivery_method,
			foundThrough: data.found_through,
		},
		createdAt: data.created_at,
		updatedAt: data.updated_at,
	})
);

// Infer TypeScript type from the Zod schema
export type RegistrationForm = z.infer<typeof RegistrationFormSchema>;
export type DBRegistrationForm = z.infer<typeof DBRegistrationFormSchema>;

export const toDBRegistrationForm = (
	form: Partial<RegistrationForm>
): Partial<DBRegistrationForm> => {
	return {
		id: form.id,
		gender: form.gender,
		title: form.title,
		first_name: form.name,
		last_name: form.surname,
		birth_date: form.birthdate,
		phone: form?.contact?.phone,
		mobile: form?.contact?.mobile,
		email: form?.contact?.email,
		street: form?.address?.street,
		house_number: form?.address?.houseNumber,
		postal_code: form?.address?.zipCode,
		city: form?.address?.city,
		country: form?.address?.country,
		insurance_type: form.insuranceFreeText,
		insurance_provider_id: form.insurance?.id,
		has_beihilfe: form?.details?.hasBeihilfe,
		has_transfer: form?.details?.hasTransfer,
		referring_doctor_name: form?.details?.referringDoctorName,
		current_treatment: form?.details?.currentTreatment,
		treatment_recommendations: form?.details?.treatmentRecommendations,
		doctor_recommendation: form?.details?.doctorRecommendation,
		send_report_to_doctor: form?.details?.sendReportToDoctor,
		report_delivery_method: form?.details?.reportDeliveryMethod,
		found_through: form?.details?.foundThrough,
	};
};
