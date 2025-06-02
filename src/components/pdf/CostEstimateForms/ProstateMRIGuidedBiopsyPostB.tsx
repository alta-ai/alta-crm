import React from "react";

import { Document, View, Text, StyleSheet } from "@react-pdf/renderer";

import { Header, BaseFormPage, Signature } from "../components";
import styling from "../styles";
import { ComponentsTable } from "./components/ComponentsTable";
import { PatientInfoHeader } from "../components/PatientInfoHeader";
import { useFormData } from "../contexts/formDataContext";

interface ProstateMRIGuidedBiopsyPostBProps {
	onRender?: () => void;
}

const TABLE_DATA = [
	{
		goa: "5720",
		text: "MRT-gesteuerte Kombinationsbiopsie gemäß S3 Leitlinie (Version 6.1, Juli 2021; 5.2.1.): gezielte Gewebeprobenentnahmen verdächtiger Areale in der Prostata sowie systematische Biopsie unter live MRT-Kontrolle. Individuell geplanter transgluteal-transforaminaler Zugang (obere Gesäßregion) ohne Antibiotikum.",
		coeff: "2,500",
		price: "641,15",
	},
	{
		goa: "5731",
		text: "ergänzende Serien zu 5700-5730",
		coeff: "2,500",
		price: "145,73",
	},
	{
		goa: "5732",
		text: "Spulen-/Positionswechsel",
		coeff: "1,000",
		price: "58,29",
	},
	{
		goa: "5733",
		text: "Zuschlag, computergestützte Analyse",
		coeff: "1,000",
		price: "46,63",
	},
	{
		goa: "319",
		text: "Kombination gezielte und systematische Gewebeentnahmen durch transglutealen-transforaminalen Zugang mit Probeexzisionen bei einer Tiefe von >10 cm (12x)",
		coeff: "3,500",
		price: "489,72",
	},
	{
		goa: "602",
		text: "Oxymetrische Untersuchung(en)",
		coeff: "1,900",
		price: "16,83",
	},
	{
		goa: "494",
		text: "Leitungsanästhesie (2x)",
		coeff: "1,900",
		price: "26,79",
	},
	{
		goa: "491",
		text: "Infiltrationsanästhesie (2x)",
		coeff: "1,900",
		price: "26,79",
	},
	{
		goa: "253",
		text: "Injektion, intravenös",
		coeff: "1,900",
		price: "7,75",
	},
	{
		goa: "204",
		text: "Kompressionsverband",
		coeff: "1,900",
		price: "21,05",
	},
	{
		goa: "7",
		text: "Untersuchung, Organsystem",
		coeff: "1,900",
		price: "17,73",
	},
	{
		goa: "1",
		text: "Beratung auch telefonisch",
		coeff: "1,900",
		price: "8,85",
	},
	{
		goa: "1",
		text: "Mitteilung des Pathologieergebnisses",
		coeff: "1,900",
		price: "8,85",
	},
	{
		goa: "75",
		text: "Pathologiebefund mit Endergebnis und Therapieempfehlung",
		coeff: "1,900",
		price: "14,40",
	},
	{
		goa: "",
		text: "Sachkosten:",
		coeff: "",
		price: null,
	},
	{
		goa: "",
		text: "Microlax",
		coeff: "1,000",
		price: "1,75",
	},
	{
		goa: "",
		text: "Titan Coaxial Nadel (2x)",
		coeff: "1,000",
		price: "449,82",
	},
	{
		goa: "",
		text: "HistoCore Einmal-Biopsiesystem",
		coeff: "1,000",
		price: "50,58",
	},
	{
		goa: "",
		text: "Xylonest 1 % (50 ml)",
		coeff: "1,000",
		price: "4,09",
	},
	{
		goa: "",
		text: "Diazepam Amp.",
		coeff: "1,000",
		price: "1,08",
	},
	{
		goa: "",
		text: "Braunüle",
		coeff: "1,000",
		price: "2,11",
	},
	{
		goa: "",
		text: "Kanülenfixierung (5x)",
		coeff: "1,000",
		price: "6,65",
	},
	{
		goa: "",
		text: "Dreiwegehahn",
		coeff: "1,000",
		price: "1,71",
	},
	{
		type: "sum",
		price: "2.048,36",
	},
	{ type: "gap" },
	{
		text: "zzgl. CT:",
	},
	{
		goa: "5372",
		text: "CT-Becken zur Differenzierung zwischen Ligamenten und Knochenkortikalis bzw. Knochenkompakta für die Planung des individuellen Zugangsweges",
		coeff: "1,500",
		price: "227,33",
	},
	{
		goa: "5377",
		text: "Computeranalyse/3D Rekonstruktion zusätzlich zu 5370-5375",
		coeff: "1,000",
		price: "46,63",
	},
	{
		type: "sum",
		price: "273,96",
	},
];

const styles = StyleSheet.create({
	Page: {
		fontSize: "9px",
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
		Question: {
			minHeight: "18px",
			marginBottom: "5px",
		},
		FullLineTextFieldWrapper: {
			minHeight: "24px",
			display: "flex",
			flexDirection: "column",
			justifyContent: "flex-end",
		},
		TextFieldWrapper: {
			minHeight: "24px",
		},
		TextField: {
			padding: "0 10px",
			minHeight: "16px",
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

export const ProstateMRIGuidedBiopsyPostB: React.FC<
	ProstateMRIGuidedBiopsyPostBProps
> = (props) => {
	const {
		appointmentData,
		patientData,
	}: {
		appointmentData: any;
		patientData: any;
	} = useFormData();

	return (
		<Document style={styles.Page} onRender={props?.onRender}>
			<BaseFormPage customStyle={{ fontSize: "8px" }}>
				<Header>
					<Text style={styles.Heading}>Kostenvoranschlag</Text>
					<Text style={styles.SubHeading}>
						für MRT-gesteuerte Prostatabiopsie (Post B)
					</Text>
				</Header>

				<View style={{ fontSize: "10" }}>
					<PatientInfoHeader data={{ ...appointmentData, ...patientData }} />
				</View>

				<View>
					<ComponentsTable
						tableData={TABLE_DATA}
						customStyle={{ tableRow: { marginBottom: 0 }, fontSize: "8.5px" }}
					/>
				</View>

				<View
					style={{
						fontStyle: "italic",
						marginBottom: "15px",
						marginTop: "10px",
					}}
				>
					<Text>Steuerfreie Leistung gem § 4 Nr. 14 UStG</Text>
					<Text style={{ marginBottom: "4px" }}>
						Aus diesem Kostenvoranschlag kann ich alle GOÄ-Leistungsziffern und
						Steigerungsfaktoren und somit die Gesamtkosten entnehmen. Die
						Rechnung werde ich in voller Höhe vollständig selber tragen,
						unabhängig von der Erstattungsregelung mit meiner privaten
						Krankenversicherung, Beihilfestelle oder anderen Leistungsträgern.
						Durch diesen Kostenvoranschlag habe ich die Möglichkeit, die
						Erstattung im Vorfeld abzuklären. Eine Abrechnung über die
						gesetzlichen Krankenkassen oder privaten Zusatzversicherungen ist
						nicht möglich. Mir ist bewusst, dass die Leistungen im Einzelfall
						variieren können, falls Abweichungen im Ablauf entstehen, oder das
						Krankheitsbild, der Zeitaufwand oder die Umstände dieses erfordern
						(GOÄ § 5, Abs. 2). Von der ALTA Klinik habe ich alle notwendigen
						Informationen bzgl. einer Kostenerstattung erhalten.
					</Text>
					<Text style={{ marginBottom: "4px" }}>
						Erklärung zur Abrechnung der Biopsie: gemäß der S3-Leitlinie ist
						unsere Biopsie eine Kombinationsbiopsie, mit der wir gezielte
						Gewebeprobenentnahmen aus verdächtigen Arealen in der Prostata sowie
						systematische Proben unter live MRT- Kontrolle entnehmen. Auszug
						S3-Leitlinie Prostatakarzinom, Version 6.1, Juli 2021 , 5.2.1.
						<Text style={{ fontWeight: "700" }}>Erstbiopsie</Text>, 5.15
						Evidenzbasiertes Statement geprüft 2021: „Die Kombination aus
						mpMRT-gestützter, gezielter plus systematischer Biopsie erreicht
						bessere Detektionsraten als die jeweiligen Methoden allein.“ Unsere
						Kombinationsbiopsie ist nicht nur MRT- gestützt, sondern
						MRT-gesteuert. Verdächtige Areale biopsieren wir im MRT-Gerät über
						aktuelle Live-Bilder der Areale. Weiterhin nutzen wir für die
						Biopsie einen Zugang, der in der oberen Gesäßregion liegt
						(transgluteal-transforaminal) und für den Patienten bedeutet, dass
						keine Darmbakterien in die Prostata gelangen können und somit eine
						präventive Antibiotika-Einnahme entfällt.
					</Text>
					<Text>
						Die Gewebeproben werden durch unseren Pathologen begutachtet und
						ausgewertet. Die Abrechnung erfolgt gemäß der GOÄ.
					</Text>
				</View>

				<View style={{ fontSize: "10" }}>
					<Signature
						heading={
							<Text style={{ fontSize: 12 }}>
								Datum, Name, Vorname, Unterschrift Patient/ Sorgeberechtigter* /
								Bevollmächtigter
							</Text>
						}
					/>
				</View>
			</BaseFormPage>
		</Document>
	);
};
