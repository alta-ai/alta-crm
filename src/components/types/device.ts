import { z } from "zod";

export const DeviceSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	type: z.string(),
	created_at: z.coerce.date().nullable(),
	updated_at: z.coerce.date().nullable(),
});

// Infer TypeScript type from the Zod schema
export type Device = z.infer<typeof DeviceSchema>;
