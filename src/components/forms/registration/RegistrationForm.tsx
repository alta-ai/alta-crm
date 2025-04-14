import { useState } from "react";
import { useForm } from "react-hook-form";
import { Info } from "lucide-react";

import type {
	RegistrationForm as RegistrationFormType,
	InsuranceProvider,
} from "../../types";
import { INSURANCE_TYPE } from "../../types/constants";
import { useFormContext } from "../formContext";

interface RegistrationFormProps {
	onComplete?: () => void;
	readOnly?: boolean;
	onSubmit?: (data: RegistrationFormType) => Promise<void>;
}

interface RegistrationFormDataContextType {
	insurances: InsuranceProvider[];
	submission: RegistrationFormType;
}

export const RegistrationForm = ({
	onComplete,
	readOnly,
	onSubmit: externalSubmit,
}: RegistrationFormProps) => {
	const { data } = useFormContext<RegistrationFormDataContextType>();

	const [isSaving, setIsSaving] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [saveSuccess, setSaveSuccess] = useState(false);

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<RegistrationFormType>({
		defaultValues: data?.submission,
	});

	// Watch fields for conditional rendering
	const insuranceType = watch("insuranceFreeText");
	const doctorRecommendation = watch("details.doctorRecommendation");
	const currentTreatment = watch("details.currentTreatment");
	const hasTransfer = watch("details.hasTransfer");
	const foundThroughDoctor = watch("details.foundThrough");

	const onFormSubmit = async (data: RegistrationFormType) => {
		if (externalSubmit) {
			try {
				setIsSaving(true);
				setSaveError(null);
				setSaveSuccess(false);

				await externalSubmit(data);

				setSaveSuccess(true);
				setTimeout(() => setSaveSuccess(false), 3000);
			} catch (error: any) {
				console.error("Error saving form:", error);
				setSaveError(error.message || "Fehler beim Speichern des Formulars");
			} finally {
				setIsSaving(false);
			}
		} else if (onComplete) {
			onComplete();
		}
	};

	const renderInsuranceOptions = (insuranceType: string) => {
		const selectedInsurances = data?.insurances
			.filter((insurance) => insurance.type === insuranceType)
			.map((insurance) => (
				<option key={insurance.id} value={insurance.id}>
					{insurance.name}
				</option>
			));

		return selectedInsurances;
	};

	return (
		<form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
			{/* Personal Information */}
			<div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
				<h2 className="text-xl font-semibold">Persönliche Informationen</h2>

				{/* Gender */}
				<div className="space-y-2">
					<label className="block text-sm font-medium text-gray-700">
						Geschlecht *
					</label>
					<div className="space-x-4">
						{[
							{ label: "weiblich", value: "F" },
							{ label: "männlich", value: "M" },
							{ label: "divers", value: "D" },
						].map((option) => (
							<label key={option.value} className="inline-flex items-center">
								<input
									type="radio"
									value={option.value}
									disabled={readOnly}
									{...register("gender", {
										required: "Geschlecht ist erforderlich",
									})}
									className="form-radio h-4 w-4 text-blue-600"
								/>
								<span className="ml-2 text-gray-700">{option.label}</span>
							</label>
						))}
					</div>
					{errors.gender && (
						<p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>
					)}
				</div>

				{/* Title */}
				<div>
					<label className="block text-sm font-medium text-gray-700">
						Titel
					</label>
					<select
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
						disabled={readOnly}
						{...register("title")}
					>
						<option value="">Kein Titel</option>
						<option value="Dr.">Dr.</option>
						<option value="Dr. med.">Dr. med.</option>
						<option value="Prof. Dr.">Prof. Dr.</option>
						<option value="Prof. Dr. med.">Prof. Dr. med.</option>
					</select>
				</div>

				{/* Name Fields */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Vorname *
						</label>
						<input
							type="text"
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
							disabled={readOnly}
							{...register("name", {
								required: "Vorname ist erforderlich",
							})}
						/>
						{errors.name && (
							<p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
						)}
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Nachname *
						</label>
						<input
							type="text"
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
							disabled={readOnly}
							{...register("surname", {
								required: "Nachname ist erforderlich",
							})}
						/>
						{errors.surname && (
							<p className="text-red-500 text-sm mt-1">
								{errors.surname.message}
							</p>
						)}
					</div>
				</div>

				{/* Address */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="md:col-span-2">
						<label className="block text-sm font-medium text-gray-700">
							Straße *
						</label>
						<input
							type="text"
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
							disabled={readOnly}
							{...register("address.street", {
								required: "Straße ist erforderlich",
							})}
						/>
						{errors.address?.street && (
							<p className="text-red-500 text-sm mt-1">
								{errors.address?.street?.message}
							</p>
						)}
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Hausnummer *
						</label>
						<input
							type="text"
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
							disabled={readOnly}
							{...register("address.houseNumber", {
								required: "Hausnummer ist erforderlich",
							})}
						/>
						{errors.address?.houseNumber && (
							<p className="text-red-500 text-sm mt-1">
								{errors.address?.houseNumber?.message}
							</p>
						)}
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div>
						<label className="block text-sm font-medium text-gray-700">
							PLZ *
						</label>
						<input
							type="text"
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
							disabled={readOnly}
							{...register("address.zipCode", {
								required: "PLZ ist erforderlich",
								pattern: {
									value: /^\d{5}$/,
									message: "Bitte geben Sie eine gültige PLZ ein",
								},
							})}
						/>
						{errors.address?.zipCode && (
							<p className="text-red-500 text-sm mt-1">
								{errors.address?.zipCode?.message}
							</p>
						)}
					</div>
					<div className="md:col-span-2">
						<label className="block text-sm font-medium text-gray-700">
							Wohnort *
						</label>
						<input
							type="text"
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
							disabled={readOnly}
							{...register("address.city", {
								required: "Wohnort ist erforderlich",
							})}
						/>
						{errors.address?.city && (
							<p className="text-red-500 text-sm mt-1">
								{errors.address?.city.message}
							</p>
						)}
					</div>
				</div>

				{/* Contact Information */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Telefon (Festnetz)
						</label>
						<input
							type="tel"
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
							disabled={readOnly}
							{...register("contact.phone")}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Mobil *
						</label>
						<input
							type="tel"
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
							disabled={readOnly}
							{...register("contact.mobile", {
								required: "Mobilnummer ist erforderlich",
							})}
						/>
						{errors.contact?.mobile && (
							<p className="text-red-500 text-sm mt-1">
								{errors.contact?.mobile?.message}
							</p>
						)}
					</div>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700">
						E-Mail *
					</label>
					<input
						type="email"
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
						disabled={readOnly}
						{...register("contact.email", {
							required: "E-Mail ist erforderlich",
							pattern: {
								value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
								message: "Ungültige E-Mail-Adresse",
							},
						})}
					/>
					{errors.contact?.email && (
						<p className="text-red-500 text-sm mt-1">
							{errors.contact?.email?.message}
						</p>
					)}
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700">
						Geburtstag (TT.MM.JJJJ) *
					</label>
					<input
						type="date"
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
						disabled={readOnly}
						{...register("birthdate", {
							required: "Geburtstag ist erforderlich",
						})}
					/>
					{errors.birthdate && (
						<p className="text-red-500 text-sm mt-1">
							{errors.birthdate.message}
						</p>
					)}
				</div>
			</div>

			{/* Insurance Information */}
			<div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
				<h2 className="text-xl font-semibold">Versicherungsinformationen</h2>

				<div className="space-y-4">
					<label className="block text-sm font-medium text-gray-700">
						Wie sind Sie versichert? *
					</label>
					<div className="space-y-2">
						{[
							"Private Krankenversicherung (PKV)",
							"Ich zahle die Untersuchung selbst und bin gesetzlich Krankenversichert (GKV)",
							"Ich zahle die Untersuchung selbst und bin nicht versichert",
						].map((option) => (
							<label key={option} className="flex items-center">
								<input
									type="radio"
									value={option}
									disabled={readOnly}
									{...register("insuranceFreeText", {
										required: "Bitte wählen Sie Ihre Versicherungsart",
									})}
									className="form-radio h-4 w-4 text-blue-600"
								/>
								<span className="ml-2 text-gray-700">{option}</span>
							</label>
						))}
					</div>
					{errors.insuranceFreeText && (
						<p className="text-red-500 text-sm mt-1">
							{errors.insuranceFreeText.message}
						</p>
					)}
				</div>

				{insuranceType === "Private Krankenversicherung (PKV)" && (
					<>
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Private Krankenversicherung *
							</label>
							<select
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
								disabled={readOnly}
								{...register("insurance.id", {
									required: "Bitte wählen Sie Ihre Versicherung",
								})}
							>
								<option value="">Bitte wählen</option>
								{renderInsuranceOptions(INSURANCE_TYPE[0])}
							</select>
							{errors.insurance?.id && (
								<p className="text-red-500 text-sm mt-1">
									{errors.insurance?.id?.message}
								</p>
							)}
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700">
								Sind Sie Beihilfe berechtigt? *
							</label>
							<div className="mt-2 space-x-4">
								{["Ja", "Nein"].map((option) => (
									<label key={option} className="inline-flex items-center">
										<input
											type="radio"
											value={option === "Ja" ? "true" : "false"}
											disabled={readOnly}
											{...register("details.hasBeihilfe", {
												required: "Diese Angabe ist erforderlich",
											})}
											className="form-radio h-4 w-4 text-blue-600"
										/>
										<span className="ml-2 text-gray-700">{option}</span>
									</label>
								))}
							</div>
							{errors.details?.hasBeihilfe && (
								<p className="text-red-500 text-sm mt-1">
									{errors.details?.hasBeihilfe?.message}
								</p>
							)}
						</div>
					</>
				)}

				{insuranceType ===
					"Ich zahle die Untersuchung selbst und bin gesetzlich Krankenversichert (GKV)" && (
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Gesetzliche Krankenversicherung *
						</label>
						<select
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
							disabled={readOnly}
							{...register("insurance.id", {
								required: "Bitte wählen Sie Ihre Versicherung",
							})}
						>
							<option value="">Bitte wählen</option>
							{renderInsuranceOptions(INSURANCE_TYPE[1])}
						</select>
						{errors.insurance?.id && (
							<p className="text-red-500 text-sm mt-1">
								{errors.insurance?.id?.message}
							</p>
						)}
					</div>
				)}
			</div>

			{/* Medical Information */}
			<div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
				<h2 className="text-xl font-semibold">Medizinische Informationen</h2>

				<div>
					<label className="block text-sm font-medium text-gray-700">
						Sind Sie aktuell bei einem Urologen in Behandlung? *
					</label>
					<div className="mt-2 space-x-4">
						{["Ja", "Nein"].map((option) => (
							<label key={option} className="inline-flex items-center">
								<input
									type="radio"
									value={option === "Ja" ? "true" : "false"}
									disabled={readOnly}
									{...register("details.currentTreatment", {
										required: "Diese Angabe ist erforderlich",
									})}
									className="form-radio h-4 w-4 text-blue-600"
								/>
								<span className="ml-2 text-gray-700">{option}</span>
							</label>
						))}
					</div>
					{errors.details?.currentTreatment && (
						<p className="text-red-500 text-sm mt-1">
							{errors.details?.currentTreatment?.message}
						</p>
					)}
				</div>

				{currentTreatment && (
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Welche Empfehlung haben Sie von Ihrem Urologen erhalten?
							(Mehrfachauswahl möglich) *
						</label>
						<div className="mt-2 space-y-2">
							{[
								"keine, da keine Diagnose bekannt ist",
								"Empfehlung zur Biopsie",
								"Empfehlung zur MRT",
								"Empfehlung zur antibiotischen Therapie",
								"Empfehlung zur PSA- und/oder klinischen Kontrolle",
							].map((option) => (
								<label key={option} className="flex items-center">
									<input
										type="checkbox"
										value={option}
										disabled={readOnly}
										{...register("details.treatmentRecommendations", {
											required: "Bitte wählen Sie mindestens eine Option",
										})}
										className="form-checkbox h-4 w-4 text-blue-600"
									/>
									<span className="ml-2 text-gray-700">{option}</span>
								</label>
							))}
						</div>
						{errors.details?.treatmentRecommendations && (
							<p className="text-red-500 text-sm mt-1">
								{errors.details?.treatmentRecommendations?.message}
							</p>
						)}
					</div>
				)}

				<div>
					<label className="block text-sm font-medium text-gray-700">
						Kommen Sie auf Empfehlung Ihres behandelnden Arztes? *
					</label>
					<div className="mt-2 space-x-4">
						{["Ja", "Nein"].map((option) => (
							<label key={option} className="inline-flex items-center">
								<input
									type="radio"
									value={option === "Ja" ? "true" : "false"}
									disabled={readOnly}
									{...register("details.doctorRecommendation", {
										required: "Diese Angabe ist erforderlich",
									})}
									className="form-radio h-4 w-4 text-blue-600"
								/>
								<span className="ml-2 text-gray-700">{option}</span>
							</label>
						))}
					</div>
					{errors.details?.doctorRecommendation && (
						<p className="text-red-500 text-sm mt-1">
							{errors.details?.doctorRecommendation?.message}
						</p>
					)}
				</div>

				{doctorRecommendation && (
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Wie heißt Ihr behandelnder Arzt? *
						</label>
						<input
							type="text"
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
							disabled={readOnly}
							{...register("details.referringDoctorName", {
								required: "Bitte geben Sie den Namen Ihres Arztes an",
							})}
						/>
						{errors.details?.referringDoctorName && (
							<p className="text-red-500 text-sm mt-1">
								{errors.details?.referringDoctorName?.message}
							</p>
						)}
					</div>
				)}
			</div>

			{/* Medical Information - Additional Questions */}
			<div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
				<div className="space-y-6">
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Haben Sie eine Überweisung für diese Untersuchung bekommen? *
						</label>
						<div className="mt-2 space-x-4">
							{["Ja", "Nein"].map((option) => (
								<label key={option} className="inline-flex items-center">
									<input
										type="radio"
										value={option === "Ja" ? "true" : "false"}
										disabled={readOnly}
										{...register("details.hasTransfer", {
											required: "Diese Angabe ist erforderlich",
										})}
										className="form-radio h-4 w-4 text-blue-600"
									/>
									<span className="ml-2 text-gray-700">{option}</span>
								</label>
							))}
						</div>
						{errors.details?.hasTransfer && (
							<p className="text-red-500 text-sm mt-1">
								{errors.details?.hasTransfer?.message}
							</p>
						)}
					</div>

					{hasTransfer && (
						<div className="bg-blue-50 border-l-4 border-blue-500 p-4">
							<div className="flex">
								<Info className="h-6 w-6 text-blue-500 mr-2" />
								<p className="text-sm text-blue-700">
									Bitte bringen Sie die Überweisung mit zu Ihrem Termin.
								</p>
							</div>
						</div>
					)}

					<div>
						<label className="block text-sm font-medium text-gray-700">
							Möchten Sie, dass wir Ihrem Behandler auch einen Befundbericht von
							dieser Untersuchung zukommen lassen? *
						</label>
						<div className="mt-2 space-x-4">
							{["Ja", "Nein"].map((option) => (
								<label key={option} className="inline-flex items-center">
									<input
										type="radio"
										value={option === "Ja" ? "true" : "false"}
										disabled={readOnly}
										{...register("details.sendReportToDoctor", {
											required: "Diese Angabe ist erforderlich",
										})}
										className="form-radio h-4 w-4 text-blue-600"
									/>
									<span className="ml-2 text-gray-700">{option}</span>
								</label>
							))}
						</div>
						{errors.details?.sendReportToDoctor && (
							<p className="text-red-500 text-sm mt-1">
								{errors.details?.sendReportToDoctor.message}
							</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700">
							Wie möchten Sie den schriftlichen Befundbericht erhalten? *
						</label>
						<div className="mt-2 space-x-4">
							{[
								{ label: "per Post", value: "Post" },
								{ label: "per E-Mail", value: "E-Mail" },
								{ label: "beides", value: "beides" },
							].map((option) => (
								<label key={option.value} className="inline-flex items-center">
									<input
										type="radio"
										value={option.value}
										disabled={readOnly}
										{...register("details.reportDeliveryMethod", {
											required: "Bitte wählen Sie eine Option",
										})}
										className="form-radio h-4 w-4 text-blue-600"
									/>
									<span className="ml-2 text-gray-700">{option.label}</span>
								</label>
							))}
						</div>
						{errors.details?.reportDeliveryMethod && (
							<p className="text-red-500 text-sm mt-1">
								{errors.details?.reportDeliveryMethod?.message}
							</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700">
							Wie sind Sie auf uns aufmerksam geworden? (Mehrfachauswahl
							möglich) *
						</label>
						<div className="mt-2 space-y-2">
							{[
								{ label: "Überweisender Arzt", value: "Überweisender Arzt" },
								{
									label: "ich bin bereits Patient",
									value: "ich bin bereits Patient",
								},
								{
									label: "Recall – Terminerinnerung von der ALTA Klinik",
									value: "Recall – Terminerinnerung von der ALTA Klinik",
								},
								{
									label:
										"Bewertungsportal wie jameda.de, klinikbewertungen.de, etc.",
									value: "Bewertungsportal",
								},
								{
									label:
										"ALTA Klinik Broschüre, Zeitung, Vortragsveranstaltung",
									value: "Broschüre",
								},
								{
									label: "Internetsuchmaschine, wie google, etc.",
									value: "Internet",
								},
								{
									label: "Empfehlung durch Familie, Freunde, etc.",
									value: "Empfehlung",
								},
								{ label: "Sonstiges", value: "Sonstiges" },
							].map((option) => (
								<label key={option.value} className="flex items-center">
									<input
										type="checkbox"
										value={option.value}
										disabled={readOnly}
										{...register("details.foundThrough", {
											required: "Bitte wählen Sie mindestens eine Option",
										})}
										className="form-checkbox h-4 w-4 text-blue-600"
									/>
									<span className="ml-2 text-gray-700">{option.label}</span>
								</label>
							))}
						</div>
						{errors.details?.foundThrough && (
							<p className="text-red-500 text-sm mt-1">
								{errors.details?.foundThrough.message}
							</p>
						)}
					</div>

					{Array.isArray(foundThroughDoctor) &&
						foundThroughDoctor.includes("Überweisender Arzt") && (
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Von welchem Arzt wurden Sie überwiesen? *
								</label>
								<input
									type="text"
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
									disabled={readOnly}
									{...register("details.referringDoctorName", {
										required: "Bitte geben Sie den überweisenden Arzt an",
									})}
								/>
								{errors.details?.referringDoctorName && (
									<p className="text-red-500 text-sm mt-1">
										{errors.details?.referringDoctorName?.message}
									</p>
								)}
							</div>
						)}
				</div>
			</div>

			{/* Save Button - only show if onSubmit is provided */}
			{externalSubmit && (
				<div className="flex items-center justify-between">
					<div>
						{saveError && <p className="text-sm text-red-600">{saveError}</p>}
						{saveSuccess && (
							<p className="text-sm text-green-600">
								Formular wurde erfolgreich gespeichert
							</p>
						)}
					</div>
					<button
						type="submit"
						disabled={isSaving}
						className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
					>
						{isSaving ? "Wird gespeichert..." : "Speichern"}
					</button>
				</div>
			)}
		</form>
	);
};

export default RegistrationForm;
