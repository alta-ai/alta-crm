import { z } from "zod";

export const PrivacyFormSchema = z.object({
	id: z.string().uuid(),
	email_consent: z.boolean(),
	appointment_reminder_consent: z.boolean(),
	request_report_consent: z.boolean(),
	transmit_report_consent: z.boolean(),
	data_processing_consent: z.boolean(),
	foto_consent: z.boolean().nullable().optional(),
	created_at: z.coerce.date(),
	updated_at: z.coerce.date(),
});

// Infer TypeScript type from the Zod schema
export type PrivacyForm = z.infer<typeof PrivacyFormSchema>;
