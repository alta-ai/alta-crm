import { z } from "zod";
import { PatientSchema } from "./patient";
import { BodySide } from "./constants";
import { enumToZod } from "./utils";

export const AppointmentSchema = z.object({
	id: z.string().uuid(),
	start_time: z.coerce.date(),
	end_time: z.coerce.date(),
	patient_data: z.object({
		has_beihilfe: z.boolean().optional().nullable(),
		has_transfer: z.boolean().optional().nullable(),
		referring_doctor: z.string().optional().nullable(),
		with_contrast_medium: z.boolean().optional().nullable(),
	}),
	body_side: enumToZod(BodySide).optional().nullable(),
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
	device: z
		.object({
			id: z.string().uuid(),
			name: z.string(),
		})
		.optional(),
	location: z.object({
		id: z.string().uuid(),
		name: z.string(),
	}),
	patient: PatientSchema.partial(),
	previous_appointment: z
		.object({
			start_time: z.coerce.date(),
		})
		.optional()
		.nullable(),
});

// Infer TypeScript type from the Zod schema
export type Appointment = z.infer<typeof AppointmentSchema>;
