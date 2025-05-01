import { View, Text, StyleSheet } from "@react-pdf/renderer";
import React from "react";

// Define types for custom style objects
interface CheckboxStyle {
	box?: object;
	inner?: object;
	label?: object;
	[key: string]: any;
}

// Interface for Checkbox props
interface CheckboxProps {
	label: string | React.ReactNode;
	checked: boolean;
	style: CheckboxStyle;
	useCustomLabels?: boolean;
}

// Interface for BoxSelection props
interface BoxSelectionProps<T> {
	options: T[];
	labels?: string[];
	selected: T | T[];
	style?: {
		checkbox?: CheckboxStyle;
		[key: string]: any;
	};
	useCustomLabels?: boolean;
	debug?: boolean;
}

// Custom styles for the checkbox
const styles = StyleSheet.create({
	checkboxContainer: {
		display: "flex",
		flexDirection: "row",
	},
	checkbox: {
		width: "12pt",
		height: "12pt",
		borderWidth: "1pt",
		borderColor: "#000",
		marginRight: 4,
		alignItems: "center",
		justifyContent: "center",
		display: "flex",
	},
	checkboxInner: {
		width: 8,
		height: 8,
		backgroundColor: "#000",
	},
	label: {
		fontSize: 12,
	},
});

const Checkbox: React.FC<CheckboxProps> = ({
	label,
	checked,
	style,
	useCustomLabels,
}) => (
	<View style={{ ...styles.checkboxContainer, ...style }}>
		<View style={{ ...styles.checkbox, ...(style?.box || {}) }}>
			{checked && (
				<View style={{ ...styles.checkboxInner, ...(style?.inner || {}) }} />
			)}
		</View>
		{useCustomLabels ? (
			label
		) : (
			<Text style={{ ...styles.label, ...(style?.label || {}) }}>
				{label as string}
			</Text>
		)}
	</View>
);

const BoxSelection: React.FC<BoxSelectionProps> = ({
	options,
	labels,
	selected,
	style,
	useCustomLabels = false,
	debug = false,
}) => {
	return (
		<View style={{ ...styles, ...style }} debug={debug}>
			{options.map((option: string, index: number) => {
				let customStyle: CheckboxStyle = {};

				if (style && style.checkbox) {
					customStyle = style.checkbox;
				}

				const label = labels ? labels[index] : option;
				const checked = Array.isArray(selected)
					? selected.includes(option)
					: selected === option;

				return (
					<Checkbox
						key={index}
						label={label}
						checked={checked}
						style={customStyle}
						useCustomLabels={useCustomLabels}
					/>
				);
			})}
		</View>
	);
};

export default BoxSelection;
