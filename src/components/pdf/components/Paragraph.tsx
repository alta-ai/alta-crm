import React from "react";

import { View, Text } from "@react-pdf/renderer";
import { Style } from "@react-pdf/types";

const styles = {
	Heading: {
		fontWeight: "bold",
		marginBottom: 3,
		fontSize: "12px",
	},
};

interface CustomStyle extends Style {
	Heading?: object;
}

interface ParagraphProps {
	text?: string;
	heading?: string;
	children?: React.ReactNode;
	lineHeight?: number;
	customStyle?: CustomStyle;
}

const Paragraph: React.FC<ParagraphProps> = ({
	text,
	heading,
	children,
	lineHeight = 1.0,
	customStyle,
}) => {
	return (
		<View style={customStyle}>
			<Text style={{ ...styles.Heading, ...customStyle?.Heading }}>
				{heading}
			</Text>
			{text && <Text style={{ lineHeight: lineHeight }}>{text}</Text>}
			{children}
		</View>
	);
};

export default Paragraph;
