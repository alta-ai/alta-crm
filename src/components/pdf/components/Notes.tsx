import React from "react";

import { View, Text } from "@react-pdf/renderer";

const styles = {
	border: "1px solid black",
	padding: "5px",
	Notes: {
		color: "grey",
	},
};

interface NotesProps {
	altText?: string;
	customStyling?: object;
}

export const Notes: React.FC<NotesProps> = ({
	altText = "Notizen:",
	customStyling,
}) => {
	return (
		<View style={{ ...styles, ...customStyling }}>
			<Text style={styles.Notes}>{altText}</Text>
		</View>
	);
};

export default Notes;
