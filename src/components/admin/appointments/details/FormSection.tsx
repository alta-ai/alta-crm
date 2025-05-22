import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "../../../../lib/supabase";
import { ExternalLink, ArrowLeft } from "lucide-react";
import PatientPhotoCapture from "../PatientPhotoCapture";
import FormList from "./FormList";
import FormViewer from "./FormViewer";
import { generateFormToken, getFormsUrl } from "../../../../lib/forms";
import PDFFormPreviewModal from "../PDFFormPreviewModal";
import { cn } from "../../../../lib/utils";
import BillingFormFilledView from "../../billing/BillingFormFilledView";
import { Appointment, Patient, PatientSchema } from "../../../types";
import { FormContextProvider } from "../../../forms/formContext";
import { FormMap } from "./formMap";
import { FormType } from "../../../types/constants";

interface FormSectionProps {
	appointment: Appointment;
	examinationId: string;
	onPhotoUpdated?: () => void;
}

const FormSection: React.FC<FormSectionProps> = ({
	appointment,
	examinationId,
	onPhotoUpdated,
}) => {
	const [activeTab, setActiveTab] = useState<"forms" | "billing">("forms");
	const [activeFormPage, setActiveFormPage] = useState<string | null>(null);
	const [selectedFormTypeForEdit, setSelectedFormTypeForEdit] =
		useState<FormType | null>(null);
	const [selectedFormTypeForPreview, setSelectedFormTypeForPreview] =
		useState<FormType | null>(null);
	const [selectedBillingFormId, setSelectedBillingFormId] = useState<
		string | null
	>(null);

	const [formUrl, setFormUrl] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	// Load patient data for PDF
	const { data: patient } = useQuery({
		queryKey: ["patient", appointment.patient?.id],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("patients")
				.select(
					`
					gender,
					title,
					patient_number,
					first_name,
					last_name,
					birth_date,
					phone,
					mobile,
					email,
					street,
					house_number,
					postal_code,
					city,
					country,
					insurance:insurance_providers(
						id,
						name,
						type
					)
					`
				)
				.eq("id", appointment.patient?.id)
				.single();

			if (error) {
				console.error(error);
				throw error;
			}

			try {
				const p = PatientSchema.partial().parse(data) as Patient;
				return p;
			} catch (valError) {
				console.error(valError);
			}
		},
	});

	// // Lade Untersuchungsdetails, um die Kategorie-ID zu erhalten
	// const { data: examination, isLoading: isLoadingExamination } = useQuery({
	// 	queryKey: ["examination-details", examinationId],
	// 	queryFn: async () => {
	// 		const { data, error } = await supabase
	// 			.from("examinations")
	// 			.select(
	// 				`
	// 				id,
	// 				name,
	// 				category_id
	// 			`
	// 			)
	// 			.eq("id", examinationId)
	// 			.single();

	// 		if (error) {
	// 			console.error(error);
	// 			throw error;
	// 		}
	// 	},
	// });

	// Lade Abrechnungsbögen, die zur Kategorie der Untersuchung passen
	// const {
	// 	data: categoryBillingForms,
	// 	isLoading: isLoadingCategoryBillingForms,
	// } = useQuery({
	// 	queryKey: ["category-billing-forms", examination?.category_id],
	// 	queryFn: async () => {
	// 		if (!examination?.category_id) return [];

	// 		const { data, error } = await supabase
	// 			.from("billing_forms")
	// 			.select(
	// 				`
	// 				id,
	// 				name,
	// 				description
	// 			`
	// 			)
	// 			.eq("category_id", examination.category_id);

	// 		if (error) throw error;
	// 		return data;
	// 	},
	// 	enabled: !!examination?.category_id,
	// });

	// // Lade bereits ausgefüllte Abrechnungsbögen für diese Untersuchung
	// const { data: filledBillingForms, isLoading: isLoadingFilledBillingForms } =
	// 	useQuery({
	// 		queryKey: ["filled-billing-forms", examinationId],
	// 		queryFn: async () => {
	// 			const { data, error } = await supabase
	// 				.from("examination_billing_forms")
	// 				.select(
	// 					`
	// 				id,
	// 				form_id,
	// 				created_at,
	// 				billing_form:billing_forms(
	// 					id,
	// 					name,
	// 					description
	// 				)
	// 			`
	// 				)
	// 				.eq("examination_id", examinationId);

	// 			if (error) throw error;
	// 			return data;
	// 		},
	// 	});

	// Generate form URL
	const handleGenerateUrl = async () => {
		try {
			setError(null);
			const token = await generateFormToken(appointment.id);
			const url = getFormsUrl(token);
			setFormUrl(url);
		} catch (error: any) {
			console.error("Error generating form URL:", error);
			setError(error.message || "Fehler beim Generieren der Formular-URL");
		}
	};

	const handleRequestSignature = async () => {
		const { error: createError } = await supabase
			.from("signature_requests")
			.insert({
				device_id: 0,
				appointment_id: appointment.id,
				patient_id: appointment.patient.id,
			})
			.select("id")
			.single();

		if (createError) {
			console.error("Error creating appointment:", createError);
			throw createError;
		}
	};

	if (activeFormPage === "photo-capture") {
		return (
			<PatientPhotoCapture
				patientId={appointment.patient.id as string}
				onPhotoUpdated={() => {
					if (onPhotoUpdated) {
						onPhotoUpdated();
					}
					setActiveFormPage(null);
				}}
				onBack={() => setActiveFormPage(null)}
			/>
		);
	}

	if (selectedFormTypeForEdit) {
		return (
			<div>
				<button
					onClick={() => setSelectedFormTypeForEdit(null)}
					className="mb-6 text-sm text-blue-600 hover:text-blue-800"
				>
					← Zurück zur Formularübersicht
				</button>
				<FormContextProvider
					dataProvider={FormMap[selectedFormTypeForEdit].data}
					{...{ appointment, formType: selectedFormTypeForEdit }}
				>
					<FormViewer
						appointment={appointment}
						FormComponent={FormMap[selectedFormTypeForEdit].editForm}
					/>
				</FormContextProvider>
			</div>
		);
	}

	return (
		<>
			{/* Tabs für Formulare und Abrechnungsbögen */}
			<div className="border-b border-gray-200 mb-6">
				<nav className="-mb-px flex space-x-8" aria-label="Tabs">
					<button
						onClick={() => {
							setActiveTab("forms");
							setSelectedBillingFormId(null);
						}}
						className={cn(
							"whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm",
							activeTab === "forms"
								? "border-blue-500 text-blue-600"
								: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
						)}
					>
						Verfügbare Formulare
					</button>
					<button
						onClick={() => setActiveTab("billing")}
						className={cn(
							"whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm",
							activeTab === "billing"
								? "border-blue-500 text-blue-600"
								: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
						)}
					>
						Abrechnungsbögen
					</button>
				</nav>
			</div>

			<FormList
				appointmentId={appointment.id}
				examinationId={appointment.examination.id}
				billingType={appointment.billing_type}
				onPhotoCapture={() => setActiveFormPage("photo-capture")}
				onViewForm={(formType) => setSelectedFormTypeForEdit(formType)}
				onPreviewForm={(formType) => setSelectedFormTypeForPreview(formType)}
			/>

			<div className="mt-10">
				<h3 className="text-lg font-medium mb-4">Formular-Link generieren</h3>

				{error && (
					<div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
						<p className="text-sm text-red-700">{error}</p>
					</div>
				)}

				{formUrl ? (
					<div className="space-y-4">
						<p className="text-sm text-gray-500">
							Unter folgendem Link können die Formulare ausgefüllt werden:
						</p>
						<div className="flex items-center space-x-2">
							<input
								type="text"
								readOnly
								value={formUrl}
								className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
							/>
							<a
								href={formUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
							>
								<ExternalLink className="h-4 w-4 mr-1" />
								Öffnen
							</a>
						</div>
					</div>
				) : (
					<button
						onClick={handleGenerateUrl}
						className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
					>
						Link generieren
					</button>
				)}
			</div>

			<div className="mt-10">
				<h3 className="text-lg font-medium mb-4">
					Ausgefüllte Formulare unterschreiben
				</h3>

				{error && (
					<div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
						<p className="text-sm text-red-700">{error}</p>
					</div>
				)}

				<button
					onClick={handleRequestSignature}
					className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
				>
					Formulare unterschreiben
				</button>
			</div>

			{selectedFormTypeForPreview && (
				<FormContextProvider
					dataProvider={FormMap[selectedFormTypeForPreview].data}
					{...{
						appointment,
						formType: selectedFormTypeForPreview,
						stringify: false,
					}}
				>
					<PDFFormPreviewModal
						onClose={() => setSelectedFormTypeForPreview(null)}
						formType={selectedFormTypeForPreview}
						patientData={patient || ({} as Patient)}
						appointmentData={appointment}
					/>
				</FormContextProvider>
			)}

			<canvas
				style={{ display: "none", maxWidth: "400px", maxHeight: "200px" }}
				id="render-canvas-chart"
			/>
		</>
	);
};

export default FormSection;
