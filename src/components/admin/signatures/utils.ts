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

interface NameProps {
	title?: string | null;
	name?: string;
	surname?: string;
}

export const deriveDisplayedFullName = ({
	title,
	name,
	surname,
}: NameProps): string => {
	if (!name || !surname) return "";

	return `${title ? title + ", " : ""}${surname}, ${name}`;
};

export const booleanToYesNo = (value?: boolean | null): string => {
	if (value === undefined || value === null) return "";

	return value ? "Yes" : "No";
};

interface AddressProps {
	street?: string;
	houseNumber?: string;
	zip?: string;
	zipCode?: string;
	city?: string;
}

export const deriveDisplayedStreetAddress = ({
	street,
	houseNumber,
}: AddressProps): string => {
	if (!street || !houseNumber) return "";

	return `${street}, ${houseNumber}`;
};

export const deriveDisplayedCityAddress = ({
	zip,
	city,
}: AddressProps): string => {
	if (!city || !zip) return "";

	return `${zip}, ${city}`;
};

export const deriveFullAddress = ({
	street,
	houseNumber,
	zipCode,
	city,
}: AddressProps): string => {
	if (!street || !houseNumber || !zipCode || !city) return "";

	return `${street}, ${houseNumber}, ${zipCode} ${city}`;
};
