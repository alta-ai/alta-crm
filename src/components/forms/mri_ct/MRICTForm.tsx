import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Info, AlertCircle } from "lucide-react";

import { defaultMRICTForm, type MRICTForm as MRICTFormType } from "../../types";
import type { MRICTFormDataContextType } from "./MRICTFormData";
import { useFormContext } from "../formContext";

interface MRICTFormFormProps {
	onComplete?: () => void;
	readOnly?: boolean;
}

export const MRICTForm = ({ onComplete, readOnly }: MRICTFormFormProps) => {
	const { data, mutateFn } = useFormContext<MRICTFormDataContextType>();

	const [isSaving, setIsSaving] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [saveSuccess, setSaveSuccess] = useState(false);

	const {
		register,
		handleSubmit,
		watch,
		setValue, // <-- added setValue here
		formState: { errors },
	} = useForm<MRICTFormType>({
		defaultValues: data?.submission || defaultMRICTForm,
	});

	// Watch fields for conditional rendering
	const wearingInterferingDevices = watch(
		"wearing_interfearing_devices"
	) as unknown as string;
	const hadBrainOrHeartOp = watch("had_brain_or_heart_op") as unknown as string;
	const hadOrganRemoved = watch("had_organ_removed") as unknown as string;
	const hasKidneyDisease = watch("has_kidney_disease") as unknown as string;
	const wearingImplantsOrMetalObjects = watch(
		"wearing_interfearing_implants_or_metal_objects"
	) as unknown as string;
	const hasInjuriesByMetallicObjects = watch(
		"has_injuries_by_metallic_objects"
	) as unknown as string;
	const hasAllergies = watch("has_allergies") as unknown as string;
	const takingMedicationForHyperthyroidism = watch(
		"taking_medication_for_hyperthyroidism"
	) as unknown as string;
	const areTherePreliminaryExams = watch(
		"are_there_preliminary_exams_of_the_bodypart"
	) as unknown as string;
	const hasInfectiousDisease = watch(
		"has_infectious_disease"
	) as unknown as string;
	const takingBloodThinningMedication = watch(
		"taking_blood_thinning_medication"
	) as unknown as string;
	const takingRegularMedication = watch(
		"taking_regular_medication"
	) as unknown as string;

	// Add hooks to reset dependent fields
	useEffect(() => {
		if (wearingInterferingDevices === "false") {
			setValue("interfearing_devices", null);
		}
	}, [wearingInterferingDevices, setValue]);

	useEffect(() => {
		if (hadBrainOrHeartOp === "false") {
			setValue("which_op", null);
			setValue("when_op", null);
		}
	}, [hadBrainOrHeartOp, setValue]);

	useEffect(() => {
		if (hadOrganRemoved === "false") {
			setValue("which_organ", null);
			setValue("when_organ", null);
		}
	}, [hadOrganRemoved, setValue]);

	useEffect(() => {
		if (hasKidneyDisease === "false") {
			setValue("which_kidney_disease", null);
		}
	}, [hasKidneyDisease, setValue]);

	useEffect(() => {
		if (wearingImplantsOrMetalObjects === "false") {
			setValue("which_interfearing_implants", null);
			setValue("when_interfearing_implants", null);
		}
	}, [wearingImplantsOrMetalObjects, setValue]);

	useEffect(() => {
		if (hasInjuriesByMetallicObjects === "false") {
			setValue("which_injuries", null);
		}
	}, [hasInjuriesByMetallicObjects, setValue]);

	useEffect(() => {
		if (hasAllergies === "false") {
			setValue("which_allergies", null);
		}
	}, [hasAllergies, setValue]);

	useEffect(() => {
		if (takingMedicationForHyperthyroidism === "false") {
			setValue("which_hyperthyroidism_medication", null);
		}
	}, [takingMedicationForHyperthyroidism, setValue]);

	useEffect(() => {
		if (areTherePreliminaryExams === "false") {
			setValue("which_preliminary_exams", null);
			setValue("when_preliminary_exams", null);
		}
	}, [areTherePreliminaryExams, setValue]);

	useEffect(() => {
		if (hasInfectiousDisease === "false") {
			setValue("which_infectious_disease", null);
		}
	}, [hasInfectiousDisease, setValue]);

	useEffect(() => {
		if (takingBloodThinningMedication === "false") {
			setValue("which_blood_thinning_medication", null);
			setValue("since_when_taking_medication", null);
		}
	}, [takingBloodThinningMedication, setValue]);

	useEffect(() => {
		if (takingRegularMedication === "false") {
			setValue("which_regular_medication", null);
		}
	}, [takingRegularMedication, setValue]);

	// Function to render a radio group
	const renderRadioGroup = (
		name: keyof MRICTFormType,
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

	const onFormSubmit = async (data: MRICTFormType) => {
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
					Aufklärungsbogen MRT und CT
				</h3>
				<p className="text-gray-700">
					Bitte füllen Sie diesen Fragebogen vor Ihrer MRT- oder CT-Untersuchung
					vollständig aus. Die Informationen helfen uns, Ihre Untersuchung
					optimal und sicher zu planen.
				</p>
				<div className="bg-blue-50 border-l-4 border-blue-500 p-4">
					<div className="flex">
						<Info
							className="text-blue-500 mr-2"
							style={{
								height: "16px",
								width: "16px",
								minWidth: "16px",
								flexShrink: 0,
							}}
						/>
						<p className="text-sm text-blue-700">
							Alle mit * gekennzeichneten Felder sind Pflichtfelder und müssen
							ausgefüllt werden.
						</p>
					</div>
				</div>
			</div>

			{/* MRT Information Section */}
			<div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
				<h3 className="text-lg font-semibold mb-4">
					Was ist MRT (Magnet-Resonanz-Tomograph)?
				</h3>
				<p className="text-gray-700">
					Das MRT oder auch der Kernspintomograph ist ein Untersuchungsgerät,
					mit dem über ein Magnetfeld die bildliche Darstellung des Körpers bzw.
					eines Körperteils ohne Röntgenstrahlung funktioniert. Innerhalb einer
					Magnetröhre werden Radiowellen erzeugt, die im Körper zu Reaktionen
					führen, aus denen mit Hilfe eines Computers Schnittbilder der zu
					untersuchenden Körperregion erstellt werden können.
				</p>
				<div className="bg-red-50 border-l-4 border-red-500 p-4">
					<div className="flex">
						<AlertCircle
							className="text-red-500 mr-2"
							style={{
								height: "16px",
								width: "16px",
								minWidth: "16px",
								flexShrink: 0,
							}}
						/>
						<p className="text-sm text-red-700">
							<strong>
								Sollten Sie Träger eines Herzschrittmachers, eines
								Defibrillators, einer künstlichen Herzklappe, einer Insulinpumpe
								oder sonstiger elektrischer Implantate sein, bitten wir Sie, um
								sofortige Mitteilung, da Sie in diesen Fällen NICHT im MRT-Gerät
								untersucht werden dürfen!
							</strong>
						</p>
					</div>
				</div>
			</div>

			{/* Patient Information */}
			<div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
				<h3 className="text-lg font-semibold mb-4">
					Persönliche Informationen
				</h3>

				{/* Height and Weight */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Größe (in cm) *
						</label>
						<input
							type="number"
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
							placeholder="Ihre Größe in cm"
							{...register("height", {
								required: "Bitte geben Sie Ihre Größe an",
								valueAsNumber: true,
								min: {
									value: 0,
									message: "Bitte geben Sie eine gültige Größe ein",
								},
								max: {
									value: 220,
									message: "Bitte geben Sie eine gültige Größe ein",
								},
							})}
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
							Gewicht (in kg) *
						</label>
						<input
							type="number"
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
							placeholder="Ihr Gewicht in kg"
							{...register("weight", {
								required: "Bitte geben Sie Ihr Gewicht an",
								valueAsNumber: true,
								min: {
									value: 25,
									message: "Bitte geben Sie ein gültiges Gewicht ein",
								},
								max: {
									value: 250,
									message: "Bitte geben Sie ein gültiges Gewicht ein",
								},
							})}
							disabled={readOnly}
						/>
						{errors.weight && (
							<p className="text-red-500 text-sm mt-1">
								{errors.weight.message}
							</p>
						)}
					</div>
				</div>

				{renderRadioGroup(
					"has_claustrophobia",
					"Leiden Sie an Klaustrophobie (Angst in engen Räumen, Platzangst)?",
					["Ja", "Nein"],
					true
				)}
			</div>

			{/* Medical Device Questions */}
			<div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
				<h3 className="text-lg font-semibold mb-4">Medizinische Fragen</h3>

				{renderRadioGroup(
					"wearing_interfearing_devices",
					"Tragen Sie einen Herzschrittmacher, elektrische Implantate (z. B. ICD, CRT) oder eine künstliche Metallherzklappe?",
					["Ja", "Nein"],
					true
				)}

				{wearingInterferingDevices === "true" && (
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Welche? *
						</label>
						<input
							type="text"
							{...register("interfearing_devices", {
								required: "Diese Angabe ist erforderlich",
							})}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
							disabled={readOnly}
						/>
						{errors.interfearing_devices && (
							<p className="text-red-500 text-sm mt-1">
								{errors.interfearing_devices.message}
							</p>
						)}
					</div>
				)}

				{renderRadioGroup(
					"had_brain_or_heart_op",
					"Wurden Sie schon einmal am Gehirn oder Herzen operiert?",
					["Ja", "Nein"],
					true
				)}

				{hadBrainOrHeartOp === "true" && (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Was wurde operiert? *
							</label>
							<input
								type="text"
								{...register("which_op", {
									required: "Diese Angabe ist erforderlich",
								})}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
								disabled={readOnly}
							/>
							{errors.which_op && (
								<p className="text-red-500 text-sm mt-1">
									{errors.which_op.message}
								</p>
							)}
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Wann war die OP? *
							</label>
							<input
								type="text"
								{...register("when_op", {
									required: "Diese Angabe ist erforderlich",
								})}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
								disabled={readOnly}
							/>
							{errors.when_op && (
								<p className="text-red-500 text-sm mt-1">
									{errors.when_op.message}
								</p>
							)}
						</div>
					</div>
				)}

				{renderRadioGroup(
					"had_organ_removed",
					"Wurden bei Ihnen bereits Organe entfernt?",
					["Ja", "Nein"],
					true
				)}

				{hadOrganRemoved === "true" && (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Welche Organe wurden entfernt? *
							</label>
							<input
								type="text"
								{...register("which_organ", {
									required: "Diese Angabe ist erforderlich",
								})}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
								disabled={readOnly}
							/>
							{errors.which_organ && (
								<p className="text-red-500 text-sm mt-1">
									{errors.which_organ.message}
								</p>
							)}
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Wann wurden Organe entfernt? *
							</label>
							<input
								type="text"
								{...register("when_organ", {
									required: "Diese Angabe ist erforderlich",
								})}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
								disabled={readOnly}
							/>
							{errors.when_organ && (
								<p className="text-red-500 text-sm mt-1">
									{errors.when_organ.message}
								</p>
							)}
						</div>
					</div>
				)}

				{renderRadioGroup(
					"has_kidney_disease",
					"Leiden Sie an einer Nierenerkrankung?",
					["Ja", "Nein"],
					true
				)}

				{hasKidneyDisease === "true" && (
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Welche Nierenerkrankung? *
						</label>
						<input
							type="text"
							{...register("which_kidney_disease", {
								required: "Diese Angabe ist erforderlich",
							})}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
							disabled={readOnly}
						/>
						{errors.which_kidney_disease && (
							<p className="text-red-500 text-sm mt-1">
								{errors.which_kidney_disease.message}
							</p>
						)}
					</div>
				)}
			</div>

			{/* Implants and Metal Objects */}
			<div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
				<h3 className="text-lg font-semibold mb-4">
					Implantate und Metallteile
				</h3>

				{renderRadioGroup(
					"wearing_interfearing_implants_or_metal_objects",
					"Tragen Sie Implantate und/oder Metallteile (gilt nicht für Zahnersatz) in/an Ihrem Körper?",
					["Ja", "Nein"],
					true
				)}

				{wearingImplantsOrMetalObjects === "true" && (
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="md:col-span-2">
							<label className="block text-sm font-medium text-gray-700">
								Welche? (z. B. Hörimplantat, Gelenkprothesen, Operationsnägel,
								Gefäßclips, Stents, Metallclips, Metallplatten,
								Medikamentenpumpen, Piercings, Tätowierungen, Permanent-Make-up,
								Kupferspirale) *
							</label>
							<input
								type="text"
								{...register("which_interfearing_implants", {
									required: "Diese Angabe ist erforderlich",
								})}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
								disabled={readOnly}
							/>
							{errors.which_interfearing_implants && (
								<p className="text-red-500 text-sm mt-1">
									{errors.which_interfearing_implants.message}
								</p>
							)}
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Wann?
							</label>
							<input
								type="text"
								{...register("when_interfearing_implants")}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
								disabled={readOnly}
							/>
						</div>
					</div>
				)}

				{renderRadioGroup(
					"has_injuries_by_metallic_objects",
					"Haben Sie Verletzungen durch metallische Objekte erlitten?",
					["Ja", "Nein"],
					true
				)}

				{hasInjuriesByMetallicObjects === "true" && (
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Welche? (z. B. Granatsplitter, Verletzungen im Auge) *
						</label>
						<input
							type="text"
							{...register("which_injuries", {
								required: "Diese Angabe ist erforderlich",
							})}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
							disabled={readOnly}
						/>
						{errors.which_injuries && (
							<p className="text-red-500 text-sm mt-1">
								{errors.which_injuries.message}
							</p>
						)}
					</div>
				)}
			</div>

			{/* Allergies and Medical Conditions */}
			<div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
				<h3 className="text-lg font-semibold mb-4">
					Allergien und medizinische Bedingungen
				</h3>

				{renderRadioGroup(
					"has_allergies",
					"Sind bei Ihnen Allergien bekannt?",
					["Ja", "Nein"],
					true
				)}

				{hasAllergies === "true" && (
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Welche? (z. B. Kontrastmittel, Medikamente, Histamin) *
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

				{renderRadioGroup(
					"had_previous_exam_with_contrast_media",
					"Sind Sie früher schon einmal mit Röntgen-Kontrastmittel untersucht worden?",
					["Ja", "Nein"],
					true
				)}

				{renderRadioGroup(
					"had_side_effects_from_contrast_media",
					"Haben Sie nach Röntgen-Kontrastmittelgabe Nebenwirkungen verspürt? Übelkeit, Hautrötung, Jucken, Niesreiz, Luftnot, Kreislaufbeschwerden, Bewusstlosigkeit",
					["Ja", "Nein"],
					true
				)}

				{renderRadioGroup(
					"has_asthma",
					"Leiden Sie unter Asthma?",
					["Ja", "Nein"],
					true
				)}

				{renderRadioGroup(
					"has_known_hyperthyroidism",
					"Ist bei Ihnen eine Überfunktion der Schilddrüse bekannt?",
					["Ja", "Nein"],
					true
				)}

				{renderRadioGroup(
					"taking_medication_for_hyperthyroidism",
					"Nehmen Sie Schilddrüsenmedikamente?",
					["Ja", "Nein"],
					true
				)}

				{takingMedicationForHyperthyroidism === "true" && (
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Welche Schilddrüsenmedikamente nehmen Sie? *
						</label>
						<input
							type="text"
							{...register("which_hyperthyroidism_medication", {
								required: "Diese Angabe ist erforderlich",
							})}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
							disabled={readOnly}
						/>
						{errors.which_hyperthyroidism_medication && (
							<p className="text-red-500 text-sm mt-1">
								{errors.which_hyperthyroidism_medication.message}
							</p>
						)}
					</div>
				)}

				{renderRadioGroup(
					"had_thyroid_surgery_or_radioactive_iodine_therapy",
					"Wurden Sie an der Schilddrüse operiert oder hatten Sie eine Radiojodtherapie?",
					["Ja", "Nein"],
					true
				)}

				{renderRadioGroup(
					"has_diabetes",
					"Besteht einer Zuckerkrankheit (Diabetes mellitus)?",
					["Ja", "Nein"],
					true
				)}

				{renderRadioGroup(
					"taking_metformin_or_similar",
					"Nehmen Sie Metformin oder ähnliche Medikamente ein?",
					["Ja", "Nein"],
					true
				)}

				{renderRadioGroup(
					"has_renal_impairment",
					"Ist bei Ihnen eine Einschränkung der Nierenfunktion bekannt?",
					["Ja", "Nein"],
					true
				)}

				{renderRadioGroup(
					"has_increased_intraocular_pressure",
					"Besteht bei Ihnen ein erhöhter Augeninnendruck (Glaukom)?",
					["Ja", "Nein"],
					true
				)}
			</div>

			{/* Previous examinations */}
			<div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
				<h3 className="text-lg font-semibold mb-4">Voruntersuchungen</h3>

				{renderRadioGroup(
					"are_there_preliminary_exams_of_the_bodypart",
					"Gibt es Voruntersuchungen des heute zu untersuchenden Körperteils?",
					["Ja", "Nein"],
					true
				)}

				{areTherePreliminaryExams === "true" && (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Welche? (z. B. Röntgen, CT, MR, Nuklearmedizin) *
							</label>
							<input
								type="text"
								{...register("which_preliminary_exams", {
									required: "Diese Angabe ist erforderlich",
								})}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
								disabled={readOnly}
							/>
							{errors.which_preliminary_exams && (
								<p className="text-red-500 text-sm mt-1">
									{errors.which_preliminary_exams.message}
								</p>
							)}
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Wann war die Voruntersuchung? *
							</label>
							<input
								type="text"
								{...register("when_preliminary_exams", {
									required: "Diese Angabe ist erforderlich",
								})}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
								disabled={readOnly}
							/>
							{errors.when_preliminary_exams && (
								<p className="text-red-500 text-sm mt-1">
									{errors.when_preliminary_exams.message}
								</p>
							)}
						</div>
					</div>
				)}
			</div>

			{/* Infectious diseases */}
			<div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
				<h3 className="text-lg font-semibold mb-4">Infektionskrankheiten</h3>

				{renderRadioGroup(
					"has_infectious_disease",
					"Ist bei Ihnen eine Infektionskrankheit bekannt?",
					["Ja", "Nein"],
					true
				)}

				{hasInfectiousDisease === "true" && (
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Welche? (z. B. Hepatitis, HIV, etc.) *
						</label>
						<input
							type="text"
							{...register("which_infectious_disease", {
								required: "Diese Angabe ist erforderlich",
							})}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
							disabled={readOnly}
						/>
						{errors.which_infectious_disease && (
							<p className="text-red-500 text-sm mt-1">
								{errors.which_infectious_disease.message}
							</p>
						)}
					</div>
				)}
			</div>

			{/* Medications */}
			<div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
				<h3 className="text-lg font-semibold mb-4">Medikamente</h3>

				{renderRadioGroup(
					"taking_blood_thinning_medication",
					"Nehmen Sie Blutverdünner?",
					["Ja", "Nein"],
					true
				)}

				{takingBloodThinningMedication === "true" && (
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Welche? (z. B. ASS/Aspirin, Plavix, Xarelto) *
							</label>
							<input
								type="text"
								{...register("which_blood_thinning_medication", {
									required: "Diese Angabe ist erforderlich",
								})}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
								disabled={readOnly}
							/>
							{errors.which_blood_thinning_medication && (
								<p className="text-red-500 text-sm mt-1">
									{errors.which_blood_thinning_medication.message}
								</p>
							)}
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Seit wann nehmen Sie Blutverdünner? *
							</label>
							<input
								type="text"
								{...register("since_when_taking_medication", {
									required: "Diese Angabe ist erforderlich",
								})}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
								disabled={readOnly}
							/>
							{errors.since_when_taking_medication && (
								<p className="text-red-500 text-sm mt-1">
									{errors.since_when_taking_medication.message}
								</p>
							)}
						</div>
					</div>
				)}

				{renderRadioGroup(
					"taking_regular_medication",
					"Nehmen Sie regelmäßig sonstige Medikamente ein?",
					["Ja", "Nein"],
					true
				)}

				{takingRegularMedication === "true" && (
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Welche sonstigen Medikamente nehmen Sie regelmäßig ein? *
						</label>
						<input
							type="text"
							{...register("which_regular_medication", {
								required: "Diese Angabe ist erforderlich",
							})}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
							disabled={readOnly}
						/>
						{errors.which_regular_medication && (
							<p className="text-red-500 text-sm mt-1">
								{errors.which_regular_medication.message}
							</p>
						)}
					</div>
				)}
			</div>

			{/* Consent */}
			<div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
				<h3 className="text-lg font-semibold mb-4">Einwilligung</h3>

				<div className="relative flex items-start">
					<div className="flex items-center h-5">
						<input
							id="has_read_and_understood"
							type="checkbox"
							{...register("has_read_and_understood", {
								required:
									"Bitte bestätigen Sie, dass Sie den Aufklärungsbogen gelesen und verstanden haben",
							})}
							className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
							disabled={readOnly}
						/>
					</div>
					<div className="ml-3 text-sm">
						<label
							htmlFor="has_read_and_understood"
							className="font-medium text-gray-700"
						>
							<strong>
								Den Aufklärungsbogen habe ich gelesen und verstanden.
							</strong>
						</label>
					</div>
				</div>
				{errors.has_read_and_understood && (
					<p className="text-red-500 text-sm">
						{errors.has_read_and_understood.message}
					</p>
				)}
			</div>

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

export default MRICTForm;
