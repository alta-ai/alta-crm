import { z } from "zod";
import { parseISO } from "date-fns";

const DBAppointmentSchema = z.object({
	id: z.string().uuid(),
	start_time: z.string(),
	end_time: z.string(),
	patient_data: z.object({
		has_beihilfe: z.boolean().optional(),
		has_transfer: z.boolean().optional(),
		referring_doctor: z.string().optional(),
		with_contrast_medium: z.boolean().optional(),
	}),
	billing_type: z.string(),
	status: z.object({
		id: z.string().uuid(),
		name: z.string(),
	}),
	examination: z.object({
		id: z.string().uuid(),
		name: z.string(),
		duration: z.number(),
	}),
	device: z.object({
		id: z.string().uuid(),
		name: z.string(),
	}),
	location: z.object({
		id: z.string().uuid(),
		name: z.string(),
	}),
	patient: z.object({
		id: z.string().uuid(),
		first_name: z.string(),
		last_name: z.string(),
		email: z.string(),
		phone: z.string(),
	}),
	previous_appointment: z
		.object({
			start_time: z.string(),
		})
		.nullable(),
});

export const AppointmentSchema = DBAppointmentSchema.transform((data) => ({
	id: data.id,
	timing: {
		start: parseISO(data.start_time),
		end: parseISO(data.end_time),
	},
	status: {
		id: data.status.id,
		name: data.status.name,
	},
	billingType: data.billing_type,
	examination: {
		id: data.examination.id,
		name: data.examination.name,
		duration: data.examination.duration,
	},
	device: {
		id: data.device.id,
		name: data.device.name,
	},
	location: {
		id: data.location.id,
		name: data.location.name,
	},
	patient: {
		id: data.patient.id,
		firstName: data.patient.first_name,
		lastName: data.patient.last_name,
		contact: {
			email: data.patient.email,
			phone: data.patient.phone,
		},
		appointmentSpecificData: {
			...data.patient_data,
		},
	},
	previousAppointment: data.previous_appointment
		? {
				startTime: parseISO(data.previous_appointment.start_time),
		  }
		: undefined,
	details: {
		hasBeihilfe: data.patient_data.has_beihilfe,
		hasTransfer: data.patient_data.has_transfer,
		referringDoctor: data.patient_data.referring_doctor,
		withContrastMedium: data.patient_data.with_contrast_medium,
	},
}));

// Infer TypeScript type from the Zod schema
export type Appointment = z.infer<typeof AppointmentSchema>;
export type DBAppointment = z.infer<typeof DBAppointmentSchema>;
