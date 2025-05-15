import { z } from "zod";

export const AppointmentStatusSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	color: z.string(),
	created_at: z.date().nullable(),
	updated_at: z.date().nullable(),
});

// Infer TypeScript type from the Zod schema
export type AppointmentStatus = z.infer<typeof AppointmentStatusSchema>;
