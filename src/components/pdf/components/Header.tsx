import React from "react";
import logo from "../resources/logo.png";

import { Image, View, Text } from "@react-pdf/renderer";
import { useFormData } from "../formDataContext";

const style = {
	display: "flex" as const,
	position: "relative" as const,
	justifyContent: "flex-end" as const,
	height: "55px",
	marginBottom: "12px",
	paddingBottom: "5px",
	borderBottom: "1px solid lightgrey",

	Image: {
		width: "200px",
		position: "absolute" as const,
		right: 0,
		top: "-10px",
		zIndex: -1,
	},
	PatientID: {
		position: "absolute" as const,
		right: "5px",
		top: "37px",
		fontSize: "10px",
		fontWeight: 500,
	},
};

interface HeaderProps {
	children: React.ReactNode;
	showPatientID?: boolean;
}

const Header: React.FC<HeaderProps> = ({ children, showPatientID = true }) => {
	const { patientData } = useFormData();

	return (
		<View style={style}>
			{children}
			{showPatientID && (
				<Text style={style.PatientID}>
					Patienten-ID: {patientData?.patientNumber}
				</Text>
			)}
			<Image src={logo} style={style.Image} />
		</View>
	);
};

export default Header;
