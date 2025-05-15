import { z } from "zod";
import { INSURANCE_TYPE } from "./constants";

export const InsuranceSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	type: z.enum(INSURANCE_TYPE),
});

// Infer TypeScript type from the Zod schema
export type Insurance = z.infer<typeof InsuranceSchema>;
