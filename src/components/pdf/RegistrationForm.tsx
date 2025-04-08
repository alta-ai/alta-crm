import { Document, View, Text, StyleSheet } from "@react-pdf/renderer";
import { format } from "date-fns";
import {
	Header,
	FormRow,
	BoxSelection,
	Question,
	Paragraph,
	BaseFormPage,
	Signature,
} from "./components";
import {
	booleanToYesNo,
	deriveDisplayedCityAddress,
	deriveDisplayedFullName,
	deriveDisplayedStreetAddress,
	formatDate,
	formatExamination,
} from "./utils";
import styling from "./styles";
import { useFormData } from "./formDataContext";
import { FormProps, RegistrationForm as RegistrationFormData } from "./types";

const styles = StyleSheet.create({
	Page: { fontSize: 10 },
	HeaderWrapper: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "flex-start",
		height: "45px",
	},
	Heading: {
		fontSize: "16px",
		fontWeight: "bold",
	},
	QuestionBox: {
		...styling.QuestionBox,
		marginBottom: "5px",
		Question: {
			minHeight: "18px",
			marginBottom: "8px",
		},
		TextField: {
			padding: "0 10px",
			minHeight: "16px",
			textAlign: "left" as const,
			flex: 1,
			borderBottom: "1px solid gray",
			paddingBottom: "3px",
		},
		BoxSelection: {
			display: "flex",
			flexDirection: "row",
			checkbox: {
				marginLeft: "10px",
			},
		},
	},
	Paragraph: {
		marginBottom: "15px",
	},
});

export const RegistrationForm: React.FC<FormProps> = (props) => {
	const { formData, patientData, appointmentData } =
		useFormData<RegistrationFormData>();

	return (
		<Document onRender={props?.onRender}>
			<BaseFormPage customStyle={styles.Page}>
				<Header>
					<View style={styles.HeaderWrapper}>
						<Text style={styles.Heading}>Anmeldeformular</Text>
					</View>
				</Header>
				<View style={styling.FormTypeLines}>
					<FormRow
						style={styling.FormTypeLines.FormRow}
						items={[
							{
								label: "Titel, Nachname, Vorname",
								value: deriveDisplayedFullName({
									title: patientData?.title || undefined,
									name: patientData?.name,
									surname: patientData?.surname,
								}),
								start: 50,
								type: "text",
							},
							{
								label: "Geburtsdatum",
								value: format(patientData?.birthdate, "dd.MM.yyyy"),
								start: 50,
								type: "text",
							},
						]}
					/>
					<FormRow
						style={styling.FormTypeLines.FormRow}
						items={[
							{
								label: "Telefon (tagsüber)",
								value: patientData?.contact?.phone,
								start: 30,
								type: "text",
							},
							{
								label: "Mobil",
								value: patientData?.contact?.mobile,
								start: 30,
								type: "text",
							},
							{
								label: "E-Mail",
								value: patientData?.contact?.email,
								start: 40,
								type: "text",
							},
						]}
					/>
					<FormRow
						style={styling.FormTypeLines.FormRow}
						items={[
							{
								label: "Straße, Hausnummer",
								value: deriveDisplayedStreetAddress({
									street: patientData?.address?.street,
									houseNumber: patientData?.address?.houseNumber,
								}),
								start: 30,
								type: "text",
							},
							{
								label: "PLZ, Wohnort",
								value: deriveDisplayedCityAddress({
									zip: patientData?.address?.zipCode || undefined,
									city: patientData?.address?.city || undefined,
								}),
								start: 30,
								type: "text",
							},
							{
								label: "Land",
								value: patientData?.address?.country,
								start: 40,
								type: "text",
							},
						]}
					/>
					<FormRow
						style={styling.FormTypeLines.FormRow}
						items={[
							{
								label: "PKV/GKV",
								value: patientData?.insurance?.name,
								start: 50,
								type: "text",
							},
							{
								label: "Beihilfeberechtigt",
								value: (
									<BoxSelection
										options={["Ja", "Nein"]}
										selected={booleanToYesNo(
											appointmentData?.details?.hasBeihilfe
										)}
										style={styling.FormTypeLines.BoxSelection}
									/>
								),
								type: "custom",
								start: 30,
							},
						]}
					/>
					<FormRow
						style={styling.FormTypeLines.FormRow}
						items={[
							{
								label: "Untersuchung",
								value: formatExamination({
									examination: appointmentData?.examination?.name,
									bodySide: appointmentData?.examination?.bodySide as string,
								}),
								start: 100,
								type: "text",
							},
						]}
					/>
					<FormRow
						style={styling.FormTypeLines.FormRow}
						items={[
							{
								label: "ggf. Notiz für den Arzt oder Standort der Biopsie",
								value: "",
								start: 100,
								type: "text",
							},
						]}
					/>
				</View>
				<View style={styles.QuestionBox}>
					<Question
						question="Sind Sie aktuell bei einem Urologen in Behandlung?"
						style={styles.QuestionBox.Question}
					>
						<BoxSelection
							options={["Ja", "Nein"]}
							selected={booleanToYesNo(
								formData?.urologicInformation?.currentlyUndergoingTreatment
							)}
							style={styles.QuestionBox.BoxSelection}
						/>
					</Question>
					<Question
						question="Empfehlung vom Urologen:"
						style={styles.QuestionBox.Question}
					>
						<Text style={styles.QuestionBox.TextField}>
							{formData?.urologicInformation?.recommendationOfUrologist}
						</Text>
					</Question>
					<Question
						question="Kommen Sie auf Empfehlung Ihres behandelnden Arztes?"
						style={styles.QuestionBox.Question}
					>
						<BoxSelection
							options={["Ja", "Nein"]}
							selected={booleanToYesNo(
								formData?.urologicInformation?.visitDueToRecommendation
							)}
							style={styles.QuestionBox.BoxSelection}
						/>
					</Question>
					<Question
						question="Welcher Arzt?"
						style={styles.QuestionBox.Question}
					>
						<Text style={styles.QuestionBox.TextField}>
							{formData?.urologicInformation?.nameOfUrologist}
						</Text>
					</Question>
					<Question
						question="Haben Sie eine Überweisung?"
						style={styles.QuestionBox.Question}
					>
						<BoxSelection
							options={["Ja", "Nein"]}
							selected={booleanToYesNo(
								formData?.urologicInformation?.gotTransfer
							)}
							style={styles.QuestionBox.BoxSelection}
						/>
					</Question>
					<Question question="Soll der Befundbericht an den Behandler geschickt werden?">
						<BoxSelection
							options={["Ja", "Nein"]}
							selected={booleanToYesNo(
								formData?.urologicInformation?.sendReportToUrologist
							)}
							style={{ ...styles.QuestionBox.BoxSelection, marginBottom: 0 }}
						/>
					</Question>
				</View>
				<View style={styles.Paragraph}>
					<Paragraph
						heading={"Kostenerstattung"}
						text={
							"Hiermit nehme ich zur Kenntnis, dass ein privatärztlicher Behandlungsvertrag zwischen mir und der ALTA Klinik geschlossen wird. Rechnungen zwischen mir und der ALTA Klinik werde ich in voller Höhe vollständig selber tragen, unabhängig von der Erstattungsregelung meiner privaten Krankenversicherung, Beihilfestelle oder anderen Leistungsträgern. Eine Abrechnung über die gesetzlichen Krankenkassen oder privaten Zusatzversicherungen ist nicht möglich. Als privatversicherter Patient, oder PBeaKK oder KVB I-III Versicherter mit ggf. Beihilfeanspruch nehme ich zur Kenntnis, dass Untersuchungen oder Leistungen im Einzelfall bis zum 3,5-fachen Steigerungsfaktor abgerechnet werden können, falls Abweichungen im Ablauf der Untersuchung entstehen, oder das Krankheitsbild, der Zeitaufwand oder die Umstände dieses erfordern (GOÄ § 5, Abs. 2). Ich wurde darüber aufgeklärt, dass gerade in diesen Fällen die Kosten von den jeweiligen Leistungsträgern teilweise nicht bzw. nicht vollständig erstattet werden können."
						}
						lineHeight={1.0}
					/>
				</View>
				<Signature />
			</BaseFormPage>
		</Document>
	);
};
