import { z } from "zod";

export const SignatureSchema = z.object({
	id: z.string().uuid(),
	signature: z.string(),
	created_at: z.coerce.date(),
});

// Infer TypeScript type from the Zod schema
export type Signature = z.infer<typeof SignatureSchema>;
