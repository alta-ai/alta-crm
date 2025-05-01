import { View, Text } from "@react-pdf/renderer";
import FormRow from "./FormRow";
import { deriveDisplayedFullName, formatDate } from "../utils";
import styling from "../styles";
import { Patient } from "../../types";

interface PatientInfoHeaderProps {
	data: Partial<Patient> & { start_time?: Date };
}
interface PatientInfoHeaderSmallProps {
	data: Partial<Patient> & { start_time?: Date };
}

export const PatientInfoHeader: React.FC<PatientInfoHeaderProps> = ({
	data,
}) => {
	return (
		<View
			style={{
				...styling.FormTypeLines,
				marginTop: "-10px",
				marginBottom: "-4px",
			}}
		>
			<FormRow
				style={styling.FormTypeLines.FormRow}
				items={[
					{
						label: "Titel, Nachname, Vorname",
						value: deriveDisplayedFullName({
							title: data?.title || undefined,
							name: data?.first_name,
							surname: data?.last_name,
						}),
						start: 40,
						type: "text",
					},
					{
						label: "Geburtsdatum",
						value: formatDate(data?.birth_date),
						start: 30,
						type: "text",
					},
					{
						label: "Untersuchungsdatum",
						value: formatDate(data?.start_time),
						start: 30,
						type: "text",
					},
				]}
			/>
		</View>
	);
};

export const PatientInfoHeaderSmall: React.FC<PatientInfoHeaderSmallProps> = ({
	data,
}) => {
	return (
		<View style={{ position: "absolute", right: 0, top: "-8px" }}>
			<Text>
				{deriveDisplayedFullName({
					title: data?.title || undefined,
					name: data?.first_name,
					surname: data?.last_name,
				})}{" "}
				- Geb. Datum: {formatDate(data?.birth_date)} - Untersuchungsdatum:{" "}
				{formatDate(data?.start_time)}
			</Text>
		</View>
	);
};
