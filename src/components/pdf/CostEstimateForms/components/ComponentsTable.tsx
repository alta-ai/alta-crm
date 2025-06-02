import React from "react";

import { View, Text, StyleSheet } from "@react-pdf/renderer";

interface TableEntry {
	goa?: string | null;
	text?: string | null;
	coeff?: string | number | null;
	price?: string | number | null;
	type?: "sum" | "gap" | string | null;
}

interface ComponentsTableProps {
	tableData: TableEntry[];
	customStyle?: {
		[key: string]: any;
		tableRow?: {
			[key: string]: any;
		};
	};
}

const styles = StyleSheet.create({
	tableRow: {
		flexDirection: "row",
		marginBottom: "1px",
	},
	tableColGOA: {
		width: "15%",
		marginRight: "5px",
		textAlign: "right",
	},
	tableColText: {
		width: "55%",
		marginRight: "5px",
		textAlign: "left",
	},
	tableColFactor: {
		width: "15%",
		marginRight: "5px",
		textAlign: "right",
	},
	tableColSum: {
		width: "15%",
		textAlign: "right",
	},
	tableBorder: {
		borderBottom: "2px solid black",
	},
});

export const ComponentsTable: React.FC<ComponentsTableProps> = ({
	tableData,
	customStyle,
}) => {
	return (
		<View
			style={
				{
					display: "table",
					width: "100%",
					padding: "0 10px",
					...styles,
					...customStyle,
				} as any
			}
		>
			{/* Table Header */}
			<View
				style={{
					...styles.tableRow,
					...styles.tableBorder,
					...customStyle?.tableRow,
				}}
			>
				<View style={styles.tableColGOA}>
					<Text>GOÄ-Ziffer</Text>
				</View>
				<View style={styles.tableColText}>
					<Text>Leistung</Text>
				</View>
				<View style={styles.tableColFactor}>
					<Text>Faktor</Text>
				</View>
				<View style={styles.tableColSum}>
					<Text>Gebühr</Text>
				</View>
			</View>

			{tableData.map((entry, index) => {
				const rowStyle = { ...styles.tableRow } as any;

				if (entry.type === "sum") {
					rowStyle.borderTop = "2px solid black";
					rowStyle.fontWeight = "bold";
				}

				if (entry.type === "gap") {
					rowStyle.marginTop = "8px";
				}

				return (
					<View style={rowStyle} key={index}>
						<View style={styles.tableColGOA}>
							<Text>{entry.goa}</Text>
						</View>
						<View style={styles.tableColText}>
							<Text>{entry.text}</Text>
						</View>
						<View style={styles.tableColFactor}>
							<Text>{entry.coeff}</Text>
						</View>
						<View style={styles.tableColSum}>
							<Text>
								{entry.price}
								{entry.price ? " €" : ""}
							</Text>
						</View>
					</View>
				);
			})}
		</View>
	);
};
