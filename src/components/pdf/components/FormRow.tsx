import React from "react";
import { Style } from "@react-pdf/types";

import { View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = {
	row: {
		display: "flex" as const,
		flexDirection: "row" as const,
		alignItems: "flex-end" as const,
	},
	rowTop: {
		borderBottom: "1px solid black",
		paddingBottom: "4px",
		fontSize: "12px",
		minHeight: "15px",
	},
	rowBottom: {
		paddingTop: "2px",
		opacity: 0.7,
	},
};

interface FormRowProps {
	items: Array<{
		type: "text" | "custom";
		value: string | React.ReactNode;
		label: string;
		start: number;
	}>;
	style?: Style;
}

const FormRow: React.FC<FormRowProps> = ({ items, style = {} }) => {
	return (
		<View style={style}>
			<View style={{ ...styles.row, ...styles.rowTop, ...(style || {}) }}>
				{items.map((item, index) => {
					const customStyle: Style = {
						width: `${item.start}%`,
					};

					if (index === 0) {
						customStyle.marginLeft = "5px";
					}

					switch (item.type) {
						case "text":
							return (
								<Text key={`value-${index}`} style={customStyle}>
									{item.value as string}
								</Text>
							);
						case "custom":
							return (
								<React.Fragment key={`value-${index}`}>
									{item.value as React.ReactNode}
								</React.Fragment>
							);
						default:
							throw new Error("Invalid type");
					}
				})}
			</View>
			<View style={{ ...styles.row, ...styles.rowBottom }}>
				{items.map((item, index) => {
					const customStyle: Style = {
						width: `${item.start}%`,
					};

					if (index === 0) {
						customStyle.marginLeft = "5px";
					}

					return (
						<Text key={`label-${index}`} style={customStyle}>
							{item.label}
						</Text>
					);
				})}
			</View>
		</View>
	);
};

export default FormRow;
