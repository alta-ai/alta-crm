import React from "react";
import { View, Text, Image } from "@react-pdf/renderer";

import { formatDate, formatTime } from "../utils";
import { useFormData } from "../formDataContext";
import styling from "../styles";
import { WithSignature } from "../../types";

const styles = {
	marginTop: "5px",
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
		Image: {
			height: "100%",
			marginLeft: "20px",
		},
	},
	Footnote: {
		fontSize: 8,
	},
};

export const SignatureString = () => {
	const { formData, appointmentData } = useFormData<WithSignature>();
	return (
		<View style={styling.Row} debug={false}>
			<Text style={{ marginTop: "10px" }}>
				{formatDate(formData?.signature?.signedAtDate) ||
					formatDate(appointmentData?.date)}{" "}
				{formData?.signature?.signedAtTime &&
					`(${formatTime(formData?.signature?.signedAtTime)})`}
			</Text>

			{formData?.signature?.data && (
				<View>
					<Image
						style={styles.Signature.Image}
						src={formData?.signature?.data}
					/>
				</View>
			)}
		</View>
	);
};

interface SignatureProps {
	heading?: string;
}

const Signature: React.FC<SignatureProps> = ({ heading }) => {
	return (
		<View style={styles}>
			<Text style={styles.Text}>
				{heading
					? heading
					: "Datum, Unterschrift Patient/ Sorgeberechtigter* / Bevollmächtigter"}
			</Text>
			<View style={styles.Signature}>
				<View style={styles.Signature.Inner}>
					<SignatureString />
				</View>
			</View>
			<Text style={styles.Footnote}>
				*Grundsätzlich sollten beide Sorgeberechtigten unterschreiben. Liegt die
				Unterschrift nur eines Sorgeberechtigen vor, so versichert der/die
				Unterzeichner/in, dass er/sie im Einverständnis mit dem anderen
				Sorgeberechtigten handelt oder er/sie das alleinige Sorgerecht für das
				Kind hat.
			</Text>
		</View>
	);
};

export default Signature;
