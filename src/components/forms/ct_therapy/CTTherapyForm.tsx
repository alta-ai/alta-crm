import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

import {
	defaultCTTherapyForm,
	type CTTherapyForm as CTTherapyFormType,
} from "../../types";
import type { CTTherapyFormDataContextType } from "./CTTherapyFormData";
import { useFormContext } from "../formContext";
import { GENDER } from "../../types/constants";

interface CTTherapyFormProps {
	onComplete?: () => void;
	readOnly?: boolean;
}

export const CTTherapyForm = ({ onComplete, readOnly }: CTTherapyFormProps) => {
	const { data, mutateFn } = useFormContext<CTTherapyFormDataContextType>();

	const [isSaving, setIsSaving] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [saveSuccess, setSaveSuccess] = useState(false);

	const {
		register,
		setValue,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<CTTherapyFormType>({
		defaultValues: data?.submission || defaultCTTherapyForm,
	});

	// Watch fields for conditional rendering
	const hasAllergies = watch("has_allergies") as unknown as string;
	const treatedWithAnticoagulants = watch(
		"treated_with_anticoagulants"
	) as unknown as string;

	// Add hooks to reset dependent fields
	useEffect(() => {
		if (hasAllergies === "false") {
			setValue("which_allergies", "");
		}
	}, [hasAllergies, setValue]);

	useEffect(() => {
		if (treatedWithAnticoagulants === "false") {
			setValue("which_anticoagulants", "");
		}
	}, [treatedWithAnticoagulants, setValue]);

	// Function to render a radio group
	const renderRadioGroup = (
		name: keyof CTTherapyFormType,
		label: string,
		options: string[] = ["Ja", "Nein"],
		required = false
	) => {
		return (
			<div className="space-y-2">
				<label className="block text-sm font-medium text-gray-700">
					{label} {required && "*"}
				</label>
				<div className="space-x-4">
					{options.map((option) => (
						<label key={option} className="inline-flex items-center">
							<input
								type="radio"
								value={
									option === "Ja"
										? "true"
										: option === "Nein"
										? "false"
										: option
								}
								{...register(
									name as any,
									required ? { required: `${label} ist erforderlich` } : {}
								)}
								className="form-radio h-4 w-4 text-blue-600"
								disabled={readOnly}
							/>
							<span className="ml-2 text-gray-700">{option}</span>
						</label>
					))}
				</div>
				{errors[name] && (
					<p className="text-red-500 text-sm">
						{String(errors[name]?.message)}
					</p>
				)}
			</div>
		);
	};

	const onFormSubmit = async (data: CTTherapyFormType) => {
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

	return (
		<form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
			{/* Introduction */}
			<div className="prose max-w-none bg-white p-6 rounded-lg shadow-sm">
				<h3 className="text-xl font-semibold mb-4">
					Aufklärungsbogen CT-Therapie
				</h3>
				<p className="text-gray-700">
					Hiermit wollen wir Ihnen Informationen zu den Wirbelsäulen-Therapien
					geben.
				</p>
				<div className="mt-4">
					<p className="text-gray-700">
						Die CT-gesteuerte Therapie ist ein seit mehreren Jahren etabliertes
						Behandlungsverfahren. Zielgruppe sind Patienten, bei denen
						degenerative Veränderungen der Wirbelsäule bzw. ein
						Bandscheibenvorfall diagnostiziert wurde. Unter
						computertomographischer Kontrolle wird eine dünne Nadel an das
						Wirbelgelenk bzw. in den Wirbelkanal vorgeschoben und das
						entsprechende Medikament injiziert. So kann eine hohe örtliche
						Wirkdosis am Nerv, der Nervenwurzel sowie der Gelenkskapsel erreicht
						werden.
					</p>
					<p className="text-gray-700 mt-2">
						<strong>
							Nach der Therapie ist eine Wartezeit von mindestens 30 Minuten zur
							Beobachtung einzuhalten.
						</strong>{" "}
						Örtliche Betäubung und Kontrastmittel können zu allergischen
						Reaktionen führen. In sehr seltenen Fällen sind dabei
						Schockreaktionen möglich, die notfallmäßig therapiert werden
						müssten.
					</p>
				</div>
			</div>

			{/* Patient Information */}
			<div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
				<h3 className="text-lg font-semibold mb-4">Patienteninformation</h3>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Wie groß sind Sie? (in cm) *
						</label>
						<input
							type="number"
							step="0.01"
							{...register("height", {
								required: "Größe ist erforderlich",
								valueAsNumber: true,
								min: { value: 0, message: "Größe muss größer als 0 sein" },
								max: { value: 220, message: "Größe darf maximal 220 cm sein" },
							})}
							placeholder="Ihre Größe in cm"
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
							disabled={readOnly}
						/>
						{errors.height && (
							<p className="text-red-500 text-sm mt-1">
								{errors.height.message}
							</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700">
							Wie viel wiegen Sie? (in kg) *
						</label>
						<input
							type="number"
							{...register("weight", {
								required: "Gewicht ist erforderlich",
								valueAsNumber: true,
								min: { value: 0, message: "Gewicht muss größer als 0 sein" },
								max: {
									value: 300,
									message: "Gewicht darf maximal 300 kg sein",
								},
							})}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
							placeholder="Bitte in kg und ohne Nachkommastelle angeben."
							disabled={readOnly}
						/>
						{errors.weight && (
							<p className="text-red-500 text-sm mt-1">
								{errors.weight.message}
							</p>
						)}
					</div>
				</div>
			</div>

			{/* Medical Questions */}
			<div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
				<h3 className="text-lg font-semibold mb-4">Medizinische Fragen</h3>

				<div className="space-y-6">
					{renderRadioGroup(
						"had_previous_exam_with_contrast_media",
						"Sind Sie früher schon einmal mit Röntgenkontrastmittel untersucht worden?",
						["Ja", "Nein"],
						true
					)}

					{renderRadioGroup(
						"had_side_effects_from_contrast_media",
						"Haben Sie nach Röntgenkontrastmittelgabe Nebenwirkungen verspürt? (Hautrötung, Jucken, Niesreiz, Luftnot, Kreislaufbeschwerden, Bewusstlosigkeit)",
						["Ja", "Nein"],
						true
					)}

					{renderRadioGroup(
						"has_allergies",
						"Sind bei Ihnen Allergien bekannt?",
						["Ja", "Nein"],
						true
					)}

					{hasAllergies === "true" && (
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Gegen was sind Sie allergisch? *
							</label>
							<input
								type="text"
								{...register("which_allergies", {
									required: "Diese Angabe ist erforderlich",
								})}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
								disabled={readOnly}
							/>
							{errors.which_allergies && (
								<p className="text-red-500 text-sm mt-1">
									{errors.which_allergies.message}
								</p>
							)}
						</div>
					)}
				</div>
			</div>

			{/* Medical Conditions */}
			<div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
				<h3 className="text-lg font-semibold mb-4">Medizinische Bedingungen</h3>

				<div className="space-y-6">
					{renderRadioGroup(
						"has_known_hyperthyroidism",
						"Ist bei Ihnen eine Überfunktion der Schilddrüse bekannt?",
						["Ja", "Nein"],
						true
					)}

					{renderRadioGroup(
						"has_osteoporosis",
						"Besteht bei Ihnen Osteoporose?",
						["Ja", "Nein"],
						true
					)}

					{renderRadioGroup(
						"has_hepatitis",
						"Besteht bei Ihnen eine Hepatitis?",
						["Ja", "Nein"],
						true
					)}

					{renderRadioGroup(
						"has_diabetes",
						"Sind Sie Diabetiker/in?",
						["Ja", "Nein"],
						true
					)}

					{renderRadioGroup(
						"has_high_blood_pressure",
						"Besteht bei Ihnen Bluthochdruck?",
						["Ja", "Nein"],
						true
					)}

					{renderRadioGroup(
						"has_increased_intraocular_pressure",
						"Besteht bei Ihnen ein erhöhter Augeninnendruck (Glaukom)?",
						["Ja", "Nein"],
						true
					)}

					{renderRadioGroup(
						"has_history_of_gastric_or_duodenal_ulcers",
						"Ist in Ihrer Vorgeschichte ein Magen- oder Zwölffingerdarmgeschwür bekannt?",
						["Ja", "Nein"],
						true
					)}

					{renderRadioGroup(
						"has_history_of_thrombosis_or_pulmonary_embolism",
						"Ist in Ihrer Vorgeschichte eine Thrombose oder Lungenembolie bekannt?",
						["Ja", "Nein"],
						true
					)}
				</div>
			</div>

			{/* Medication */}
			<div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
				<h3 className="text-lg font-semibold mb-4">Medikation</h3>

				<div className="space-y-6">
					{renderRadioGroup(
						"treated_with_anticoagulants",
						"Werden Sie mit blutgerinnungshemmenden Mitteln behandelt?",
						["Ja", "Nein"],
						true
					)}

					{treatedWithAnticoagulants === "true" && (
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Mit welchem blutgerinnungshemmenden Mitteln werden Sie
								behandelt? *
							</label>
							<input
								type="text"
								{...register("which_anticoagulants", {
									required: "Diese Angabe ist erforderlich",
								})}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
								disabled={readOnly}
							/>
							{errors.which_anticoagulants && (
								<p className="text-red-500 text-sm mt-1">
									{errors.which_anticoagulants.message}
								</p>
							)}
						</div>
					)}
				</div>
			</div>

			{/* Female-specific Information */}
			{data?.patient?.gender === GENDER[1] && (
				<div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
					<h3 className="text-lg font-semibold mb-4">Für Patientinnen</h3>

					<div className="space-y-6">
						<div className="relative flex items-start">
							<div className="flex items-center h-5">
								<input
									id="pregnant"
									type="checkbox"
									{...register("pregnant", {
										required:
											"Bitte bestätigen Sie, dass bei Ihnen keine Schwangerschaft besteht",
									})}
									className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
									disabled={readOnly}
								/>
							</div>
							<div className="ml-3 text-sm">
								<label htmlFor="pregnant" className="font-medium text-gray-700">
									Ich bestätige hiermit, dass bei mir z. Zt. keine
									Schwangerschaft besteht. Eine fragliche Schwangerschaft
									während der Therapie werde ich sofort mitteilen. Mir ist eine
									mögliche Schädigung von Röntgenstrahlen für das ungeborene
									Leben bekannt. *
								</label>
							</div>
						</div>
						{errors.pregnant && (
							<p className="text-red-500 text-sm">{errors.pregnant.message}</p>
						)}

						<div>
							<label className="block text-sm font-medium text-gray-700">
								Wann war Ihre letzte Regelblutung? *
							</label>
							<input
								type="text"
								{...register("last_menstruation", {
									required: "Diese Angabe ist erforderlich",
								})}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
								disabled={readOnly}
							/>
							{errors.last_menstruation && (
								<p className="text-red-500 text-sm mt-1">
									{errors.last_menstruation.message}
								</p>
							)}
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700">
								Stillen Sie zurzeit? *
							</label>
							<div className="mt-2 space-x-4">
								{["Ja", "Nein"].map((option) => (
									<label key={option} className="inline-flex items-center">
										<input
											type="radio"
											value={option === "Ja" ? "true" : "false"}
											{...register("breastfeeding", {
												required: "Diese Angabe ist erforderlich",
											})}
											className="form-radio h-4 w-4 text-blue-600"
											disabled={readOnly}
										/>
										<span className="ml-2 text-gray-700">{option}</span>
									</label>
								))}
							</div>
							{errors.breastfeeding && (
								<p className="text-red-500 text-sm mt-1">
									{errors.breastfeeding.message}
								</p>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Save Button - only show if not readOnly */}
			{!readOnly && (
				<div className="flex items-center justify-between">
					<div>
						{saveError && <p className="text-sm text-red-600">{saveError}</p>}
						{saveSuccess && (
							<p className="text-sm text-green-600">
								Fragebogen wurde erfolgreich gespeichert
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

export default CTTherapyForm;
