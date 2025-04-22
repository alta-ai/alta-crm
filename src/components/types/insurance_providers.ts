import { z } from "zod";
import { INSURANCE_TYPE } from "./constants";

export const InsuranceProviderSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	type: z.enum(INSURANCE_TYPE),
	created_at: z.coerce.date(),
	updated_at: z.coerce.date(),
});

// Infer TypeScript type from the Zod schema
export type InsuranceProvider = z.infer<typeof InsuranceProviderSchema>;
