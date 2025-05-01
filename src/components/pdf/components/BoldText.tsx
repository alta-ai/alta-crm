import React from "react";

import { Text } from "@react-pdf/renderer";

const styles = {
	fontWeight: "bold",
};

interface BoldTextProps {
	text: string;
}

export const BoldText: React.FC<BoldTextProps> = ({ text }) => {
	return <Text style={styles}>{text}</Text>;
};

export default BoldText;
