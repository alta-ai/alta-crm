import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Info, AlertCircle } from "lucide-react";

import type { RegistrationBGForm as RegistrationBGFormType } from "../../types";
import type { RegistrationBGFormDataContextType } from "./RegistrationBGFormData";
import { useFormContext } from "../formContext";
import { GENDER } from "../../types/constants";

interface RegistrationBGFormProps {
	onComplete?: () => void;
	readOnly?: boolean;
}

export const RegistrationBGForm = ({
	onComplete,
	readOnly,
}: RegistrationBGFormProps) => {
	const { data, mutateFn } =
		useFormContext<RegistrationBGFormDataContextType>();

	const [isSaving, setIsSaving] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [saveSuccess, setSaveSuccess] = useState(false);
	const [currentStep, setCurrentStep] = useState(1);
	const [stepValidationErrors, setStepValidationErrors] = useState<string[]>(
		[]
	);

	const {
		register,
		handleSubmit,
		setValue,
		getValues,
		formState: { errors },
		trigger,
	} = useForm<RegistrationBGFormType>({
		defaultValues: data?.submission,
		shouldUnregister: false,
	});

	// Format dates for display in the form
	useEffect(() => {
		const internalData = (getValues() ||
			data?.submission) as RegistrationBGFormType;

		// Format birth_date if it exists
		if (internalData) {
			const birthDate = new Date(internalData.birth_date);
			if (!isNaN(birthDate.getTime())) {
				const formattedDate = birthDate.toISOString().substring(0, 10);
				setValue("birth_date", formattedDate as any);
			}
		}
		// Format accident date if it exists
		if (internalData) {
			const accidentDate = new Date(internalData?.datetime_of_accident);
			if (!isNaN(accidentDate.getTime())) {
				const formattedDate = accidentDate.toISOString().substring(0, 10);
				setValue("datetime_of_accident", formattedDate as any);
			}
		}
	}, [data?.submission, currentStep]);

	// Preserve form values when switching between steps
	// const preserveFormData = () => {
	// 	const formValues = getValues();

	// 	// Ensure birth_date is properly formatted
	// 	if (formValues.birth_date && formValues.birth_date instanceof Date) {
	// 		const birthDate = formValues.birth_date;
	// 		// Check if the date is valid (not NaN)
	// 		console.log(birthDate);
	// 		if (!isNaN(birthDate.getTime())) {
	// 			setValue("birth_date", birthDate.toISOString().substring(0, 10) as any);
	// 		}
	// 	}

	// 	// Ensure datetime_of_accident is properly formatted
	// 	if (
	// 		formValues.datetime_of_accident &&
	// 		formValues.datetime_of_accident instanceof Date
	// 	) {
	// 		const accidentDate = formValues.datetime_of_accident;
	// 		// Check if the date is valid (not NaN)
	// 		if (!isNaN(accidentDate.getTime())) {
	// 			setValue(
	// 				"datetime_of_accident",
	// 				accidentDate.toISOString().substring(0, 10) as any
	// 			);
	// 		}
	// 	}
	// };

	const onFormSubmit = async (data: RegistrationBGFormType) => {
		try {
			setIsSaving(true);
			setSaveError(null);
			setSaveSuccess(false);

			mutateFn.mutate(data);

			setSaveSuccess(true);
			setTimeout(() => setSaveSuccess(false), 3000);
		} catch (error: any) {
			console.error("Error saving form:", error);
			setSaveError(error.message || "Fehler beim Speichern des Formulars");
		} finally {
			setIsSaving(false);
		}

		if (onComplete) {
			onComplete();
		}
	};

	// Define fields to validate for each step
	const step1Fields = [
		"gender",
		"last_name",
		"first_name",
		"birth_date",
		"street",
		"house_number",
		"postal_code",
		"city",
		"country",
		"mobile",
		"email",
	];

	const step2Fields = [
		"datetime_of_accident",
		"name_of_company",
		"street_of_company",
		"house_number_of_company",
		"postal_code_of_company",
		"city_of_company",
		"profession",
		"time_of_employment",
		"referring_doctor_name",
	];

	const step3Fields = ["accident_consent", "read_consent"];

	const nextStep = async () => {
		// Determine which fields to validate based on the current step
		const fieldsToValidate =
			currentStep === 1
				? step1Fields
				: currentStep === 2
				? step2Fields
				: step3Fields;

		// Trigger validation for the fields in the current step
		const isStepValid = await trigger(fieldsToValidate as any);

		if (isStepValid) {
			// preserveFormData(); // Preserve form data before changing steps
			setStepValidationErrors([]);
			setCurrentStep(currentStep + 1);
		} else {
			// Extract error messages for display
			const errorMessages = fieldsToValidate
				.filter((field) => errors[field as keyof RegistrationBGFormType])
				.map((field) => {
					const error = errors[field as keyof RegistrationBGFormType];
					return error?.message || `Bitte überprüfen Sie das Feld "${field}"`;
				});

			setStepValidationErrors(errorMessages);
		}
	};

	const prevStep = () => {
		// preserveFormData(); // Preserve form data before changing steps
		setCurrentStep(currentStep - 1);
		setStepValidationErrors([]);
	};

	return (
		<form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
			{/* Step 1: Personal Information */}
			{currentStep === 1 && (
				<div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
					<h3 className="text-lg font-semibold mb-4">
						Persönliche Informationen
					</h3>

					{/* Gender */}
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Geschlecht *
						</label>
						<div className="mt-2 space-x-4">
							{Object.entries(GENDER).map(([key, value]) => (
								<label key={key} className="inline-flex items-center">
									<input
										type="radio"
										value={value}
										{...register("gender", {
											required: "Bitte wählen Sie ein Geschlecht",
										})}
										className="form-radio h-4 w-4 text-blue-600"
										disabled={readOnly}
									/>
									<span className="ml-2 text-gray-700">
										{value === "M"
											? "männlich"
											: value === "F"
											? "weiblich"
											: "divers"}
									</span>
								</label>
							))}
						</div>
						{errors.gender && (
							<p className="text-red-500 text-sm mt-1">
								{errors.gender.message}
							</p>
						)}
					</div>

					{/* Title */}
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Titel
						</label>
						<select
							{...register("title")}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
							disabled={readOnly}
						>
							<option value="">Kein Titel</option>
							<option value="Dr.">Dr.</option>
							<option value="Dr. med.">Dr. med.</option>
							<option value="Prof. Dr.">Prof. Dr.</option>
							<option value="Prof. Dr. med.">Prof. Dr. med.</option>
						</select>
					</div>

					{/* Name fields */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Nachname *
							</label>
							<input
								type="text"
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
								placeholder="Ihr Nachname"
								{...register("last_name", {
									required: "Bitte geben Sie Ihren Nachnamen ein",
								})}
								disabled={readOnly}
							/>
							{errors.last_name && (
								<p className="text-red-500 text-sm mt-1">
									{errors.last_name.message}
								</p>
							)}
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Vorname *
							</label>
							<input
								type="text"
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
								placeholder="Ihr Vorname"
								{...register("first_name", {
									required: "Bitte geben Sie Ihren Vornamen ein",
								})}
								disabled={readOnly}
							/>
							{errors.first_name && (
								<p className="text-red-500 text-sm mt-1">
									{errors.first_name.message}
								</p>
							)}
						</div>
					</div>

					{/* Birth date */}
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Geburtsdatum *
						</label>
						<input
							type="date"
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
							{...register("birth_date", {
								required: "Bitte geben Sie Ihr Geburtsdatum ein",
								valueAsDate: true,
							})}
							disabled={readOnly}
						/>
						{errors.birth_date && (
							<p className="text-red-500 text-sm mt-1">
								{errors.birth_date.message}
							</p>
						)}
					</div>

					{/* Address */}
					<div>
						<h4 className="text-md font-medium mb-3">Adresse</h4>
						<div className="grid grid-cols-3 gap-4 mb-4">
							<div className="col-span-2">
								<label className="block text-sm font-medium text-gray-700">
									Straße *
								</label>
								<input
									type="text"
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
									{...register("street", {
										required: "Bitte geben Sie Ihre Straße ein",
									})}
									disabled={readOnly}
								/>
								{errors.street && (
									<p className="text-red-500 text-sm mt-1">
										{errors.street.message}
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
									{...register("house_number", {
										required: "Bitte geben Sie Ihre Hausnummer ein",
									})}
									disabled={readOnly}
								/>
								{errors.house_number && (
									<p className="text-red-500 text-sm mt-1">
										{errors.house_number.message}
									</p>
								)}
							</div>
						</div>

						<div className="grid grid-cols-3 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Postleitzahl *
								</label>
								<input
									type="text"
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
									{...register("postal_code", {
										required: "Bitte geben Sie Ihre Postleitzahl ein",
									})}
									disabled={readOnly}
								/>
								{errors.postal_code && (
									<p className="text-red-500 text-sm mt-1">
										{errors.postal_code.message}
									</p>
								)}
							</div>
							<div className="col-span-2">
								<label className="block text-sm font-medium text-gray-700">
									Ort *
								</label>
								<input
									type="text"
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
									{...register("city", {
										required: "Bitte geben Sie Ihren Wohnort ein",
									})}
									disabled={readOnly}
								/>
								{errors.city && (
									<p className="text-red-500 text-sm mt-1">
										{errors.city.message}
									</p>
								)}
							</div>
						</div>
					</div>

					{/* Country */}
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Land *
						</label>
						<select
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
							{...register("country", {
								required: "Bitte wählen Sie ein Land",
							})}
							defaultValue="Deutschland"
							disabled={readOnly}
						>
							<option value="Deutschland">Deutschland</option>
							<option value="Österreich">Österreich</option>
							<option value="Schweiz">Schweiz</option>
							{/* Additional countries could be added here */}
						</select>
						{errors.country && (
							<p className="text-red-500 text-sm mt-1">
								{errors.country.message}
							</p>
						)}
					</div>

					{/* Contact information */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Telefon (Festnetz)
							</label>
							<input
								type="tel"
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
								{...register("phone")}
								disabled={readOnly}
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Mobiltelefon *
							</label>
							<input
								type="tel"
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
								{...register("mobile", {
									required: "Bitte geben Sie Ihre Mobilnummer ein",
								})}
								disabled={readOnly}
							/>
							{errors.mobile && (
								<p className="text-red-500 text-sm mt-1">
									{errors.mobile.message}
								</p>
							)}
						</div>
					</div>

					{/* Email */}
					<div>
						<label className="block text-sm font-medium text-gray-700">
							E-Mail *
						</label>
						<input
							type="email"
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
							{...register("email", {
								required: "Bitte geben Sie Ihre E-Mail-Adresse ein",
								pattern: {
									value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
									message: "Ungültige E-Mail-Adresse",
								},
							})}
							disabled={readOnly}
						/>
						{errors.email && (
							<p className="text-red-500 text-sm mt-1">
								{errors.email.message}
							</p>
						)}
					</div>

					{stepValidationErrors.length > 0 && (
						<div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
							<div className="flex">
								<AlertCircle
									className="text-red-500 mr-2"
									style={{
										height: "24px",
										width: "24px",
										minWidth: "24px",
										flexShrink: 0,
									}}
								/>
								<div className="text-sm text-red-700">
									<p className="font-medium">
										Bitte korrigieren Sie folgende Fehler:
									</p>
									<ul className="list-disc ml-5 mt-1">
										{stepValidationErrors.map((err, idx) => (
											<li key={idx}>{err}</li>
										))}
									</ul>
								</div>
							</div>
						</div>
					)}

					<div className="flex justify-end">
						<button
							type="button"
							onClick={nextStep}
							className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
							disabled={readOnly}
						>
							Weiter
						</button>
					</div>
				</div>
			)}

			{/* Step 2: Accident Information */}
			{currentStep === 2 && (
				<div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
					<h3 className="text-lg font-semibold mb-4">
						Informationen zum Unfall
					</h3>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Datum des Unfalls *
							</label>
							<input
								type="date"
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
								{...register("datetime_of_accident", {
									required: "Bitte geben Sie das Unfalldatum ein",
									valueAsDate: true,
								})}
								disabled={readOnly}
							/>
							{errors.datetime_of_accident && (
								<p className="text-red-500 text-sm mt-1">
									{errors.datetime_of_accident.message}
								</p>
							)}
						</div>
					</div>

					<h3 className="text-lg font-semibold mb-4 mt-8">
						Informationen über den Arbeitgeber
					</h3>

					<div>
						<label className="block text-sm font-medium text-gray-700">
							Name des Betriebs *
						</label>
						<input
							type="text"
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
							{...register("name_of_company", {
								required: "Bitte geben Sie den Namen des Betriebs ein",
							})}
							disabled={readOnly}
						/>
						{errors.name_of_company && (
							<p className="text-red-500 text-sm mt-1">
								{errors.name_of_company.message}
							</p>
						)}
					</div>

					{/* Company Address */}
					<div>
						<h4 className="text-md font-medium mb-3">
							Adresse des Arbeitgebers
						</h4>
						<div className="grid grid-cols-3 gap-4 mb-4">
							<div className="col-span-2">
								<label className="block text-sm font-medium text-gray-700">
									Straße *
								</label>
								<input
									type="text"
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
									{...register("street_of_company", {
										required: "Bitte geben Sie die Straße ein",
									})}
									disabled={readOnly}
								/>
								{errors.street_of_company && (
									<p className="text-red-500 text-sm mt-1">
										{errors.street_of_company.message}
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
									{...register("house_number_of_company", {
										required: "Bitte geben Sie die Hausnummer ein",
									})}
									disabled={readOnly}
								/>
								{errors.house_number_of_company && (
									<p className="text-red-500 text-sm mt-1">
										{errors.house_number_of_company.message}
									</p>
								)}
							</div>
						</div>

						<div className="grid grid-cols-3 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Postleitzahl *
								</label>
								<input
									type="text"
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
									{...register("postal_code_of_company", {
										required: "Bitte geben Sie die Postleitzahl ein",
									})}
									disabled={readOnly}
								/>
								{errors.postal_code_of_company && (
									<p className="text-red-500 text-sm mt-1">
										{errors.postal_code_of_company.message}
									</p>
								)}
							</div>
							<div className="col-span-2">
								<label className="block text-sm font-medium text-gray-700">
									Ort *
								</label>
								<input
									type="text"
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
									{...register("city_of_company", {
										required: "Bitte geben Sie den Ort ein",
									})}
									disabled={readOnly}
								/>
								{errors.city_of_company && (
									<p className="text-red-500 text-sm mt-1">
										{errors.city_of_company.message}
									</p>
								)}
							</div>
						</div>
					</div>

					{/* Job information */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Als was sind Sie beschäftigt? *
							</label>
							<input
								type="text"
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
								{...register("profession", {
									required: "Bitte geben Sie Ihre Tätigkeit ein",
								})}
								disabled={readOnly}
							/>
							{errors.profession && (
								<p className="text-red-500 text-sm mt-1">
									{errors.profession.message}
								</p>
							)}
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Seit wann sind Sie beschäftigt? *
							</label>
							<input
								type="text"
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
								{...register("time_of_employment", {
									required: "Bitte geben Sie den Beschäftigungsbeginn ein",
								})}
								disabled={readOnly}
							/>
							{errors.time_of_employment && (
								<p className="text-red-500 text-sm mt-1">
									{errors.time_of_employment.message}
								</p>
							)}
						</div>
					</div>

					{/* Referring doctor */}
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Von welchem Arzt wurden Sie überwiesen? *
						</label>
						<input
							type="text"
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
							{...register("referring_doctor_name", {
								required:
									"Bitte geben Sie den Namen des überweisenden Arztes ein",
							})}
							disabled={readOnly}
						/>
						{errors.referring_doctor_name && (
							<p className="text-red-500 text-sm mt-1">
								{errors.referring_doctor_name.message}
							</p>
						)}
					</div>

					{stepValidationErrors.length > 0 && (
						<div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
							<div className="flex">
								<AlertCircle
									className="text-red-500 mr-2"
									style={{
										height: "24px",
										width: "24px",
										minWidth: "24px",
										flexShrink: 0,
									}}
								/>
								<div className="text-sm text-red-700">
									<p className="font-medium">
										Bitte korrigieren Sie folgende Fehler:
									</p>
									<ul className="list-disc ml-5 mt-1">
										{stepValidationErrors.map((err, idx) => (
											<li key={idx}>{err}</li>
										))}
									</ul>
								</div>
							</div>
						</div>
					)}

					<div className="flex justify-between">
						<button
							type="button"
							onClick={prevStep}
							className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
							disabled={readOnly}
						>
							Zurück
						</button>
						<button
							type="button"
							onClick={nextStep}
							className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
							disabled={readOnly}
						>
							Weiter
						</button>
					</div>
				</div>
			)}

			{/* Step 3: Consents and Submit */}
			{currentStep === 3 && (
				<div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
					<h3 className="text-lg font-semibold mb-4">Überweisung</h3>

					<div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
						<div className="flex">
							<AlertCircle
								className="text-yellow-500 mr-2"
								style={{
									height: "24px",
									width: "24px",
									minWidth: "24px",
									flexShrink: 0,
								}}
							/>
							<p className="text-sm text-yellow-700">
								<strong>
									Bitte vergessen Sie nicht, die Überweisung Ihres
									Durchgangsarztes zur Untersuchung mitzubringen, da wir ohne
									diese Überweisung die Untersuchung bei Ihnen nicht durchführen
									können.
								</strong>
							</p>
						</div>
					</div>

					<h3 className="text-lg font-semibold mb-4">
						Datenschutz und Einwilligungen
					</h3>

					<div className="bg-gray-50 p-4 rounded mb-4">
						<h4 className="font-medium mb-2">
							Datenschutz-Grundverordnung (DSGVO)
						</h4>
						<p className="text-sm text-gray-700 mb-4">
							Ihre Gesundheit und der sichere Umgang mit Ihren Daten sind uns
							wichtig. Im Zuge des Inkrafttretens der
							Datenschutz-Grundverordnung (DSGVO) am 25.05.2018 informieren wir
							Sie, dass wir, alle Mitarbeiter der ALTA Klinik, zur Erbringung
							unserer Leistung Ihre personenbezogenen Daten benötigen, die bei
							uns gespeichert werden. Dazu gehören Ihre personenbezogenen Daten,
							wie Name, Geburtsdatum, Adresse, Telefon, E-Mail,
							Versicherungsstatus, Beruf. Ebenso gehören personenbezogenen Daten
							besonderer Kategorie, wie Gesundheit, dazu. Wir nutzen Ihre Daten
							für die Terminvereinbarung, Kontaktaufnahme, für die Durchführung
							einer Untersuchung oder Behandlung, für die Bereitstellung der
							Ergebnisse, zur Dokumentation des Behandlungsverlaufes und zur
							Abrechnung der von uns erbrachten Leistungen.
						</p>
					</div>

					<div className="bg-gray-50 p-4 rounded mb-4">
						<h4 className="font-medium mb-2">
							Einwilligungserklärung für die Übermittlung von Befunden
						</h4>
						<p className="text-sm text-gray-700 mb-4">
							Da es sich bei dieser Untersuchung um einen BG-Fall handelt, ist
							mir bewusst und ich bin ausdrücklich damit einverstanden, dass
							mein ärztlicher Befundbericht und meine Behandlungsdaten an den
							überweisenden Arzt und die zuständige Berufsgenossenschaft
							übermittelt werden.
						</p>
					</div>

					<div className="bg-gray-50 p-4 rounded mb-6">
						<h4 className="font-medium mb-2">Kostenerstattung</h4>
						<p className="text-sm text-gray-700 mb-4">
							Die Abrechnung erfolgt über die zuständige Berufsgenossenschaft.
						</p>
					</div>

					<div className="space-y-4">
						<div>
							<label className="flex items-start">
								<input
									type="checkbox"
									className="form-checkbox mt-1 h-4 w-4 text-blue-600"
									{...register("accident_consent", {
										required: "Bitte bestätigen Sie diese Zustimmung",
									})}
									disabled={readOnly}
								/>
								<span className="ml-2 text-sm text-gray-700">
									Dies ist ein Arbeitsunfall. Die Abrechnung erfolgt über die
									zuständige Berufsgenossenschaft. *
								</span>
							</label>
							{errors.accident_consent && (
								<p className="text-red-500 text-sm mt-1">
									{errors.accident_consent.message}
								</p>
							)}
						</div>

						<div>
							<label className="flex items-start">
								<input
									type="checkbox"
									className="form-checkbox mt-1 h-4 w-4 text-blue-600"
									{...register("read_consent", {
										required: "Bitte bestätigen Sie diese Zustimmung",
									})}
									disabled={readOnly}
								/>
								<span className="ml-2 text-sm text-gray-700">
									Hiermit bestätige ich, dass ich alles gelesen und verstanden
									habe. *
								</span>
							</label>
							{errors.read_consent && (
								<p className="text-red-500 text-sm mt-1">
									{errors.read_consent.message}
								</p>
							)}
						</div>
					</div>

					{stepValidationErrors.length > 0 && (
						<div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
							<div className="flex">
								<AlertCircle
									className="text-red-500 mr-2"
									style={{
										height: "24px",
										width: "24px",
										minWidth: "24px",
										flexShrink: 0,
									}}
								/>
								<div className="text-sm text-red-700">
									<p className="font-medium">
										Bitte korrigieren Sie folgende Fehler:
									</p>
									<ul className="list-disc ml-5 mt-1">
										{stepValidationErrors.map((err, idx) => (
											<li key={idx}>{err}</li>
										))}
									</ul>
								</div>
							</div>
						</div>
					)}

					<div className="flex justify-between mt-6">
						<button
							type="button"
							onClick={prevStep}
							className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
							disabled={readOnly}
						>
							Zurück
						</button>

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
							disabled={isSaving || readOnly}
							className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
						>
							{isSaving ? "Wird gespeichert..." : "Speichern"}
						</button>
					</div>
				</div>
			)}
		</form>
	);
};

export default RegistrationBGForm;
