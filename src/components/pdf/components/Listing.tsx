import React from "react";

import { View, Text } from "@react-pdf/renderer";

const styles = {
	marginLeft: "15px",
	ListElement: {
		Dot: {
			left: "-15px",
			position: "absolute" as const,
		},
	},
};

// Added static type hints for props
interface ListingProps {
	list: string[];
	lineHeight?: number;
	customStyle?: any;
}

export const Listing: React.FC<ListingProps> = ({
	list,
	lineHeight = 1.0,
	customStyle,
}) => {
	return (
		<View style={{ ...styles, ...customStyle }}>
			{list.map((item, index) => (
				<View key={index} style={styles.ListElement}>
					<Text
						style={{
							...styles.ListElement.Dot,
						}}
					>
						{index + 1} .
					</Text>
					<View>
						<Text style={{ lineHeight }}>{item}</Text>
					</View>
				</View>
			))}
		</View>
	);
};

export default Listing;
