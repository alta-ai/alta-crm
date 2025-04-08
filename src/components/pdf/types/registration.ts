import { z } from "zod";

export const RegistrationFormDataSchema = z.object({
	urologicInformation: z.object({
		currentlyUndergoingTreatment: z.boolean().optional(),
		recommendationOfUrologist: z.string().optional(),
		visitDueToRecommendation: z.boolean().optional(),
		nameOfUrologist: z.string().optional(),
		gotTransfer: z.boolean().optional(),
		sendReportToUrologist: z.boolean().optional(),
	}),
});

export type RegistrationForm = z.infer<typeof RegistrationFormDataSchema>;
