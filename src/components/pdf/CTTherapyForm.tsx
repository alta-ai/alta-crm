import React from "react";

import { Document, View, Text, StyleSheet } from "@react-pdf/renderer";
import {
	Header,
	BoxSelection,
	Question,
	Paragraph,
	BaseFormPage,
	BoldText,
	Signature,
	SignatureDoc,
} from "./components";
import styling from "./styles";
import { useFormData } from "./contexts/formDataContext";
import { PatientInfoHeader } from "./components/PatientInfoHeader";
import { FormProps, CTTherapyForm as CTTheapyFormData } from "../types";

const styles = StyleSheet.create({
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
		fontSize: 12,
		marginTop: "10px",
		fontWeight: "700",
	},
});

export const CTTherapyForm: React.FC<FormProps> = (props) => {
	const { formData, patientData, appointmentData } =
		useFormData<CTTheapyFormData>();

	return (
		<Document onRender={props?.onRender}>
			<BaseFormPage withFooter={true}>
				<Header>
					<View style={styles.HeaderWrapper}>
						<Text style={styles.Heading}>CT Therapie Aufklärungsbogen</Text>
					</View>
				</Header>

				<PatientInfoHeader data={{ ...appointmentData, ...patientData }} />

				<Paragraph
					heading={"Informationen zur Untersuchung"}
					customStyle={{ fontSize: 10.5, marginTop: "8px" }}
				>
					<Text style={styles.WithSmallBottomMargin}>
						hiermit wollen wir Ihnen Informationen zu den Wirbelsäulen-Therapien
						geben.
					</Text>
					<Text style={styles.WithSmallBottomMargin}>
						Die CT-gesteuerte Therapie ist ein seit mehreren Jahren etabliertes
						Behandlungsverfahren. Zielgruppe sind Patienten, bei denen
						degenerative Veränderungen der Wirbelsäule bzw. ein
						Bandscheibenvorfall diagnostiziert wurde. Unter
						computertomographischer Kontrolle wird eine dünne Nadel an das
						Wirbelgelenk bzw. in den Wirbelkanal vorgeschoben und das
						entsprechende Medikament injiziert. So kann eine hohe örtliche
						Wirkdosis am Nerv, der Nervenwurzel sowie der Gelenkskapsel erreicht
						werden. Diese Art von Behandlung wird dann im Abstand von 2-4
						Wochen, ggf. auch in längeren Zeitabschnitten, mehrfach wiederholt
						(üblicherweise 4-6 Termine). Häufig ist eine mehrfache Behandlung
						erforderlich bis eine ausreichende Beschwerdelinderung erreicht ist.
					</Text>
					<Text
						style={{ ...styles.WithSmallBottomMargin, ...styles.WithBorder }}
					>
						Der Einsatz der Computertomographie bei dieser Methode bedeutet,
						neben erhöhter Sicherheit, die Gewährleistung einer hohen Präzision
						bei jeder Untersuchung. Der exakte Stichwinkel, ebenso die
						Punktionstiefe, werden im CT-Schnitt am Monitor ermittelt.
						Selbstverständlich liegt die dabei verwendete Röntgenstrahlung im
						Niedrigdosisbereich. Trotzdem muss bei Mehrfachtherapien auf die
						Möglichkeit von Entstehen von bösartigen Erkrankungen wie z. B.
						Lymphom hingewiesen werden, wobei die Wahrscheinlichkeit sehr gering
						ist. Die zur Therapie eingesetzte Nadel bzw. das Kontrastmittel wird
						exakt im Bild lokalisiert und kontrolliert; dann werden die
						Medikamente injiziert.
					</Text>
					<Text style={styles.WithSmallBottomMargin}>
						Zur Therapie werden verschiedene Medikamente eingesetzt. Zum einen
						werden kurz und lang wirksame Lokalanästhetika (Mittel zur örtlichen
						Betäubung), zum anderen ein Kortisonpräparat (Volon A) und eine
						geringe Menge von Kontrastmittel zur Dokumentation der Verteilung
						der Medikamente verabreicht. Da all diese Medikamente örtlich
						wirksam sind, ist nur eine geringe Gesamtdosis erforderlich. Die
						Behandlung selbst ist wegen der örtlichen Betäubung nahezu
						schmerzfrei.
					</Text>
					<Text style={styles.WithSmallBottomMargin}>
						Bei 80% unserer Patienten kommt es unter dieser Behandlung zu einer
						deutlichen Verbesserung der Beschwerden, bis hin zur
						Beschwerdefreiheit. Diese Wirkung hält nicht nur während der
						Therapiedauer an, sondern zeigt meistens eine anhaltende Wirkung
						auch über längere Zeit nach der Therapie. Nach der Injektion können
						ein kurzfristiges Taubheitsgefühl und eine Schwäche im Bein bzw. Arm
						auftreten. Dies ist eine dosisabhängige Wirkung der örtlichen
						Betäubung und verschwindet normalerweise nach kurzer Zeit. Bei der
						Notwendigkeit einer Schmerzmittelapplikation in den Rückenmarkskanal
						sollten Sie selbst nicht mit dem Auto fahren, weil die Reaktionszeit
						verlängert werden kann.
					</Text>
					<Text style={styles.WithSmallBottomMargin}>
						Durch Reizung der Meningen (Hirnhäute) können vereinzelt
						vorübergehende Kopfschmerzen auftreten. Bei der Injektion in den
						Wirbelkanal kann es zur Punktion des Duralsackes (Rückenmarkshaut)
						kommen, jedoch durch die Kontrolle der Nadelspitze ist dieses sofort
						zu korrigieren. Durch die Punktion selbst ist es möglich, dass
						kleinere Blutungen im Stichkanal blaue Flecken der Haut verursachen
						können. Grundsätzlich kann auch eine Entzündung durch die Punktion
						ausgelöst werden.
					</Text>
					<Text style={styles.WithSmallBottomMargin}>
						<BoldText
							text={
								"Nach der Therapie ist eine Wartezeit von mindestens 30 Minuten zur Beobachtung einzuhalten. "
							}
						/>
						Örtliche Betäubung und Kontrastmittel können zu allergischen
						Reaktionen führen. In sehr seltenen Fällen sind dabei
						Schockreaktionen möglich, die notfallmäßig therapiert werden
						müssten. Bei der niedrigen Dosis des Kortisonpräparates kommt es
						extrem selten zu dauerhaften Nebenwirkungen.
					</Text>
					<Text>
						Als mögliche <BoldText text={"Nebenwirkungen"} /> können auftreten:
					</Text>
					<Text style={styles.WithSmallBottomMargin}>
						Wadenkrämpfe, Gewichtszunahme, Blutzuckeranstieg, Anstieg des
						Blutdrucks, Akne, Rötung des Gesichtes, vermehrte Brüchigkeit
						kleiner Gefäße mit Auftreten von blauen Flecken und Zyklusstörungen
						bei Frauen. Bei Frauen in der Menopause ist die physiologische
						Osteoporose zu berücksichtigen. Eine langanhaltende Kortisontherapie
						könnte zu einer zusätzlichen Verminderung der Knochendichte führen.
					</Text>
					<Text style={{ ...styles.WithBottomMargin, marginTop: "15px" }}>
						Bei Menschen die zu Magen- oder Zwölffingerdarmgeschwüren neigen,
						kann es in seltenen Fällen zum Wiederauftreten von diesen Geschwüren
						kommen. Aus diesem Grund sollte eine entsprechende Therapie zum
						Schutz der Magenschleimhaut mit Säureblockern eingeleitet werden.
						Sollten Sie eine Lungenembolie durchgemacht haben, sprechen Sie
						bitte mit uns darüber, da in Ausnahmefällen die Bildung von
						Thrombosen nach Kortison begünstigt wird. Bei Augenkrankheiten wie
						z. B. Glaukom (grüner Star) kann der Augeninnendruck zunehmen;
						dieser muss vom Augenarzt kontrolliert werden.
					</Text>
				</Paragraph>
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
							question={
								<Text style={{ textIndent: -15 }}>
									4. Ist bei Ihnen eine{" "}
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
									5. Besteht bei Ihnen{" "}
									<Text style={{ fontWeight: 700 }}>Osteoporose</Text>?
								</Text>
							}
							style={styles.QuestionBox.Question}
						>
							<BoxSelection
								options={[true, false]}
								labels={["Ja", "Nein"]}
								selected={formData?.has_osteoporosis}
								style={styles.QuestionBox.BoxSelection}
							/>
						</Question>

						<Question
							question={
								<Text style={{ textIndent: -15 }}>
									6. Besteht bei Ihnen eine{" "}
									<Text style={{ fontWeight: 700 }}>Hepatitis</Text>?
								</Text>
							}
							style={styles.QuestionBox.Question}
						>
							<BoxSelection
								options={[true, false]}
								labels={["Ja", "Nein"]}
								selected={formData?.has_hepatitis}
								style={styles.QuestionBox.BoxSelection}
							/>
						</Question>

						<Question
							question={
								<Text style={{ textIndent: -15 }}>
									7. Besteht bei Ihnen eine Zuckerkrankheit{" "}
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
									8. Besteht bei Ihnen{" "}
									<Text style={{ fontWeight: 700 }}>Bluthochdruck</Text>?
								</Text>
							}
							style={styles.QuestionBox.Question}
						>
							<BoxSelection
								options={[true, false]}
								labels={["Ja", "Nein"]}
								selected={formData?.has_high_blood_pressure}
								style={styles.QuestionBox.BoxSelection}
							/>
						</Question>

						<Question
							question={
								<Text style={{ textIndent: -15 }}>
									9. Besteht bei Ihnen ein{" "}
									<Text style={{ fontWeight: 700 }}>
										erhöhter Augeninnendruck
									</Text>{" "}
									(Glaukom)?
								</Text>
							}
							style={styles.QuestionBox.Question}
						>
							<BoxSelection
								options={[true, false]}
								labels={["Ja", "Nein"]}
								selected={formData?.has_increased_intraocular_pressure}
								style={styles.QuestionBox.BoxSelection}
							/>
						</Question>

						<Question
							question={
								<Text style={{ textIndent: -15 }}>
									10. Ist in Ihrer Vorgeschichte ein{" "}
									<Text style={{ fontWeight: 700 }}>
										Magen- oder Zwölffingerdarmgeschwür
									</Text>{" "}
									bekannt?
								</Text>
							}
							style={styles.QuestionBox.Question}
						>
							<BoxSelection
								options={[true, false]}
								labels={["Ja", "Nein"]}
								selected={formData?.has_history_of_gastric_or_duodenal_ulcers}
								style={styles.QuestionBox.BoxSelection}
							/>
						</Question>

						<Question
							question={
								<Text style={{ textIndent: -15 }}>
									11. Ist in Ihrer Vorgeschichte eine{" "}
									<Text style={{ fontWeight: 700 }}>
										Thrombose oder Lungenembolie
									</Text>{" "}
									bekannt?
								</Text>
							}
							style={styles.QuestionBox.Question}
						>
							<BoxSelection
								options={[true, false]}
								labels={["Ja", "Nein"]}
								selected={
									formData?.has_history_of_thrombosis_or_pulmonary_embolism
								}
								style={styles.QuestionBox.BoxSelection}
							/>
						</Question>

						<Question
							question={
								<Text style={{ textIndent: -15 }}>
									12. Nehmen Sie regelmäßig{" "}
									<Text style={{ fontWeight: 700 }}>
										blutgerinnungshemmenden Medikamente
									</Text>{" "}
									ein?
								</Text>
							}
							style={styles.QuestionBox.Question}
						>
							<BoxSelection
								options={[true, false]}
								labels={["Ja", "Nein"]}
								selected={formData?.treated_with_anticoagulants}
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
								{formData?.which_anticoagulants}
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

				<View style={{ ...styles.QuestionBox }}>
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
									<Text style={{ fontWeight: 700 }}>letzte Regelblutung</Text>?
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

				<Text style={{ marginTop: "8px" }}>
					Über die Wirkungen sowie Komplikationen der vorstehenden Therapieform
					bin ich aufgeklärt. Ebenso willige ich ein, dass mir Cortison für die
					Therapiebehandlung injiziert wird. Mir ist auch bewusst, dass Cortison
					zu den Auflebemitteln gehört. Durch meine Unterschrift gebe ich mein
					Einverständnis.
				</Text>

				<SignatureDoc />
				<Signature />
			</BaseFormPage>
		</Document>
	);
};
