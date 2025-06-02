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
	formatTime,
	deriveDisplayedCityAddress,
	deriveDisplayedFullName,
	deriveDisplayedStreetAddress,
	formatExamination,
	formatDate,
	deriveFullAdress,
} from "./utils";
import styling from "./styles";
import { useFormData } from "./contexts/formDataContext";
import {
	FormProps,
	RegistrationBGForm as RegistrationBGFormData,
} from "../types";

const styles = StyleSheet.create({
	Page: { fontSize: 10, lineHeight: 1.2 },
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
		marginBottom: "5px",
	},
});

export const RegistrationBGForm: React.FC<FormProps> = (props) => {
	const { formData, appointmentData, patientData } =
		useFormData<RegistrationBGFormData>();

	return (
		<Document onRender={props?.onRender}>
			<BaseFormPage customStyle={styles.Page}>
				<Header>
					<View style={styles.HeaderWrapper}>
						<Text style={styles.Heading}>Anmeldeformular</Text>
						<Text style={{ ...styles.Heading, marginTop: "5px" }}>
							Arbeitsunfall (Berufsgenossenschaft)
						</Text>
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
									name: patientData?.first_name,
									surname: patientData?.last_name,
								}),
								start: 50,
								type: "text",
							},
							{
								label: "Geburtsdatum",
								value: format(
									formData.birth_date || patientData.birth_date,
									"dd.MM.yyyy"
								),
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
								value: patientData?.phone,
								start: 40,
								type: "text",
							},
							{
								label: "Mobil",
								value: patientData?.mobile,
								start: 60,
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
									street: patientData?.street,
									houseNumber: patientData?.house_number,
								}),
								start: 40,
								type: "text",
							},
							{
								label: "PLZ, Wohnort",
								value: deriveDisplayedCityAddress({
									zip: patientData?.postal_code,
									city: patientData?.city,
								}),
								start: 60,
								type: "text",
							},
						]}
					/>
					<FormRow
						style={styling.FormTypeLines.FormRow}
						items={[
							{
								label: "Unfalltag",
								value: format(formData?.datetime_of_accident, "dd.MM.yyyy"),
								start: 40,
								type: "text",
							},
							{
								label: "Uhrzeit",
								value: formatTime(formData?.datetime_of_accident),
								start: 60,
								type: "text",
							},
						]}
					/>
					<FormRow
						style={styling.FormTypeLines.FormRow}
						items={[
							{
								label: "Arbeitgeber/Name",
								value: formData?.name_of_company,
								start: 40,
								type: "text",
							},
							{
								label: "Anschrift",
								value: deriveFullAdress({
									street: formData?.street_of_company,
									houseNumber: formData?.house_number_of_company,
									zipCode: formData?.postal_code_of_company,
									city: formData?.city_of_company,
								}),
								start: 60,
								type: "text",
							},
						]}
					/>
					<FormRow
						style={styling.FormTypeLines.FormRow}
						items={[
							{
								label: "Beschäftigt als",
								value: formData?.profession,
								start: 40,
								type: "text",
							},
							{
								label: "Seit wann",
								value: formData?.time_of_employment,
								start: 60,
								type: "text",
							},
						]}
					/>
				</View>

				<View style={styles.QuestionBox}>
					<Question
						question="Untersuchung:"
						style={{ ...styles.QuestionBox.Question, marginBottom: "8px" }}
					>
						<Text style={styles.QuestionBox.TextField}>
							{formatExamination({
								examination: appointmentData?.examination?.name,
								bodySide: appointmentData?.body_side,
							})}
						</Text>
					</Question>
					<Question
						question="Überweisender Arzt:"
						style={styles.QuestionBox.Question}
					>
						<Text style={styles.QuestionBox.TextField}>
							{formData?.referring_doctor_name}
						</Text>
					</Question>
				</View>

				<View style={styles.Paragraph}>
					<Paragraph
						heading={"Datenschutz-Grundverordnung (DSGVO) ab dem 25.05.2018"}
						text={
							"Ihre Gesundheit und der sichere Umgang mit Ihren Daten sind uns wichtig. Im Zuge des Inkrafttretens der Datenschutz-Grundverordnung (DSGVO) am 25.05.2018 informieren wir Sie, dass wir, alle Mitarbeiter der ALTA Klinik, zur Erbringung unserer Leistung Ihre personenbezogenen Daten benötigen, die bei uns gespeichert werden. Dazu gehören Ihre personenbezogenen Daten, wie Name, Geburtsdatum, Adresse, Telefon, E-Mail, Versicherungsstatus, Beruf. Ebenso gehören personenbezogenen Daten besonderer Kategorie, wie Gesundheit, dazu. Wir nutzen Ihre Daten für die Terminvereinbarung, Kontaktaufnahme, für die Durchführung einer Untersuchung oder Behandlung, für die Bereitstellung der Ergebnisse, zur Dokumentation des Behandlungsverlaufes und zur Abrechnung der von uns erbrachten Leistungen. Wenn Laborleistungen, pathologische Leistungen in Anspruch genommen werden, sind Sie einverstanden, dass wir in diesem Zusammenhang Ihre personenbezogenen Daten übermitteln dürfen. Weiterhin klären wir Sie auf, dass unsere externen IT- und Technologie- Dienstleistungsunternehmen Zugriff auf Ihre personenbezogenen (wie z.B. Name) sowie personenbezogene Daten besonderer Kategorien (wie z.B. Gesundheit) haben. Um Ihre Daten zu schützen, haben wir technisch-organisatorische Maßnahmen ergriffen."
						}
						lineHeight={0.8}
					/>
				</View>
				<View style={styles.Paragraph}>
					<Paragraph
						heading={"Einwilligungserklärung für die Übermittlung von Befunden"}
						text={
							"Da es sich bei dieser Untersuchung um einen BG-Fall handelt, ist mir bewusst und ich bin ausdrücklich damit einverstanden, dass mein ärztlicher Befundbericht und meine Behandlungsdaten an den überweisenden und/oder weiterbehandelnden Arzt und die zuständige Berufsgenossenschaft übermittelt werden."
						}
						lineHeight={0.8}
					/>
				</View>
				<View style={styles.Paragraph}>
					<Paragraph
						heading={"Kostenerstattung"}
						text={
							"Die Abrechnung erfolgt über die zuständige Berufsgenossenschaft. Mir ist bewusst, wenn dies kein Arbeitsunfall ist, dass ich die Kosten privat tragen muss."
						}
						lineHeight={0.8}
					/>
				</View>

				<Signature />
			</BaseFormPage>
		</Document>
	);
};
