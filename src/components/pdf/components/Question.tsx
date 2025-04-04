import React, { ReactNode } from "react";
import { StyleSheet, View, Text } from "@react-pdf/renderer";

const styles = StyleSheet.create({
	Question: {
		display: "flex",
		justifyContent: "space-between",
		flexDirection: "row",
	},
	Text: {
		textIndent: -15,
		marginLeft: "15px",
	},
});

interface QuestionProps {
	question: string;
	children?: ReactNode;
	style?: {
		Question?: Record<string, any>;
		[key: string]: any;
	};
	sameRow?: boolean;
	questionWidth?: string;
	debug?: boolean;
}

const Question: React.FC<QuestionProps> = ({
	question,
	children,
	style,
	sameRow = true,
	questionWidth = "75%",
	debug = false,
}) => {
	return (
		<View style={style} debug={debug}>
			<View style={{ ...styles.Question }}>
				<Text
					style={{
						...styles.Text,
						...style?.Question,
						maxWidth: questionWidth,
					}}
				>
					{question}
				</Text>
				{sameRow && children}
			</View>
			{!sameRow && children}
		</View>
	);
};

export default Question;
