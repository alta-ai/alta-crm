import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../../lib/supabase";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import PatientPhotoCapture from "../PatientPhotoCapture";
import FormList from "./FormList";
import FormViewer from "./FormViewer";
import { generateFormToken, getFormsUrl } from "../../../../lib/forms";
import { PDFPreview } from "../../../PDFPreview";
import { FormDataProvider } from "../../../pdf/formDataContext";
import { RegistrationForm } from "../../../pdf/RegistrationForm";
import { RegistrationFormData } from "./forms/types";

interface FormSectionProps {
	appointmentId: string;
	patientId: string;
	patientName: string;
	patientEmail: string;
	appointmentDate: string;
	examinationName: string;
	examinationId: string;
	billingType: string;
	onPhotoUpdated?: () => void;
}

const FormSection: React.FC<FormSectionProps> = ({
	appointmentId,
	patientId,
	patientName,
	patientEmail,
	appointmentDate,
	examinationName,
	examinationId,
	billingType,
	onPhotoUpdated,
}) => {
	const [activeFormPage, setActiveFormPage] = useState<string | null>(null);
	const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
	const [formUrl, setFormUrl] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [showPDFPreview, setShowPDFPreview] = useState(false);

	// Load patient data for PDF
	const { data: patient } = useQuery({
		queryKey: ["patient", patientId],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("patients")
				.select("*")
				.eq("id", patientId)
				.single();

			if (error) throw error;
			return data;
		},
	});

	// Load form submission if it exists
	const { data: formSubmission } = useQuery({
		queryKey: ["registration-form-submission", appointmentId],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("registration_form_submissions")
				.select("*")
				.eq("appointment_id", appointmentId)
				.maybeSingle();

			if (error) throw error;
			return data;
		},
	});

	// Generate form URL
	const handleGenerateUrl = async () => {
		try {
			setError(null);
			const token = await generateFormToken(appointmentId);
			const url = getFormsUrl(token);
			setFormUrl(url);
		} catch (error: any) {
			console.error("Error generating form URL:", error);
			setError(error.message || "Fehler beim Generieren der Formular-URL");
		}
	};

	if (showPDFPreview) {
		// Prepare data for PDF
		const formData = formSubmission
			? {
					urologicInformation: {
						currentlyUndergoingTreatment:
							formSubmission.current_treatment === "true",
						recommendationOfUrologist:
							formSubmission.treatment_recommendations?.join(", "),
						visitDueToRecommendation:
							formSubmission.doctor_recommendation === "true",
						nameOfUrologist: formSubmission.referring_doctor_name,
						gotTransfer: formSubmission.has_transfer === "true",
						sendReportToUrologist:
							formSubmission.send_report_to_doctor === "true",
					},
			  }
			: {};

		const patientData = {
			title: formSubmission?.title || patient?.title,
			name: formSubmission?.first_name || patient?.first_name, // Vorname
			surname: formSubmission?.last_name || patient?.last_name, // Nachname
			birthdate: formSubmission?.birth_date || patient?.birth_date,
			contact: {
				phone: formSubmission?.phone_landline || patient?.phone,
				mobile: formSubmission?.phone_mobile || patient?.phone,
				email: formSubmission?.email || patient?.email,
			},
			address: {
				street: formSubmission?.street || patient?.street,
				houseNumber: formSubmission?.house_number || patient?.house_number,
				zipCode: formSubmission?.postal_code || patient?.postal_code,
				city: formSubmission?.city || patient?.city,
			},
			insurance: {
				privateInsurance:
					formSubmission?.insurance_type === "Private Krankenversicherung (PKV)"
						? formSubmission?.insurance_provider_id
						: undefined,
				eligibleForAid: formSubmission?.has_beihilfe === "true",
			},
		};

		const appointmentData = {
			examination: examinationName,
			date: format(new Date(appointmentDate), "dd.MM.yyyy", { locale: de }),
		};

		return (
			<div className="h-full">
				<PDFPreview
					document={<RegistrationForm />}
					contexts={[
						(props) => (
							<FormDataProvider<RegistrationFormData>
								initialFormData={formData}
								initialPatientData={patientData}
								initialAppointmentData={appointmentData}
							>
								{props}
							</FormDataProvider>
						),
					]}
					fileName={`Anmeldeformular_${patientName.replace(/\s+/g, "_")}.pdf`}
				/>
			</div>
		);
	}

	if (activeFormPage === "photo-capture") {
		return (
			<PatientPhotoCapture
				patientId={patientId}
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

	if (selectedFormId) {
		return (
			<div>
				<button
					onClick={() => setSelectedFormId(null)}
					className="mb-6 text-sm text-blue-600 hover:text-blue-800"
				>
					← Zurück zur Formularübersicht
				</button>
				<FormViewer
					formId={selectedFormId}
					appointmentId={appointmentId}
					formType="registration"
				/>
			</div>
		);
	}

	return (
		<>
			<h3 className="text-lg font-medium">Termin Details</h3>

			{/* Patient und weitere Infos */}
			<div className="mt-6 mb-10">
				<div className="grid grid-cols-2 gap-8">
					<div>
						<h4 className="text-sm text-gray-500">Patient</h4>
						<p>{patientName}</p>
					</div>
					<div>
						<h4 className="text-sm text-gray-500">E-Mail</h4>
						<p>{patientEmail}</p>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-8 mt-6">
					<div>
						<h4 className="text-sm text-gray-500">Termin</h4>
						<p>
							{format(
								new Date(appointmentDate),
								"EEEE, d. MMMM yyyy 'um' HH:mm 'Uhr'",
								{ locale: de }
							)}
						</p>
					</div>
					<div>
						<h4 className="text-sm text-gray-500">Untersuchung</h4>
						<p>{examinationName}</p>
					</div>
				</div>
			</div>

			<div className="flex justify-between items-center mb-4">
				<h3 className="text-lg font-medium">Verfügbare Formulare</h3>
				<button
					onClick={() => setShowPDFPreview(true)}
					className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
				>
					PDF Vorschau
				</button>
			</div>

			<FormList
				appointmentId={appointmentId}
				examinationId={examinationId}
				billingType={billingType}
				onPhotoCapture={() => setActiveFormPage("photo-capture")}
				onViewForm={(formId) => setSelectedFormId(formId)}
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
		</>
	);
};

export default FormSection;
