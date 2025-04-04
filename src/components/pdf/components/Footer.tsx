import { View, Text } from "@react-pdf/renderer";

const styles = {
	display: "flex" as const,
	alignItems: "center" as const,
	Text: {
		fontSize: "9px",
		textAlign: "center" as const,
		color: "red",
	},
};

interface FooterProps {
	style?: object; // Optional style prop to customize the footer
}

const Footer: React.FC<FooterProps> = ({ style }) => {
	return (
		<View style={{ ...styles, ...style }} fixed={true}>
			<Text style={styles.Text}>ALTA Klinik GmbH</Text>
			<Text style={styles.Text}>
				Alfred-Bozi-Straße 3 · D-33602 Bielefeld · Tel: 0521 - 260 555 0 · Fax:
				0521 - 260 555 14 · info@alta-klinik.de · www.alta-klinik.de
			</Text>
			<Text style={styles.Text}>
				Sitz der Gesellschaft: Bielefeld · Amtsgericht Bielefeld HRB 42489 ·
				Geschäftsführer: Dr.med. Agron Lumiani · Steuer-Nr.:305/5801/1989
			</Text>
		</View>
	);
};

export default Footer;
