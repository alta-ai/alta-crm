import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";

import { supabase } from "../../../../lib/supabase";
import PatientPhotoCapture from "../PatientPhotoCapture";
import FormList from "./FormList";
import FormViewer from "./FormViewer";
import { generateFormToken, getFormsUrl } from "../../../../lib/forms";
import PDFFormPreviewModal from "../PDFFormPreviewModal";
import {
	Patient,
	Appointment,
	PatientSchema,
	RegistrationForm,
	RegistrationFormSchema,
} from "../../../types";
import { FormContextProvider } from "../../../forms/formContext";
import { FormMap } from "./formMap";
import { FormType } from "../../../types/constants";

interface FormSectionProps {
	appointment: Appointment;
	onPhotoUpdated?: () => void;
}

const FormSection: React.FC<FormSectionProps> = ({
	appointment,
	onPhotoUpdated,
}) => {
	const [activeFormPage, setActiveFormPage] = useState<string | null>(null);
	const [selectedFormTypeForEdit, setSelectedFormTypeForEdit] =
		useState<FormType | null>(null);
	const [selectedFormTypeForPreview, setSelectedFormTypeForPreview] =
		useState<FormType | null>(null);

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
			<div className="flex justify-between items-center mb-4">
				<h3 className="text-lg font-medium">Verfügbare Formulare</h3>
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

			{/* PDF Form Preview Modal */}
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
						form={FormMap[selectedFormTypeForPreview].pdfForm}
						formName={FormMap[selectedFormTypeForPreview].label}
						patientData={patient || ({} as Patient)}
						appointmentData={appointment}
					/>
				</FormContextProvider>
			)}
		</>
	);
};

export default FormSection;
