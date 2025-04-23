import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

// Dynamic form components import
import RegistrationForm from "../forms/registration/RegistrationForm";
import CostReimbursementForm from "../forms/CostReimbursementForm";
import PrivacyForm from "../forms/privacy/PrivacyForm";
import CompleteForm from "../forms/mri/MRIForm";
import CTConsentForm from "../forms/ct/CTForm";
import CTTherapyForm from "../forms/CTTherapyGorm";
import MRTCTConsentForm from "../forms/MRTCTConsentForm";
import ProstateQuestionnaireForm from "../forms/ProstateQuestionnaireForm";

const FORM_COMPONENTS: Record<string, React.ComponentType<any>> = {
	RegistrationForm,
	CostReimbursementForm,
	PrivacyForm,
	CompleteForm,
	CTConsentForm,
	CTTherapyForm,
	MRTCTConsentForm,
	ProstateQuestionnaireForm,
};

interface FormViewerProps {
	formId?: string;
	onClose?: () => void;
	isModal?: boolean;
}

const FormViewer = ({ formId, onClose, isModal = false }: FormViewerProps) => {
	const [form, setForm] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();
	const params = useParams();

	// Use formId from props or from URL params
	const currentFormId = formId || params.id;

	useEffect(() => {
		const fetchForm = async () => {
			if (!currentFormId) return;

			setLoading(true);
			try {
				const { data, error } = await supabase
					.from("forms")
					.select("*")
					.eq("id", currentFormId)
					.single();

				if (error) throw error;
				setForm(data);
			} catch (error) {
				console.error("Error fetching form:", error);
				setError(
					"Fehler beim Laden des Formulars. Bitte versuchen Sie es später erneut."
				);
			} finally {
				setLoading(false);
			}
		};

		fetchForm();
	}, [currentFormId]);

	const handleBack = () => {
		if (isModal && onClose) {
			onClose();
		} else {
			navigate("/admin/forms");
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="text-gray-600">Formular wird geladen...</div>
			</div>
		);
	}

	if (error || !form) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="text-red-600">
					{error || "Formular konnte nicht gefunden werden."}
				</div>
			</div>
		);
	}

	// Get the appropriate component based on form_data.component
	const FormComponent = form.form_data?.component
		? FORM_COMPONENTS[form.form_data.component]
		: null;

	return (
		<div
			className={cn(
				"bg-gray-50",
				isModal ? "h-full overflow-y-auto" : "min-h-screen"
			)}
		>
			<div className="max-w-4xl mx-auto p-6">
				<div className="flex items-center justify-between mb-6">
					<div>
						<h1 className="text-2xl font-semibold text-gray-900">
							{form.name}
						</h1>
						{form.description && (
							<p className="mt-2 text-sm text-gray-700">{form.description}</p>
						)}
					</div>
					<button
						onClick={handleBack}
						className="rounded-full p-2 text-gray-600 hover:bg-gray-200 focus:outline-none"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				<div className="bg-white rounded-lg shadow-sm p-6 mb-6">
					<div className="flex items-center space-x-2 mb-4">
						<span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
							{form.form_type}
						</span>
						<span className="text-xs text-gray-500">ID: {currentFormId}</span>
					</div>

					{FormComponent ? (
						<div className="border-t border-gray-200 pt-6 mt-6">
							<h2 className="text-lg font-medium text-gray-900 mb-4">
								Formular-Vorschau
							</h2>
							<div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
								<FormComponent readOnly={true} />
							</div>
						</div>
					) : (
						<div className="text-center p-8 text-gray-600">
							<p>Keine Vorschau verfügbar für diesen Formulartyp.</p>
						</div>
					)}
				</div>

				{/* API Information */}
				{form.api_endpoint && (
					<div className="bg-white rounded-lg shadow-sm p-6 mb-6">
						<h2 className="text-lg font-medium text-gray-900 mb-4">
							API-Konfiguration
						</h2>
						<div className="space-y-2">
							<p>
								<strong>Endpoint:</strong> {form.api_endpoint}
							</p>
							{form.api_auth_token && (
								<p>
									<strong>Authentifizierung:</strong> Konfiguriert
								</p>
							)}
						</div>

						{form.api_mappings?.length > 0 && (
							<div className="mt-4">
								<h3 className="text-md font-medium text-gray-900 mb-2">
									Feld-Zuordnungen
								</h3>
								<div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
									<table className="min-w-full">
										<thead>
											<tr>
												<th className="text-left text-sm font-medium text-gray-700">
													Formularfeld
												</th>
												<th className="text-left text-sm font-medium text-gray-700">
													API-Schlüssel
												</th>
											</tr>
										</thead>
										<tbody>
											{form.api_mappings.map((mapping: any, index: number) => {
												const fieldLabel =
													form.form_fields?.fields.find(
														(f: any) => f.id === mapping.fieldId
													)?.label || mapping.fieldId;
												return (
													<tr key={index} className="border-t border-gray-200">
														<td className="py-2 text-sm text-gray-900">
															{fieldLabel}
														</td>
														<td className="py-2 text-sm text-gray-900">
															{mapping.apiKey}
														</td>
													</tr>
												);
											})}
										</tbody>
									</table>
								</div>
							</div>
						)}
					</div>
				)}

				{/* Fields Information */}
				{form.form_fields?.fields && form.form_fields.fields.length > 0 && (
					<div className="bg-white rounded-lg shadow-sm p-6">
						<h2 className="text-lg font-medium text-gray-900 mb-4">
							Formularfelder
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{form.form_fields.fields.map((field: any, index: number) => (
								<div
									key={index}
									className="bg-gray-50 rounded-lg p-3 border border-gray-200"
								>
									<div className="flex justify-between">
										<p className="text-sm font-medium text-gray-900">
											{field.label}
										</p>
										<p className="text-xs text-gray-500">ID: {field.id}</p>
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default FormViewer;
