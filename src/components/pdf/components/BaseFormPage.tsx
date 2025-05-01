import { Page, View, Text } from "@react-pdf/renderer";
import { Footer } from "./";
import styling from "../styles";
import { useFormData } from "../formDataContext";
import { deriveDisplayedFullName, formatDateString } from "../utils";

const styles = {
	position: "relative" as const,
	PageNumber: {
		position: "absolute" as const,
		right: 0,
		transform: "translateX(-35%)",
		fontSize: 9,
		color: "grey",
	},
	Footer: {
		borderTop: "1px solid lightgrey",
		position: "absolute",
		bottom: 20,
		// transform: "translateX(%)",
		paddingTop: "5px",
	},
	PatientID: {
		position: "absolute" as const,
		top: 0,
		right: 0,
		fontSize: 9,
	},
};

interface BaseFormPageProps {
	children: React.ReactNode; // The children to render inside the page
	printPageNumbers?: boolean; // Whether to print page numbers
	customStyle?: object; // Custom styles to apply to the page
	withFooter?: boolean; // Whether to include the footer
	withPatientInfo?: boolean; // Whether to include patient information
}

const BaseFormPage: React.FC<BaseFormPageProps> = ({
	printPageNumbers = true,
	customStyle = {},
	withFooter = true,
	withPatientInfo = true,
	children,
}) => {
	const { appointmentData, patientData } = useFormData();

	return (
		<Page style={{ ...styling.page, ...styles, ...customStyle }} size="A4">
			<View
				render={({ pageNumber }) =>
					withPatientInfo && pageNumber > 1 && patientData?.patientNumber ? (
						<Text
							style={{
								...styles.PatientID,
								marginTop: "1px",
								marginRight: "1px",
							}}
						>
							{deriveDisplayedFullName({
								title: patientData?.title,
								name: patientData?.name,
								surname: patientData?.surname,
							})}{" "}
							(Pat-ID: {patientData.patientNumber}) - Untersuchung vom{" "}
							{formatDateString(appointmentData?.date)}
						</Text>
					) : (
						<Text />
					)
				}
			/>

			{children}

			{printPageNumbers && (
				<View
					style={{ ...styles.PageNumber, bottom: withFooter ? 60 : 15 }}
					fixed={true}
					render={({ pageNumber, totalPages }) => (
						<Text
							style={{
								fontSize: 9,
								color: "grey",
								marginBottom: "1px",
							}}
						>
							Seite {pageNumber} von {totalPages}
						</Text>
					)}
				/>
			)}
			{withFooter && <Footer style={styles.Footer} />}
		</Page>
	);
};

export default BaseFormPage;
