import React from "react";

import { View, Text } from "@react-pdf/renderer";

const styles = {
	BulletPoint: {
		Dot: {
			left: "-15px",
			position: "absolute" as const,
			fontSize: "16px",
		},
	},
};

const BULLETPOINTS = [
	{ symbol: "-", paddingTop: "-4px" },
	{ symbol: "•", paddingTop: "-3px" },
];

// Added static type hints for props
interface BulletPointProps {
	text?: string | React.ReactNode;
	lineHeight?: number;
	order?: number;
	customStyle?: any;
	children?: React.ReactNode;
}

export const BulletPoint: React.FC<BulletPointProps> = ({
	text,
	lineHeight = 1.0,
	order = 1,
	customStyle,
	children,
}) => {
	const style = {
		...customStyle,
		marginLeft: `${order * 25}px`,
	};

	return (
		<View style={style}>
			<View style={styles.BulletPoint}>
				<Text
					style={{
						...styles.BulletPoint.Dot,
						paddingTop: BULLETPOINTS[order - 1].paddingTop,
					}}
				>
					{BULLETPOINTS[order - 1].symbol}
				</Text>
				<View>
					{text && <Text style={{ lineHeight }}>{text}</Text>}
					{children}
				</View>
			</View>
		</View>
	);
};

export default BulletPoint;
