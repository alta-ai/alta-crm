import React from "react";
import { BiopsyCTConsent, DataPrivacyImageConsent } from "./components";
import { FormType } from "../../types/constants";

export interface CustomComponents {
	before?: React.ComponentType<any>[];
	after?: React.ComponentType<any>[];
}

// Updated with the actual custom components
export const CUSTOM_SIGNATURE_CONTENT: Record<string, CustomComponents> = {
	[FormType.REGISTRATION]: {
		before: [],
		after: [],
	},
	[FormType.REGISTRATION_BG]: {
		before: [],
		after: [],
	},
	[FormType.PRIVACY]: {
		before: [(props) => DataPrivacyImageConsent(props)],
		// before: [],
		after: [],
	},
	[FormType.MRI_CONSENT]: {
		before: [],
		after: [],
	},
	[FormType.CT_CONSENT]: {
		before: [],
		after: [],
	},
	[FormType.MRI_CT_CONSENT]: {
		before: [],
		after: [],
	},
	[FormType.CT_THERAPY]: {
		before: [],
		after: [],
	},
	[FormType.PROSTATE_NEW_PATIENT]: {
		before: [],
		after: [],
	},
	[FormType.PROSTATE_FOLLOWUP]: {
		before: [],
		after: [],
	},
	[FormType.PROSTATE_TULSA]: {
		before: [],
		after: [],
	},
	[FormType.PROSTATE_HOLEP]: {
		before: [],
		after: [],
	},
	[FormType.IPSS]: {
		before: [],
		after: [],
	},
	[FormType.BIOPSY]: {
		before: [(props) => BiopsyCTConsent(props)],
		after: [],
	},
};
