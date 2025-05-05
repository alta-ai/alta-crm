import React from "react";

import { View, Text } from "@react-pdf/renderer";
import { useFormData } from "../formDataContext";
import { deriveDisplayedFullName, formatDate } from "../utils";
import { SignatureString } from "./Signature";
import { WithSignature } from "../../types";

const styles = {
	marginTop: "5px",
	Text: {
		fontWeight: "bold",
		marginRight: "5px",
	},
	Signature: {
		height: "32px",
		backgroundColor: "lightgrey",
		Inner: {
			height: "100%",
			margin: "3px",
			borderBottom: "1px solid black",
		},
	},
	Footnote: {
		fontSize: 8,
	},
};
const SignatureAlt: React.FC = () => {
	const { patientData } = useFormData<WithSignature>();

	return (
		<View style={styles}>
			<Text style={{ fontStyle: "italic", marginBottom: "5px" }}>
				Bitte schreiben Sie Ihren Namen, Vornamen und Geburtsdatum in
				Druckbuchstaben:
			</Text>

			<Text style={styles.Text}>Name, Vorname, geboren am (TT.MM.JJJJ)</Text>
			<View style={styles.Signature}>
				<View style={styles.Signature.Inner}>
					<Text style={{ marginTop: "10px" }}>
						{deriveDisplayedFullName({
							title: patientData?.title || undefined,
							name: patientData?.first_name,
							surname: patientData?.last_name,
							sep: " ",
						})}
						, geboren am {formatDate(patientData?.birth_date)}
					</Text>
				</View>
			</View>

			<Text style={styles.Text}>Ort, Datum, Uhrzeit, Unterschrift</Text>
			<View style={styles.Signature}>
				<View style={styles.Signature.Inner}>
					<SignatureString />
				</View>
			</View>
		</View>
	);
};

export default SignatureAlt;
