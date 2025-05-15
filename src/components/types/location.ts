import { z } from "zod";

export const LocationSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	address: z.string(),
	phone: z.string(),
	email: z.string(),
	directions: z.string().nullable(),
	created_at: z.string().nullable(),
	updated_at: z.string().nullable(),
	letterhead_url: z.string().nullable(),
	use_default_letterhead: z.boolean().nullable().default(false),
});

// Infer TypeScript type from the Zod schema
export type Location = z.infer<typeof LocationSchema>;
