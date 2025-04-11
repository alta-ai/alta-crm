import { z } from "zod";
import { INSURANCE_TYPE } from "./constants";

export const DBInsuranceProviderSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	type: z.enum(INSURANCE_TYPE),
	created_at: z.coerce.date(),
	updated_at: z.coerce.date(),
});

export const InsuranceProviderSchema = DBInsuranceProviderSchema.transform(
	(data) => ({
		id: data.id,
		name: data.name,
		type: data.type,
		createdAt: data.created_at,
		updatedAt: data.updated_at,
	})
);

// Infer TypeScript type from the Zod schema
export type InsuranceProvider = z.infer<typeof InsuranceProviderSchema>;
export type DBInsuranceProvider = z.infer<typeof DBInsuranceProviderSchema>;
