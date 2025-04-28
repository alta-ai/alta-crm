import { useState } from "react";
import { useForm } from "react-hook-form";
import { Info } from "lucide-react";

import type { ProstateHoLEPForm as ProstateHoLEPFormType } from "../../types";
import type { ProstateHoLEPFormDataContextType } from "./ProstateHoLEPFormData";
import { useFormContext } from "../formContext";
import PSATable from "../components/PSATable";

interface PostHolepQuestionnaireFormProps {
	onComplete?: () => void;
	readOnly?: boolean;
}

// Define constants for drop-down options
const NIGHT_FREQUENCY_OPTIONS = [
	"Nein",
	"Manchmal",
	"1 mal",
	"2 mal",
	"3 mal",
	"4 mal",
	"5 mal",
	"Oder öfter",
];

export const ProstateHoLEPForm = ({
	onComplete,
	readOnly,
}: PostHolepQuestionnaireFormProps) => {
	const { data, mutateFn } = useFormContext<ProstateHoLEPFormDataContextType>();

	const [isSaving, setIsSaving] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [saveSuccess, setSaveSuccess] = useState(false);

	const {
		register,
		trigger,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<ProstateHoLEPFormType>({ defaultValues: data?.submission });

	// Watch fields for conditional rendering
	const hasComplaints = watch("has_complaints") as unknown as string;
	const hasIncontinence = watch("has_incontinence") as unknown as string;
	const takesPhosphodiesterase = watch(
		"taking_phosphodiesterase_inhibitors"
	) as unknown as string;
	const takesProstateMedication = watch(
		"taking_prostate_medication"
	) as unknown as string;
	const hadAntibioticTherapy = watch(
		"had_antibiotic_therapy"
	) as unknown as string;
	const takesBloodThinners = watch(
		"taking_blood_thinners"
	) as unknown as string;
	const hasOtherComplaints = watch("has_other_complaints") as unknown as string;

	// Function to render a radio button group
	const renderRadioGroup = (
		name: keyof ProstateHoLEPFormType,
		label: string,
		options: string[] = ["Ja", "Nein"],
		required = false
	) => {
		return (
			<div className="space-y-2">
				<label className="block text-sm font-medium text-gray-700">
					{label} {required && "*"}
				</label>
				<div className="space-y-2">
					{options.map((option) => (
						<label key={option} className="flex items-center">
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
									required ? { required: `Dieses Feld ist erforderlich` } : {}
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

	const onFormSubmit = async (data: ProstateHoLEPFormType) => {
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
					Prostata-Fragebogen nach HoLEP
				</h3>
				<p className="text-gray-700">
					Bitte füllen Sie diesen Fragebogen nach Ihrer HoLEP-Behandlung aus.
					Die Informationen helfen uns, Ihre Behandlung nachzuverfolgen und zu
					bewerten.
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

			{/* PSA Values */}
			<PSATable
				count={6}
				register={register}
				trigger={trigger}
				errors={errors}
				readOnly={readOnly}
			/>

			{/* Complaints and Symptoms */}
			<div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
				<h3 className="text-lg font-semibold mb-4">Beschwerden nach HoLEP</h3>

				{renderRadioGroup(
					"has_complaints",
					"2. Haben Sie nach dem HoLEP-Eingriff Beschwerden?"
				)}

				{hasComplaints === "true" && (
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Welche Beschwerden haben Sie nach dem HoLEP-Eingriff? *
						</label>
						<input
							type="text"
							{...register("complaints_description", {
								required: "Dieses Feld ist erforderlich",
							})}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
							disabled={readOnly}
						/>
						{errors.complaints_description && (
							<p className="text-red-500 text-sm mt-1">
								{errors.complaints_description.message}
							</p>
						)}
					</div>
				)}

				{renderRadioGroup(
					"has_potency_problems",
					"3. Haben Sie Probleme mit der Erektion/Potenz nach der HoLEP?",
					["Ja", "Nein"],
					true
				)}

				{renderRadioGroup(
					"has_incontinence",
					"4. Besteht eine Harninkontinenz nach der HoLEP?",
					["Ja", "Nein"],
					true
				)}

				{hasIncontinence === "true" && (
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Wie viele Vorlagen verbrauchen Sie an einem Tag (24 Std.)? *
						</label>
						<input
							type="text"
							{...register("templates_per_day", {
								required: "Dieses Feld ist erforderlich",
							})}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
							disabled={readOnly}
						/>
						{errors.templates_per_day && (
							<p className="text-red-500 text-sm mt-1">
								{errors.templates_per_day.message}
							</p>
						)}
					</div>
				)}

				{renderRadioGroup(
					"has_normal_ejaculation",
					"5. Haben Sie eine normale Ejakulation nach der HoLEP?",
					["Ja", "Nein"],
					true
				)}

				{renderRadioGroup(
					"has_other_complaints",
					"6. Anderweitige Beschwerden nach der HoLEP?"
				)}

				{hasOtherComplaints === "true" && (
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Welche anderweitige Beschwerden? *
						</label>
						<input
							type="text"
							{...register("other_complaints_description", {
								required: "Dieses Feld ist erforderlich",
							})}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
							disabled={readOnly}
						/>
						{errors.other_complaints_description && (
							<p className="text-red-500 text-sm mt-1">
								{errors.other_complaints_description.message}
							</p>
						)}
					</div>
				)}
			</div>

			{/* Medications */}
			<div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
				<h3 className="text-lg font-semibold mb-4">Medikamente</h3>

				{renderRadioGroup(
					"taking_phosphodiesterase_inhibitors",
					"7. Nehmen Sie die Phosphodiesterasehemmer (z.B. Tadalafil) noch ein?",
					["Ja", "Nein"],
					true
				)}

				{takesPhosphodiesterase === "true" && (
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Welches Präparat und welche Dosierung? *
						</label>
						<input
							type="text"
							{...register("phosphodiesterase_inhibitors_details", {
								required: "Dieses Feld ist erforderlich",
							})}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
							disabled={readOnly}
						/>
						{errors.phosphodiesterase_inhibitors_details && (
							<p className="text-red-500 text-sm mt-1">
								{errors.phosphodiesterase_inhibitors_details.message}
							</p>
						)}
					</div>
				)}

				<div>
					<label className="block text-sm font-medium text-gray-700">
						8. Stehen Sie nach der HoLEP-Behandlung in der Nacht noch auf, um
						auf die Toilette zu gehen? *
					</label>
					<select
						{...register("night_toilet_usage", {
							required: "Dieses Feld ist erforderlich",
						})}
						className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
						disabled={readOnly}
					>
						<option value="">Bitte auswählen</option>
						{NIGHT_FREQUENCY_OPTIONS.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
					{errors.night_toilet_usage && (
						<p className="text-red-500 text-sm mt-1">
							{errors.night_toilet_usage.message}
						</p>
					)}
				</div>

				{renderRadioGroup(
					"taking_prostate_medication",
					"9. Nehmen Sie nach der Behandlung Medikamente für die Prostata ein?",
					["Ja", "Nein"],
					true
				)}

				{takesProstateMedication === "true" && (
					<>
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Welche Medikamente? *
							</label>
							<input
								type="text"
								{...register("prostate_medication_description", {
									required: "Dieses Feld ist erforderlich",
								})}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
								disabled={readOnly}
							/>
							{errors.prostate_medication_description && (
								<p className="text-red-500 text-sm mt-1">
									{errors.prostate_medication_description.message}
								</p>
							)}
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700">
								Seit wann nehmen Sie Medikamente? *
							</label>
							<input
								type="text"
								{...register("prostate_medication_since_when", {
									required: "Dieses Feld ist erforderlich",
								})}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
								disabled={readOnly}
							/>
							{errors.prostate_medication_since_when && (
								<p className="text-red-500 text-sm mt-1">
									{errors.prostate_medication_since_when.message}
								</p>
							)}
						</div>
					</>
				)}
			</div>

			{/* Antibiotic Therapy */}
			<div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
				<h3 className="text-lg font-semibold mb-4">Antibiotika-Therapie</h3>

				{renderRadioGroup(
					"had_antibiotic_therapy",
					"10. Haben Sie nach der HoLEP noch eine Antibiotika-Therapie gemacht?",
					["Ja", "Nein"],
					true
				)}

				{hadAntibioticTherapy === "true" && (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Wann? *
							</label>
							<input
								type="text"
								{...register("antibiotic_therapy_when", {
									required: "Dieses Feld ist erforderlich",
								})}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
								disabled={readOnly}
							/>
							{errors.antibiotic_therapy_when && (
								<p className="text-red-500 text-sm mt-1">
									{errors.antibiotic_therapy_when.message}
								</p>
							)}
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700">
								Dauer? *
							</label>
							<input
								type="text"
								{...register("antibiotic_therapy_duration", {
									required: "Dieses Feld ist erforderlich",
								})}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
								disabled={readOnly}
							/>
							{errors.antibiotic_therapy_duration && (
								<p className="text-red-500 text-sm mt-1">
									{errors.antibiotic_therapy_duration.message}
								</p>
							)}
						</div>
					</div>
				)}
			</div>

			{/* Blood Thinners */}
			<div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
				<h3 className="text-lg font-semibold mb-4">Blutverdünner</h3>

				{renderRadioGroup(
					"taking_blood_thinners",
					"11. Nehmen Sie (regelmäßige) Blutverdünner (wie z. B. Aspirin, ASS, Plavix, Marcumar)?",
					["Ja", "Nein"],
					true
				)}

				{takesBloodThinners === "true" && (
					<>
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Welche? (z.B. ASS/Aspirin, Plavix, Xarelto)
							</label>
							<input
								type="text"
								{...register("blood_thinners_description")}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
								disabled={readOnly}
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700">
								Seit wann nehmen Sie Blutverdünner? *
							</label>
							<input
								type="text"
								{...register("blood_thinners_since_when", {
									required: "Dieses Feld ist erforderlich",
								})}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
								disabled={readOnly}
							/>
							{errors.blood_thinners_since_when && (
								<p className="text-red-500 text-sm mt-1">
									{errors.blood_thinners_since_when.message}
								</p>
							)}
						</div>
					</>
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

export default ProstateHoLEPForm;
