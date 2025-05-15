import { z } from "zod";
import { enumToZod } from "./utils";
import { ExaminationCategory } from "./constants";

export const ExaminationSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	description: z.string().nullable(),
	duration: z.number().int(),
	device_id: z.string().uuid().nullable(),

	self_payer_without_contrast: z.number(),
	self_payer_with_contrast: z.number(),
	private_patient_without_contrast: z.number(),
	private_patient_with_contrast: z.number(),
	foreign_patient_without_contrast: z.number(),
	foreign_patient_with_contrast: z.number(),

	category: enumToZod(ExaminationCategory),
	billing_info: z.string().nullable(),
	requires_body_side: z.boolean().default(false),
	report_title_template: z.string().nullable(),
	report_title: z.string().nullable(),
	prompt: z.string().nullable(),

	created_at: z.coerce.date().nullable(),
	updated_at: z.coerce.date().nullable(),
});

// Infer TypeScript type from the Zod schema
export type Examination = z.infer<typeof ExaminationSchema>;
