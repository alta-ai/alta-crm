import React from "react";

import { View, Text, StyleSheet } from "@react-pdf/renderer";
import {
	Header,
	BoxSelection,
	Question,
	Paragraph,
	BaseFormPage,
	Signature,
	Notes,
	BoldText,
} from "./components";
import styling from "./styles";
import { useFormData } from "./formDataContext";
import { asDocument } from "./asDocument";
import { PatientInfoHeader } from "./components/PatientInfoHeader";
import { formatExamination } from "./utils";
import { CTForm as CTFormData } from "../types";

const styles = StyleSheet.create({
	Page: { fontSize: 10 },
	Heading: {
		fontSize: "16px",
		fontWeight: "bold",
	},
	SubHeading: {
		fontSize: "14px",
	},
	HeaderWrapper: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "flex-start",
		height: "45px",
	},
	QuestionBox: {
		...styling.QuestionBox,
		marginBottom: "5px",
		Question: {
			minHeight: "18px",
			marginBottom: "6px",
		},
		TextField: {
			padding: "0 10px",
			minHeight: "16px",
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
	WithBottomMargin: {
		marginBottom: "8px",
	},
	HeightAndWeight: {
		...styling.Center,
		justifyContent: "space-around",
		fontSize: 12,
		marginTop: "10px",
		fontWeight: "700",
	},
});

export const CTForm = ({ onlyForMen = false }) => {
	const { formData, patientData, appointmentData } = useFormData<CTFormData>();

	return (
		<>
			<BaseFormPage withFooter={true} withPatientInfo={!onlyForMen}>
				<Header>
					<View style={styles.HeaderWrapper}>
						<Text style={styles.Heading}>CT Aufklärungsbogen</Text>
						<Text style={styles.SubHeading}>
							{formatExamination({
								examination: appointmentData.examination.name,
								bodySide: appointmentData.body_side || undefined,
							})}
						</Text>
					</View>
				</Header>

				<PatientInfoHeader data={{ ...appointmentData, ...patientData }} />

				<View>
					<Text style={styles.WithBottomMargin}>
						Die Computertomographie (CT) ist ein diagnostisches Verfahren, bei
						dem die zu untersuchende Körperregion mit Verwendung von
						Röntgenstrahlen dargestellt wird. Die Strahlenbelastung wird dabei
						so gering wie möglich gehalten (low-dose-CT).
					</Text>
					<Text style={styles.WithBottomMargin}>
						Bei einigen Fragestellungen ist für die CT-Untersuchung die Gabe
						eines Kontrastmittels notwendig. Die Entscheidung über eine möglich
						notwendige Kontrastmittelgabe trifft der Arzt.
					</Text>
					<Text style={styles.WithBottomMargin}>
						Bei CT-Untersuchungen wird das Kontrastmittel über eine elektrische
						Pumpe in die Armvene gespritzt und/oder oral verabreicht. Dabei
						können vorübergehend ein Wärmegefühl und ein leichtes Unwohlsein
						auftreten, was nach kurzer Zeit von selbst verschwindet. Das
						Kontrastmittel wird eingesetzt zur Beurteilung der Organe und
						Gefäße.
					</Text>
					<Text style={styles.WithBottomMargin}>
						Röntgen-Kontrastmittel enthalten Jod. Manche Patienten sind dagegen
						allergisch und dürfen auf diese Weise nicht untersucht werden. Auch
						bei einer Schilddrüsenüberfunktion und/oder Einnahme von
						metforminhaltigen Medikamenten bei Diabetes mellitus darf Jod nicht
						gegeben werden.
					</Text>
					<Text>
						Während der Untersuchungszeit sind wir immer in Ihrer unmittelbaren
						Nähe. Bitte teilen Sie uns alles mit, was Sie beunruhigt,
						insbesondere, wenn Sie folgende Symptome verspüren: Nies- oder
						Juckreiz, Quaddelbildung, Husten, Atemschwierigkeiten, Schwindel,
						Übelkeit oder Schmerzen im Bereich der Injektionsnadel.
					</Text>
				</View>

				{!onlyForMen && (
					<View style={{ marginTop: "16px", ...styling.Emph }}>
						<Text>
							Sollte der Verdacht auf eine Schwangerschaft bestehen, bitten wir
							Sie, um sofortige Mitteilung, da Sie in diesem Fall NICHT im
							CT-Gerät untersucht werden dürfen bzw. sollten!
						</Text>
					</View>
				)}

				<Notes customStyling={{ marginTop: "16px", height: "300px" }} />
			</BaseFormPage>

			<BaseFormPage withFooter={true}>
				<Paragraph heading={"Relevante Informationen für die Untersuchung"}>
					<View style={styles.QuestionBox}>
						<Question
							question="1. Sind Sie früher schon einmal mit Röntgen-Kontrastmittel untersucht worden?"
							style={styles.QuestionBox.Question}
						>
							<BoxSelection
								options={[true, false]}
								labels={["Ja", "Nein"]}
								selected={formData?.had_previous_exam_with_contrast_media}
								style={styles.QuestionBox.BoxSelection}
							/>
						</Question>

						<Question
							question={
								<Text style={{ textIndent: -15 }}>
									2. Haben Sie nach{" "}
									<Text style={{ fontWeight: 700 }}>
										Röntgen-Kontrastmittelgabe Nebenwirkungen
									</Text>{" "}
									verspürt?
								</Text>
							}
							style={styles.QuestionBox.Question}
						>
							<BoxSelection
								options={[true, false]}
								labels={["Ja", "Nein"]}
								selected={formData?.had_side_effects_from_contrast_media}
								style={styles.QuestionBox.BoxSelection}
							/>
						</Question>
						<Text
							style={{
								marginLeft: "15px",
								marginTop: "-5px",
								marginBottom: "8px",
								maxWidth: "65%",
							}}
						>
							(z.B. Übelkeit, Hautrötung, Jucken, Niesreiz, Luftnot,
							Kreislaufbeschwerden, Bewusstlosigkeit)
						</Text>

						<Question
							question={
								<Text style={{ textIndent: -15 }}>
									3. Sind bei Ihnen{" "}
									<Text style={{ fontWeight: 700 }}>Allergien</Text> bekannt?
								</Text>
							}
							style={styles.QuestionBox.Question}
						>
							<BoxSelection
								options={[true, false]}
								labels={["Ja", "Nein"]}
								selected={formData?.has_allergies}
								style={styles.QuestionBox.BoxSelection}
							/>
						</Question>
						<Question
							question={
								<Text style={{ textIndent: -15 }}>
									Falls ja, <Text style={{ fontWeight: 700 }}>welche</Text>?
								</Text>
							}
							style={{ marginLeft: "16px", ...styles.QuestionBox.Question }}
						>
							<Text style={styles.QuestionBox.TextField}>
								{formData?.which_allergies}
							</Text>
						</Question>

						<Question
							question="4. Leiden Sie unter Asthma?"
							style={styles.QuestionBox.Question}
						>
							<BoxSelection
								options={[true, false]}
								labels={["Ja", "Nein"]}
								selected={formData?.has_asthma}
								style={styles.QuestionBox.BoxSelection}
							/>
						</Question>

						<Question
							question={
								<Text style={{ textIndent: -15 }}>
									5. Gibt es{" "}
									<Text style={{ fontWeight: 700 }}>Voruntersuchungen</Text> des
									heute zu{" "}
									<Text style={{ fontWeight: 700 }}>
										untersuchenden Körperteils
									</Text>
									?
								</Text>
							}
							style={styles.QuestionBox.Question}
						>
							<BoxSelection
								options={[true, false]}
								labels={["Ja", "Nein"]}
								selected={formData?.has_preliminary_examinations}
								style={styles.QuestionBox.BoxSelection}
							/>
						</Question>
						<Question
							question={
								<Text style={{ textIndent: -15 }}>
									Falls ja, <Text style={{ fontWeight: 700 }}>welche</Text>?
								</Text>
							}
							style={{ marginLeft: "16px", ...styles.QuestionBox.Question }}
						>
							<Text
								style={{ ...styles.QuestionBox.TextField, marginRight: "5px" }}
							>
								{formData?.preliminary_examinations_details}
							</Text>
							<BoldText text={"und wann?"} />
							<Text
								style={{ ...styles.QuestionBox.TextField, marginLeft: "15px" }}
							>
								{formData?.preliminary_examinations_date}
							</Text>
						</Question>
						<Text
							style={{
								marginLeft: "15px",
								marginTop: "-5px",
								marginBottom: "8px",
							}}
						>
							(z.B. Röntgen, CT, MR, Nuklearmedizin, PET)
						</Text>

						<Question
							question={
								<Text style={{ textIndent: -15 }}>
									6. Ist bei Ihnen eine{" "}
									<Text style={{ fontWeight: 700 }}>Überfunktion</Text> der{" "}
									<Text style={{ fontWeight: 700 }}>Schilddrüse</Text> bekannt?
								</Text>
							}
							style={styles.QuestionBox.Question}
						>
							<BoxSelection
								options={[true, false]}
								labels={["Ja", "Nein"]}
								selected={formData?.has_known_hyperthyroidism}
								style={styles.QuestionBox.BoxSelection}
							/>
						</Question>

						<Question
							question={
								<Text style={{ textIndent: -15 }}>
									7. Nehmen Sie{" "}
									<Text style={{ fontWeight: 700 }}>
										Schilddrüsenmedikamente
									</Text>{" "}
									?
								</Text>
							}
							style={styles.QuestionBox.Question}
						>
							<BoxSelection
								options={[true, false]}
								labels={["Ja", "Nein"]}
								selected={formData?.taking_medication_for_hyperthyroidism}
								style={styles.QuestionBox.BoxSelection}
							/>
						</Question>
						<Question
							question={
								<Text style={{ textIndent: -15 }}>
									Falls ja, <Text style={{ fontWeight: 700 }}>welche</Text>?
								</Text>
							}
							style={{ marginLeft: "16px", ...styles.QuestionBox.Question }}
						>
							<Text style={styles.QuestionBox.TextField}>
								{formData?.which_hyperthyroidism_medication}
							</Text>
						</Question>

						<Question
							question={
								<Text style={{ textIndent: -15 }}>
									8. Wurden Sie an der{" "}
									<Text style={{ fontWeight: 700 }}>Schilddrüse</Text> operiert
									oder hatten Sie eine
									<Text style={{ fontWeight: 700 }}>Radiojodtherapie</Text>?
								</Text>
							}
							style={styles.QuestionBox.Question}
						>
							<BoxSelection
								options={[true, false]}
								labels={["Ja", "Nein"]}
								selected={
									formData?.had_thyroid_surgery_or_radioactive_iodine_therapy
								}
								style={styles.QuestionBox.BoxSelection}
							/>
						</Question>

						<Question
							question={
								<Text style={{ textIndent: -15 }}>
									9. Besteht bei Ihnen eine Zuckerkrankheit{" "}
									<Text style={{ fontWeight: 700 }}>(Diabetes mellitus)</Text>?
								</Text>
							}
							style={styles.QuestionBox.Question}
						>
							<BoxSelection
								options={[true, false]}
								labels={["Ja", "Nein"]}
								selected={formData?.has_diabetes}
								style={styles.QuestionBox.BoxSelection}
							/>
						</Question>

						<Question
							question={
								<Text style={{ textIndent: -15 }}>
									10. Nehmen Sie{" "}
									<Text style={{ fontWeight: 700 }}>
										Metformin oder ähnliche Medikamente
									</Text>{" "}
									ein?
								</Text>
							}
							style={styles.QuestionBox.Question}
						>
							<BoxSelection
								options={[true, false]}
								labels={["Ja", "Nein"]}
								selected={formData?.taking_metformin_or_similar}
								style={styles.QuestionBox.BoxSelection}
							/>
						</Question>

						<Question
							question={
								<Text style={{ textIndent: -15 }}>
									11. Ist bei Ihnen eine{" "}
									<Text style={{ fontWeight: 700 }}>
										Einschränkung der Nierenfunktion
									</Text>{" "}
									bekannt?
								</Text>
							}
							style={styles.QuestionBox.Question}
						>
							<BoxSelection
								options={[true, false]}
								labels={["Ja", "Nein"]}
								selected={formData?.has_renal_impairment}
								style={styles.QuestionBox.BoxSelection}
							/>
						</Question>

						<Question
							question={
								<Text style={{ textIndent: -15 }}>
									12. Nehmen Sie regelmäßig{" "}
									<Text style={{ fontWeight: 700 }}>
										blutverdünnende Medikamente
									</Text>{" "}
									ein?
								</Text>
							}
							style={styles.QuestionBox.Question}
						>
							<BoxSelection
								options={[true, false]}
								labels={["Ja", "Nein"]}
								selected={formData?.taking_blood_thinners}
								style={styles.QuestionBox.BoxSelection}
							/>
						</Question>
						<Question
							question={
								<Text style={{ textIndent: -15 }}>
									Falls ja, <Text style={{ fontWeight: 700 }}>welche</Text> (z.
									B. ASS/Aspirin, Plavix, Xarelto)?
								</Text>
							}
							style={{ marginLeft: "16px", ...styles.QuestionBox.Question }}
						>
							<Text style={styles.QuestionBox.TextField}>
								{formData?.blood_thinners_details}
							</Text>
						</Question>

						<Question
							question={
								<Text style={{ textIndent: -15 }}>
									13. Ist bei Ihnen eine{" "}
									<Text style={{ fontWeight: 700 }}>Infektionskrankheit</Text>{" "}
									bekannt?
								</Text>
							}
							style={styles.QuestionBox.Question}
						>
							<BoxSelection
								options={[true, false]}
								labels={["Ja", "Nein"]}
								selected={formData?.has_infectious_disease}
								style={styles.QuestionBox.BoxSelection}
							/>
						</Question>
						<Question
							question={
								<Text style={{ textIndent: -15 }}>
									Falls ja, <Text style={{ fontWeight: 700 }}>welche</Text> (z.
									B. Hepatitis, HIV, etc.)?
								</Text>
							}
							style={{ marginLeft: "16px", ...styles.QuestionBox.Question }}
						>
							<Text style={styles.QuestionBox.TextField}>
								{formData?.infectious_disease_details}
							</Text>
						</Question>

						<View style={{ ...styling.Row, ...styles.HeightAndWeight }}>
							<View style={styling.Row}>
								<BoldText text={"Körpergröße:"} />
								<Text
									style={{
										...styles.QuestionBox.TextField,
										flex: "auto",
										width: "50px",
										textAlign: "center",
									}}
								>
									{formData?.height}
								</Text>
								<Text>cm</Text>
							</View>
							<View style={styling.Row}>
								<BoldText text={"Körpergewicht:"} />
								<Text
									style={{
										...styles.QuestionBox.TextField,
										flex: "auto",
										width: "50px",
										textAlign: "center",
									}}
								>
									{formData?.weight}
								</Text>
								<Text>kg</Text>
							</View>
						</View>
					</View>
				</Paragraph>

				{!onlyForMen && (
					<View style={{ ...styles.QuestionBox, marginBottom: "10px" }}>
						<Paragraph heading={"Für Frauen"}>
							<Question
								question={
									<Text style={{ textIndent: -15 }}>
										Sind Sie{" "}
										<Text style={{ fontWeight: 700 }}>aktuell schwanger</Text>?
									</Text>
								}
								style={{ ...styles.QuestionBox.Question }}
							>
								<BoxSelection
									options={[true, false]}
									labels={["Ja", "Nein"]}
									selected={formData?.pregnant}
									style={styles.QuestionBox.BoxSelection}
								/>
							</Question>

							<Question
								question={
									<Text style={{ textIndent: -15 }}>
										Wann war Ihre{" "}
										<Text style={{ fontWeight: 700 }}>letzte Regelblutung</Text>
										?
									</Text>
								}
								style={styles.QuestionBox.Question}
							>
								<Text style={styles.QuestionBox.TextField}>
									{formData?.last_menstruation}
								</Text>
							</Question>

							<Question
								question={
									<Text style={{ textIndent: -15 }}>
										<Text style={{ textIndent: -15, fontWeight: 700 }}>
											Stillen
										</Text>{" "}
										Sie zurzeit?
									</Text>
								}
								style={{ ...styles.QuestionBox.Question, marginBottom: 0 }}
							>
								<BoxSelection
									options={[true, false]}
									labels={["Ja", "Nein"]}
									selected={formData?.breastfeeding}
									style={styles.QuestionBox.BoxSelection}
								/>
							</Question>
						</Paragraph>
					</View>
				)}

				<Text style={{ fontWeight: "bold" }}>
					Den Aufklärungsbogen habe ich gelesen und verstanden.
				</Text>

				<Signature />
			</BaseFormPage>
		</>
	);
};

export default asDocument(CTForm);
