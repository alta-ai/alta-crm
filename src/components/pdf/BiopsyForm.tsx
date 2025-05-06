import React from "react";

import { Document, View, Text, StyleSheet } from "@react-pdf/renderer";
import {
	Header,
	Question,
	Paragraph,
	BaseFormPage,
	BulletPoint,
	Listing,
	BoxSelection,
	BoldText,
	SignatureAlt,
	SignatureDoc,
} from "./components";
import { useFormData } from "./contexts/formDataContext";
import styling from "./styles";
import { PatientInfoHeader } from "./components/PatientInfoHeader";
import { FormProps, BiopsyForm as BiopsyFormData } from "../types";

const styles = StyleSheet.create({
	Page: { fontSize: 10, lineHeight: 0.8 },
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
	WithBottomMargin: {
		marginBottom: "8px",
	},
	InfoText: {
		fontStyle: "italic",
		marginBottom: "12px",
	},
	QuestionBox: {
		...styling.QuestionBox,
		marginBottom: "5px",
		Question: {
			minHeight: "18px",
			marginBottom: "8px",
		},
		BoxSelection: {
			display: "flex",
			flexDirection: "row",
			checkbox: {
				marginLeft: "10px",
			},
		},
		BoxSelectionCol: {
			display: "flex",
			flexDirection: "column",
			checkbox: {
				justifyContent: "start",
				marginLeft: "10px",
			},
		},
		TextField: {
			padding: "0 10px",
			flex: 1,
			minHeight: "16px",
			borderBottom: "1px solid gray",
			paddingBottom: "3px",
		},
		CustomBulletPointText: {
			maxWidth: "100%",
			width: "100%",
			fontSize: "12px",
		},
	},
});

export const BiopsyForm: React.FC<FormProps> = (props) => {
	const { formData, patientData, appointmentData } =
		useFormData<BiopsyFormData>();

	return (
		<Document style={styles} onRender={props?.onRender}>
			<BaseFormPage withFooter={false}>
				<Header>
					<View style={styles.HeaderWrapper}>
						<Text style={styles.Heading}>3D-Live MRT-Prostatabiopsie</Text>
						<Text style={styles.Heading}>Aufklärungsbogen</Text>
					</View>
				</Header>

				<PatientInfoHeader data={{ ...appointmentData, ...patientData }} />

				<View style={{ marginTop: "8px" }}>
					<Paragraph heading="Bitte beachten Sie folgende Punkte vor der 3D-Live MRT-Prostatabiopsie">
						<BulletPoint
							text={
								"Sie haben am Tag, an dem die MRT-Untersuchung der Prostata durchgeführt wurde, vorab einen allgemeinen Aufklärungsbogen inkl. der Voraussetzungen für eine MRT-Untersuchung ausgefüllt. Unsere Prostatabiopsie verläuft auch MRT-kontrolliert. Wir weisen Sie daher nochmals auf folgende Punkte hin:"
							}
						/>
						<BulletPoint
							text={
								"Sie dürfen keinen Herzschrittmacher, Defibrillator, künstliche Metallherzklappe und/oder Insulinpumpe tragen."
							}
							order={2}
						/>
						<BulletPoint
							text={
								"Nach einer Implantation und/oder Einbringung von Metallteilen (gilt nicht für Zahnersatz, sondern für z. B. Hörimplantate, Gelenkprothesen, Operationsnägel, Gefäßclips, Stents, Metallclips, Metallplatten) darf die MRT-Untersuchung frühestens 6 Wochen nach Einbringung erfolgen."
							}
							order={2}
							customStyle={styles.WithBottomMargin}
						/>
						<BulletPoint
							text={
								"Falls bereits eine Stanzbiopsie erfolgt ist, sollten zwischen dieser und unserem Termin mindestens 6 Wochen liegen."
							}
							order={1}
							customStyle={styles.WithBottomMargin}
						/>
						<BulletPoint
							text={
								"Am Tag der Biopsie keine Cremes oder Lotionen zur Pflege im Gesäß-Becken-Bereich verwenden."
							}
							order={1}
							customStyle={styles.WithBottomMargin}
						/>
						<BulletPoint
							text={
								"Falls es Änderungen gibt, bitten wir Sie, uns diese sofort hier mitzuteilen."
							}
							order={1}
						>
							{/* <BoxSelection
                options={["keine Änderungen", "folgende Änderungen"]}
                selected={booleanToYesNo(formData?.insurance?.eligibleForAid)}
                style={styling.FormTypeLines.BoxSelection}
                /> */}
						</BulletPoint>
						<BulletPoint
							text={
								"Für die Biopsie ist es notwendig, dass folgende aktuelle Blutwerte vorliegen:"
							}
							order={1}
						>
							<BulletPoint
								text={
									<Text style={{ fontWeight: "bold" }}>kleines Blutbild,</Text>
								}
								order={2}
							/>
							<BulletPoint
								customStyle={{ fontWeight: "bold" }}
								text={
									<Text style={{ fontWeight: "bold" }}>
										Blutgerinnungswerte: Quick, PTT und PTZ.
									</Text>
								}
								order={2}
							/>
							<Text style={styles.WithBottomMargin}>
								In der Regel werden diese Werte bei uns am Vortag, wenn die
								MRT-Untersuchung der Prostata durchgeführt wird, bestimmt.
							</Text>
							<Text style={styles.WithBottomMargin}>
								Liegen jedoch zwischen der MRT-Untersuchung der Prostata und dem
								Biopsietermin mehr als 14 Tage, müssen Sie bitte die folgenden
								Werte erneut bestimmen lassen:
							</Text>
							<BulletPoint
								text={
									<Text style={{ fontWeight: "bold" }}>kleines Blutbild,</Text>
								}
								order={2}
							/>
							<BulletPoint
								customStyle={{ fontWeight: "bold" }}
								text={
									<Text style={{ fontWeight: "bold" }}>
										Quick, PTZ und PTT, jedoch keine PSA-Werte.
									</Text>
								}
								order={2}
							/>
							<Text style={styles.WithBottomMargin}>
								Diese Blutwerte sollten Sie uns unbedingt vor dem Biopsietermin
								(spätestens 1 Tag vorher) per E-Mail oder per Fax zukommen
								lassen, damit wir rechtzeitig klären können, ob alle Werte im
								Normbereich liegen. Zusätzlich bitten wir Sie, das Laborblatt am
								Biopsietag mitzubringen.
							</Text>
						</BulletPoint>
						<BulletPoint
							text={
								"Nehmen Sie bitte 7 Tage vor der Biopsie keine blutverdünnenden Medikamente wie z. B. Aspirin bzw. Medikamente, die den Wirkstoff ASS (Acetylsalicylsäure) enthalten, ein."
							}
							order={1}
						/>
					</Paragraph>
				</View>
			</BaseFormPage>

			<BaseFormPage withFooter={false}>
				<View style={{ ...styles.InfoText, marginTop: "15px" }}>
					<Paragraph
						heading={
							"Für Patienten, die regelmäßig einen „Blutverdünner“ einnehmen"
						}
						customStyle={{
							border: "2px dashed black",
							padding: "5px",
						}}
					>
						<Text style={styles.WithBottomMargin}>
							Sollten Sie Medikamente zur „Blutverdünnung“ einnehmen wie z. B.
							ASS (Aspirin), Plavix, Marcumar, müssen diese in Absprache mit
							Ihrem behandelnden Arzt vor dem Biopsietermin abgesetzt werden.
							Wir bitten Sie in diesem Fall, uns die aktuellen Blutwerte
							(kleines Blutbild und die Blutgerinnungswerte Quick und PTT)
							unbedingt vor dem Biopsietermin (spätestens 1 Tag vorher) per
							E-Mail oder per Fax zukommen zu lassen, damit wir rechtzeitig
							klären können, ob alle Werte im Normbereich liegen. Zusätzlich
							bitten wir Sie, das Laborblatt am Biopsietag mitzubringen. Diese
							Blutwerte dürfen nicht älter als 2 Tage sein!
						</Text>
						<Text style={styles.WithBottomMargin}>
							Falls unter laufender Marcumartherapie die Gerinnungshemmung nicht
							für einen solchen Zeitraum unterbrochen werden darf, so ist eine
							Therapieumstellung auf eine andere antikoagulative Therapie wie z.
							B. ein niedermolekulares Heparinpräparat (z.B. Clexane oder
							Fraxiparin) vorzunehmen. Zur Vermeidung von thromboembolischen
							Komplikationen werden diese Präparate angepasst, an das
							individuelle Körpergewicht dosiert und in der Regel 1x täglich
							verabreicht.
						</Text>
						<Text style={styles.WithBottomMargin}>
							Bei hoher Thromboemboliegefahr aufgrund von besonderen kardialen,
							venösen oder vom Blut ausgehenden Vorerkrankungen kann auch eine
							2x tägliche Applikation des Heparinpräparates angezeigt sein. Die
							Entscheidung über eine 1x oder 2x tägliche Heparingabe sollte in
							Absprache mit dem behandelnden Hausarzt herbeigeführt werden.
						</Text>
						<Text style={styles.WithBottomMargin}>
							Die Applikationszeiten sind so einzurichten, dass die letzte Gabe
							etwa 12 Stunden vor der geplanten Biopsie erfolgt.
						</Text>
						<Text style={styles.WithBottomMargin}>
							Falls die plasmatische Gerinnungshemmung mit einer der neueren
							oralen Marcumar ersetzenden Substanzen (Xarelto oder Pradaxa)
							betrieben wird, so ist nur eine Unterbrechung der
							Tabletteneinnahme und in der Regel keine Therapieumstellung auf
							ein niedermolekulares Heparin erforderlich (kein Bridging mit
							Heparin).
						</Text>
						<Text>
							Die Wiederaufnahme der ursprünglichen antikoagulativen Therapie
							besprechen Sie bitte mit uns und Ihrem behandelnden Arzt.
						</Text>
					</Paragraph>
				</View>
				<View>
					<Paragraph heading="Entleerung des Enddarms">
						<BulletPoint order={1} customStyle={styles.WithBottomMargin}>
							<Text>
								Für die Biopsie ist es erforderlich, dass der Enddarm entleert
								ist – nicht der gesamte Dickdarm. Das entsprechende Abführmittel
								mit der Anleitung haben Sie von uns erhalten.
							</Text>
						</BulletPoint>
						<BulletPoint order={1} customStyle={styles.WithBottomMargin}>
							<Text style={styles.WithBottomMargin}>
								Bitte am Biopsietag nur ein leichtes Frühstück einnehmen. Zum
								Mittagessen nur leichte Kost, wie Suppen, Nudel- oder
								Reisgerichte, essen. Grundsätzlich sollte am Biopsietag auf
								schwere, ballaststoffreiche und blähende Nahrung, wie Müsli,
								Salat, Hülsenfrüchte (z. B. Bohnen), Gemüse oder Obst verzichtet
								werden. Tee und Kaffee sind erlaubt.
							</Text>
							<Text style={styles.WithBottomMargin}>
								Wenn Sie am Biopsietag anreisen, sollten Sie 2,5 Stunden vor
								Ihrem Biopsietermin bei uns sein, damit Sie die abführenden
								Maßnahmen in unserem Hause durchführen können.
							</Text>
							<Text>
								Falls Sie in Bielefeld in einem Hotel übernachten, können Sie
								die abführende Maßnahme im Hotel vornehmen. Dann reicht es, wenn
								Sie 30 Minuten vor Biopsietermin in unserem Hause sind.
							</Text>
						</BulletPoint>
					</Paragraph>
				</View>
			</BaseFormPage>

			<BaseFormPage withFooter={false}>
				<View style={{ ...styles.InfoText, marginTop: "15px" }}>
					<Paragraph
						heading={"Enddarmreinigung mit:"}
						customStyle={{
							border: "2px dashed black",
							padding: "5px",
						}}
					>
						<Text style={{ fontWeight: "bold", ...styles.WithBottomMargin }}>
							Gebrauchsinformationen Microlax (Rektallösung) von McNeil Consumer
							Healthcare GmbH, Neuss
						</Text>
						<Text style={{ fontWeight: "bold" }}>Inhaltsstoffe</Text>
						<BulletPoint order={1} customStyle={styles.WithBottomMargin}>
							<Text style={styles.WithBottomMargin}>
								Natriumcitrat, Dodecyl(sulfoacetat), Natriumsalz 70%,
								Sorbitol-Lösung 70% (kristallisierend) (Ph.Eur.)
							</Text>
						</BulletPoint>

						<Text style={{ fontWeight: "bold" }}>Anwendung von Microlax</Text>
						<Text style={styles.WithBottomMargin}>
							Bitte wenden Sie eine Tube Microlax 2,5 Stunden vor der Biopsie
							an.
						</Text>
						<Listing
							customStyle={styles.WithBottomMargin}
							list={[
								"Tube festhalten, den Verschluss drehen und abziehen.",
								"den ersten Tropfen vorsichtig ausdrücken, um die Spitze zur Einführung gleitfähig zu machen.",
								"Tubenhals in den Enddarm einführen.",
								"Inhalt durch Zusammendrücken der Tube entleeren.",
								"Tubenhals aus dem Enddarm entfernen. Dabei die Tube zusammengedrückt halten.",
								"zu erwartender Wirkungseintritt in etwa 5 – 20 Minuten.",
							]}
						></Listing>

						<Text style={{ fontWeight: "bold" }}>
							Microlax darf nicht angewendet werden
						</Text>
						<BulletPoint order={1}>
							<Text style={styles.WithBottomMargin}>
								wenn Sie allergisch gegen Natriumcitrat, Dodecyl(sulfoacetat),
								Natriumsalz 70%, Sorbitol- Lösung 70% (kristallisierend)
								(Ph.Eur.), Glycerol, Sorbinsäure (Ph-Eur.), gereinigtes Wasser
								sind
							</Text>
						</BulletPoint>
						<BulletPoint order={1}>
							<Text style={styles.WithBottomMargin}>
								bei Darmverschluss (Ileus),
							</Text>
						</BulletPoint>
						<BulletPoint order={1} customStyle={styles.WithBottomMargin}>
							<Text style={styles.WithBottomMargin}>
								bei diagnostizierter hereditärer Fruktoseintoleranz
								(Unverträglichkeit gegenüber bestimmten Zuckern)
							</Text>
						</BulletPoint>

						<Text style={{ fontWeight: "bold" }}>
							Welche Nebenwirkungen sind möglich?
						</Text>
						<Text style={styles.WithBottomMargin}>
							Bitte wenden Sie eine Tube Microlax 2,5 Stunden vor der Biopsie
							an.
						</Text>

						<Text style={{ fontWeight: "bold" }}>Mögliche Nebenwirkungen</Text>
						<View style={{ display: "flex", flexDirection: "row" }}>
							<Text style={{ fontWeight: "bold" }}>Nicht bekannt </Text>
							<Text>
								(Häufigkeit auf Grundlage der verfügbaren Daten nicht
								abschätzbar):
							</Text>
						</View>
						<BulletPoint order={1}>
							<Text style={styles.WithBottomMargin}>
								Überempfindlichkeitsreaktionen (z.B. Nesselsucht),
							</Text>
						</BulletPoint>
						<BulletPoint order={1}>
							<Text style={styles.WithBottomMargin}>Bauchschmerzen,</Text>
						</BulletPoint>
						<BulletPoint order={1}>
							<Text style={styles.WithBottomMargin}>
								leichtes Brennen im Analbereich,
							</Text>
						</BulletPoint>
						<BulletPoint order={1}>
							<Text style={styles.WithBottomMargin}>lockerer Stuhl.</Text>
						</BulletPoint>

						<Text style={styles.WithBottomMargin}>
							Wenn Sie Nebenwirkungen bemerken, wenden Sie sich bitte an Ihren
							Arzt oder Apotheker. Dies gilt auch für Nebenwirkungen, die hier
							nicht angegeben sind.
						</Text>
					</Paragraph>
				</View>

				<View style={{ marginBottom: "16px" }}>
					<Paragraph heading={"Computertomographie des Beckens"} />
					<Text>
						Für die gezielten Gewebeentnahmen unter MRT-Kontrolle nutzen wir den
						Zugangsweg über den Gesäßmuskel (transgluteal-transforaminal).
						Dieser Zugangsweg muss exakt geplant, gemessen und bestimmt werden,
						um die verdächtige(n) Stelle(n) in der Prostata gezielt biopsieren
						zu können. Dafür führen wir vorab eine Low-Dose (niedrig dosiert)
						CT-Untersuchung des Beckens durch. Diese Untersuchung funktioniert
						über Röntgenstrahlen und lässt – und das kann die MRT nicht leisten
						– eine klare Definition der Grenze zwischen Weichteilgewebe wie z.
						B. Bändern und den knöchernen Strukturen zu. Diese Untersuchung ist
						für die Bestimmung des Zugangsweges der Biopsie notwendig, damit
						keine Widerstände wie z. B. durch Verkalkungen hinderlich sind. Eine
						weitere Information, die uns die CT-Untersuchung des Beckens gibt,
						ist der Nachweis bzw. Ausschluss von Phlebolithen im
						periprostatischen Fettgewebe sowie Verkalkungen in den erfassten
						Schlagadern.
					</Text>
				</View>

				<View style={styling.Center}>
					<BoxSelection
						options={[true, false]}
						labels={[
							<BoldText text={"ja, ich bin damit einverstanden"} />,
							<BoldText text={"nein, ich bin nicht damit einverstanden"} />,
						]}
						selected={formData?.consent_pelvis_ct}
						style={styling.FormTypeLines.BoxSelection}
					/>
				</View>
			</BaseFormPage>

			<BaseFormPage withFooter={false}>
				<Paragraph
					heading={"Biopsieverfahren"}
					customStyle={{ marginBottom: "16px" }}
				>
					<Text style={styles.WithBottomMargin}>
						Mit unserer 3-D live MRT-gesteuerten Kombinationsbiopsie entnehmen
						wir gezielte Proben aus verdächtigen Stellen in der Prostata und
						zusätzlich systematische Proben. Gemäß der S3-Leitlinie weist diese
						Art der Prostatabiopsie die höchste Detektionsrate auf.,
					</Text>
					<Text style={styles.WithBottomMargin}>
						Auszug S3-Leitlinie Prostatakarzinom, Version 6.1, Juli 2021 ,
						5.2.1. Erstbiopsie, 5.15 Evidenzbasiertes Statement geprüft 2021:
						„Die Kombination aus mpMRT-gestützter, gezielter plus systematischer
						Biopsie erreicht bessere Detektionsraten als die jeweiligen Methoden
						allein.“
					</Text>
					<Text style={styles.WithBottomMargin}>
						Unsere Kombinationsbiopsie ist nicht nur MRT-gestützt, sondern live
						MRT-gesteuert. Verdächtige Areale biopsieren wir im MRT-Gerät über
						aktuelle Live-Bilder der Areale. Weiterhin nutzen wir für die
						Biopsie den Zugangsweg über den Gesäßmuskel
						(transgluteal-transforaminal), was für den Patienten bedeutet, dass
						keine Darmbakterien in die Prostata gelangen können und somit eine
						präventive Antibiotika-Einnahme entfällt.
					</Text>
					<Text style={styles.WithBottomMargin}>
						Bei der vorangegangenen MRT-Untersuchung wurde(n) bei Ihnen
						eine/mehrere verdächtige Stelle(n) festgestellt, von der/denen das
						Gewebe histopathologisch abzuklären ist. Mit unserem
						Biopsieverfahren entnehmen wir gezielt unter live MRT-Kontrolle
						Gewebeproben aus verdächtigen Stellen und zusätzlich über denselben
						Zugangsweg noch gemäß der S3-Leitlinie systematische Proben aus der
						Prostata. Bei jedem Patienten wird der Zugangsweg bzw. die
						Einstichstelle individuell errechnet bzw. geplant. Grundsätzlich
						führen wir die Nadel über den Gesäßmuskel ein und nicht durch den
						Dickdarm oder Damm. Dazu verwenden wir das Bildmaterial der
						vorangegangenen MRT-Untersuchung und erstellen auf dieser Basis
						aktuelle Live-MRT-Bilder von den zu biopsierenden Stellen. Nachdem
						die Haut an entsprechender Stelle markiert wird, erfolgt die
						mehrmalige Hautdesinfektion sowie die sterile Abdeckung.
						Anschließend wird nach ausgedehnter örtlicher Betäubung und einem
						ca. 0,3 cm langen Hautschnitt eine Hohlnadel durch die Haut, das
						Unterhautfettgewebe und durch die Muskulatur bis zum verdächtigen
						Bezirk unter Umgehung des Enddarmes in die Prostata vorgeführt.
					</Text>
					<Text style={styles.WithBottomMargin}>
						Nach der Entnahme der Gewebeproben wird zum sicheren
						Blutungsausschluss eine MRT-Kontrolle des Interventionsgebietes in 2
						bzw. 3 Ebenen durchgeführt. Unsere Biopsiemethode ist durch die Art
						der örtlichen Betäubung und der Auswahl der entsprechenden
						Medikamente in der Regel für den Patienten schmerzfrei.
					</Text>
					<Text style={styles.WithBottomMargin}>
						Grundsätzlich ist unsere 3-D live MRT-Prostatabiopsie ein
						minimal-invasiver Eingriff, welcher MRT- kontrolliert durchgeführt
						wird und unter sterilen Bedingungen stattfindet. Für unsere
						Biopsiemethode ist keine Narkose notwendig. Da wir die verdächtigen
						Stellen gezielt biopsieren, ist es notwendig, dass Sie ruhig liegen.
						Dafür bekommen Sie von uns lediglich ein Beruhigungsmittel
						verabreicht. Bitte beachten Sie, dass nach örtlicher Betäubung bzw.
						nach intravenöser Injektion von Beruhigungsmitteln Ihr
						Reaktionsvermögen vorübergehend beeinträchtigt ist. Sie dürfen somit
						in keinem Fall nach der Biopsie aktiv am Straßenverkehr teilnehmen,
						d. h. ein Kraftfahrzeug führen oder Zweirad steuern, an gefährlichen
						Maschinen arbeiten, wichtige Entscheidungen treffen und keinen
						Alkohol trinken – erst am nächsten Tag wieder. Bitte kommen Sie in
						Begleitung einer Person, die Sie fahren kann oder organisieren Sie
						sich ein Taxi. Abschließend erhalten Sie ein schriftliches
						Biopsieprotokoll, in dem auch die Verhaltensregeln nach der Biopsie
						genannt werden und eine Handynummer des diensthabenden Arztes
						notiert ist.
					</Text>
				</Paragraph>

				<Paragraph heading={"Es kann in Einzelfällen zu Komplikationen kommen"}>
					<BulletPoint order={1}>
						<Text style={styles.WithBottomMargin}>
							Es kann bei der Biopsie zu kleinen Einblutungen im Bereich der
							Entnahmestelle in der Prostata kommen, die in der Regel weder
							therapiert noch kontrolliert werden müssen. In extrem seltenen
							Fällen kann durch Verletzungen von Prostata umgebenen
							Gefäßkonvoluten die Blutung jedoch stärker sein, so dass der
							Bluterguss durch eine weitere MRT-gesteuerte Punktion entlastet
							werden muss. Im Ausnahmefall kann auch eine Operation notwendig
							werden. Ebenso können stärkere Blutungen eine Transfusion von
							Fremdblut oder Blutbestandteilen nach sich ziehen. Durch eine
							Bluttransfusion kann es in extrem seltenen Fällen zu Entzündungen
							(Infektionen) z. B. mit Hepatitis-Viren mit nachfolgender
							Leberentzündung sowie HIV mit der Ausbildung des Krankheitsbildes
							AIDS als Spätfolge und/oder anderen Erregern wie z. B. BSE kommen.
						</Text>
					</BulletPoint>
				</Paragraph>
			</BaseFormPage>

			<BaseFormPage withFooter={false}>
				<BulletPoint order={1} customStyle={{ marginTop: "15px" }}>
					<Text style={styles.WithBottomMargin}>
						Kleine Verletzungen der von der Prostata umschlossenen Harnröhre bei
						der Biopsie sind selten und schließen sich in der Regel von selbst.
						Der Urin und das Ejakulat können in manchen Fällen auch noch für
						einige Wochen blutig sein. In der Regel ist eine Behandlung nicht
						erforderlich. Präventiv sollte daher schon vor und nach der Biopsie
						reichlich Flüssigkeit (mind. 2 Liter stilles Wasser täglich) zu sich
						genommen werden, um eine Spülung des Urogenitaltraktes zu bewirken
						und so eine Blutkoagelbildung in der Harnröhre (prostatischer
						Anteil) zu verhindern. Damit sollten keine Probleme beim
						Wasserlassen auftreten, jedoch kann in extrem seltenen Fällen eine
						sogenannte Harnsperre auftreten, welche eine Katheterisierung
						unvermeidlich werden lässt.
					</Text>
				</BulletPoint>
				<BulletPoint order={1}>
					<Text style={styles.WithBottomMargin}>
						Verletzungen benachbarter Organe sind extrem selten. Eine
						medikamentöse oder operative Therapie kann dann erforderlich werden.
					</Text>
				</BulletPoint>
				<BulletPoint order={1}>
					<Text style={styles.WithBottomMargin}>
						Infektionen der Prostata und auch der (Neben-) Hoden sind sehr
						selten. Eine prophylaktische Antibiotika-Einnahme ist nicht
						erforderlich.
					</Text>
				</BulletPoint>
				<BulletPoint order={1}>
					<Text style={styles.WithBottomMargin}>
						Überempfindlichkeitsreaktionen auf das örtliche Betäubungsmittel
						sind sehr selten. Eine Allergie kann zu einer Beeinträchtigung der
						Atemfunktion bis hin zum Atemstillstand und zu schweren
						Herz-Kreislaufstörungen bis hin zum Herz-Kreislaufstillstan
					</Text>
				</BulletPoint>

				<Paragraph
					heading={"Was der Arzt vor dem Eingriff unbedingt wissen muss"}
				>
					<View style={styles.QuestionBox}>
						<Question
							question="1. Sind Störungen des Stoffwechsels (z.B. Diabetes mellitus) oder wichtiger Organe (z.B. Herz, Nieren) bekannt?"
							style={styles.QuestionBox.Question}
						>
							<BoxSelection
								options={[false, true]}
								labels={["Nein", "Ja"]}
								selected={formData?.has_disorders_of_metabolism_or_organs}
								style={styles.QuestionBox.BoxSelection}
							/>
						</Question>
						<Question
							question="Falls ja, welche?"
							style={{ marginLeft: "16px", ...styles.QuestionBox.Question }}
						>
							<Text style={styles.QuestionBox.TextField}>
								{formData?.which_disorders}
							</Text>
						</Question>

						<Question
							question="2. Sind bei Ihnen folgende Risikofaktoren bekannt?"
							style={styles.QuestionBox.Question}
							sameRow={false}
						>
							<BoxSelection
								options={[
									"nein",
									"Rauchen",
									"Bluthochdruck",
									"Cholesterin",
									"familiäre Vorbelastung",
								]}
								labels={[
									"nein",
									"Rauchen",
									"Bluthochdruck",
									"Cholesterin",
									"familiäre Vorbelastung",
								]}
								selected={formData?.risk_factors}
								style={{ ...styles.QuestionBox.BoxSelection, marginTop: "5px" }}
							/>
							<BoxSelection
								options={[true]}
								labels={[
									<View
										style={{
											...styling.Row,
											...styles.QuestionBox.CustomBulletPointText,
										}}
									>
										<Text>Weitere Risikofaktoren: </Text>
										<Text
											style={{
												...styles.QuestionBox.TextField,
												paddingBottom: "1px",
											}}
										>
											{formData?.further_risk_factors}
										</Text>
									</View>,
								]}
								selected={Boolean(formData?.further_risk_factors)}
								style={{ ...styles.QuestionBox.BoxSelection, marginTop: "5px" }}
								useCustomLabels={true}
							/>
						</Question>

						<Question
							question="3. Besteht eine akute Infektionskrankheit (z.B. der Harnwege)?"
							style={styles.QuestionBox.Question}
						>
							<BoxSelection
								options={[false, true]}
								labels={["Nein", "Ja"]}
								selected={formData?.has_acute_infectious_disease}
								style={styles.QuestionBox.BoxSelection}
							/>
						</Question>
						<Question
							question="Falls ja, welche?"
							style={{ marginLeft: "16px", ...styles.QuestionBox.Question }}
						>
							<Text style={styles.QuestionBox.TextField}>
								{formData?.which_acute_infectious_disease}
							</Text>
						</Question>

						<Question
							question="4. Besteht eine Infektionskrankheit (z.B. Hepatitis, HIV)?"
							style={styles.QuestionBox.Question}
						>
							<BoxSelection
								options={[false, true]}
								labels={["Nein", "Ja"]}
								selected={formData?.has_infectious_disease}
								style={styles.QuestionBox.BoxSelection}
							/>
						</Question>
						<Question
							question="Falls ja, welche?"
							style={{ marginLeft: "16px", ...styles.QuestionBox.Question }}
						>
							<Text style={styles.QuestionBox.TextField}>
								{formData?.which_infectious_disease}
							</Text>
						</Question>

						<Question
							question="5. Nehmen Sie regelmäßig blutverdünnende Medikamente ein?"
							style={styles.QuestionBox.Question}
						>
							<BoxSelection
								options={[false, true]}
								labels={["Nein", "Ja"]}
								selected={formData?.taking_blood_thinning_medication}
								style={styles.QuestionBox.BoxSelection}
							/>
						</Question>
						<Question
							question="Falls ja, welche? (z. B. ASS/Aspirin, Plavix, Xarelto)?"
							style={{ marginLeft: "16px", ...styles.QuestionBox.Question }}
						>
							<Text style={styles.QuestionBox.TextField}>
								{formData?.which_blood_thinning_medication}
							</Text>
						</Question>
						<Question
							question="Haben Sie das Medikament, wie vorgeschrieben, 7 Tage vorher abgesetzt bzw. umgestellt?"
							style={{ marginLeft: "16px", ...styles.QuestionBox.Question }}
							sameRow={false}
						>
							<BoxSelection
								options={["stopped", "adapted", "still_taken"]}
								labels={[
									<View
										style={{
											...styling.Row,
											...styles.QuestionBox.CustomBulletPointText,
										}}
									>
										<Text>ja, abgesetzt und zwar vor </Text>
										<Text
											style={{
												...styles.QuestionBox.TextField,
												paddingBottom: "1px",
												maxWidth: "50px",
												textAlign: "center",
											}}
										>
											{formData?.when_stopped_medication_in_days}
										</Text>
										<Text> Tagen </Text>
									</View>,

									<View style={styles.QuestionBox.CustomBulletPointText}>
										<Text style={{ display: "block" } as any}>
											ja, umgestellt, aufgrund hohem Thromboembolierisiko wurde
											eine Therapieumstellung auf ein anderes
											gerinnungshemmendes Medikament vorgenommen.
										</Text>
										<View style={styling.Row}>
											<Text style={{ display: "block" } as any}>
												Folgendes Medikament:
											</Text>
											<Text
												style={{
													...styles.QuestionBox.TextField,
													paddingBottom: "1px",
													maxWidth: "200px",
													textAlign: "left",
												}}
											>
												{formData?.which_new_medication}
											</Text>
											<Text> und zwar vor </Text>
											<Text
												style={{
													...styles.QuestionBox.TextField,
													paddingBottom: "1px",
													maxWidth: "50px",
													textAlign: "center",
												}}
											>
												{formData?.when_adapted_medication_in_days}
											</Text>
											<Text> Tagen </Text>
										</View>
									</View>,
									<Text style={styles.QuestionBox.CustomBulletPointText}>
										nein
									</Text>,
								]}
								selected={formData?.stopped_medication}
								style={{
									marginTop: "5px",
									...styles.QuestionBox.BoxSelectionCol,
								}}
								useCustomLabels={true}
							/>
						</Question>

						<Question
							question="6. Nehmen Sie regelmäßig Medikamente (außer Blutverdünner) ein?"
							style={styles.QuestionBox.Question}
						>
							<BoxSelection
								options={[false, true]}
								labels={["Nein", "Ja"]}
								selected={formData?.taking_regular_medication}
								style={styles.QuestionBox.BoxSelection}
							/>
						</Question>
						<Question
							question="Falls ja, welche?"
							style={{ marginLeft: "16px", ...styles.QuestionBox.Question }}
						>
							<Text style={styles.QuestionBox.TextField}>
								{formData?.which_regular_medication}
							</Text>
						</Question>
					</View>
				</Paragraph>
			</BaseFormPage>

			<BaseFormPage withFooter={false}>
				<View style={{ ...styles.QuestionBox, marginTop: "15px" }}>
					<Question
						question="7. Haben Sie in den letzten 7 Tagen Aspirin (ASS) oder einen anderen Blutverdünner eingenommen?"
						style={styles.QuestionBox.Question}
						sameRow={false}
					>
						<BoxSelection
							options={[false, true]}
							labels={[
								<Text
									style={{
										fontSize: "12px",
										width: "auto",
									}}
								>
									nein
								</Text>,
								<View style={styling.Row}>
									<Text style={{ display: "block" } as any}>
										ja und zwar vor
									</Text>
									<Text
										style={
											{
												...styles.QuestionBox.TextField,
												display: "block",
												flex: "auto",
												paddingBottom: "1px",
												maxWidth: "50px",
												width: "50px",
												textAlign: "center",
											} as any
										}
									>
										{formData?.when_taken_aspirin_or_blood_thinner}
									</Text>
									<Text> Tagen </Text>
								</View>,
							]}
							selected={formData?.taken_aspirin_or_blood_thinner}
							style={{ marginTop: "5px", ...styles.QuestionBox.BoxSelection }}
							useCustomLabels={true}
						/>
					</Question>

					<Question
						question="8. Kam es bei früheren Operationen oder Verletzungen zu verstärkter Blutung?"
						style={styles.QuestionBox.Question}
					>
						<BoxSelection
							options={[false, true]}
							labels={["Nein", "Ja"]}
							selected={formData?.increased_bleeding}
							style={{ marginTop: "5px", ...styles.QuestionBox.BoxSelection }}
						/>
					</Question>

					<Question
						question="9. Kam es früher bei Eingriffen zu Eiterungen oder Abszessen?"
						style={styles.QuestionBox.Question}
					>
						<BoxSelection
							options={[false, true]}
							labels={["Nein", "Ja"]}
							selected={formData?.suppuration_or_abscesses}
							style={{ marginTop: "5px", ...styles.QuestionBox.BoxSelection }}
						/>
					</Question>

					<Question
						question="10. Wurden Sie bereits früher an den Harnorganen operiert?"
						style={styles.QuestionBox.Question}
					>
						<BoxSelection
							options={[false, true]}
							labels={["Nein", "Ja"]}
							selected={formData?.surgery_on_urinary_organs}
							style={{ marginTop: "5px", ...styles.QuestionBox.BoxSelection }}
						/>
					</Question>
					<Question
						question="Falls ja, welche Operation wurden wann bei Ihnen durchgeführt?"
						style={{ marginLeft: "16px", ...styles.QuestionBox.Question }}
						sameRow={false}
					>
						<View
							style={{
								...styles.QuestionBox.TextField,
								flex: "auto",
								minHeight: "25px",
							}}
						>
							<Text style={{ marginTop: "auto" }}>
								{formData?.which_surgery}
							</Text>
						</View>
					</Question>

					<Question
						question="11. Besteht bei Ihnen eine erhöhte Blutungsneigung (z.B. häufiges Nasenbluten, Blutergüsse)?"
						style={styles.QuestionBox.Question}
					>
						<BoxSelection
							options={[false, true]}
							labels={["Nein", "Ja"]}
							selected={formData?.increased_bleeding_tendency}
							style={{ marginTop: "5px", ...styles.QuestionBox.BoxSelection }}
						/>
					</Question>

					<Question
						question="12. Wurden Allergien/Unverträglichkeiten (z.B. gegen Pflaster, Medikamente) beobachtet?"
						style={styles.QuestionBox.Question}
					>
						<BoxSelection
							options={[false, true]}
							labels={["Nein", "Ja"]}
							selected={formData?.has_allergies}
							style={{ marginTop: "5px", ...styles.QuestionBox.BoxSelection }}
						/>
					</Question>
				</View>

				<Paragraph
					heading={"Eventuelle Anmerkungen zum Aufklärungsgespräch"}
					customStyle={{ marginBottom: "16px" }}
				>
					<Text style={{ fontStyle: "italic" }}>
						Hier trägt der Arzt alle wesentlichen, zusätzlichen Informationen
						ein, die er Ihnen zum individuellen Fall mitgeteilt und mit Ihnen
						besprochen hat.
					</Text>
					<Text
						style={{ marginTop: "30px", ...styles.QuestionBox.TextField }}
					></Text>
					<SignatureDoc />
				</Paragraph>

				<Paragraph
					heading={"Einwilligungserklärung"}
					customStyle={{ marginBottom: "16px" }}
				>
					<Text>
						Über die geplante 3-D live MRT-Prostatabiopsie hat mich Dr. med.
						______________________ (Arzt/Ärztin) in einem Aufklärungsgespräch
						ausführlich informiert. Dabei konnte ich alle mir wichtig
						erscheinenden Fragen, z. B. die über Art und Bedeutung des
						Eingriffes, über spezielle Risiken und mögliche Komplikationen sowie
						über alternative Biopsieverfahren und über Neben- und Folgemaßnahmen
						und ihre Risiken stellen. Ich bin auch darüber aufgeklärt, dass ich
						für die Biopsie ein Beruhigungsmittel bekomme und deshalb im
						Anschluss an die Biopsie selber kein Auto fahren bzw. nicht aktiv am
						Straßenverkehr teilnehmen darf. Dieses ist erst frühestens am
						Folgetag wieder möglich. Ich habe diesen Aufklärungsbogen (Seite 1
						bis 6) gelesen und verstanden. Ich habe keine weiteren Fragen, fühle
						mich ausreichend informiert und willige hiermit nach ausreichender
						Bedenkzeit in den geplanten Eingriff ein.
					</Text>
				</Paragraph>
				<SignatureAlt />
			</BaseFormPage>
		</Document>
	);
};
