import { View, Text, StyleSheet, Document } from "@react-pdf/renderer";
import {
	Header,
	BoxSelection,
	Question,
	Paragraph,
	BaseFormPage,
	Signature,
	Notes,
	BoldText,
	SignatureDoc,
	PatientInfoHeader,
} from "./components";
import styling from "./styles";
import { useFormData } from "./formDataContext";
import { asDocument } from "./asDocument";
import { formatExamination } from "./utils";
import { MRIForm as MRIFormData } from "../types";

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
	SubHeading: {
		fontSize: "14px",
	},
	View: {
		fontSize: 8.5,
		Heading: {
			fontSize: 9,
			marginBottom: "1px",
		},
	},
	QuestionBox: {
		...styling.QuestionBox,
		marginBottom: "5px",
		Question: {
			minHeight: "14px",
			marginBottom: "5px",
		},
		TextField: {
			padding: "0 10px",
			flex: 1,
			minHeight: "12px",
			borderBottom: "1px solid gray",
			paddingBottom: "2px",
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
	WithVerySmallBottomMargin: {
		marginBottom: "3px",
	},
	HeightAndWeight: {
		...styling.Center,
		justifyContent: "space-around",
		fontSize: 12,
		marginTop: "10px",
	},
});

export const MRIForm = ({ onlyForMen = false }) => {
	const { formData, appointmentData, patientData } = useFormData<MRIFormData>();

	return (
		<>
			<BaseFormPage withFooter={false} customStyle={styles.Page}>
				<Header>
					<View style={styles.HeaderWrapper}>
						<Text style={styles.Heading}>MRT Aufklärungsbogen</Text>
						<Text style={styles.SubHeading}>
							{formatExamination({
								examination: appointmentData.examination.name,
								bodySide: appointmentData.body_side || undefined,
							})}
						</Text>
					</View>
				</Header>

				<PatientInfoHeader data={{ ...appointmentData, ...patientData }} />

				<Paragraph
					heading={"Untersuchungsablauf"}
					customStyle={{ ...styles.WithVerySmallBottomMargin, ...styles.View }}
				>
					<Text>
						Die Kernspintomographie oder auch Magnet-Resonanz-Tomographie (kurz
						MRT) ist ein Untersuchungsverfahren, das mit Hilfe von einem starken
						Magnetfeld und Hochfrequenzwellen Schnittbilder erzeugt. Dabei wird
						die zu untersuchende Region in die Mitte der MRT-Röhre positioniert,
						wobei bei vielen Untersuchungen der Kopf außerhalb liegt. Die Länge
						der Untersuchung variiert, je nach Fragestellung und Körperregion,
						zwischen 20-60 Minuten. In seltenen Fällen kann das auch eine Stunde
						oder länger dauern. Das MRT-Team wird Sie darüber genau informieren.
						Außerdem wird es, aufgrund von schnell wechselnden Magnetfeldern,
						sehr laut während der Untersuchung. Damit Sie Ihr Gehör dabei nicht
						schädigen, erhalten Sie von den MRT- Mitarbeiter*innen einen
						Lärmschutz in Form von Kopfhörern und/oder Ohrstöpsel. Sobald es
						laut wird, ist es wichtig, dass Sie den gesamten Körper ruhig liegen
						lassen. Jede Bewegung kann zu verwackelten Bildern führen, was die
						Auswertung erschwert. Sollten Sie weitere Fragen zum
						Untersuchungsablauf haben, können Sie sich gern an die
						MRT-Mitarbeiter*innen wenden!
					</Text>
				</Paragraph>

				<Paragraph
					heading={
						"Was ist zu beachten, wenn man sich in die Nähe des Magnetfeldes begibt?"
					}
					customStyle={{ ...styles.View, ...styles.WithVerySmallBottomMargin }}
				>
					<View style={{ margin: "0 0 3px", ...styling.Emph }}>
						<Text>
							Sollten Sie Träger eines Herzschrittmachers, eines Defibrillators,
							einer künstlichen Herzklappe, einer Insulinpumpe oder sonstiger
							elektrischer Implantate sein, bitten wir Sie, um sofortige
							Mitteilung, da Sie in diesen Fällen NICHT im MRT-Gerät untersucht
							werden dürfen!
						</Text>
					</View>

					<Text>
						Um Schäden und Verletzungen aufgrund des starken Magnetfeldes zu
						vermeiden, dürfen in den Untersuchungsraum keine Metallgegenstände
						oder elektronischen Geräte eingebracht werden (z.B. Handy,
						Hörgeräte, Kreditkarten, Kleingeld, Brieftasche, Schlüssel,
						Feuerzeug, Uhr, Schmuck, Haarklammern, Brille, herausnehmbarer
						Zahnersatz, Gürtel, Rollstühle, Rollatoren). Welche Kleidungsstücke
						Sie speziell für Ihre Untersuchung ausziehen sollten, teilt Ihnen
						unser Personal individuell mit. Für bestimmte Untersuchungen ist es
						notwendig, den BH (metallische Bügel und Ösen) oder auch die Hose
						(Reißverschluss und Knöpfe) abzulegen.
					</Text>
				</Paragraph>

				<Paragraph
					heading={"Tätowierungen und Permanent-Make-up"}
					customStyle={{ ...styles.View, ...styles.WithVerySmallBottomMargin }}
				>
					<Text>
						Bestimmte Tätowierungen und Permanent-Make-up mit eisenhaltigen
						Farben können sich während der MRT-Untersuchung verändern. Die
						metallhaltigen Farbpigmente können sich wie elektrische Leiter
						verhalten und es kann in diesem Bereich zu unangenehmen Erhitzungen,
						Reizungen der Haut und schlimmstenfalls zu Verbrennungen kommen.
						Magnetische Eyeliner, die zum Applizieren von magnetischen Wimpern
						aufgetragen werden, können sich ebenfalls erhitzen und müssen vor
						der MRT- Untersuchung restlos entfernt werden. Magnetische
						Wimpernpaare müssen abgelegt werden.
					</Text>
				</Paragraph>

				<Paragraph
					heading={"Spirale (Intrauterinpessar) und Diaphragma"}
					customStyle={{ ...styles.View, ...styles.WithVerySmallBottomMargin }}
				>
					<Text>
						Da es zu einer Lageveränderung während der MRT kommen kann, sollte
						Ihr Gynäkologe nach einer MRT-Untersuchung den korrekten Sitz der
						Spirale überprüfen.
					</Text>
				</Paragraph>

				<Paragraph
					heading={"Kontrastmittel"}
					customStyle={{ ...styles.View, ...styles.WithVerySmallBottomMargin }}
				>
					<Text>
						Bei bestimmten Fragestellungen ist die Gabe eines Kontrastmittels
						(KM) zwingend erforderlich, um eine eindeutige Diagnose stellen zu
						können. Das KM wird in den meisten Fällen während der Untersuchung
						in die Armvene injiziert. Wir verwenden ein gadoliniumhaltiges
						Kontrastmittel (MRT-Kontrastmittel), welches in der Regel gut
						verträglich ist. In seltenen Fällen kann es zu allergischen
						Reaktionen kommen (z.B. Kopfschmerzen, Übelkeit, Schwindel oder
						Hautirritationen an der Einstichstelle). Sehr selten treten
						Hautrötungen und Ausschlag auf. Extrem selten wurden
						Atembeschwerden, Schwellung des Gesichts sowie des Mund-, Rachen-
						und Halsbereiches und Ödeme der Augenlider beschrieben.
					</Text>
					<Text>
						Da das KM über die Nieren wieder ausgeschieden wird, kann es bei
						einer eingeschränkten Nierenfunktion (also auch bei Dialysepflicht
						sowie nach einer Lebertransplantation) zu einer nephrogenen
						systemischen Fibrose kommen. Bitte teilen Sie uns mit, wenn bei
						Ihnen der Verdacht auf eine eingeschränkte Nierenfunktion besteht.
						Um die Ausscheidung des Kontrastmittels zu unterstützen, empfiehlt
						es sich nach der Untersuchung viel zu trinken. Frauen, die stillen
						und ein KM erhalten haben, sollten für ca. 24 Stunden mit dem
						Stillen aussetzen, da gadoliniumhaltige KM in sehr geringen Mengen
						in die Muttermilch ausgeschieden werden. Im günstigsten Fall sollte
						Milch vor der MRT-Untersuchung abgepumpt werden.
					</Text>
					<Text>
						Selten kann es während der Kontrastmittelinfusion in die Vene zum
						Kontrastmittelaustritt an der Injektionsstelle in den Arm kommen
						(Paravasat). Dies führt zu einer schmerzhaften Schwellung, die
						manchmal auch über Tage anhalten kann und extrem selten am Arm
						Gefäß- und Nervenverletzungen, Gewebeschädigungen oder Infektionen
						verursachen kann. Falls Sie während der Kontrastmittelgabe Schmerzen
						und eine Schwellung am Arm verspüren, verständigen Sie umgehend die
						Mitarbeiter*innen.
					</Text>
				</Paragraph>

				<Paragraph
					heading={"Einverständniserklärung zur Sedierung/ Medikamente"}
					customStyle={{ ...styles.View, ...styles.WithVerySmallBottomMargin }}
				>
					<Text>
						Für den Fall, dass Sie eine leichte Sedierung aufgrund einer
						Klaustrophobie erhalten haben, ist Ihr Reaktionsvermögen
						beeinträchtigt. So können unerwünschte Nebenwirkungen wie
						Sehstörungen, Übelkeit oder Schwindel hervorgerufen werden Sie sind
						für 24 Stunden nur eingeschränkt straßenverkehrstauglich. Innerhalb
						dieser Zeit dürfen Sie nicht selbst Auto oder Rad fahren. Sie müssen
						deshalb in Begleitung kommen. Ebenso sollten Sie auf das Führen
						gefährlicher Maschinen verzichten. Des Weiteren vermeiden Sie
						Alkohol, da sich die Wirkung von Beruhigungsmitteln auf
						unvorhersehbare Weise verändern bzw. verstärken kann.
					</Text>
				</Paragraph>

				<Paragraph
					heading={
						"Für MRT-Untersuchungen im Bereich des Abdomens bis unteres Beckens: Einverständniserklärung Buscopan"
					}
					customStyle={{ ...styles.View, ...styles.WithVerySmallBottomMargin }}
				>
					<Text>
						Für die MRT-Untersuchung erhalten Sie ein Medikament, das die
						Darmtätigkeit kurzzeitig reduziert, um die Bildqualität zu
						verbessern. Dieses Medikament heißt Buscopan© (Butylscopolamid) und
						wird vor der Untersuchung in die Vene gespritzt. Bitte beachten Sie:
						Buscopan© wirkt hemmend auf bestimmte Muskelfasern, u.a. auf die
						Augenmuskulatur. Dadurch kann die Sehschärfe kurzzeitig
						beeinträchtigt werden. Sollte dies der Fall sein, bitten wir Sie bis
						zur Normalisierung Ihrer Sehschärfe in unseren Praxisräumen zu
						verweilen, bevor Sie aktiv am Straßenverkehr teilnehmen.
					</Text>
				</Paragraph>

				<Notes
					altText="Ärztliche Notizen:"
					customStyling={{ height: "50px", fontSize: "9px" }}
				/>
				<SignatureDoc customStyle={{ marginTop: "3px", fontSize: "9px" }} />
			</BaseFormPage>

			<BaseFormPage withFooter={false} customStyle={styles.Page}>
				<Paragraph
					heading={
						"Informationen zur Untersuchung: " +
						formatExamination({
							examination: appointmentData.examination.name,
							bodySide: appointmentData.body_side || undefined,
						})
					}
				>
					<View style={{ ...styles.QuestionBox, fontSize: "11" }}>
						<Question
							question={
								<Text style={{ textIndent: -15 }}>
									1. Tragen Sie einen{" "}
									<Text style={{ fontWeight: 700 }}>
										Herzschrittmacher, elektrische Implantate (z. B. ICD, CRT)
										oder eine künstliche Metallherzklappe
									</Text>
									?
								</Text>
							}
							style={styles.QuestionBox.Question}
						>
							<BoxSelection
								options={[true, false]}
								labels={["Ja", "Nein"]}
								selected={formData?.wearing_interfearing_devices}
								style={styles.QuestionBox.BoxSelection}
							/>
						</Question>
						<Question
							question="Falls ja, was?"
							style={{ marginLeft: "16px", ...styles.QuestionBox.Question }}
						>
							<Text style={styles.QuestionBox.TextField}>
								{formData?.interfearing_devices}
							</Text>
						</Question>

						<Question
							question={
								<Text style={{ textIndent: -15 }}>
									2. Wurden Sie schon{" "}
									<Text style={{ fontWeight: 700 }}>
										einmal am Gehirn oder Herzen operiert
									</Text>
									?
								</Text>
							}
							style={styles.QuestionBox.Question}
						>
							<BoxSelection
								options={[true, false]}
								labels={["Ja", "Nein"]}
								selected={formData?.had_brain_or_heart_op}
								style={styles.QuestionBox.BoxSelection}
							/>
						</Question>
						<Question
							question="Falls ja, was?"
							style={{ marginLeft: "16px", ...styles.QuestionBox.Question }}
						>
							<Text
								style={{ ...styles.QuestionBox.TextField, marginRight: "5px" }}
							>
								{formData?.which_op}
							</Text>
							<BoldText text={"und wann?"} />
							<Text
								style={{ ...styles.QuestionBox.TextField, marginLeft: "15px" }}
							>
								{formData?.when_op}
							</Text>
						</Question>

						<Question
							question={
								<Text style={{ textIndent: -15 }}>
									3. Wurden bei Ihnen bereits{" "}
									<Text style={{ fontWeight: 700 }}>Organe entfernt</Text>?
								</Text>
							}
							style={styles.QuestionBox.Question}
						>
							<BoxSelection
								options={[true, false]}
								labels={["Ja", "Nein"]}
								selected={formData?.had_organ_removed}
								style={styles.QuestionBox.BoxSelection}
							/>
						</Question>
						<Question
							question="Falls ja, welche?"
							style={{ marginLeft: "16px", ...styles.QuestionBox.Question }}
						>
							<Text
								style={{ ...styles.QuestionBox.TextField, marginRight: "5px" }}
							>
								{formData?.which_organ}
							</Text>
							<BoldText text={"und wann?"} />
							<Text
								style={{ ...styles.QuestionBox.TextField, marginLeft: "15px" }}
							>
								{formData?.when_organ}
							</Text>
						</Question>

						<Question
							question={
								<Text style={{ textIndent: -15 }}>
									4. Leiden Sie an einer{" "}
									<Text style={{ fontWeight: 700 }}>Nierenerkrankung</Text>?
								</Text>
							}
							style={styles.QuestionBox.Question}
						>
							<BoxSelection
								options={[true, false]}
								labels={["Ja", "Nein"]}
								selected={formData?.has_kidney_disease}
								style={styles.QuestionBox.BoxSelection}
							/>
						</Question>
						<Question
							question="Falls ja, welche (z. B. Niereninsuffizienz)?"
							style={{ marginLeft: "16px", ...styles.QuestionBox.Question }}
						>
							<Text style={styles.QuestionBox.TextField}>
								{formData?.which_kidney_disease}
							</Text>
						</Question>

						<Question
							question={
								<Text style={{ textIndent: -15 }}>
									5. Tragen Sie{" "}
									<Text style={{ fontWeight: 700 }}>
										Implantate und/oder Metallteile
									</Text>{" "}
									(gilt nicht für Zahnersatz) in/an Ihrem Körper?
								</Text>
							}
							style={styles.QuestionBox.Question}
						>
							<BoxSelection
								options={[true, false]}
								labels={["Ja", "Nein"]}
								selected={
									formData?.wearing_interfearing_implants_or_metal_objects
								}
								style={styles.QuestionBox.BoxSelection}
							/>
						</Question>
						<Question
							question="Falls ja, welche?"
							style={{ marginLeft: "16px", ...styles.QuestionBox.Question }}
						>
							<Text
								style={{ ...styles.QuestionBox.TextField, marginRight: "5px" }}
							>
								{formData?.which_interfearing_implants}
							</Text>
							<BoldText text={"und wann?"} />
							<Text
								style={{ ...styles.QuestionBox.TextField, marginLeft: "15px" }}
							>
								{formData?.when_interfearing_implants}
							</Text>
						</Question>
						<Text
							style={{
								marginLeft: "15px",
								marginTop: "-3px",
								marginBottom: "8px",
							}}
						>
							(z. B. Hörimplantat, Gelenkprothesen, Operationsnägel, Gefäßclips,
							Stents, Metallclips, Metallplatten, Medikamentenpumpen, Piercings,
							Tätowierungen, Permanent-Make-up, Kupferspirale)
						</Text>

						<Question
							question={
								<Text style={{ textIndent: -15 }}>
									6. Haben Sie{" "}
									<Text style={{ fontWeight: 700 }}>
										Verletzungen durch metallische Objekte
									</Text>{" "}
									erlitten?
								</Text>
							}
							style={styles.QuestionBox.Question}
						>
							<BoxSelection
								options={[true, false]}
								labels={["Ja", "Nein"]}
								selected={formData?.has_injuries_by_metallic_objects}
								style={styles.QuestionBox.BoxSelection}
							/>
						</Question>
						<Question
							question="Falls ja, welche (z. B. Granatsplitter, Verletzungen im Auge)?"
							style={{ marginLeft: "16px", ...styles.QuestionBox.Question }}
						>
							<Text style={styles.QuestionBox.TextField}>
								{formData?.which_injuries}
							</Text>
						</Question>

						<Question
							question={
								<Text style={{ textIndent: -15 }}>
									7. Sind bei Ihnen{" "}
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
							question="Falls ja, welche (z. B. Kontrastmittel, Medikamente, Histamin)?"
							style={{ marginLeft: "16px", ...styles.QuestionBox.Question }}
						>
							<Text style={styles.QuestionBox.TextField}>
								{formData?.which_allergies}
							</Text>
						</Question>

						<Question
							question={
								<Text style={{ textIndent: -15 }}>
									8. Besteht bei Ihnen ein{" "}
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
								selected={formData?.has_glaucoma}
								style={styles.QuestionBox.BoxSelection}
							/>
						</Question>

						<Question
							question={
								<Text style={{ textIndent: -15 }}>
									9. Gibt es{" "}
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
							question="Falls ja, welche?"
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
									10. Ist bei Ihnen eine{" "}
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
							question="Falls ja, welche (z. B. Hepatitis, HIV, etc.)?"
							style={{ marginLeft: "16px", ...styles.QuestionBox.Question }}
						>
							<Text style={styles.QuestionBox.TextField}>
								{formData?.infectious_disease_details}
							</Text>
						</Question>

						<Question
							question={
								<Text style={{ textIndent: -15 }}>
									11. Nehmen Sie regelmäßig{" "}
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
							question="Falls ja, welche (z. B. ASS/Aspirin, Plavix, Xarelto)?"
							style={{ marginLeft: "16px", ...styles.QuestionBox.Question }}
						>
							<Text style={styles.QuestionBox.TextField}>
								{formData?.blood_thinners_details}
							</Text>
						</Question>

						<Question
							question={
								<Text style={{ textIndent: -15 }}>
									12. Nehmen Sie{" "}
									<Text style={{ fontWeight: 700 }}>
										regelmäßig sonstige Medikamente
									</Text>{" "}
									ein?
								</Text>
							}
							style={styles.QuestionBox.Question}
						>
							<BoxSelection
								options={[true, false]}
								labels={["Ja", "Nein"]}
								selected={formData?.taking_other_medications}
								style={styles.QuestionBox.BoxSelection}
							/>
						</Question>
						<Question
							question="Falls ja, welche?"
							style={{ marginLeft: "16px", ...styles.QuestionBox.Question }}
						>
							<Text style={styles.QuestionBox.TextField}>
								{formData?.other_medications_details}
							</Text>
						</Question>

						<Question
							question={
								<Text style={{ textIndent: -15 }}>
									13. Leiden Sie an{" "}
									<Text style={{ fontWeight: 700 }}>Klaustrophobie</Text> (Angst
									in engen Räumen, Platzangst)?
								</Text>
							}
							style={styles.QuestionBox.Question}
						>
							<BoxSelection
								options={[true, false]}
								labels={["Ja", "Nein"]}
								selected={formData?.has_claustrophobia}
								style={styles.QuestionBox.BoxSelection}
							/>
						</Question>

						<View
							style={{
								...styling.Row,
								...styles.HeightAndWeight,
							}}
						>
							<View style={styling.Row}>
								<BoldText text={"Körpergröße:"} />
								<Text
									style={{
										...styles.QuestionBox.TextField,
										flex: "auto",
										width: "50px",
										textAlign: "center",
										fontWeight: 700,
									}}
								>
									{formData?.height}
								</Text>
								<Text style={{ fontWeight: 700 }}>cm</Text>
							</View>
							<View style={{ ...styling.Row }}>
								<BoldText text={"Körpergewicht:"} />
								<Text
									style={{
										...styles.QuestionBox.TextField,
										flex: "auto",
										width: "50px",
										textAlign: "center",
										fontWeight: 700,
									}}
								>
									{formData?.weight}
								</Text>
								<Text style={{ fontWeight: 700 }}>kg</Text>
							</View>
						</View>
					</View>
				</Paragraph>

				{!onlyForMen && (
					<View
						style={{
							...styles.QuestionBox,
							marginBottom: "10px",
							fontSize: "11px",
						}}
					>
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
									<Text style={{ textIndent: -15 }}>Stillen Sie zurzeit?</Text>
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

				<Text style={{ marginTop: "2px" }}>
					Den Aufklärungsbogen habe ich gelesen und verstanden.
				</Text>

				<Signature />
			</BaseFormPage>
		</>
	);
};

export default asDocument(MRIForm);
