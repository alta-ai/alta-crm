import { Page, View, Text } from "@react-pdf/renderer";
import { Footer } from "./";
import styling from "../styles";
import { useFormData } from "../contexts/formDataContext";
import { deriveDisplayedFullName, formatDate } from "../utils";

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
		top: -5,
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
					withPatientInfo && pageNumber > 1 && patientData?.patient_number ? (
						<>
							<View
								style={{
									...styles.PatientID,
									display: "flex",
									marginTop: "1px",
									marginRight: "1px",
								}}
							>
								<Text>
									{deriveDisplayedFullName({
										title: patientData?.title || undefined,
										name: patientData?.first_name,
										surname: patientData?.last_name,
									})}{" "}
									(Pat-ID: {patientData.patient_number})
								</Text>
								<View style={{ alignItems: "flex-end" }}>
									<Text>
										Untersuchung vom {formatDate(appointmentData?.start_time)}
									</Text>
								</View>
							</View>
						</>
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
