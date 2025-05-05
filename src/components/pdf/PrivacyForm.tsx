import React from "react";
import { Document, View, Text, StyleSheet } from "@react-pdf/renderer";
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
	deriveDisplayedCityAddress,
	deriveDisplayedFullName,
	deriveDisplayedStreetAddress,
	formatDate,
} from "./utils";
import styling from "./styles";
import { useFormData } from "./formDataContext";
import { FormProps, PrivacyForm as PrivacyFormData } from "../types";

const styles = {
	Page: { fontSize: 11 },
	HeaderWrapper: {
		display: "flex" as const,
		flexDirection: "column" as const,
		justifyContent: "flex-start" as const,
		height: "45px",
	},
	Heading: {
		fontSize: "16px",
		fontWeight: "bold",
	},
	QuestionBox: {
		...styling.QuestionBox,
		marginBottom: "5px",
		marginTop: "8px",
		Question: {
			minHeight: "18px",
			marginBottom: "8px",
		},
		TextField: {
			padding: "0 10px",
			minHeight: "16px",
			flex: 1,
			borderBottom: "1px solid gray",
			paddingBottom: "3px",
		},
		BoxSelection: {
			display: "flex" as const,
			flexDirection: "row",
			checkbox: {
				marginLeft: "10px",
			},
		},
	},
	WithBottomMargin: {
		marginBottom: "8px",
	},
	WithSmallBottomMargin: {
		marginBottom: "5px",
	},
	WithBorder: {
		border: "1px solid black",
		padding: "5px",
	},
	HeightAndWeight: {
		...styling.Center,
		justifyContent: "space-around",
	},
	QuestionExplanaition: {
		fontSize: "9px",
		marginTop: "-12px",
		marginBottom: "5px",
		maxWidth: "80%",
	},
};

export const PrivacyForm: React.FC<FormProps> = (props) => {
	const { formData, patientData } = useFormData<PrivacyFormData>();

	return (
		<Document onRender={props?.onRender}>
			<BaseFormPage withFooter={false} customStyle={styles.Page}>
				<Header>
					<View style={styles.HeaderWrapper}>
						<Text style={styles.Heading}>Datenschutzformular</Text>
					</View>
				</Header>

				<View style={styling.FormTypeLines}>
					<FormRow
						style={styling.FormTypeLines.FormRow}
						items={[
							{
								label: "Titel, Nachname, Vorname",
								value: deriveDisplayedFullName({
									title: patientData.title || undefined,
									name: patientData.first_name,
									surname: patientData.last_name,
								}),
								start: 50,
								type: "text",
							},
							{
								label: "Geburtsdatum",
								value: formatDate(patientData.birth_date),
								start: 50,
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
									street: patientData.street,
									houseNumber: patientData.house_number,
								}),
								start: 30,
								type: "text",
							},
							{
								label: "PLZ, Wohnort",
								value: deriveDisplayedCityAddress({
									zip: patientData.postal_code,
									city: patientData.city,
								}),
								start: 30,
								type: "text",
							},
							{
								label: "Land",
								value: patientData?.country,
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
								label: "Telefon/Mobil",
								value: patientData?.mobile || patientData?.phone,
								start: 30,
								type: "text",
							},
							{
								label: "E-Mail",
								value: patientData?.email,
								start: 40,
								type: "text",
							},
						]}
					/>
				</View>

				<Paragraph
					heading={"Datenschutz-Grundverordnung (DSGVO) ab dem 25.05.2018"}
					customStyle={{ marginTop: "5px" }}
				>
					<Text>
						Ihre Gesundheit und der sichere Umgang mit Ihren Daten sind uns
						wichtig. Im Zuge des Inkrafttretens der Datenschutz-Grundverordnung
						(DSGVO) am 25.05.2018 informieren wir Sie, dass wir, alle
						Mitarbeiter der ALTA Klinik, Vertretungsärzte, Vertretungspersonal,
						Hospitanten und MRT-Dienstleister zur Erbringung unserer Leistung
						Ihre personenbezogenen Daten benötigen, die bei uns gespeichert
						werden. Dazu gehören Ihre personenbezogenen Daten, wie Name,
						Geburtsdatum, Adresse, Telefon, E-Mail, Versicherungsstatus, Beruf.
						Ebenso gehören personenbezogene Daten besonderer Kategorie gem. Art.
						9 (2) lit. h DGSVO, wie Gesundheit, dazu. Wir nutzen Ihre Daten für
						die Terminvereinbarung, Kontaktaufnahme, für die Durchführung einer
						Untersuchung oder Behandlung, für die Bereitstellung der Ergebnisse,
						zur Dokumentation des Behandlungsverlaufes und zur Abrechnung der
						von uns erbrachten Leistungen. Wenn Laborleistungen, pathologische
						Leistungen in Anspruch genommen werden, sind Sie einverstanden, dass
						wir in diesem Zusammenhang Ihre personenbezogenen Daten übermitteln
						dürfen. Weiterhin klären wir Sie auf, dass unsere externen IT- und
						Technologie-Dienstleistungsunternehmen Zugriff auf Ihre
						personenbezogenen (wie z.B. Name) sowie personenbezogene Daten
						besonderer Kategorien (wie z.B. Gesundheit) haben. Um Ihre Daten zu
						schützen, haben wir technisch-organisatorische Maßnahmen ergriffen.
						Mehr Informationen bietet Ihnen unsere „Patienteninformation zur
						Datenverarbeitung in der ALTA Klinik“.
					</Text>
				</Paragraph>

				<View style={{ ...styles.QuestionBox, marginTop: "10px" }}>
					<Question question="0. Foto" style={styles.QuestionBox.Question}>
						<BoxSelection
							options={[true, false]}
							labels={["Ja", "Nein"]}
							style={styles.QuestionBox.BoxSelection}
							selected={formData?.foto_consent}
						/>
					</Question>
					<Text style={styles.QuestionExplanaition}>
						Sind Sie damit einverstanden, dass intern ein Foto von Ihnen
						gespeichert wird?
					</Text>

					<Question question="1. E-Mail" style={styles.QuestionBox.Question}>
						<BoxSelection
							options={[true, false]}
							labels={["Ja", "Nein"]}
							selected={formData?.email_consent}
							style={styles.QuestionBox.BoxSelection}
						/>
					</Question>
					<Text style={styles.QuestionExplanaition}>
						Sind Sie damit einverstanden, dass Ihre Arztbefunde und damit
						zusammenhängende Unterlagen und Informationen an Sie per E-Mail
						versendet werden? Wir weisen Sie darauf hin, dass bei einer
						Übersendung eine unberechtigte Kenntnisnahme Dritter vom Inhalt
						sowie eine Veränderung des Inhalts trotz ausreichender Vorkehrungen
						nicht ausgeschlossen werden kann.
					</Text>

					<Question
						question="2. Terminerinnerung - Recall"
						style={styles.QuestionBox.Question}
					>
						<BoxSelection
							options={[true, false]}
							labels={["Ja", "Nein"]}
							selected={formData?.appointment_reminder_consent}
							style={styles.QuestionBox.BoxSelection}
						/>
					</Question>
					<Text style={styles.QuestionExplanaition}>
						Sind Sie damit einverstanden, dass wir Sie über eine ggf. notwendige
						Verlaufskontrolle erinnern?
					</Text>

					<Question
						question="3. Anforderung von Befunden"
						style={styles.QuestionBox.Question}
					>
						<BoxSelection
							options={[true, false]}
							labels={["Ja", "Nein"]}
							selected={formData?.request_report_consent}
							style={styles.QuestionBox.BoxSelection}
						/>
					</Question>
					<Text style={styles.QuestionExplanaition}>
						Sind Sie damit einverstanden, dass wir betreffende Behandlungsdaten
						und Befunde bei anderen Ärzten, Zahnärzten, Psychotherapeuten und
						sonstigen Leistungserbringern zum Zweck der Dokumentation und
						Behandlung anfordern?
					</Text>

					<Question
						question="4. Übermittlung von Befunden"
						style={styles.QuestionBox.Question}
					>
						<BoxSelection
							options={[true, false]}
							labels={["Ja", "Nein"]}
							selected={formData?.transmit_report_consent}
							style={styles.QuestionBox.BoxSelection}
						/>
					</Question>
					<Text style={styles.QuestionExplanaition}>
						Sind Sie damit einverstanden, dass wir betreffende Behandlungsdaten
						und Befunde durch die ALTA Klinik an andere Ärzte, Zahnärzte,
						Psychotherapeuten und sonstige Leistungserbringern zum Zweck der
						Dokumentation und Behandlung übermitteln?
					</Text>

					<Question
						question="5. Anonymisierte Datenverarbeitung zu Forschungszwecken"
						style={styles.QuestionBox.Question}
					>
						<BoxSelection
							options={[true, false]}
							labels={["Ja", "Nein"]}
							selected={formData?.data_processing_consent}
							style={styles.QuestionBox.BoxSelection}
						/>
					</Question>
					<Text style={styles.QuestionExplanaition}>
						Sind Sie damit einverstanden, dass Ihre personenbezogenen Daten von
						der ALTA Klinik in anonymisierter oder pseudonymisierter Form zu
						Zwecken klinisch wissenschaftlicher Untersuchungen
						weiterverarbeitet, an beteiligte Dritte weitergeleitet und
						veröffentlicht werden?
					</Text>
				</View>

				<View style={{ height: "10px" }} />
				<Signature />
			</BaseFormPage>
		</Document>
	);
};
