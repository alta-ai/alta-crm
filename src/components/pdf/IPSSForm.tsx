import React from "react";

import { Document, View, Text, StyleSheet } from "@react-pdf/renderer";
import { Header, Question, Paragraph, BaseFormPage } from "./components";
import styling from "./styles";
import { useFormData } from "./contexts/formDataContext";
import { PatientInfoHeader } from "./components/PatientInfoHeader";
import { FormProps, IPSSForm as IPSSFormData } from "../types";

const styles = StyleSheet.create({
	HeaderWrapper: {
		display: "flex" as const,
		flexDirection: "column" as const,
		justifyContent: "flex-start" as const,
		height: "45px",
	},
	Heading: {
		fontSize: "16px",
		fontWeight: "bold" as const,
	},
	QuestionBox: {
		...styling.QuestionBox,
		marginBottom: "5px",
		marginTop: "8px",
		Question: {
			minHeight: "10px",
			marginBottom: "6px",
			width: "100%",
		},
		TextField: {
			borderBottom: "1px solid gray",
			width: "50px",
			minHeight: "10px",
			marginBottom: "10px",
			textAlign: "center" as const,
		},
		BoxSelection: {
			display: "flex" as const,
			flexDirection: "row" as const,
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
		justifyContent: "space-around" as const,
	},
	QuestionExplanaition: {
		fontSize: "9px",
		marginTop: "-12px",
		marginBottom: "5px",
		maxWidth: "90%",
	},
	ScaleDescription: {
		fontWeight: "normal" as const,
	},
});

export const IPSSForm: React.FC<FormProps> = (props) => {
	const { formData, patientData, appointmentData } =
		useFormData<IPSSFormData>();

	return (
		<Document onRender={props?.onRender}>
			<BaseFormPage withFooter={false}>
				<Header>
					<View style={styles.HeaderWrapper}>
						<Text style={styles.Heading}>IPSS-Fragebogen</Text>
					</View>
				</Header>

				<PatientInfoHeader data={{ ...appointmentData, ...patientData }} />

				<View style={{ margin: "16px 0", ...styling.Emph }}>
					<Text>
						Bitte lesen Sie diesen Hinweis bevor Sie den Fragebogen ausfüllen:
					</Text>
					<Text style={styles.WithSmallBottomMargin}>
						Sie werden die Fragen auf einer Skala von 1 bis 5 beantworten. Die
						Werte bedeuten:
					</Text>
					<Text style={styles.ScaleDescription}>0 = niemals</Text>
					<Text style={styles.ScaleDescription}>
						1 = seltener als in einem von fünf Fällen
					</Text>
					<Text style={styles.ScaleDescription}>
						2 = seltener als in der Hälfte der Fälle
					</Text>
					<Text style={styles.ScaleDescription}>
						3 = ungefähr in der Hälfte der Fälle
					</Text>
					<Text style={styles.ScaleDescription}>
						4 = in mehr als der Hälfte aller Fälle
					</Text>
					<Text style={styles.ScaleDescription}>5 = fast immer</Text>
				</View>

				<Paragraph heading={"Fragebogen zum Wasserlassen"}>
					<View style={styles.QuestionBox}>
						<Question
							question="1. Wie oft während des letzten Monats hatten Sie das Gefühl, dass Ihre Blase nach dem Wasserlassen nicht ganz entleert war?"
							style={styles.QuestionBox.Question}
							questionWidth="85%"
						>
							<Text
								style={{ ...styles.QuestionBox.TextField, marginBottom: 0 }}
							>
								{formData?.bladder_not_empty_after_urinating + 1}
							</Text>
						</Question>

						<Question
							question="2. Wie oft während des letzten Monats mussten Sie in weniger als zwei Stunden ein zweites Mal Wasser lassen?"
							style={styles.QuestionBox.Question}
							questionWidth="85%"
						>
							<Text style={styles.QuestionBox.TextField}>
								{formData?.urinating_twice_in_two_hours + 1}
							</Text>
						</Question>

						<Question
							question="3. Wie oft während des letzten Monats mussten Sie beim Wasserlassen mehrmals aufhören und neu beginnen?"
							style={styles.QuestionBox.Question}
							questionWidth="85%"
						>
							<Text style={styles.QuestionBox.TextField}>
								{formData?.restart_urination + 1}
							</Text>
						</Question>

						<Question
							question="4. Wie oft während des letzten Monats hatten Sie Schwierigkeiten, das Wasserlassen hinauszuzögern?"
							style={styles.QuestionBox.Question}
							questionWidth="85%"
						>
							<Text style={styles.QuestionBox.TextField}>
								{formData?.struggling_delay_urination + 1}
							</Text>
						</Question>

						<Question
							question="5. Wie oft während des letzten Monats hatten Sie einen schwachen Strahl beim Wasserlassen?"
							style={styles.QuestionBox.Question}
							questionWidth="85%"
						>
							<Text style={styles.QuestionBox.TextField}>
								{formData?.weak_urine_stream + 1}
							</Text>
						</Question>

						<Question
							question="6. Wie oft während des letzten Monats mussten Sie pressen oder sich anstrengen, um mit dem Wasserlassen zu beginnen?"
							style={{ ...styles.QuestionBox.Question }}
							questionWidth="85%"
						>
							<Text style={styles.QuestionBox.TextField}>
								{formData?.strain_to_urinate + 1}
							</Text>
						</Question>

						<Question
							question="7. Wie oft sind Sie während des letzten Monats im Durchschnitt nachts aufgestanden, um Wasser zu lassen? Maßgebend ist der Zeitraum vom Zubettgehen bis zum Aufstehen am Morgen"
							style={{ ...styles.QuestionBox.Question }}
							questionWidth="85%"
						>
							<Text style={styles.QuestionBox.TextField}>
								{formData?.get_up_at_night_to_urinate + 1}
							</Text>
						</Question>

						<Question
							question="8. Wie würden Sie sich fühlen, wenn sich Ihre Symptome beim Wasserlassen zukünftig nicht mehr ändern würden?"
							style={{ ...styles.QuestionBox.Question }}
							questionWidth="60%"
						>
							<Text
								style={{
									...styles.QuestionBox.TextField,
									width: "200px",
									fontWeight: 700,
									fontSize: 14,
								}}
							>
								{formData?.urination_symptoms_satisfaction_level?.toUpperCase()}
							</Text>
						</Question>

						<View
							style={{
								...styling.Row,
								marginLeft: "15px",
								marginTop: "16px",
							}}
						>
							<Text style={{ fontWeight: "bold", fontSize: "16px" }}>
								IPSS-Score:
							</Text>
							<Text
								style={{
									...styles.QuestionBox.TextField,
									minHeight: "16px",
									marginLeft: "10px",
									fontWeight: "bold",
									fontSize: "16px",
								}}
							>
								{formData?.ipss_score}
							</Text>
						</View>
					</View>
				</Paragraph>
			</BaseFormPage>
		</Document>
	);
};
