import React from "react";

import { Document, View, Text, StyleSheet } from "@react-pdf/renderer";

import { Header, BaseFormPage, Signature } from "../components";
import styling from "../styles";
import { ComponentsTable } from "./components/ComponentsTable";
import { PatientInfoHeader } from "../components/PatientInfoHeader";
import { useFormData } from "../contexts/formDataContext";

interface ProstateMRICEFormProps {
	onRender?: () => void;
}

const TABLE_DATA = [
	{
		goa: "5720",
		text: "multiparametrische MRT der Prostata in Dünnschicht- und hochauflösender Technik; zusätzliche Beurteilung des gesamten Beckens, mit den dazugehörigen Organen; Untersuchung der Lymphknoten und Knochenstrukturen im Becken",
		coeff: "2,300",
		price: "589,86",
	},
	{
		goa: "5731",
		text: "ergänzende Serien zu 5700-5730",
		coeff: "2,300",
		price: "134,07",
	},
	{
		goa: "5733",
		text: "Zuschlag, computergestützte Analyse",
		coeff: "1,000",
		price: "46,63",
	},
	{
		goa: "1",
		text: "Beratung, auch telefonisch (ausführliches Gespräch > 10 Minuten)",
		coeff: "3,500",
		price: "16,31",
	},
	{
		goa: "5",
		text: "Untersuchung, symptombezogen",
		coeff: "2,300",
		price: "10,72",
	},
	{
		goa: "75",
		text: "Befundbericht, ausführlich",
		coeff: "2,300",
		price: "17,43",
	},
	{
		goa: "261",
		text: "Einbringung von Arzneimittel in einen parenteralen Katheter",
		coeff: "2,300",
		price: "4,03",
	},
	{
		goa: "346",
		text: "Kontrastmittel, i.v. Hochdruck",
		coeff: "2,300",
		price: "40,23",
	},
	{
		goa: "",
		text: "Sachkosten:",
		coeff: "",
		price: null,
	},
	{
		goa: "",
		text: "Kontrastmittel DotaVision 1 ml [60 ml] Anzahl: (20x)",
		coeff: "1,000",
		price: "85,80",
	},
	{
		goa: "",
		text: "Buscopan 2 Amp.",
		coeff: "1,000",
		price: "5,46",
	},
	{
		goa: "",
		text: "NaCl 10ml",
		coeff: "1,000",
		price: "0,56",
	},
	{
		goa: "",
		text: "Braunüle",
		coeff: "1,000",
		price: "2,11",
	},
	{
		goa: "",
		text: "Kanülenfixierung",
		coeff: "1,000",
		price: "1,33",
	},
	{
		goa: "",
		text: "Dreiwegehahn",
		coeff: "1,000",
		price: "1,71",
	},
	{
		goa: "",
		text: "KM-Schlauch",
		coeff: "1,000",
		price: "1,06",
	},
	{
		type: "sum",
		price: "957,30",
	},
	{ type: "gap" },
	{
		text: "eventuell zzgl. Leistungen und Laborparameter:",
	},
	{
		goa: "857",
		text: "erweiterte Testverfahren gemäß §6: IIEF & IPPS Bogenauswertung",
		coeff: "1,800",
		price: "12,17",
	},
	{
		goa: "250",
		text: "Blutentnahme, Vene",
		coeff: "1,800",
		price: "4,19",
	},
	{
		goa: "3550",
		text: "Blutbild, einfach",
		coeff: "1,150",
		price: "3,43",
	},
	{
		goa: "3741",
		text: "CRP, Ligandassay",
		coeff: "1,150",
		price: "3,95",
	},
	{
		goa: "3605",
		text: "PTT / aPTT, Einfachbestimmung",
		coeff: "1,150",
		price: "3,43",
	},
	{
		goa: "3606",
		text: "PTZ / TZ, Doppelbestimmung",
		coeff: "1,150",
		price: "3,95",
	},
	{
		goa: "3607",
		text: "TPZ, Einfachbestimmung",
		coeff: "1,150",
		price: "3,95",
	},
	{
		goa: "3908H3",
		text: "PSA, Ligandassay",
		coeff: "1,150",
		price: "4,11",
	},
	{
		type: "sum",
		price: "65,29",
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

export const ProstateMRICEForm: React.FC<ProstateMRICEFormProps> = (props) => {
	const {
		appointmentData,
		patientData,
	}: {
		appointmentData: any;
		patientData: any;
	} = useFormData();

	return (
		<Document style={styles.Page} onRender={props?.onRender}>
			<BaseFormPage customStyle={{ fontSize: "10px" }}>
				<Header>
					<Text style={styles.Heading}>Kostenvoranschlag</Text>
					<Text style={styles.SubHeading}>
						für eine multiparametrische MRT-Untersuchung
					</Text>
					<Text style={styles.SubHeading}>
						der Prostata und des gesamten Beckens
					</Text>
				</Header>

				<View style={{ fontSize: "10" }}>
					<PatientInfoHeader data={{ ...appointmentData, ...patientData }} />
				</View>

				<View style={{ marginBottom: "15px" }}>
					<ComponentsTable tableData={TABLE_DATA} />
				</View>

				<View style={{ fontStyle: "italic", marginBottom: "15px" }}>
					<Text>Steuerfreie Leistung gem § 4 Nr. 14 UStG</Text>
					<Text style={{ marginBottom: "8px" }}>
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
					<Text>
						Auszug S3-Leitlinie Prostatakarzinom, Version 6.1, Juli 2021, 5.16
						Evidenzbasierte Empfehlung: "Die mpMRT nach geltenden
						Qualitätsstandards sollte in der Primärdiagnostik eingesetzt
						werden."
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
