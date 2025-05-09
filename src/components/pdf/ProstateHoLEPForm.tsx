import React from "react";

import { Document, View, Text, StyleSheet, Image } from "@react-pdf/renderer";
import {
	Header,
	BoxSelection,
	Question,
	Paragraph,
	BaseFormPage,
	Signature,
	PSAValues,
} from "./components";
import styling from "./styles";
import { useFormData } from "./contexts/formDataContext";
import { usePSADiagram } from "./contexts/psaDiagramContext";
import { PatientInfoHeader } from "./components/PatientInfoHeader";
import {
	FormProps,
	ProstateHoLEPForm as ProstateHoLEPFormData,
} from "../types";
import { dumpPsaValues } from "../types/utils";

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
	SubHeading: {
		fontSize: "12px",
	},
	QuestionBox: {
		...styling.QuestionBox,
		Question: {
			fontSize: 12,
			minHeight: "18px",
			marginBottom: "5px",
		},
		FullLineTextFieldWrapper: {
			minHeight: "22px",
			display: "flex" as const,
			flexDirection: "column" as const,
			justifyContent: "flex-end" as const,
		},
		TextFieldWrapper: {
			minHeight: "16px",
		},
		TextField: {
			padding: "0 10px",
			minHeight: "18px",
			borderBottom: "1px solid gray",
			paddingBottom: "3px",
			flex: 1,
		},
		BoxSelection: {
			display: "flex" as const,
			flexDirection: "row" as const,
			checkbox: {
				marginLeft: "10px",
				box: {
					width: 12,
					height: 12,
				},
				inner: {
					width: 7,
					height: 7,
				},
				label: {
					fontSize: 12,
				},
			},
		},
		BoxSelectionCol: {
			display: "flex" as const,
			flexDirection: "column" as const,
			marginTop: "4px",
			checkbox: {
				marginLeft: "10px",
				display: "block" as const,
				justifyContent: "flex-start" as const,
			},
		},
		CustomBulletPointText: {
			maxWidth: "100%",
			width: "100%",
		},
	},
	WithBottomMargin: {
		marginBottom: "8px",
	},
	WithSmallBottomMargin: {
		marginBottom: "5px",
	},
	HeightAndWeight: {
		...styling.Center,
		justifyContent: "space-around" as const,
	},
});

export const ProstateHoLEPForm: React.FC<FormProps> = (props) => {
	const { formData, appointmentData, patientData } =
		useFormData<ProstateHoLEPFormData>();
	const psaDiagram = usePSADiagram();

	return (
		<Document onRender={props?.onRender}>
			<BaseFormPage withFooter={false}>
				<Header>
					<View style={styles.HeaderWrapper}>
						<Text style={styles.Heading}>Prostatafragebogen</Text>
						<Text style={{ ...styles.SubHeading, marginBottom: "4px" }}>
							nach der HoLEP-Behandlung
						</Text>
					</View>
				</Header>

				<PatientInfoHeader data={{ ...appointmentData, ...patientData }} />

				<Paragraph
					heading={"PSA-Werte im Verlauf"}
					customStyle={styles.WithBottomMargin}
				>
					<View style={{ ...styles.QuestionBox }}>
						<View style={styling.Row}>
							<View style={{ width: "40%" }}>
								<PSAValues
									psaValues={dumpPsaValues(formData)}
									customStyle={{ fontSize: "9px", minHeight: "15px" }}
								/>
							</View>
							<View style={{ width: "60%" }}>
								{psaDiagram?.chart && (
									<Image source={psaDiagram?.chart}></Image>
								)}
							</View>
						</View>
					</View>
				</Paragraph>

				<Paragraph
					heading={"Relevante Informationen zur HoLEP Therapie"}
					customStyle={styles.WithBottomMargin}
				>
					<View style={{ ...styles.QuestionBox }}>
						<Question
							question="1. Haben Sie nach dem HoLEP-Eingriff Beschwerden?"
							style={styles.QuestionBox.Question}
						>
							<BoxSelection
								options={[false, true]}
								labels={["Nein", "Ja"]}
								selected={formData?.has_complaints}
								style={styles.QuestionBox.BoxSelection}
							/>
						</Question>
						<Question
							question="Falls ja, welche?"
							style={{ marginLeft: "16px", ...styles.QuestionBox.Question }}
						>
							<Text style={styles.QuestionBox.TextField}>
								{formData?.complaints_description}
							</Text>
						</Question>

						<Question
							question="2. Haben Sie Probleme mit der Erektion/Potenz nach der HoLEP?"
							style={styles.QuestionBox.Question}
						>
							<BoxSelection
								options={[false, true]}
								labels={["Nein", "Ja"]}
								selected={formData?.has_potency_problems}
								style={styles.QuestionBox.BoxSelection}
							/>
						</Question>

						<Question
							question="3. Besteht eine Harninkontinenz nach der HoLEP?"
							style={styles.QuestionBox.Question}
						>
							<BoxSelection
								options={[false, true]}
								labels={["Nein", "Ja"]}
								selected={formData?.has_incontinence}
								style={styles.QuestionBox.BoxSelection}
							/>
						</Question>
						<Question
							question="Wie viele Vorlagen verbrauchen Sie an einem Tag (24 Std.)?"
							style={{ marginLeft: "16px", ...styles.QuestionBox.Question }}
						>
							<Text style={styles.QuestionBox.TextField}>
								{formData?.templates_per_day}
							</Text>
						</Question>

						<Question
							question="4. Haben Sie eine normale Ejakulation nach der HoLEP?"
							style={styles.QuestionBox.Question}
						>
							<BoxSelection
								options={[false, true]}
								labels={["Nein", "Ja"]}
								selected={formData?.has_normal_ejaculation}
								style={styles.QuestionBox.BoxSelection}
							/>
						</Question>

						<Question
							question="5. Haben Sie anderweitige Beschwerden nach der HoLEP?"
							style={styles.QuestionBox.Question}
						>
							<BoxSelection
								options={[false, true]}
								labels={["Nein", "Ja"]}
								selected={formData?.has_other_complaints}
								style={styles.QuestionBox.BoxSelection}
							/>
						</Question>
						<Question
							question="Falls ja, welche?"
							style={{ marginLeft: "16px", ...styles.QuestionBox.Question }}
						>
							<Text style={styles.QuestionBox.TextField}>
								{formData?.other_complaints_description}
							</Text>
						</Question>

						<Question
							question="6. Nehmen Sie die Phosphodiesterasehemmer (z.B. Tadalafil) noch ein?"
							style={styles.QuestionBox.Question}
						>
							<BoxSelection
								options={[false, true]}
								labels={["Nein", "Ja"]}
								selected={formData?.taking_phosphodiesterase_inhibitors}
								style={styles.QuestionBox.BoxSelection}
							/>
						</Question>
						<Question
							question="Falls ja, welches Präparat und welche Dosierung?"
							style={{ marginLeft: "16px", ...styles.QuestionBox.Question }}
						>
							<Text style={styles.QuestionBox.TextField}>
								{formData?.phosphodiesterase_inhibitors_details}
							</Text>
						</Question>

						<Question
							question="7. Nehmen Sie nach der Behandlung Medikamente für die Prostata ein?"
							style={styles.QuestionBox.Question}
						>
							<BoxSelection
								options={[false, true]}
								labels={["Nein", "Ja"]}
								selected={formData?.taking_prostate_medication}
								style={styles.QuestionBox.BoxSelection}
							/>
						</Question>
						<Question
							question="Falls ja, welche?"
							style={{ marginLeft: "16px", ...styles.QuestionBox.Question }}
						>
							<Text style={styles.QuestionBox.TextField}>
								{formData?.prostate_medication_description}
							</Text>
						</Question>
						<Question
							question="Und seit wann?"
							style={{ marginLeft: "16px", ...styles.QuestionBox.Question }}
						>
							<Text style={styles.QuestionBox.TextField}>
								{formData?.prostate_medication_since_when}
							</Text>
						</Question>

						<Question
							question="8. Haben Sie nach der HoLEP noch eine Antibiotika-Therapie gemacht?"
							style={styles.QuestionBox.Question}
						>
							<BoxSelection
								options={[false, true]}
								labels={["Nein", "Ja"]}
								selected={formData?.had_antibiotic_therapy}
								style={styles.QuestionBox.BoxSelection}
							/>
						</Question>
						<Question
							question="Falls ja, wann?"
							style={{ marginLeft: "16px", ...styles.QuestionBox.Question }}
						>
							<Text
								style={{ ...styles.QuestionBox.TextField, marginRight: "5px" }}
							>
								{formData?.antibiotic_therapy_when}
							</Text>
							<Text>Dauer</Text>
							<Text
								style={{ ...styles.QuestionBox.TextField, marginLeft: "15px" }}
							>
								{formData?.antibiotic_therapy_duration}
							</Text>
						</Question>
					</View>
				</Paragraph>
			</BaseFormPage>

			<BaseFormPage>
				<View style={{ ...styles.QuestionBox, margin: "15px 0" }}>
					<Question
						question="9. Stehen Sie nach der HoLEP-Behandlung in der Nacht noch auf, um auf die Toilette zu gehen?"
						style={styles.QuestionBox.Question}
						sameRow={false}
					>
						<BoxSelection
							options={[
								"Nein",
								"Manchmal",
								"1 mal",
								"2 mal",
								"3 mal",
								"4 mal",
								"5 mal",
								"Oder öfter",
							]}
							labels={[
								<Text>Nein</Text>,
								<Text>Manchmal</Text>,
								<Text>1 mal</Text>,
								<Text>2 mal</Text>,
								<Text>3 mal</Text>,
								<Text>4 mal</Text>,
								<Text>5 mal</Text>,
								<Text>Oder öfter</Text>,
							]}
							selected={formData?.night_toilet_usage}
							style={{
								...styles.QuestionBox.BoxSelection,
								marginTop: "4px",
							}}
							useCustomLabels={true}
						/>
					</Question>

					<Question
						question="10. Nehmen Sie regelmäßig blutverdünnende Medikamente ein?"
						style={styles.QuestionBox.Question}
					>
						<BoxSelection
							options={[false, true]}
							labels={["Nein", "Ja"]}
							selected={formData?.taking_blood_thinners}
							style={styles.QuestionBox.BoxSelection}
						/>
					</Question>
					<Question
						question="Falls ja, welche? (z. B. ASS/Aspirin, Plavix, Xarelto)?"
						style={{ marginLeft: "16px", ...styles.QuestionBox.Question }}
					>
						<Text style={styles.QuestionBox.TextField}>
							{formData?.blood_thinners_description}
						</Text>
					</Question>
				</View>

				<Signature />
			</BaseFormPage>
		</Document>
	);
};
