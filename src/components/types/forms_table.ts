import { z } from "zod";
import { enumToZod } from "./utils";
import { FormType } from "./constants";

export const FormSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1),
	description: z.string().nullable(),
	form_type: enumToZod(FormType),
	editable: z.boolean().nullable(),
	needs_signature: z.boolean().nullable(),
	created_at: z.coerce.date(),
	updated_at: z.coerce.date(),
});

// Infer TypeScript type from the Zod schema
export type Form = z.infer<typeof FormSchema>;
