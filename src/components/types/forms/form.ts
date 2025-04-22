import { z } from "zod";
import { FormType } from "../constants";
import { enumToZod } from "../utils";

export const FormSchema = z.object({
	id: z.string().uuid(),
	name: z.string().optional(),
	description: z.string().optional().nullable(),
	created_at: z.coerce.date().optional(),
	updated_at: z.coerce.date().optional(),
	form_data: z.object({}).optional(),
	form_fields: z.object({}).optional(),
	form_type: enumToZod(FormType),
});

// Infer TypeScript type from the Zod schema
export type Form = z.infer<typeof FormSchema>;
