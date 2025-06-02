import { z } from "zod";
import { enumToZod } from "./utils";
import { BillingType } from "./constants";
import { ExaminationSchema } from "./examination";
import { FormSchema } from "./forms_table";

export const ExaminationFormSchema = z.object({
	id: z.string().uuid(),
	examination: ExaminationSchema.partial().optional(),
	form: FormSchema.partial().optional(),
	order: z.number().int(),
	created_at: z.coerce.date(),
	billing_type: z.array(enumToZod(BillingType)),
});

// Infer TypeScript type from the Zod schema
export type ExaminationForm = z.infer<typeof ExaminationFormSchema>;
