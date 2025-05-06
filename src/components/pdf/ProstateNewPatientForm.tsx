import React, { useState, useEffect } from "react";

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
import { PatientInfoHeaderSmall } from "./components/PatientInfoHeader";
import {
	FormProps,
	ProstateNewPatientForm as ProstateNewPatientFormData,
} from "../types";
import { dumpPsaValues } from "../types/utils";

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
	SubHeading: {
		fontSize: "12px",
	},
	QuestionBox: {
		...styling.QuestionBox,
		marginBottom: "3px",
		Question: {
			fontSize: "9px",
			minHeight: "12px",
			marginBottom: "5px",
		},
		FullLineTextFieldWrapper: {
			minHeight: "16px",
			display: "flex" as const,
			flexDirection: "column" as const,
			justifyContent: "flex-end" as const,
		},
		TextFieldWrapper: {
			minHeight: "16px",
		},
		TextField: {
			padding: "0 10px",
			minHeight: "12px",
			borderBottom: "1px solid gray",
			paddingBottom: "2px",
			flex: 1,
		},
		BoxSelection: {
			display: "flex",
			flexDirection: "row",
			checkbox: {
				marginLeft: "10px",
				box: {
					width: 10,
					height: 10,
				},
				inner: {
					width: 6,
					height: 6,
				},
				label: {
					fontSize: "10px",
				},
			},
		},
		BoxSelectionCol: {
			display: "flex",
			flexDirection: "column",
			marginTop: "4px",
			checkbox: {
				marginLeft: "10px",
				display: "block",
				justifyContent: "flex-start",
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
		justifyContent: "space-around",
	},
});

export const ProstateNewPatientForm: React.FC<FormProps> = (props) => {
	const { formData, appointmentData, patientData } =
		useFormData<ProstateNewPatientFormData>();
	const psaDiagram = usePSADiagram();

	const [chartKey, setChartKey] = useState(0);

	// Watch for changes to psaDiagram.chart
	useEffect(() => {
		if (psaDiagram?.chart) {
			// Increment key to force a re-render when chart changes
			setChartKey((prevKey) => prevKey + 1);
		}
	}, [psaDiagram?.chart]);

	return (
		<Document onRender={props?.onRender}>
			<BaseFormPage withFooter={false}>
				<Header>
					<View style={styles.HeaderWrapper}>
						<Text style={styles.Heading}>Prostatafragebogen Neupatient</Text>
					</View>
				</Header>

				<View style={{ position: "relative" }}>
					<PatientInfoHeaderSmall
						data={{ ...appointmentData, ...patientData }}
					/>
				</View>

				<Paragraph
					heading={"PSA-Werte im Verlauf"}
					customStyle={{ marginBottom: "0", marginTop: "-3px" }}
				>
					<View style={{ ...styles.QuestionBox, marginBottom: "1px" }}>
						<View style={styling.Row}>
							<View style={{ width: "40%" }}>
								<PSAValues
									psaValues={dumpPsaValues(formData)}
									customStyle={{ fontSize: "9px", minHeight: "15px" }}
								/>
							</View>
							<View style={{ width: "60%" }}>
								{psaDiagram?.chart && (
									<Image source={psaDiagram?.chart} key={chartKey}></Image>
								)}
							</View>
						</View>
					</View>
				</Paragraph>

				<Paragraph heading={""} customStyle={{ marginTop: "0px" }}>
					<View style={styles.QuestionBox}>
						<Question
							question={
								<Text style={{ textIndent: -15 }}>
									1. Sind in Ihrer{" "}
									<Text style={{ fontWeight: 700 }}>
										Familie Prostataerkrankungen
									</Text>{" "}
									bekannt? {"  "}
								</Text>
							}
							style={styles.QuestionBox.Question}
						>
							<BoxSelection
								options={[false, true]}
								labels={["Nein", "Ja"]}
								selected={formData?.family_prostate_disease}
								style={styles.QuestionBox.BoxSelection}
							/>
						</Question>
						<Question
							question="Falls ja, wer?"
							style={{ marginLeft: "16px", ...styles.QuestionBox.Question }}
						>
							<BoxSelection
								options={["Vater", "Großvater", "Bruder", "Onkel"]}
								labels={["Vater", "Großvater", "Bruder", "Onkel"]}
								selected={formData?.family_member}
								style={{ ...styles.QuestionBox.BoxSelection }}
							/>
						</Question>
						<Question
							question="Welche Erkrankungen?"
							style={{ marginLeft: "16px", ...styles.QuestionBox.Question }}
						>
							<BoxSelection
								options={[
									"Prostatakrebs",
									"Prostatavergrößerung",
									"Prostataentzündung",
								]}
								labels={[
									"Prostatakrebs",
									"Prostatavergrößerung",
									"Prostataentzündung",
								]}
								selected={formData?.family_disease_type}
								style={{ ...styles.QuestionBox.BoxSelection }}
							/>
						</Question>

						<Question
							question={
								<Text style={{ textIndent: -15 }}>
									2. Sind Sie <Text style={{ fontWeight: 700 }}>aktuell</Text>{" "}
									bei einem{" "}
									<Text style={{ fontWeight: 700 }}>
										Urologen in Behandlung
									</Text>
									?
								</Text>
							}
							style={styles.QuestionBox.Question}
						>
							<BoxSelection
								options={[false, true]}
								labels={["Nein", "Ja"]}
								selected={formData?.urologist_treatment}
								style={styles.QuestionBox.BoxSelection}
							/>
						</Question>
						<Question
							question={
								<Text style={{ textIndent: -15 }}>
									Falls ja, welche{" "}
									<Text style={{ fontWeight: 700 }}>Empfehlung</Text> haben Sie
									von Ihrem <Text style={{ fontWeight: 700 }}>Urologen</Text>{" "}
									erhalten? {"  "}
									<Text style={{ fontStyle: "italic" }}>
										(Mehrfachauswahl möglich)
									</Text>
								</Text>
							}
							style={{ marginLeft: "16px", ...styles.QuestionBox.Question }}
							sameRow={false}
						>
							<View style={styles.QuestionBox.FullLineTextFieldWrapper}>
								<BoxSelection
									options={[
										"keine, da keine Diagnose bekannt ist ",
										"Empfehlung zur Biopsie",
										"Empfehlung zur MRT",
									]}
									labels={[
										<Text>keine, da keine Diagnose bekannt ist </Text>,
										<Text>Empfehlung zur Biopsie</Text>,
										<Text>Brennen in der Harnröhre</Text>,
									]}
									selected={formData?.urologist_recommendation}
									style={{
										...styles.QuestionBox.BoxSelection,
										marginTop: "4px",
									}}
									useCustomLabels={true}
								/>
								<BoxSelection
									options={[
										"Empfehlung zur antibiotischen Therapie",
										"Empfehlung zur PSA- und/oder klinischen Kontrolle",
									]}
									labels={[
										<Text>Empfehlung zur antibiotischen Therapie</Text>,
										<Text>
											Empfehlung zur PSA- und/oder klinischen Kontrolle
										</Text>,
									]}
									selected={formData?.urologist_recommendation}
									style={{
										...styles.QuestionBox.BoxSelection,
										...styles.WithSmallBottomMargin,
									}}
									useCustomLabels={true}
								/>
							</View>
						</Question>

						<Question
							question={
								<Text style={{ textIndent: -15 }}>
									3. Ist/War bei Ihnen eine{" "}
									<Text style={{ fontWeight: 700 }}>Diagnose bekannt</Text>?{" "}
								</Text>
							}
							style={styles.QuestionBox.Question}
						>
							<BoxSelection
								options={[false, true]}
								labels={["Nein", "Ja"]}
								selected={formData?.known_diagnosis}
								style={styles.QuestionBox.BoxSelection}
							/>
						</Question>
						<Question
							question="Falls ja, welche?"
							style={{ marginLeft: "16px", ...styles.QuestionBox.Question }}
						>
							<BoxSelection
								options={[
									"Prostatakrebs",
									"Prostatavergrößerung",
									"Prostataentzündung",
								]}
								labels={[
									"Prostatakrebs",
									"Prostatavergrößerung",
									"Prostataentzündung",
								]}
								selected={formData?.diagnosis_type}
								style={{ ...styles.QuestionBox.BoxSelection }}
							/>
						</Question>

						<Question
							question={
								<Text style={{ textIndent: -15 }}>
									4. Wurde/Wird Ihre{" "}
									<Text style={{ fontWeight: 700 }}>
										Prostata bereits behandelt
									</Text>
									?{"  "}
									<Text style={{ fontStyle: "italic" }}>
										(Mehrfachauswahl möglich)
									</Text>
								</Text>
							}
							style={styles.QuestionBox.Question}
							sameRow={false}
						>
							<BoxSelection
								options={[
									"nein, da keine Diagnose bekannt ist",
									"nein, da bisher keine Notwendigkeit bestand",
									"nein, da ich Sorge/Angst vor Nebenwirkungen/Komplikationen habe",
									"nein, aus anderen Gründen",
									"ja, wegen gutartiger Prostatavergrösserung (BPH, BPS, Hyperplasie)",
									"ja, wegen Prostataentzündung (Prostatitis)",
									"ja, wegen Prostatakrebs",
								]}
								labels={[
									<Text>nein, da keine Diagnose bekannt ist</Text>,
									<Text>nein, da bisher keine Notwendigkeit bestand</Text>,
									<Text>
										nein, da ich Sorge/Angst vor Nebenwirkungen/Komplikationen
										habe
									</Text>,

									<View
										style={{
											...styles.QuestionBox.CustomBulletPointText,
											...styles.WithSmallBottomMargin,
											...styling.Row,
										}}
									>
										<Text>nein, aus anderen Gründen. Welche:</Text>
										<Text
											style={{
												...styles.QuestionBox.TextField,
												marginLeft: "12px",
											}}
										>
											{formData?.prostate_not_treated_reason}
										</Text>
									</View>,

									<View style={styles.QuestionBox.CustomBulletPointText}>
										<Text>
											ja, wegen{" "}
											<Text style={{ fontWeight: 700 }}>
												gutartiger Prostatavergrößerung (BPH, BPS, Hyperplasie)
											</Text>
										</Text>
										<Question
											question="Welche Behandlung?"
											style={{
												...styles.QuestionBox.Question,
												marginTop: "8px",
											}}
										>
											<BoxSelection
												options={[
													"TURP",
													"Greenlight-Laser",
													"HoLEP (Holmium-Laser)",
													"Medikamente",
												]}
												labels={[
													<Text>TURP</Text>,
													<Text>Greenlight-Laser</Text>,
													<Text>HoLEP (Holmium-Laser)</Text>,
													<Text>Medikamente</Text>,
												]}
												selected={formData?.enlargement_therapy_type}
												style={styles.QuestionBox.BoxSelection}
												useCustomLabels={true}
											/>
										</Question>

										<BoxSelection
											options={["andere Behandlung"]}
											labels={[
												<View
													style={{
														...styles.QuestionBox.CustomBulletPointText,
														...styles.WithSmallBottomMargin,
														...styling.Row,
													}}
												>
													<Text>andere, welche?</Text>

													<Text
														style={{
															...styles.QuestionBox.TextField,
															marginLeft: "12px",
														}}
													>
														{formData?.enlargement_therapy_other}
													</Text>
												</View>,
											]}
											style={{
												...styles.QuestionBox.BoxSelection,
												marginLeft: "113px",
												marginTop: "-5px",
											}}
											useCustomLabels={true}
											selected={formData?.enlargement_therapy_type}
										/>

										<Question
											question="Wann war die Behandlung?"
											style={{
												...styles.QuestionBox.Question,
											}}
										>
											<Text
												style={{
													...styles.QuestionBox.TextField,
													flex: 1,
												}}
											>
												{formData?.enlargement_therapy_date}
											</Text>
										</Question>

										<Text>
											Falls Ihre Prostatvergrößerung mit Medikamenten behandelt
											wurde - Mit welchen Medikamenten?
										</Text>

										<BoxSelection
											options={[
												"pflanzlich/naturheilkundlich/homöopathisch",
												"andere (z.B. Tamsulosin, Finasterid)",
											]}
											labels={[
												<Text>pflanzlich/naturheilkundlich/homöopathisch</Text>,

												<View
													style={{
														...styles.QuestionBox.CustomBulletPointText,
														...styles.WithSmallBottomMargin,
														...styling.Row,
													}}
												>
													<Text>
														andere (z.B. Tamsulosin, Finasterid), welche?
													</Text>

													<Text
														style={{
															...styles.QuestionBox.TextField,
															marginLeft: "12px",
														}}
													>
														{formData?.enlargement_medication_other}
													</Text>
												</View>,
											]}
											selected={formData?.enlargement_medication_type}
											style={styles.QuestionBox.BoxSelectionCol}
											useCustomLabels={true}
										/>
										<Question
											question="Seit wann nehmen Sie diese Medikamente?"
											style={{
												...styles.QuestionBox.Question,
												marginLeft: "12px",
											}}
										>
											<Text
												style={{
													...styles.QuestionBox.TextField,
													flex: 1,
												}}
											>
												{formData?.enlargement_medication_since}
											</Text>
										</Question>
									</View>,

									<View style={styles.QuestionBox.CustomBulletPointText}>
										<Text>
											ja, wegen{" "}
											<Text style={{ fontWeight: 700 }}>
												Prostataentzündung (Prostatitis)
											</Text>
										</Text>
										<Question
											question="Welche Behandlung?"
											style={{
												...styles.QuestionBox.Question,
												marginTop: "8px",
											}}
										>
											<BoxSelection
												options={["Antibiotika", "andere Behandlung"]}
												labels={[
													<Text>Antibiotika</Text>,
													<View
														style={{
															...styling.Row,
															width: "290px",
														}}
													>
														<Text>andere, welche?</Text>

														<Text
															style={{
																...styles.QuestionBox.TextField,
																marginLeft: "12px",
															}}
														>
															{formData?.inflammation_therapy_other}
														</Text>
													</View>,
												]}
												selected={formData?.inflammation_therapy_type}
												style={styles.QuestionBox.BoxSelection}
												useCustomLabels={true}
											/>
										</Question>
										<Question
											question="Wann war die Behandlung?"
											style={{
												...styles.QuestionBox.Question,
											}}
										>
											<Text
												style={{
													...styles.QuestionBox.TextField,
													flex: 1,
												}}
											>
												{formData?.inflammation_therapy_date}
											</Text>
										</Question>
										<Question
											question="Wie lange wurden Sie behandelt?"
											style={{
												...styles.QuestionBox.Question,
											}}
										>
											<Text
												style={{
													...styles.QuestionBox.TextField,
													flex: 1,
												}}
											>
												{formData?.inflammation_therapy_duration}
											</Text>
										</Question>
									</View>,

									<View style={styles.QuestionBox.CustomBulletPointText}>
										<Text>
											ja, wegen{" "}
											<Text style={{ fontWeight: 700 }}>Prostatakrebs</Text>
										</Text>
										<Question
											question="Welche Behandlung?"
											style={{
												...styles.QuestionBox.Question,
												marginTop: "8px",
											}}
										>
											<BoxSelection
												options={[
													"Active-Surveillance (aktive Überwachung)",
													"Anti-Hormontherapie",
												]}
												labels={[
													<Text style={{ marginRight: "20px" }}>
														Active-Surveillance (aktive Überwachung)
													</Text>,
													<Text style={{ marginRight: "10px" }}>
														Anti-Hormontherapie
													</Text>,
												]}
												selected={formData?.cancer_therapy_type}
												style={styles.QuestionBox.BoxSelection}
												useCustomLabels={true}
											/>
										</Question>
										<BoxSelection
											options={["Strahlentherapie", "andere Behandlung"]}
											labels={[
												<Text>Strahlentherapie</Text>,
												<View
													style={{
														...styling.Row,
														width: "250px",
													}}
												>
													<Text>andere, welche?</Text>

													<Text
														style={{
															...styles.QuestionBox.TextField,
															marginLeft: "12px",
														}}
													>
														{formData?.cancer_therapy_other}
													</Text>
												</View>,
											]}
											selected={formData?.cancer_therapy_type}
											style={{
												...styles.QuestionBox.BoxSelection,
												marginLeft: "115px",
												marginTop: "-5px",
											}}
											useCustomLabels={true}
										/>

										<Question
											question="Wann war die Behandlung?"
											style={{
												...styles.QuestionBox.Question,
												marginTop: "5px",
												marginBottom: "-7px",
											}}
										>
											<Text
												style={{
													...styles.QuestionBox.TextField,
													flex: 1,
												}}
											>
												{formData?.cancer_therapy_date}
											</Text>
										</Question>
									</View>,
								]}
								selected={formData?.prostate_treated}
								style={styles.QuestionBox.BoxSelectionCol}
								useCustomLabels={true}
							/>
						</Question>
					</View>
				</Paragraph>
			</BaseFormPage>

			<BaseFormPage withFooter={false}>
				<View style={{ ...styles.QuestionBox, marginTop: "15px" }}>
					<Question
						question={
							<Text style={{ textIndent: -15 }}>
								5. Haben Sie {""}
								<Text style={{ fontWeight: 700 }}>
									Symptome beim Wasserlassen
								</Text>{" "}
								oder{" "}
								<Text style={{ fontWeight: 700 }}>
									im Zusammenhang mit der Blase
								</Text>
								? {"  "}
								<Text style={{ fontStyle: "italic" }}>
									(Mehrfachauswahl möglich)
								</Text>
							</Text>
						}
						style={styles.QuestionBox.Question}
						sameRow={false}
						questionWidth="100%"
					>
						<BoxSelection
							options={[
								"nein",
								"Blut im Urin",
								"Brennen in der Harnröhre",
								"häufiger Harndrang",
							]}
							labels={[
								<Text>nein</Text>,
								<Text>Blut im Urin</Text>,
								<Text>Brennen in der Harnröhre</Text>,
								<Text>häufiger Harndrang</Text>,
							]}
							selected={formData?.urination_symptoms}
							style={{
								...styles.QuestionBox.BoxSelection,
								marginTop: "4px",
							}}
							useCustomLabels={true}
						/>

						<BoxSelection
							options={[
								"plötzlicher Harndrang",
								"schwacher Harnstrahl",
								"erschwertes Wasserlassen",
							]}
							labels={[
								<Text>plötzlicher Harndrang</Text>,
								<Text>schwacher Harnstrahl</Text>,
								<Text>erschwertes Wasserlassen</Text>,
							]}
							selected={formData?.urination_symptoms}
							style={{
								...styles.QuestionBox.BoxSelection,
							}}
							useCustomLabels={true}
						/>

						<BoxSelection
							options={["Schmerzen"]}
							labels={[
								<View
									style={{
										...styling.Row,
										width: "500px",
									}}
								>
									<Text>Schmerzen, wo:</Text>
									<Text
										style={{
											...styles.QuestionBox.TextField,
											marginLeft: "12px",
										}}
									>
										{formData?.urination_pain_location}
									</Text>
								</View>,
							]}
							selected={formData?.urination_symptoms}
							style={{
								...styles.QuestionBox.BoxSelection,
								...styles.WithSmallBottomMargin,
							}}
							useCustomLabels={true}
						/>
					</Question>

					<Question
						question={
							<Text style={{ textIndent: -15 }}>
								6. <Text style={{ fontWeight: 700 }}>Wie oft</Text> stehen Sie
								in der Regel <Text style={{ fontWeight: 700 }}>nachts</Text>{" "}
								auf, um auf die{" "}
								<Text style={{ fontWeight: 700 }}>Toilette</Text> zu gehen?
							</Text>
						}
						style={styles.QuestionBox.Question}
						sameRow={false}
						questionWidth="100%"
					>
						<BoxSelection
							options={[
								"gar nicht",
								"manchmal",
								"1 mal",
								"2 mal",
								"3 mal",
								"4 mal",
								"5 mal",
								"oder öfter",
							]}
							labels={[
								<Text>gar nicht</Text>,
								<Text>manchmal</Text>,
								<Text>1 mal</Text>,
								<Text>2 mal</Text>,
								<Text>3 mal</Text>,
								<Text>4 mal</Text>,
								<Text>5 mal</Text>,
								<Text>oder öfter</Text>,
							]}
							selected={formData?.night_urination_frequency}
							style={{
								...styles.QuestionBox.BoxSelection,
								...styles.WithSmallBottomMargin,
								marginTop: "4px",
							}}
							useCustomLabels={true}
						/>
					</Question>

					<Question
						question={
							<Text style={{ textIndent: -15 }}>
								7. <Text style={{ fontWeight: 700 }}>Seit wann</Text> bestehen{" "}
								<Text style={{ fontWeight: 700 }}>
									Symptome beim Wasserlassen
								</Text>
								?
							</Text>
						}
						style={{ ...styles.QuestionBox.Question }}
						sameRow={false}
						questionWidth="100%"
					>
						<BoxSelection
							options={[
								"seit kurzem",
								"weniger als 1 Jahr",
								"1 bis 5 Jahre",
								"mehr als 5 Jahre",
								"keine Symptome",
							]}
							labels={[
								<Text>seit kurzem</Text>,
								<Text>weniger als 1 Jahr</Text>,
								<Text>1 bis 5 Jahre</Text>,
								<Text>mehr als 5 Jahre</Text>,
								<Text>keine Symptome</Text>,
							]}
							selected={formData?.urination_symptoms_duration}
							style={{
								...styles.QuestionBox.BoxSelection,
								...styles.WithSmallBottomMargin,
								marginTop: "4px",
							}}
							useCustomLabels={true}
						/>
					</Question>

					<Question
						question={
							<Text style={{ textIndent: -15 }}>
								8.{" "}
								<Text style={{ fontWeight: 700 }}>
									Wenn sich die Symptome beim Wasserlassen oder im Zusammenhang
									mit der Blase für den Rest des Lebens nicht ändern würden,
									fühle ich mich:
								</Text>
							</Text>
						}
						style={styles.QuestionBox.Question}
						sameRow={false}
						questionWidth="95%"
					>
						<BoxSelection
							options={[
								"ausgezeichnet",
								"zufrieden",
								"überwiegend zufrieden",
								"gemischt, teils zufrieden, teils unzufrieden",
								"überwiegend unzufrieden",
								"unglücklich",
								"sehr schlecht",
							]}
							labels={[
								<Text>ausgezeichnet</Text>,
								<Text>zufrieden</Text>,
								<Text>überwiegend zufrieden</Text>,
								<Text>gemischt, teils zufrieden, teils unzufrieden</Text>,
								<Text>überwiegend unzufrieden</Text>,
								<Text>unglücklich</Text>,
								<Text>sehr schlecht</Text>,
							]}
							selected={formData?.urination_satisfaction_level}
							style={{
								...styles.QuestionBox.BoxSelectionCol,
								...styles.WithSmallBottomMargin,
							}}
							useCustomLabels={true}
						/>
					</Question>

					<Question
						question={
							<Text style={{ textIndent: -15 }}>
								9. Hat Ihr{" "}
								<Text style={{ fontWeight: 700 }}>
									Urologe einen Tastbefund der Prostata
								</Text>{" "}
								durchgeführt?
								{"  "}
								<Text style={{ fontStyle: "italic" }}>
									(Mehrfachauswahl möglich)
								</Text>
							</Text>
						}
						style={styles.QuestionBox.Question}
						sameRow={false}
						questionWidth="95%"
					>
						<BoxSelection
							options={[
								"nein",
								"ja, war unauffällig",
								"ja, war vergrößert",
								"ja, war krebsverdächtig",
							]}
							labels={[
								<Text>nein</Text>,
								<Text>ja, war unauffällig</Text>,
								<Text>ja, war vergrößert</Text>,
								<Text>ja, war krebsverdächtig</Text>,
							]}
							selected={formData?.urologist_palpation}
							style={{
								...styles.QuestionBox.BoxSelection,
								...styles.WithSmallBottomMargin,
							}}
							useCustomLabels={true}
						/>
					</Question>

					<Question
						question={
							<Text style={{ textIndent: -15 }}>
								10. Hat Ihr{" "}
								<Text style={{ fontWeight: 700 }}>
									Urologe eine Ultraschalluntersuchung der Prostata
								</Text>{" "}
								durchgeführt?
								{"  "}
								<Text style={{ fontStyle: "italic" }}>
									(Mehrfachauswahl möglich)
								</Text>
							</Text>
						}
						style={styles.QuestionBox.Question}
						sameRow={false}
						questionWidth="95%"
					>
						<BoxSelection
							options={[
								"nein",
								"ja, war unauffällig",
								"ja, war vergrößert",
								"ja, war krebsverdächtig",
							]}
							labels={[
								<Text>nein</Text>,
								<Text>ja, war unauffällig</Text>,
								<Text>ja, war vergrößert</Text>,
								<Text>ja, war krebsverdächtig</Text>,
							]}
							selected={formData?.urologist_ultrasound}
							style={{
								...styles.QuestionBox.BoxSelection,
								...styles.WithSmallBottomMargin,
							}}
							useCustomLabels={true}
						/>
					</Question>

					<Question
						question={
							<Text style={{ textIndent: -15 }}>
								11. Wurde bei Ihnen{" "}
								<Text style={{ fontWeight: 700 }}>
									bereits eine MRT-Untersuchung der Prostata
								</Text>{" "}
								durchgeführt?
							</Text>
						}
						style={styles.QuestionBox.Question}
					>
						<BoxSelection
							options={[false, true]}
							labels={["Nein", "Ja"]}
							selected={formData?.had_mri}
							style={styles.QuestionBox.BoxSelection}
						/>
					</Question>
					<Question
						question="Falls ja, wann?"
						style={{ marginLeft: "16px", ...styles.QuestionBox.Question }}
					>
						<Text style={{ ...styles.QuestionBox.TextField, flex: 1 }}>
							{formData?.mri_date}
						</Text>
					</Question>
					<Question
						question="Bringen Sie die CD zu Ihrer Untersuchung mit?"
						style={{
							marginLeft: "16px",
							...styles.QuestionBox.Question,
						}}
						sameRow={false}
					>
						<BoxSelection
							options={[
								"ja, ich bringe die CD mit",
								"nein, ich schicke die CD vorher per Post",
								"nein, ich habe keine CD von dieser Untersuchung",
							]}
							labels={[
								"Ich bringe sie mit",
								"Ich schicke sie vorher per Post ein",
								"Ich bringe sie nicht mit",
							]}
							selected={formData?.brings_mri_cd}
							style={{ ...styles.QuestionBox.BoxSelection, marginTop: "4px" }}
						/>
					</Question>

					<Question
						question={
							<Text style={{ textIndent: -15 }}>
								12. Hatten Sie bereits eine{" "}
								<Text style={{ fontWeight: 700 }}>Stanzbiopsie</Text>?{"  "}
								<Text style={{ fontStyle: "italic" }}>
									(Mehrfachauswahl möglich)
								</Text>
							</Text>
						}
						style={styles.QuestionBox.Question}
						sameRow={false}
					>
						<BoxSelection
							options={[
								"nein",
								"ja, ultraschallgesteuert (klassisch ohne MRT)",
								"ja, Fusionsbiopsie (mit MRT-Aufnahmen)",
								"ja, Sättigungsbiopsie (mehr als 20 Proben)",
								"ja, jedoch bin ich mir unsicher, welche Biopsie bei mir durchgeführt wurde",
							]}
							labels={[
								<Text>nein</Text>,
								<View
									style={{
										...styling.Row,
										width: "500px",
									}}
								>
									<Text>
										ja, ultraschallgesteuert (klassisch ohne MRT), wann:
									</Text>

									<Text
										style={{
											...styles.QuestionBox.TextField,
											marginLeft: "12px",
										}}
									>
										{formData?.last_usg_biopsy_date}
									</Text>
								</View>,

								<View
									style={{
										...styling.Row,
										width: "500px",
									}}
								>
									<Text>ja, Fusionsbiopsie (mit MRT-Aufnahmen), wann:</Text>

									<Text
										style={{
											...styles.QuestionBox.TextField,
											marginLeft: "12px",
										}}
									>
										{formData?.last_fusion_biopsy_date}
									</Text>
								</View>,

								<View
									style={{
										...styling.Row,
										width: "500px",
									}}
								>
									<Text>ja, Sättigungsbiopsie (mehr als 20 Proben), wann:</Text>

									<Text
										style={{
											...styles.QuestionBox.TextField,
											marginLeft: "12px",
										}}
									>
										{formData?.last_saturation_biopsy_date}
									</Text>
								</View>,

								<View
									style={{
										...styling.Row,
										width: "500px",
									}}
								>
									<Text>
										ja, jedoch bin ich mir unsicher, welche Biopsie bei mir
										durchgeführt wurde, wann:
									</Text>

									<Text
										style={{
											...styles.QuestionBox.TextField,
											marginLeft: "12px",
										}}
									>
										{formData?.last_unknown_biopsy_date}
									</Text>
								</View>,
							]}
							selected={formData?.biopsy_types}
							useCustomLabels={true}
							style={styles.QuestionBox.BoxSelectionCol}
						/>
					</Question>

					<Question
						question={
							<Text style={{ textIndent: -15 }}>
								Wenn ja, welcher <Text style={{ fontWeight: 700 }}>Zugang</Text>{" "}
								wurde bei der <Text style={{ fontWeight: 700 }}>Biopsie</Text>{" "}
								gewählt?
							</Text>
						}
						style={{ ...styles.QuestionBox.Question, marginLeft: "16px" }}
						sameRow={false}
					>
						<BoxSelection
							options={[
								"durch den Enddarm (transrektal)",
								"durch den Damm (transperineal)",
							]}
							labels={[
								<Text>durch den Enddarm (transrektal)</Text>,
								<Text>durch den Damm (transperineal)</Text>,
							]}
							selected={formData?.last_biopsy_access_route}
							useCustomLabels={true}
							style={{ ...styles.QuestionBox.BoxSelection, marginTop: "4px" }}
						/>
						<BoxSelection
							options={[
								"durch den Gesäßmuskel (transgluteal)",
								"ich bin mir unsicher",
							]}
							labels={[
								<Text>durch den Gesäßmuskel (transgluteal)</Text>,
								<Text>ich bin mir unsicher</Text>,
							]}
							selected={formData?.last_biopsy_access_route}
							useCustomLabels={true}
							style={styles.QuestionBox.BoxSelection}
						/>
					</Question>

					<Question
						question={
							<Text style={{ textIndent: -15 }}>
								Und <Text style={{ fontWeight: 700 }}>wie häufig</Text>?
							</Text>
						}
						style={{ ...styles.QuestionBox.Question, marginLeft: "16px" }}
					>
						<Text style={{ ...styles.QuestionBox.TextField, flex: 1 }}>
							{formData?.biopsy_count}
						</Text>
					</Question>

					<Question
						question={
							<Text style={{ textIndent: -15 }}>
								Welche <Text style={{ fontWeight: 700 }}>Diagnose</Text> haben
								Sie erhalten?
							</Text>
						}
						style={{ ...styles.QuestionBox.Question, marginLeft: "16px" }}
						sameRow={false}
					>
						<BoxSelection
							options={["kein Karzinom (negativ)", "Karzinom (positiv)"]}
							labels={[
								<Text>kein Karzinom (negativ)</Text>,
								<View
									style={{
										...styling.Row,
										width: "290px",
									}}
								>
									<Text>Karzinom (positiv) - Gleason:</Text>

									<Text
										style={{
											...styles.QuestionBox.TextField,
											marginLeft: "12px",
										}}
									>
										{formData?.biopsy_gleason_score?.join(", ")}
									</Text>
								</View>,
							]}
							selected={formData?.last_biopsy_result}
							style={{ ...styles.QuestionBox.BoxSelection, marginTop: "4px" }}
							useCustomLabels={true}
						/>
					</Question>
				</View>
				<View style={{ marginTop: "20px" }} />
				<Signature />
			</BaseFormPage>
		</Document>
	);
};
