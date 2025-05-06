import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { formatDate } from "../utils";

// Define interfaces for props
interface PSAEntry {
	testDate: Date;
	psaValue: number;
}

interface PSAValueRowProps extends PSAEntry {
	index: number;
	customStyle?: object;
}

interface PSAValuesProps {
	psaValues?: PSAEntry[];
	customStyle?: object;
}

const styles = {
	Row: {
		flexDirection: "row" as const,
		justifyContent: "space-between" as const,
	},
	PSAValueRow: {
		flexDirection: "row" as const,
		justifyContent: "space-between" as const,
		padding: "3px",
		minHeight: "22px",
	},
	TextField: {
		flex: 1,
		borderBottom: "1px solid gray",
		paddingBottom: "2px",
		textAlign: "center" as const,
		marginRight: "5px",
	},
	Value: {
		flex: 1,
		display: "flex" as const,
		flexDirection: "row" as const,
		marginRight: "5px",
	},
};

const PSAValueRow: React.FC<PSAValueRowProps> = ({
	index,
	testDate,
	psaValue,
	customStyle,
}) => {
	return (
		<View
			style={{ ...styles.PSAValueRow, ...customStyle }}
			key={`psa-values-${index}`}
		>
			<Text style={{ width: "20x" }}>{index}.</Text>
			<View style={styles.Value}>
				<Text style={{ marginRight: "2px", fontWeight: "bold" }}>Datum:</Text>
				<Text style={{ ...styles.TextField }}>{formatDate(testDate)}</Text>
			</View>
			<View style={{ ...styles.Value, flex: 0.9 }}>
				<Text style={{ marginRight: "2px", fontWeight: "bold" }}>PSA:</Text>
				<Text style={{ ...styles.TextField, maxWidth: "50px" }}>
					{psaValue}
				</Text>
				<Text>ng/ml</Text>
			</View>
		</View>
	);
};

export const PSAValues: React.FC<PSAValuesProps> = ({
	psaValues,
	customStyle,
}) => {
	const optionalPSAValues = psaValues ? psaValues : [];
	const hasPSAValues = optionalPSAValues.length > 0;
	return (
		<View style={{ ...styles, flexGrow: 1 }}>
			{hasPSAValues ? (
				Array.from({ length: 10 }, (_, i) =>
					optionalPSAValues[i] ? (
						<PSAValueRow
							index={i + 1}
							customStyle={customStyle}
							{...optionalPSAValues[i]}
						/>
					) : null
				)
			) : (
				<View
					style={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						flex: 1,
					}}
				>
					<Text>Keine PSA-Werte vorhanden</Text>
				</View>
			)}
		</View>
	);
};

export default PSAValues;
