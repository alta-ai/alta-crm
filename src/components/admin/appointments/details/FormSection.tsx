import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../../lib/supabase";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Link } from "react-router-dom";
import { ExternalLink, ArrowLeft } from "lucide-react";
import PatientPhotoCapture from "../PatientPhotoCapture";
import FormList from "./FormList";
import FormViewer from "./FormViewer";
import { generateFormToken, getFormsUrl } from "../../../../lib/forms";
import { PDFPreview } from "../../../PDFPreview";
import { FormDataProvider } from "../../../pdf/formDataContext";
import { RegistrationForm } from "../../../pdf/RegistrationForm";
import PDFFormPreviewModal from "../PDFFormPreviewModal";
import { cn } from "../../../../lib/utils";
import BillingFormFilledView from "../../billing/BillingFormFilledView";

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
	const [activeTab, setActiveTab] = useState<"forms" | "billing">("forms");
	const [activeFormPage, setActiveFormPage] = useState<string | null>(null);
	const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
	const [selectedBillingFormId, setSelectedBillingFormId] = useState<string | null>(null);
	const [formUrl, setFormUrl] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [showPDFPreview, setShowPDFPreview] = useState(false);
	const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);

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

	// Lade Untersuchungsdetails, um die Kategorie-ID zu erhalten
	const { data: examination, isLoading: isLoadingExamination } = useQuery({
		queryKey: ["examination-details", examinationId],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("examinations")
				.select(`
					id,
					name,
					category_id
				`)
				.eq("id", examinationId)
				.single();

			if (error) throw error;
			return data;
		},
	});

	// Lade Abrechnungsbögen, die zur Kategorie der Untersuchung passen
	const { data: categoryBillingForms, isLoading: isLoadingCategoryBillingForms } = useQuery({
		queryKey: ["category-billing-forms", examination?.category_id],
		queryFn: async () => {
			if (!examination?.category_id) return [];

			const { data, error } = await supabase
				.from("billing_forms")
				.select(`
					id,
					name,
					description
				`)
				.eq("category_id", examination.category_id);

			if (error) throw error;
			return data;
		},
		enabled: !!examination?.category_id,
	});

	// Lade bereits ausgefüllte Abrechnungsbögen für diese Untersuchung
	const { data: filledBillingForms, isLoading: isLoadingFilledBillingForms } = useQuery({
		queryKey: ["filled-billing-forms", examinationId],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("examination_billing_forms")
				.select(`
					id,
					form_id,
					created_at,
					billing_form:billing_forms(
						id,
						name,
						description
					)
				`)
				.eq("examination_id", examinationId);

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

	// Funktion zum Öffnen der PDF-Vorschau im Modal
	const handleOpenPDFPreview = () => {
		setIsPDFModalOpen(true);
	};

	// Vorbereiten der PDF-Daten
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

	// Funktion zum Zurückkehren zur Übersicht der Abrechnungsbögen
	const handleBackToBillingForms = () => {
		setSelectedBillingFormId(null);
	};

	// Automatisch den ersten Abrechnungsbogen auswählen, wenn der Tab wechselt oder wenn Daten geladen werden
	useEffect(() => {
		if (activeTab === "billing" && !isLoadingCategoryBillingForms && !isLoadingFilledBillingForms && !selectedBillingFormId) {
			// Prüfen, ob es bereits ausgefüllte Formulare gibt
			if (filledBillingForms && filledBillingForms.length > 0) {
				// Zuerst bereits ausgefüllte Formulare anzeigen
				setSelectedBillingFormId(filledBillingForms[0].form_id);
			} else if (categoryBillingForms && categoryBillingForms.length > 0) {
				// Ansonsten das erste verfügbare Formular anzeigen
				setSelectedBillingFormId(categoryBillingForms[0].id);
			}
		}
	}, [
		activeTab, 
		categoryBillingForms, 
		filledBillingForms, 
		selectedBillingFormId, 
		isLoadingCategoryBillingForms, 
		isLoadingFilledBillingForms
	]);

	if (showPDFPreview) {
		return (
			<div className="h-full">
				<PDFPreview
					document={<RegistrationForm />}
					contexts={[
						(props) => (
							<FormDataProvider
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

			{activeTab === "forms" ? (
				<>
					<div className="flex justify-between items-center mb-4">
						<h3 className="text-lg font-medium">Verfügbare Formulare</h3>
					</div>

					<FormList
						appointmentId={appointmentId}
						examinationId={examinationId}
						billingType={billingType}
						onPhotoCapture={() => setActiveFormPage("photo-capture")}
						onViewForm={(formId) => setSelectedFormId(formId)}
						onPreviewForm={(formId) => handleOpenPDFPreview()}
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
			) : (
				<div>
					{/* Wenn ein Abrechnungsbogen ausgewählt ist, zeigen wir ihn an */}
					{selectedBillingFormId ? (
						<>
							<button
								onClick={handleBackToBillingForms}
								className="mb-6 text-sm text-blue-600 hover:text-blue-800 flex items-center"
							>
								<ArrowLeft className="h-4 w-4 mr-1" />
								Zurück zur Übersicht
							</button>
							
							<BillingFormFilledView
								examinationId={examinationId}
								formId={selectedBillingFormId}
								onComplete={handleBackToBillingForms}
							/>
						</>
					) : (
						<>
							<div className="flex justify-between items-center mb-4">
								<h3 className="text-lg font-medium">Abrechnungsbögen</h3>
							</div>

							{isLoadingExamination || isLoadingCategoryBillingForms || isLoadingFilledBillingForms ? (
								<div className="py-4 text-gray-500">Lade Abrechnungsbögen...</div>
							) : (
								<div className="space-y-6">
									{/* Bereits ausgefüllte Abrechnungsbögen */}
									{filledBillingForms && filledBillingForms.length > 0 && (
										<div className="mb-8">
											<h4 className="text-md font-medium mb-3">Ausgefüllte Abrechnungsbögen</h4>
											<div className="space-y-3">
												{filledBillingForms.map((filledForm: any) => (
													<div
														key={filledForm.id}
														className="w-full flex items-center justify-between p-3 text-left border rounded-lg border-green-200 bg-green-50 hover:bg-green-100 cursor-pointer"
														onClick={() => {
															setSelectedBillingFormId(filledForm.form_id);
														}}
													>
														<div>
															<span className="font-medium">
																{filledForm.billing_form.name}
															</span>
															{filledForm.billing_form.description && (
																<p className="text-sm text-gray-500 mt-1">
																	{filledForm.billing_form.description}
																</p>
															)}
															<p className="text-xs text-gray-500 mt-1">
																Ausgefüllt am: {new Date(filledForm.created_at).toLocaleDateString()}
															</p>
														</div>
														<ExternalLink className="h-4 w-4 text-gray-400" />
													</div>
												))}
											</div>
										</div>
									)}

									{/* Verfügbare Abrechnungsbögen für die Kategorie */}
									<div>
										<h4 className="text-md font-medium mb-3">Verfügbare Abrechnungsbögen</h4>
										{categoryBillingForms && categoryBillingForms.length > 0 ? (
											<div className="space-y-3">
												{categoryBillingForms.map((billingForm: any) => {
													// Prüfen, ob bereits ausgefüllt
													const isAlreadyFilled = filledBillingForms?.some(
														(filledForm: any) => filledForm.form_id === billingForm.id
													);

													return (
														<div
															key={billingForm.id}
															className={cn(
																"w-full flex items-center justify-between p-3 text-left border rounded-lg transition-colors cursor-pointer",
																isAlreadyFilled
																	? "border-green-200 bg-green-50 hover:bg-green-100"
																	: "border-gray-200 hover:bg-gray-50"
															)}
															onClick={() => {
																setSelectedBillingFormId(billingForm.id);
															}}
														>
															<div>
																<span className="font-medium">{billingForm.name}</span>
																{billingForm.description && (
																	<p className="text-sm text-gray-500 mt-1">
																		{billingForm.description}
																	</p>
																)}
																{isAlreadyFilled && (
																	<p className="text-xs text-green-600 mt-1">
																		Ausgefüllt
																	</p>
																)}
															</div>
															<ExternalLink className="h-4 w-4 text-gray-400" />
														</div>
													);
												})}
											</div>
										) : (
											<div className="py-4 text-gray-500">
												Keine Abrechnungsbögen für diese Untersuchungskategorie verfügbar.
											</div>
										)}
									</div>
								</div>
							)}
						</>
					)}
				</div>
			)}

			{/* PDF Form Preview Modal */}
			<PDFFormPreviewModal
				isOpen={isPDFModalOpen}
				onClose={() => setIsPDFModalOpen(false)}
				formName="Anmeldeformular"
				patientName={patientName}
				formData={formData}
				patientData={patientData}
				appointmentData={appointmentData}
			/>
		</>
	);
};

export default FormSection;
