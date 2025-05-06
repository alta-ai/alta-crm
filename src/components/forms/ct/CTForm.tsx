import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Info, AlertCircle } from "lucide-react";

import type { CTForm as CTFormType } from "../../types";
import type { CTFormDataContextType } from "./CTFormData";
import { useFormContext } from "../formContext";
import { GENDER } from "../../types/constants";

interface CTFormProps {
	onComplete?: () => void;
	readOnly?: boolean;
}

export const CTForm = ({ onComplete, readOnly }: CTFormProps) => {
	const { data, mutateFn } = useFormContext<CTFormDataContextType>();

	const [isSaving, setIsSaving] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [saveSuccess, setSaveSuccess] = useState(false);

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm<CTFormType>({ defaultValues: data?.submission });

	// Watch fields for conditional rendering
	const previousContrastMedia = watch(
		"had_previous_exam_with_contrast_media"
	) as unknown as string;
	const allergies = watch("has_allergies") as unknown as string;
	const prelimExams = watch(
		"has_preliminary_examinations"
	) as unknown as string;
	const thyroidMedication = watch(
		"taking_medication_for_hyperthyroidism"
	) as unknown as string;
	const bloodThinners = watch("taking_blood_thinners") as unknown as string;
	const infectiousDisease = watch(
		"has_infectious_disease"
	) as unknown as string;

	// Reset dependent fields when conditional fields are toggled to false
	useEffect(() => {
		if (previousContrastMedia === "false") {
			setValue("had_side_effects_from_contrast_media", null);
		}
	}, [previousContrastMedia, setValue]);

	useEffect(() => {
		if (allergies === "false") {
			setValue("which_allergies", null);
		}
	}, [allergies, setValue]);

	useEffect(() => {
		if (prelimExams === "false") {
			setValue("preliminary_examinations_details", null);
			setValue("preliminary_examinations_date", null);
		}
	}, [prelimExams, setValue]);

	useEffect(() => {
		if (thyroidMedication === "false") {
			setValue("which_hyperthyroidism_medication", null);
		}
	}, [thyroidMedication, setValue]);

	useEffect(() => {
		if (bloodThinners === "false") {
			setValue("blood_thinners_details", null);
			setValue("blood_thinners_since", null);
		}
	}, [bloodThinners, setValue]);

	useEffect(() => {
		if (infectiousDisease === "false") {
			setValue("infectious_disease_details", null);
		}
	}, [infectiousDisease, setValue]);

	const onFormSubmit = async (data: CTFormType) => {
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
			{/* CT Information */}
			<div className="prose max-w-none bg-white p-6 rounded-lg shadow-sm">
				<h3 className="text-xl font-semibold mb-4">
					Aufklärungsbogen für Computertomographie (CT) mit Kontrastmittel
				</h3>
				<p className="text-gray-700">
					Die Computertomographie (CT) ist ein diagnostisches Verfahren, bei dem
					die zu untersuchende Körperregion mit Verwendung von Röntgenstrahlen
					dargestellt wird. Die Strahlenbelastung wird dabei so gering wie
					möglich gehalten (low-dose-CT).
				</p>
				<p className="text-gray-700">
					Bei einigen Fragestellungen ist für die CT-Untersuchung die Gabe eines
					Kontrastmittels notwendig. Die Entscheidung über eine möglich
					notwendige Kontrastmittelgabe trifft der Arzt.
				</p>
				<p className="text-gray-700">
					Bei CT-Untersuchungen wird das Kontrastmittel über eine elektrische
					Pumpe in die Armvene gespritzt und/oder oral verabreicht. Dabei können
					vorübergehend ein Wärmegefühl und ein leichtes Unwohlsein auftreten,
					was nach kurzer Zeit von selbst verschwindet. Das Kontrastmittel wird
					eingesetzt zur Beurteilung der Organe und Gefäße.
				</p>
				<p className="text-gray-700">
					Röntgen-Kontrastmittel enthalten Jod. Manche Patienten sind dagegen
					allergisch und dürfen auf diese Weise nicht untersucht werden. Auch
					bei einer Schilddrüsenüberfunktion und/oder Einnahme von
					metforminhaltigen Medikamenten bei Diabetes mellitus darf Jod nicht
					gegeben werden.
				</p>
				<div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
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
								Sollte der Verdacht auf eine Schwangerschaft bestehen, bitten
								wir Sie, um sofortige Mitteilung, da Sie in diesem Fall NICHT im
								CT-Gerät untersucht werden dürfen bzw. sollten!
							</strong>
						</p>
					</div>
				</div>
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
							Während der Untersuchungszeit sind wir immer in Ihrer
							unmittelbaren Nähe. Bitte teilen Sie uns alles mit, was Sie
							beunruhigt, insbesondere, wenn Sie folgende Symptome verspüren:
							Nies- oder Juckreiz, Quaddelbildung, Husten, Atemschwierigkeiten,
							Schwindel, Übelkeit oder Schmerzen im Bereich der Injektionsnadel.
						</p>
					</div>
				</div>
			</div>

			{/* Personal Information */}
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
								min: {
									value: 0,
									message: "Bitte geben Sie eine gültige Größe ein",
								},
								max: {
									value: 220,
									message: "Bitte geben Sie eine gültige Größe ein",
								},
							})}
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
								min: {
									value: 25,
									message: "Bitte geben Sie ein gültiges Gewicht ein",
								},
								max: {
									value: 250,
									message: "Bitte geben Sie ein gültiges Gewicht ein",
								},
							})}
						/>
						{errors.weight && (
							<p className="text-red-500 text-sm mt-1">
								{errors.weight.message}
							</p>
						)}
					</div>
				</div>
			</div>

			{/* Medical History */}
			<div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
				<h3 className="text-lg font-semibold mb-4">
					Medizinische Vorgeschichte
				</h3>

				{/* Previous contrast media */}
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Sind Sie früher schon einmal mit Röntgenkontrastmittel untersucht
							worden? *
						</label>
						<div className="mt-2 space-x-4">
							{["Ja", "Nein"].map((option) => (
								<label key={option} className="inline-flex items-center">
									<input
										type="radio"
										value={option === "Ja" ? "true" : "false"}
										{...register("had_previous_exam_with_contrast_media", {
											required: "Diese Angabe ist erforderlich",
										})}
										className="form-radio h-4 w-4 text-blue-600"
									/>
									<span className="ml-2 text-gray-700">{option}</span>
								</label>
							))}
						</div>
						{errors.had_previous_exam_with_contrast_media && (
							<p className="text-red-500 text-sm mt-1">
								{errors.had_previous_exam_with_contrast_media.message}
							</p>
						)}
					</div>

					{previousContrastMedia === "true" && (
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Haben Sie nach Röntgenkontrastmittelgabe Nebenwirkungen
								verspürt? Übelkeit, Hautrötung, Jucken, Niesreiz, Luftnot,
								Kreislaufbeschwerden, Bewusstlosigkeit? *
							</label>
							<div className="mt-2 space-x-4">
								{["Ja", "Nein"].map((option) => (
									<label key={option} className="inline-flex items-center">
										<input
											type="radio"
											value={option === "Ja" ? "true" : "false"}
											{...register("had_side_effects_from_contrast_media", {
												required: "Diese Angabe ist erforderlich",
											})}
											className="form-radio h-4 w-4 text-blue-600"
										/>
										<span className="ml-2 text-gray-700">{option}</span>
									</label>
								))}
							</div>
							{errors.had_side_effects_from_contrast_media && (
								<p className="text-red-500 text-sm mt-1">
									{errors.had_side_effects_from_contrast_media.message}
								</p>
							)}
						</div>
					)}
				</div>

				{/* Allergies */}
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Sind bei Ihnen Allergien bekannt? *
						</label>
						<div className="mt-2 space-x-4">
							{["Ja", "Nein"].map((option) => (
								<label key={option} className="inline-flex items-center">
									<input
										type="radio"
										value={option === "Ja" ? "true" : "false"}
										{...register("has_allergies", {
											required: "Diese Angabe ist erforderlich",
										})}
										className="form-radio h-4 w-4 text-blue-600"
									/>
									<span className="ml-2 text-gray-700">{option}</span>
								</label>
							))}
						</div>
						{errors.has_allergies && (
							<p className="text-red-500 text-sm mt-1">
								{errors.has_allergies.message}
							</p>
						)}
					</div>

					{allergies === "true" && (
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Gegen was sind Sie allergisch? *
							</label>
							<input
								type="text"
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
								placeholder="Bitte angeben"
								{...register("which_allergies", {
									required: "Diese Angabe ist erforderlich",
								})}
							/>
							{errors.which_allergies && (
								<p className="text-red-500 text-sm mt-1">
									{errors.which_allergies.message}
								</p>
							)}
						</div>
					)}
				</div>

				{/* Asthma */}
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Leiden Sie unter Asthma? *
						</label>
						<div className="mt-2 space-x-4">
							{["Ja", "Nein"].map((option) => (
								<label key={option} className="inline-flex items-center">
									<input
										type="radio"
										value={option === "Ja" ? "true" : "false"}
										{...register("has_asthma", {
											required: "Diese Angabe ist erforderlich",
										})}
										className="form-radio h-4 w-4 text-blue-600"
									/>
									<span className="ml-2 text-gray-700">{option}</span>
								</label>
							))}
						</div>
						{errors.has_asthma && (
							<p className="text-red-500 text-sm mt-1">
								{errors.has_asthma.message}
							</p>
						)}
					</div>
				</div>

				{/* Previous Examinations */}
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Gibt es Voruntersuchungen des heute zu untersuchenden Körperteils
							(Röntgen, CT, MR, Nuklearmedizin, PET)? *
						</label>
						<div className="mt-2 space-x-4">
							{["Ja", "Nein"].map((option) => (
								<label key={option} className="inline-flex items-center">
									<input
										type="radio"
										value={option === "Ja" ? "true" : "false"}
										{...register("has_preliminary_examinations", {
											required: "Diese Angabe ist erforderlich",
										})}
										className="form-radio h-4 w-4 text-blue-600"
									/>
									<span className="ml-2 text-gray-700">{option}</span>
								</label>
							))}
						</div>
						{errors.has_preliminary_examinations && (
							<p className="text-red-500 text-sm mt-1">
								{errors.has_preliminary_examinations.message}
							</p>
						)}
					</div>

					{prelimExams === "true" && (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Welche Voruntersuchungen gibt es? *
								</label>
								<input
									type="text"
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
									placeholder="Bitte angeben"
									{...register("preliminary_examinations_details", {
										required: "Diese Angabe ist erforderlich",
									})}
								/>
								{errors.preliminary_examinations_details && (
									<p className="text-red-500 text-sm mt-1">
										{errors.preliminary_examinations_details.message}
									</p>
								)}
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Wann wurden diese Untersuchungen gemacht?
								</label>
								<input
									type="text"
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
									placeholder="Datum oder Zeitraum"
									{...register("preliminary_examinations_date")}
								/>
							</div>
						</div>
					)}
				</div>

				{/* Thyroid function */}
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Ist bei Ihnen eine Überfunktion der Schilddrüse bekannt? *
						</label>
						<div className="mt-2 space-x-4">
							{["Ja", "Nein"].map((option) => (
								<label key={option} className="inline-flex items-center">
									<input
										type="radio"
										value={option === "Ja" ? "true" : "false"}
										{...register("has_known_hyperthyroidism", {
											required: "Diese Angabe ist erforderlich",
										})}
										className="form-radio h-4 w-4 text-blue-600"
									/>
									<span className="ml-2 text-gray-700">{option}</span>
								</label>
							))}
						</div>
						{errors.has_known_hyperthyroidism && (
							<p className="text-red-500 text-sm mt-1">
								{errors.has_known_hyperthyroidism.message}
							</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700">
							Nehmen Sie Schilddrüsenmedikamente? *
						</label>
						<div className="mt-2 space-x-4">
							{["Ja", "Nein"].map((option) => (
								<label key={option} className="inline-flex items-center">
									<input
										type="radio"
										value={option === "Ja" ? "true" : "false"}
										{...register("taking_medication_for_hyperthyroidism", {
											required: "Diese Angabe ist erforderlich",
										})}
										className="form-radio h-4 w-4 text-blue-600"
									/>
									<span className="ml-2 text-gray-700">{option}</span>
								</label>
							))}
						</div>
						{errors.taking_medication_for_hyperthyroidism && (
							<p className="text-red-500 text-sm mt-1">
								{errors.taking_medication_for_hyperthyroidism.message}
							</p>
						)}
					</div>

					{thyroidMedication === "true" && (
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Welche Schilddrüsenmedikamente nehmen Sie? *
							</label>
							<input
								type="text"
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
								placeholder="Bitte angeben"
								{...register("which_hyperthyroidism_medication", {
									required: "Diese Angabe ist erforderlich",
								})}
							/>
							{errors.which_hyperthyroidism_medication && (
								<p className="text-red-500 text-sm mt-1">
									{errors.which_hyperthyroidism_medication.message}
								</p>
							)}
						</div>
					)}

					<div>
						<label className="block text-sm font-medium text-gray-700">
							Wurden Sie an der Schilddrüse operiert oder hatten Sie eine
							Radiojodtherapie? *
						</label>
						<div className="mt-2 space-x-4">
							{["Ja", "Nein"].map((option) => (
								<label key={option} className="inline-flex items-center">
									<input
										type="radio"
										value={option === "Ja" ? "true" : "false"}
										{...register(
											"had_thyroid_surgery_or_radioactive_iodine_therapy",
											{
												required: "Diese Angabe ist erforderlich",
											}
										)}
										className="form-radio h-4 w-4 text-blue-600"
									/>
									<span className="ml-2 text-gray-700">{option}</span>
								</label>
							))}
						</div>
						{errors.had_thyroid_surgery_or_radioactive_iodine_therapy && (
							<p className="text-red-500 text-sm mt-1">
								{
									errors.had_thyroid_surgery_or_radioactive_iodine_therapy
										.message
								}
							</p>
						)}
					</div>
				</div>

				{/* Diabetes */}
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Besteht einer Zuckerkrankheit (Diabetes mellitus)? *
						</label>
						<div className="mt-2 space-x-4">
							{["Ja", "Nein"].map((option) => (
								<label key={option} className="inline-flex items-center">
									<input
										type="radio"
										value={option === "Ja" ? "true" : "false"}
										{...register("has_diabetes", {
											required: "Diese Angabe ist erforderlich",
										})}
										className="form-radio h-4 w-4 text-blue-600"
									/>
									<span className="ml-2 text-gray-700">{option}</span>
								</label>
							))}
						</div>
						{errors.has_diabetes && (
							<p className="text-red-500 text-sm mt-1">
								{errors.has_diabetes.message}
							</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700">
							Nehmen Sie Metformin oder ähnliche Medikamente ein? *
						</label>
						<div className="mt-2 space-x-4">
							{["Ja", "Nein"].map((option) => (
								<label key={option} className="inline-flex items-center">
									<input
										type="radio"
										value={option === "Ja" ? "true" : "false"}
										{...register("taking_metformin_or_similar", {
											required: "Diese Angabe ist erforderlich",
										})}
										className="form-radio h-4 w-4 text-blue-600"
									/>
									<span className="ml-2 text-gray-700">{option}</span>
								</label>
							))}
						</div>
						{errors.taking_metformin_or_similar && (
							<p className="text-red-500 text-sm mt-1">
								{errors.taking_metformin_or_similar.message}
							</p>
						)}
					</div>
				</div>

				{/* Kidney function */}
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Ist bei Ihnen eine Einschränkung der Nierenfunktion bekannt? *
						</label>
						<div className="mt-2 space-x-4">
							{["Ja", "Nein"].map((option) => (
								<label key={option} className="inline-flex items-center">
									<input
										type="radio"
										value={option === "Ja" ? "true" : "false"}
										{...register("has_renal_impairment", {
											required: "Diese Angabe ist erforderlich",
										})}
										className="form-radio h-4 w-4 text-blue-600"
									/>
									<span className="ml-2 text-gray-700">{option}</span>
								</label>
							))}
						</div>
						{errors.has_renal_impairment && (
							<p className="text-red-500 text-sm mt-1">
								{errors.has_renal_impairment.message}
							</p>
						)}
					</div>
				</div>

				{/* Blood thinners */}
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Nehmen Sie Blutverdünner? *
						</label>
						<div className="mt-2 space-x-4">
							{["Ja", "Nein"].map((option) => (
								<label key={option} className="inline-flex items-center">
									<input
										type="radio"
										value={option === "Ja" ? "true" : "false"}
										{...register("taking_blood_thinners", {
											required: "Diese Angabe ist erforderlich",
										})}
										className="form-radio h-4 w-4 text-blue-600"
									/>
									<span className="ml-2 text-gray-700">{option}</span>
								</label>
							))}
						</div>
						{errors.taking_blood_thinners && (
							<p className="text-red-500 text-sm mt-1">
								{errors.taking_blood_thinners.message}
							</p>
						)}
					</div>

					{bloodThinners === "true" && (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Welche? (z.B. ASS/Aspirin, Plavix, Xarelto) *
								</label>
								<input
									type="text"
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
									placeholder="Bitte angeben"
									{...register("blood_thinners_details", {
										required: "Diese Angabe ist erforderlich",
									})}
								/>
								{errors.blood_thinners_details && (
									<p className="text-red-500 text-sm mt-1">
										{errors.blood_thinners_details.message}
									</p>
								)}
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Seit wann nehmen Sie Blutverdünner?
								</label>
								<input
									type="text"
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
									placeholder="Datum oder Zeitraum"
									{...register("blood_thinners_since")}
								/>
							</div>
						</div>
					)}
				</div>

				{/* Infectious disease */}
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Ist bei Ihnen eine Infektionskrankheit (Hepatitis, HIV etc.)
							bekannt? *
						</label>
						<div className="mt-2 space-x-4">
							{["Ja", "Nein"].map((option) => (
								<label key={option} className="inline-flex items-center">
									<input
										type="radio"
										value={option === "Ja" ? "true" : "false"}
										{...register("has_infectious_disease", {
											required: "Diese Angabe ist erforderlich",
										})}
										className="form-radio h-4 w-4 text-blue-600"
									/>
									<span className="ml-2 text-gray-700">{option}</span>
								</label>
							))}
						</div>
						{errors.has_infectious_disease && (
							<p className="text-red-500 text-sm mt-1">
								{errors.has_infectious_disease.message}
							</p>
						)}
					</div>

					{infectiousDisease === "true" && (
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Welche? *
							</label>
							<input
								type="text"
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
								placeholder="Bitte angeben"
								{...register("infectious_disease_details", {
									required: "Diese Angabe ist erforderlich",
								})}
							/>
							{errors.infectious_disease_details && (
								<p className="text-red-500 text-sm mt-1">
									{errors.infectious_disease_details.message}
								</p>
							)}
						</div>
					)}
				</div>
			</div>

			{/* Pregnancy section - only for female patients */}
			{data?.patient.gender === GENDER[1] && (
				<div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
					<h3 className="text-lg font-semibold mb-4">
						Angaben für weibliche Patienten
					</h3>

					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 font-bold">
								Schwangerschaft *
							</label>
							<div className="mt-2">
								<label className="inline-flex items-center">
									<input
										type="checkbox"
										{...register("pregnant", {
											required: "Bitte bestätigen Sie diesen Hinweis",
										})}
										className="form-checkbox h-4 w-4 text-blue-600"
									/>
									<span className="ml-2 text-gray-700">
										Ich bestätige hiermit, dass bei mir z. Z. keine
										Schwangerschaft besteht. Mir ist die Schädigung von
										Röntgenstrahlen auf das ungeborene Leben bekannt.
									</span>
								</label>
								{errors.pregnant && (
									<p className="text-red-500 text-sm mt-1">
										{errors.pregnant.message}
									</p>
								)}
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700">
								Wann war Ihre letzte Regelblutung? *
							</label>
							<input
								type="text"
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
								placeholder="Datum oder Zeitraum"
								{...register("last_menstruation", {
									required: "Diese Angabe ist erforderlich",
								})}
							/>
							{errors.last_menstruation && (
								<p className="text-red-500 text-sm mt-1">
									{errors.last_menstruation.message}
								</p>
							)}
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700">
								Stillen Sie zurzeit?
							</label>
							<div className="mt-2 space-x-4">
								{["Ja", "Nein"].map((option) => (
									<label key={option} className="inline-flex items-center">
										<input
											type="radio"
											value={option === "Ja" ? "true" : "false"}
											{...register("breastfeeding")}
											className="form-radio h-4 w-4 text-blue-600"
										/>
										<span className="ml-2 text-gray-700">{option}</span>
									</label>
								))}
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Save Button - only show if onSubmit is provided */}
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
		</form>
	);
};

export default CTForm;
