import { z } from "zod";

export const IPSSFormSchema = z.object({
	id: z.string().uuid(),
	created_at: z.coerce.date(),
	updated_at: z.coerce.date(),

	ipss_score: z.number().optional(),
	bladder_not_empty_after_urinating: z.number().int(),
	urinating_twice_in_two_hours: z.number().int(),
	restart_urination: z.number().int(),
	struggling_delay_urination: z.number().int(),
	weak_urine_stream: z.number().int(),
	strain_to_urinate: z.number().int(),
	get_up_at_night_to_urinate: z.number().int(),
	urination_symptoms_satisfaction_level: z.string(),
});

export type IPSSForm = z.infer<typeof IPSSFormSchema>;
