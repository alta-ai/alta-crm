import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { supabase } from "@lib/supabase";
import { generateFormToken, getFormsUrl } from "@lib/forms";
import { cn } from "@components/styling";
import PatientPhotoCapture from "../../../PatientPhotoCapture";
import FormList from "../FormList";
import FormViewer from "../FormViewer";
import PDFFormPreviewModal from "../../../PDFFormPreviewModal";
import { Appointment, Patient } from "@components/types";
import { FormContextProvider } from "../../../../../forms/formContext";
import { FormMap } from "../formMap";
import { FormType } from "@components/types/constants";
import { TabSelectorProps } from "@components/ui";

export const FormTabSelector = ({ isActive }: TabSelectorProps) => {
	return (
		<button
			className={cn(
				"whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm",
				isActive
					? "border-blue-500 text-blue-600"
					: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
			)}
		>
			Verfügbare Formulare
		</button>
	);
};

interface FormTabContentProps {
	appointment: Appointment;
	patient: Patient;
}

export const FormTabContent = ({
	appointment,
	patient,
}: FormTabContentProps) => {
	const queryClient = useQueryClient();

	const [activeFormPage, setActiveFormPage] = useState<string | null>(null);
	const [selectedFormTypeForEdit, setSelectedFormTypeForEdit] =
		useState<FormType | null>(null);
	const [selectedFormTypeForPreview, setSelectedFormTypeForPreview] =
		useState<FormType | null>(null);

	const [error, setError] = useState<string | null>(null);
	const [formUrl, setFormUrl] = useState<string | null>(null);

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

	const onPhotoUpdated = async () => {
		queryClient.invalidateQueries({
			queryKey: ["patient-photo", appointment.patient.id],
		});
	};

	if (activeFormPage === "photo-capture") {
		return (
			<PatientPhotoCapture
				patientId={appointment.patient.id as string}
				onPhotoUpdated={() => {
					onPhotoUpdated;
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
			<FormList
				appointmentId={appointment.id}
				examinationId={appointment.examination.id as string}
				billingType={appointment.billing_type}
				onPhotoCapture={() => setActiveFormPage("photo-capture")}
				onViewForm={(formType: FormType) =>
					setSelectedFormTypeForEdit(formType)
				}
				onPreviewForm={(formType: FormType) =>
					setSelectedFormTypeForPreview(formType)
				}
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
