import { BODY_SIDE } from "../types/constants";

export const formatDate = (dateString?: string): string => {
	if (!dateString) return "";

	const date = new Date(dateString);

	// Get the day, month, and year from the Date object
	const day = String(date.getDate()).padStart(2, "0");
	const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based in JavaScript
	const year = date.getFullYear();

	// Return the formatted date string
	return `${day}.${month}.${year}`;
};

export const formatTime = (timeString: string): string => {
	if (!timeString) return "";

	return timeString.split(".")[0];
};

interface GenderToFormOfAddressParams {
	gender: "male" | "female" | string;
	long?: boolean;
}

export const genderToFormOfAddress = ({
	gender,
	long = false,
}: GenderToFormOfAddressParams): string => {
	if (long) {
		if (gender === "male") return "Sehr geehrter Herr";
		else if (gender === "female") return "Sehr geehrte Frau";
	} else {
		if (gender === "male") return "Herrn";
		else if (gender === "female") return "Frau";
	}
	return "";
};

interface DeriveDisplayedFullNameParams {
	title?: string;
	name?: string;
	surname?: string;
	sep?: string;
	surnameFirst?: boolean;
}

export const deriveDisplayedFullName = ({
	title,
	name,
	surname,
	sep = ", ",
	surnameFirst = true,
}: DeriveDisplayedFullNameParams): string => {
	if (!name || !surname) return "";

	if (surnameFirst) return `${title ? title + sep : ""}${surname}${sep}${name}`;

	return `${title ? title + sep : ""}${name}${sep}${surname}`;
};

export const booleanToYesNo = (value: boolean | null | undefined): string => {
	if (value === undefined || value === null) return "";

	return value ? "Ja" : "Nein";
};

interface DeriveDisplayedStreetAddressParams {
	street?: string;
	houseNumber?: string;
	sep?: string;
}

export const deriveDisplayedStreetAddress = ({
	street,
	houseNumber,
	sep = ", ",
}: DeriveDisplayedStreetAddressParams): string => {
	if (!street || !houseNumber) return "";

	return `${street}${sep}${houseNumber}`;
};

interface DeriveDisplayedCityAddressParams {
	zip?: number;
	city?: string;
	sep?: string;
}

export const deriveDisplayedCityAddress = ({
	zip,
	city,
	sep = ", ",
}: DeriveDisplayedCityAddressParams): string => {
	if (!city || !zip) return "";

	return `${zip}${sep}${city}`;
};

interface DeriveFullAddressParams {
	street: string;
	houseNumber: string;
	zipCode: string;
	city: string;
}

export const deriveFullAdress = ({
	street,
	houseNumber,
	zipCode,
	city,
}: DeriveFullAddressParams): string => {
	if (!street || !houseNumber || !zipCode || !city) return "";

	return `${street} ${houseNumber}, ${zipCode} ${city}`;
};

interface FormatExaminationParams {
	examination?: string;
	bodySide?: string;
}

export const formatExamination = ({
	examination,
	bodySide,
}: FormatExaminationParams): string => {
	let exam = examination || "";

	if (bodySide) {
		let translatedBodySide =
			bodySide === "left"
				? "links"
				: bodySide === "right"
				? "rechts"
				: "beidseitig";
		exam += " (" + translatedBodySide + ")";
	}
	return exam;
};

interface InferPhysicianSignaturesParams {
	user?: {
		username?: string;
		signature?: string;
	};
}

interface PhysicianSignature {
	name: string;
	subtitles: string[];
	signatureBase64?: string; // Optional because it may not always be present
}

export const inferPhysicianSignatures = ({
	user,
}: InferPhysicianSignaturesParams): PhysicianSignature[] => {
	const physicianSignatures: PhysicianSignature[] = [
		{
			name: "Dr. med. Agron Lumiani",
			subtitles: [
				"Facharzt für Radiologie   - Neuroradiologie",
				"Facharzt für Strahlentherapie – Nuklearmedizin",
			],
		},
	];

	if (user?.username === physicianSignatures[0].name) {
		physicianSignatures[0]["signatureBase64"] = user?.signature;
		return physicianSignatures;
	}

	if (user?.username === "zimmer")
		return [
			{
				name: "Dr. med. Markus Zimmer",
				subtitles: ["Facharzt für Diagnostische Radiologie"],
				signatureBase64: user?.signature,
			},
			...physicianSignatures,
		];

	if (user?.username === "steinmeister") {
		return [
			{
				name: "Dr. med. Leonhard Steinmeister",
				subtitles: ["Facharzt für Radiologie"],
				signatureBase64: user?.signature,
			},
			...physicianSignatures,
		];
	}

	return physicianSignatures;
};

interface NeedsCostEstimateFormParams {
	examination: string;
}

export const needsCostEstimateForm = ({
	examination,
}: NeedsCostEstimateFormParams): boolean => {
	return [
		"Prostata Neupatient",
		"Prostata mit Biopsieoption",
		"Prostata Verlaufskontrolle",
		"Prostata Verlaufskontrolle nach TULSA",
		"Biopsie",
	].includes(examination);
};
