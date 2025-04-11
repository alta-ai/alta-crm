import { z } from "zod";
import { DBPatientSchema, Patient, PartialPatientSchema } from "./patient";
import { BODY_SIDE } from "./constants";

const DBAppointmentSchema = z.object({
	id: z.string().uuid(),
	start_time: z.coerce.date(),
	end_time: z.coerce.date(),
	patient_data: z
		.object({
			has_beihilfe: z.boolean().optional().nullable(),
			has_transfer: z.boolean().optional().nullable(),
			referring_doctor: z.string().optional().nullable(),
			with_contrast_medium: z.boolean().optional().nullable(),
		})
		.optional(),
	body_side: z.enum(BODY_SIDE).optional().nullable(),
	billing_type: z.string(),
	status: z
		.object({
			id: z.string().uuid(),
			name: z.string(),
		})
		.optional(),
	examination: z
		.object({
			id: z.string().uuid(),
			name: z.string(),
			duration: z.number().optional(),
		})
		.optional(),
	device: z
		.object({
			id: z.string().uuid(),
			name: z.string(),
		})
		.optional(),
	location: z
		.object({
			id: z.string().uuid(),
			name: z.string(),
		})
		.optional(),
	patient: DBPatientSchema.partial().optional(),
	previous_appointment: z
		.object({
			start_time: z.coerce.date(),
		})
		.optional()
		.nullable(),
});

export const AppointmentSchema = DBAppointmentSchema.transform((data) => ({
	id: data.id,
	timing: {
		start: data.start_time,
		end: data.end_time,
	},
	status: {
		id: data.status?.id,
		name: data.status?.name,
	},
	billingType: data.billing_type,
	examination: {
		id: data.examination?.id,
		name: data.examination?.name,
		duration: data.examination?.duration,
		bodySide: data.body_side,
	},
	device: {
		id: data.device?.id,
		name: data.device?.name,
	},
	location: {
		id: data.location?.id,
		name: data.location?.name,
	},
	patient: PartialPatientSchema.parse(data.patient) as Patient,
	previousAppointment: data.previous_appointment
		? {
				startTime: data.previous_appointment.start_time,
		  }
		: undefined,
	details: {
		hasBeihilfe: data.patient_data?.has_beihilfe,
		hasTransfer: data.patient_data?.has_transfer,
		referringDoctor: data.patient_data?.referring_doctor,
		withContrastMedium: data.patient_data?.with_contrast_medium,
	},
}));

// We have to handle this separately since
export const PartialAppointmentSchema = AppointmentSchema._def.schema
	.partial()
	.transform((AppointmentSchema._def.effect as any).transform);

// Infer TypeScript type from the Zod schema
export type Appointment = z.infer<typeof AppointmentSchema>;
export type DBAppointment = z.infer<typeof DBAppointmentSchema>;
