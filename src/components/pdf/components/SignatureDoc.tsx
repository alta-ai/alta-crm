import React from "react";

import { View, Text } from "@react-pdf/renderer";
import styling from "../styles";
import { formatDate } from "../utils";
import { useFormData } from "../formDataContext";
import { WithSignature } from "../../types";

const styles = {
	marginTop: "5px",
	gap: "5px",
	Text: {
		fontWeight: "bold",
		marginRight: "5px",
	},
	Signature: {
		height: "30px",
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

interface SignatureDocProps {
	customStyle?: any;
}

export const SignatureDoc: React.FC<SignatureDocProps> = ({ customStyle }) => {
	const { appointmentData } = useFormData<WithSignature>();

	return (
		<View style={{ ...styling.Row, ...styles, ...customStyle }}>
			<View style={{ flexGrow: 1 }}>
				<Text style={styles.Text}>Ort, Datum</Text>
				<View style={styles.Signature}>
					<View style={styles.Signature.Inner}>
						<Text style={{ marginTop: "8px" }}>
							{`${appointmentData?.location?.name}, ${formatDate(
								appointmentData?.start_time
							)}`}
						</Text>
					</View>
				</View>
			</View>
			<View style={{ flexGrow: 1 }}>
				<Text style={styles.Text}>Unterschrift des Arztes</Text>
				<View style={styles.Signature}>
					<View style={styles.Signature.Inner}></View>
				</View>
			</View>
		</View>
	);
};

export default SignatureDoc;
