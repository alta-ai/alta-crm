import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Info } from "lucide-react";

import {
	defaultProstateFollowUpForm,
	type ProstateFollowUpForm as ProstateFollowUpFormType,
} from "../../types";
import type { ProstateFollowUpFormDataContextType } from "./ProstateFollowUpFormData";
import { useFormContext } from "../formContext";
import PSATable from "../components/PSATable";

interface ProstateFollowUpFormProps {
	onComplete?: () => void;
	readOnly?: boolean;
}

// Define constants for drop-down options
const NIGHT_FREQUENCY_OPTIONS = [
	"gar nicht",
	"manchmal",
	"1 mal",
	"2 mal",
	"3 mal",
	"4 mal",
	"5 mal",
	"oder öfter",
];
const SYMPTOM_DURATION_OPTIONS = [
	"seit kurzem",
	"weniger als 1 Jahr",
	"1 bis 5 Jahre",
	"mehr als 5 Jahre",
	"keine Symptome",
];
const SATISFACTION_LEVELS = [
	"ausgezeichnet",
	"zufrieden",
	"überwiegend zufrieden",
	"gemischt, teils zufrieden, teils unzufrieden",
	"überwiegend unzufrieden",
	"unglücklich",
	"sehr schlecht",
];
const PROSTATE_TREATMENT_TYPES = [
	"nein, da keine Diagnose bekannt ist",
	"nein, da bisher keine Notwendigkeit bestand",
	"nein, da ich Sorge/Angst vor Nebenwirkungen/Komplikationen habe",
	"nein, aus anderen Gruenden",
	"ja, wegen gutartiger Prostatavergroesserung (BPH, BPS, Hyperplasie)",
	"ja, wegen Prostataentzuendung (Prostatitis)",
	"ja, wegen Prostatakrebs",
];
const ENLARGEMENT_THERAPY_TYPES = [
	"TURP",
	"Greenlight",
	"HoLEP (Holmium-Laser)",
	"Medikamente",
	"andere Behandlung",
];
const ENLARGEMENT_MEDICATION_TYPES = [
	"pflanzlich/naturheilkundlich/homoeopathisch",
	"andere (z.B. Tamsulosin, Finasterid)",
];
const INFLAMMATION_THERAPY_TYPES = ["Antibiotika", "andere Behandlung"];
const CANCER_THERAPY_TYPES = [
	"Active-Surveillance (aktive Überwachung)",
	"Anti-Hormontherapie",
	"Strahlentherapie",
	"andere Behandlung",
];
const URINATION_SYMPTOMS = [
	"nein",
	"Blut im Urin",
	"Brennen in der Harnröhre",
	"häufiger Harndrang",
	"plötzlicher Harndrang",
	"schwacher Harnstrahl",
	"erschwertes Wasserlassen",
	"Schmerzen",
];
const BIOPSY_TYPES = [
	"nein",
	"ja, in der ALTA Klinik",
	"ja, ultraschallgesteuert (klassisch ohne MRT)",
	"ja, Fusionsbiopsie (mit MRT-Aufnahmen)",
	"ja, Saettigungsbiopsie (mehr als 20 Proben)",
	"ja, jedoch bin ich mir unsicher, welche Biopsie bei mir durchgeführt wurde",
];
const BIOPSY_ACCESS_ROUTES = [
	"durch den Enddarm (transrektal)",
	"durch den Damm (transperineal)",
	"durch den Gesäßmuskel (transgluteal)",
	"ich bin mir unsicher",
];
const BIOPSY_RESULTS = ["kein Karzinom (negativ)", "Karzinom (positiv)"];
const GLEASON_SCORES = [
	"3+3=6",
	"3+4=7a",
	"4+3=7b",
	"4+4=8",
	"3+5=8",
	"5+3=8",
	"5+4=9",
	"4+5=9",
	"5+5=10",
];

export const ProstateFollowUpForm = ({
	onComplete,
	readOnly,
}: ProstateFollowUpFormProps) => {
	const { data, mutateFn } =
		useFormContext<ProstateFollowUpFormDataContextType>();

	const [isSaving, setIsSaving] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [saveSuccess, setSaveSuccess] = useState(false);

	const {
		register,
		handleSubmit,
		trigger,
		watch,
		control,
		setValue,
		formState: { errors },
	} = useForm<ProstateFollowUpFormType>({
		defaultValues: data?.submission || defaultProstateFollowUpForm,
	});

	// Watch fields for conditional rendering
	const prostateBeenTreated = watch("prostate_treatment_types") || [];
	const enlargementTherapyTypes = watch("enlargement_therapy_types") || [];
	const enlargementMedTypes = watch("enlargement_medication_types") || [];
	const inflammationTherapyTypes = watch("inflammation_therapy_types") || [];
	const cancerTherapyTypes = watch("cancer_therapy_types") || [];
	const biopsyTypes = watch("biopsy_types") || [];
	const lastBiopsyResult = watch("last_biopsy_result");
	const urinationSymptoms = watch("urination_symptoms") || [];
	const hasOtherProblems = watch("has_other_problems") as unknown as string;

	// Reset conditional fields when toggled off:
	useEffect(() => {
		if (!prostateBeenTreated.includes("nein, aus anderen Gruenden")) {
			setValue("treatment_other_reason", "");
		}
	}, [prostateBeenTreated, setValue]);

	useEffect(() => {
		if (
			!prostateBeenTreated.includes(
				"ja, wegen gutartiger Prostatavergroesserung (BPH, BPS, Hyperplasie)"
			)
		) {
			setValue("enlargement_therapy_types", []);
			setValue("enlargement_therapy_date", "");
			setValue("enlargement_medication_types", []);
			setValue("enlargement_medication_other", "");
			setValue("enlargement_medication_since", "");
		}
	}, [prostateBeenTreated, setValue]);

	useEffect(() => {
		if (
			!prostateBeenTreated.includes(
				"ja, wegen Prostataentzuendung (Prostatitis)"
			)
		) {
			setValue("inflammation_therapy_types", []);
			setValue("inflammation_therapy_other", "");
			setValue("inflammation_therapy_date", "");
			setValue("inflammation_therapy_duration", "");
		}
	}, [prostateBeenTreated, setValue]);

	useEffect(() => {
		if (!prostateBeenTreated.includes("ja, wegen Prostatakrebs")) {
			setValue("cancer_therapy_types", []);
			setValue("cancer_therapy_other", "");
			setValue("cancer_therapy_date", "");
		}
	}, [prostateBeenTreated, setValue]);

	useEffect(() => {
		if (!enlargementTherapyTypes.includes("andere Behandlung")) {
			setValue("enlargement_therapy_other", "");
		}
	}, [enlargementTherapyTypes, setValue]);

	useEffect(() => {
		if (!enlargementMedTypes.includes("andere (z.B. Tamsulosin, Finasterid)")) {
			setValue("enlargement_medication_other", "");
		}
	}, [enlargementMedTypes, setValue]);

	useEffect(() => {
		if (!hasOtherProblems) {
			setValue("other_problems_description", "");
			setValue("other_problems_since", "");
		}
	}, [hasOtherProblems, setValue]);

	useEffect(() => {
		if (!inflammationTherapyTypes.includes("andere Behandlung")) {
			setValue("inflammation_therapy_other", "");
		}
	}, [inflammationTherapyTypes, setValue]);

	useEffect(() => {
		if (!cancerTherapyTypes.includes("andere Behandlung")) {
			setValue("cancer_therapy_other", "");
		}
	}, [cancerTherapyTypes, setValue]);

	useEffect(() => {
		if (!urinationSymptoms.includes("Schmerzen")) {
			setValue("urination_pain_location", "");
		}
	}, [urinationSymptoms, setValue]);

	useEffect(() => {
		if (!biopsyTypes.includes("ja, in der ALTA Klinik")) {
			setValue("last_alta_biopsy_date", "");
		}
		if (
			!biopsyTypes.includes("ja, ultraschallgesteuert (klassisch ohne MRT)")
		) {
			setValue("last_usg_biopsy_date", "");
		}
		if (!biopsyTypes.includes("ja, Fusionsbiopsie (mit MRT-Aufnahmen)")) {
			setValue("last_fusion_biopsy_date", "");
		}
		if (!biopsyTypes.includes("ja, Saettigungsbiopsie (mehr als 20 Proben)")) {
			setValue("last_saturation_biopsy_date", "");
		}
		if (
			!biopsyTypes.includes(
				"ja, jedoch bin ich mir unsicher, welche Biopsie bei mir durchgeführt wurde"
			)
		) {
			setValue("last_unknown_biopsy_date", "");
		}
		if (!biopsyTypes.some((type) => type.startsWith("ja,"))) {
			setValue("last_biopsy_access_route", "");
			setValue("biopsy_count", 0);
			setValue("last_biopsy_result", "");
		}
	}, [biopsyTypes, setValue]);

	useEffect(() => {
		if (lastBiopsyResult !== "Karzinom (positiv)") {
			setValue("biopsy_gleason_score", []);
		}
	}, [lastBiopsyResult, setValue]);

	// Function to render a checkbox group
	const renderCheckboxGroup = (
		options: string[],
		fieldName: keyof ProstateFollowUpFormType,
		label: string,
		required = false
	) => {
		return (
			<div className="space-y-2">
				<label className="block text-sm font-medium text-gray-700">
					{label} {required && "*"}
				</label>
				<div className="space-y-2">
					<Controller
						name={fieldName as any}
						control={control}
						rules={
							required
								? {
										validate: (value: any) =>
											(Array.isArray(value) && value.length > 0) ||
											`${label} is required`,
								  }
								: {}
						}
						render={({ field }) => (
							<>
								{options.map((option) => (
									<div key={option} className="flex items-center">
										<input
											type="checkbox"
											id={`${fieldName}-${option}`}
											value={option}
											checked={field.value?.includes(option) || false}
											onChange={(e) => {
												const values = field.value || [];
												if (e.target.checked) {
													field.onChange([...values, option]);
												} else {
													field.onChange(values.filter((v) => v !== option));
												}
											}}
											className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
											disabled={readOnly}
										/>
										<label
											htmlFor={`${fieldName}-${option}`}
											className="ml-2 block text-sm text-gray-700"
										>
											{option}
										</label>
									</div>
								))}
							</>
						)}
					/>
					{errors[fieldName] && (
						<p className="text-red-500 text-sm">
							{String(errors[fieldName]?.message)}
						</p>
					)}
				</div>
			</div>
		);
	};

	// Function to render a radio button group
	const renderRadioGroup = (
		name: keyof ProstateFollowUpFormType,
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

	const onFormSubmit = async (data: ProstateFollowUpFormType) => {
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
					Prostata-Fragebogen Verlauf
				</h3>
				<p className="text-gray-700">
					Bitte füllen Sie diesen Fragebogen für Ihre Verlaufskontrolle aus. Die
					Informationen helfen uns, Ihre Untersuchung optimal zu planen und
					auszuwerten.
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
				count={10}
				register={register}
				trigger={trigger}
				errors={errors}
				readOnly={readOnly}
			/>

			{/* Treatment Information */}
			<div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
				<h3 className="text-lg font-semibold mb-4">Behandlung</h3>

				{renderCheckboxGroup(
					PROSTATE_TREATMENT_TYPES,
					"prostate_treatment_types",
					"2. Wurde/Wird Ihre Prostata bereits behandelt? (Mehrfachauswahl möglich)",
					true
				)}

				{prostateBeenTreated.includes("nein, aus anderen Gruenden") && (
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Welche anderen Gründe? *
						</label>
						<input
							type="text"
							{...register("treatment_other_reason", {
								required: "Dieses Feld ist erforderlich",
							})}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
							disabled={readOnly}
						/>
						{errors.treatment_other_reason && (
							<p className="text-red-500 text-sm mt-1">
								{errors.treatment_other_reason.message}
							</p>
						)}
					</div>
				)}

				{prostateBeenTreated.includes(
					"ja, wegen gutartiger Prostatavergroesserung (BPH, BPS, Hyperplasie)"
				) && (
					<div className="border-t pt-4 space-y-4">
						<h4 className="text-md font-medium">
							Behandlung der Prostatavergrößerung
						</h4>

						{renderCheckboxGroup(
							ENLARGEMENT_THERAPY_TYPES,
							"enlargement_therapy_types",
							"Mit welcher Behandlung wurde Ihre gutartige Prostatavergrößerung behandelt?"
						)}

						{enlargementTherapyTypes.includes("andere Behandlung") && (
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Mit welcher anderen Methode wurde Ihre gutartige
									Prostatavergrößerung behandelt? *
								</label>
								<input
									type="text"
									{...register("enlargement_therapy_other", {
										required: "Dieses Feld ist erforderlich",
									})}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
									disabled={readOnly}
								/>
								{errors.enlargement_therapy_other && (
									<p className="text-red-500 text-sm mt-1">
										{errors.enlargement_therapy_other.message}
									</p>
								)}
							</div>
						)}

						<div>
							<label className="block text-sm font-medium text-gray-700">
								Wann war die Behandlung gegen Ihre gutartige
								Prostatavergrößerung? *
							</label>
							<input
								type="text"
								{...register("enlargement_therapy_date", {
									required: "Dieses Feld ist erforderlich",
								})}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
								disabled={readOnly}
							/>
							{errors.enlargement_therapy_date && (
								<p className="text-red-500 text-sm mt-1">
									{errors.enlargement_therapy_date.message}
								</p>
							)}
						</div>

						{enlargementTherapyTypes.includes("Medikamente") && (
							<>
								{renderCheckboxGroup(
									ENLARGEMENT_MEDICATION_TYPES,
									"enlargement_medication_types",
									"Welche Medikamente haben Sie gegen Ihre Prostatavergrößerung eingenommen?",
									true
								)}

								{watch("enlargement_medication_types")?.includes(
									"andere (z.B. Tamsulosin, Finasterid)"
								) && (
									<div>
										<label className="block text-sm font-medium text-gray-700">
											Welche anderen Medikamente haben Sie gegen Ihre gutartige
											Prostatavergrößerung eingenommen? *
										</label>
										<input
											type="text"
											{...register("enlargement_medication_other", {
												required: "Dieses Feld ist erforderlich",
											})}
											className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
											disabled={readOnly}
										/>
										{errors.enlargement_medication_other && (
											<p className="text-red-500 text-sm mt-1">
												{errors.enlargement_medication_other.message}
											</p>
										)}
									</div>
								)}

								<div>
									<label className="block text-sm font-medium text-gray-700">
										Seit wann nehmen Sie Medikamente gegen Ihre
										Prostatavergrößerung? *
									</label>
									<input
										type="text"
										{...register("enlargement_medication_since", {
											required: "Dieses Feld ist erforderlich",
										})}
										className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
										disabled={readOnly}
									/>
									{errors.enlargement_medication_since && (
										<p className="text-red-500 text-sm mt-1">
											{errors.enlargement_medication_since.message}
										</p>
									)}
								</div>
							</>
						)}
					</div>
				)}

				{prostateBeenTreated.includes(
					"ja, wegen Prostataentzuendung (Prostatitis)"
				) && (
					<div className="border-t pt-4 space-y-4">
						<h4 className="text-md font-medium">
							Behandlung der Prostataentzündung
						</h4>

						{renderCheckboxGroup(
							INFLAMMATION_THERAPY_TYPES,
							"inflammation_therapy_types",
							"Wie wurde Ihre Prostataentzündung behandelt?"
						)}

						{watch("inflammation_therapy_types")?.includes(
							"andere Behandlung"
						) && (
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Mit welcher anderen Methode wurde Ihre Prostataentzündung
									behandelt? *
								</label>
								<input
									type="text"
									{...register("inflammation_therapy_other", {
										required: "Dieses Feld ist erforderlich",
									})}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
									disabled={readOnly}
								/>
								{errors.inflammation_therapy_other && (
									<p className="text-red-500 text-sm mt-1">
										{errors.inflammation_therapy_other.message}
									</p>
								)}
							</div>
						)}

						<div>
							<label className="block text-sm font-medium text-gray-700">
								Wann wurde Ihre Prostataentzündung behandelt? *
							</label>
							<input
								type="text"
								{...register("inflammation_therapy_date", {
									required: "Dieses Feld ist erforderlich",
								})}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
								disabled={readOnly}
							/>
							{errors.inflammation_therapy_date && (
								<p className="text-red-500 text-sm mt-1">
									{errors.inflammation_therapy_date.message}
								</p>
							)}
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700">
								Wie lange wurde Ihre Prostataentzündung behandelt? *
							</label>
							<input
								type="text"
								{...register("inflammation_therapy_duration", {
									required: "Dieses Feld ist erforderlich",
								})}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
								disabled={readOnly}
							/>
							{errors.inflammation_therapy_duration && (
								<p className="text-red-500 text-sm mt-1">
									{errors.inflammation_therapy_duration.message}
								</p>
							)}
						</div>
					</div>
				)}

				{prostateBeenTreated.includes("ja, wegen Prostatakrebs") && (
					<div className="border-t pt-4 space-y-4">
						<h4 className="text-md font-medium">
							Behandlung des Prostatakrebses
						</h4>

						{renderCheckboxGroup(
							CANCER_THERAPY_TYPES,
							"cancer_therapy_types",
							"Wie wurde Ihr Prostatakrebs behandelt?",
							true
						)}

						{watch("cancer_therapy_types")?.includes("andere Behandlung") && (
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Mit welcher anderen Methode wurde Ihre Prostataentzündung
									behandelt? *
								</label>
								<input
									type="text"
									{...register("cancer_therapy_other", {
										required: "Dieses Feld ist erforderlich",
									})}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
									disabled={readOnly}
								/>
								{errors.cancer_therapy_other && (
									<p className="text-red-500 text-sm mt-1">
										{errors.cancer_therapy_other.message}
									</p>
								)}
							</div>
						)}

						<div>
							<label className="block text-sm font-medium text-gray-700">
								Wann wurden Sie wegen Prostatakrebs behandelt? *
							</label>
							<input
								type="text"
								{...register("cancer_therapy_date", {
									required: "Dieses Feld ist erforderlich",
								})}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
								disabled={readOnly}
							/>
							{errors.cancer_therapy_date && (
								<p className="text-red-500 text-sm mt-1">
									{errors.cancer_therapy_date.message}
								</p>
							)}
						</div>
					</div>
				)}
			</div>

			{/* Urination Symptoms */}
			<div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
				<h3 className="text-lg font-semibold mb-4">
					Miktionssymptome (Wasserlassen)
				</h3>

				{renderCheckboxGroup(
					URINATION_SYMPTOMS,
					"urination_symptoms",
					"3a. Haben Sie Symptome beim Wasserlassen oder im Zusammenhang mit der Blase? (Mehrfachauswahl möglich)",
					true
				)}

				{urinationSymptoms.includes("Schmerzen") && (
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Wo treten die Schmerzen während des Wasserlassens auf? *
						</label>
						<input
							type="text"
							{...register("urination_pain_location", {
								required: "Dieses Feld ist erforderlich",
							})}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
							disabled={readOnly}
						/>
						{errors.urination_pain_location && (
							<p className="text-red-500 text-sm mt-1">
								{errors.urination_pain_location.message}
							</p>
						)}
					</div>
				)}

				<div>
					<label className="block text-sm font-medium text-gray-700">
						3b. Wie oft stehen Sie in der Regel nachts auf, um auf die Toilette
						zu gehen? *
					</label>
					<select
						{...register("night_urination_frequency", {
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
					{errors.night_urination_frequency && (
						<p className="text-red-500 text-sm mt-1">
							{errors.night_urination_frequency.message}
						</p>
					)}
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700">
						4. Seit wann bestehen Symptome beim Wasserlassen? *
					</label>
					<select
						{...register("urination_symptoms_duration", {
							required: "Dieses Feld ist erforderlich",
						})}
						className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
						disabled={readOnly}
					>
						<option value="">Bitte auswählen</option>
						{SYMPTOM_DURATION_OPTIONS.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
					{errors.urination_symptoms_duration && (
						<p className="text-red-500 text-sm mt-1">
							{errors.urination_symptoms_duration.message}
						</p>
					)}
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700">
						5. Wenn sich die Symptome beim Wasserlassen oder im Zusammenhang mit
						der Blase für den Rest des Lebens nicht ändern würden, fühle ich
						mich: *
					</label>
					<select
						{...register("urination_satisfaction_level", {
							required: "Dieses Feld ist erforderlich",
						})}
						className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
						disabled={readOnly}
					>
						<option value="">Bitte auswählen</option>
						{SATISFACTION_LEVELS.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
					{errors.urination_satisfaction_level && (
						<p className="text-red-500 text-sm mt-1">
							{errors.urination_satisfaction_level.message}
						</p>
					)}
				</div>
			</div>

			{/* Other Problems */}
			<div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
				<h3 className="text-lg font-semibold mb-4">
					Weitere Prostatabeschwerden
				</h3>

				{renderRadioGroup(
					"has_other_problems",
					"6. Haben Sie andere Beschwerden im Zusammenhang mit Ihrer Prostata?",
					["Ja", "Nein"],
					true
				)}

				{hasOtherProblems === "true" && (
					<>
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Welche Beschwerden? *
							</label>
							<input
								type="text"
								{...register("other_problems_description", {
									required: "Dieses Feld ist erforderlich",
								})}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
								disabled={readOnly}
							/>
							{errors.other_problems_description && (
								<p className="text-red-500 text-sm mt-1">
									{errors.other_problems_description.message}
								</p>
							)}
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700">
								Seit wann haben Sie die Beschwerden? *
							</label>
							<input
								type="text"
								{...register("other_problems_since", {
									required: "Dieses Feld ist erforderlich",
								})}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
								disabled={readOnly}
							/>
							{errors.other_problems_since && (
								<p className="text-red-500 text-sm mt-1">
									{errors.other_problems_since.message}
								</p>
							)}
						</div>
					</>
				)}
			</div>

			{/* Biopsy Information */}
			<div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
				<h3 className="text-lg font-semibold mb-4">Biopsie-Informationen</h3>

				{renderCheckboxGroup(
					BIOPSY_TYPES,
					"biopsy_types",
					"7. Hatten Sie bereits eine Stanzbiopsie? (Mehrfachauswahl möglich)",
					true
				)}

				{biopsyTypes.includes("ja, in der ALTA Klinik") && (
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Wann war Ihre letzte Biopsie in der ALTA Klinik? *
						</label>
						<input
							type="text"
							{...register("last_alta_biopsy_date", {
								required: "Dieses Feld ist erforderlich",
							})}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
							disabled={readOnly}
						/>
						{errors.last_alta_biopsy_date && (
							<p className="text-red-500 text-sm mt-1">
								{errors.last_alta_biopsy_date.message}
							</p>
						)}
					</div>
				)}

				{biopsyTypes.includes(
					"ja, ultraschallgesteuert (klassisch ohne MRT)"
				) && (
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Wann war Ihre letzte ultraschallgesteuerte Stanzbiopsie (klassisch
							ohne MRT)? *
						</label>
						<input
							type="text"
							{...register("last_usg_biopsy_date", {
								required: "Dieses Feld ist erforderlich",
							})}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
							disabled={readOnly}
						/>
						{errors.last_usg_biopsy_date && (
							<p className="text-red-500 text-sm mt-1">
								{errors.last_usg_biopsy_date.message}
							</p>
						)}
					</div>
				)}

				{biopsyTypes.includes("ja, Fusionsbiopsie (mit MRT-Aufnahmen)") && (
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Wann war Ihre letzte Fusionsbiopsie (mit MRT-Aufnahmen)? *
						</label>
						<input
							type="text"
							{...register("last_fusion_biopsy_date", {
								required: "Dieses Feld ist erforderlich",
							})}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
							disabled={readOnly}
						/>
						{errors.last_fusion_biopsy_date && (
							<p className="text-red-500 text-sm mt-1">
								{errors.last_fusion_biopsy_date.message}
							</p>
						)}
					</div>
				)}

				{biopsyTypes.includes(
					"ja, Saettigungsbiopsie (mehr als 20 Proben)"
				) && (
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Wann war Ihre letzte Sättigungsbiopsie (mehr als 20 Proben)? *
						</label>
						<input
							type="text"
							{...register("last_saturation_biopsy_date", {
								required: "Dieses Feld ist erforderlich",
							})}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
							disabled={readOnly}
						/>
						{errors.last_saturation_biopsy_date && (
							<p className="text-red-500 text-sm mt-1">
								{errors.last_saturation_biopsy_date.message}
							</p>
						)}
					</div>
				)}

				{biopsyTypes.includes(
					"ja, jedoch bin ich mir unsicher, welche Biopsie bei mir durchgeführt wurde"
				) && (
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Wann war Ihre letzte Biopsie? *
						</label>
						<input
							type="text"
							{...register("last_unknown_biopsy_date", {
								required: "Dieses Feld ist erforderlich",
							})}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
							disabled={readOnly}
						/>
						{errors.last_unknown_biopsy_date && (
							<p className="text-red-500 text-sm mt-1">
								{errors.last_unknown_biopsy_date.message}
							</p>
						)}
					</div>
				)}

				{biopsyTypes.some((type) => type.startsWith("ja,")) && (
					<>
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Welcher Zugang wurde bei der letzten Biopsie gewählt? *
							</label>
							<select
								{...register("last_biopsy_access_route", {
									required: "Dieses Feld ist erforderlich",
								})}
								className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
								disabled={readOnly}
							>
								<option value="">Bitte auswählen</option>
								{BIOPSY_ACCESS_ROUTES.map((option) => (
									<option key={option} value={option}>
										{option}
									</option>
								))}
							</select>
							{errors.last_biopsy_access_route && (
								<p className="text-red-500 text-sm mt-1">
									{errors.last_biopsy_access_route.message}
								</p>
							)}
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700">
								Wie viele Biopsien hatten Sie? *
							</label>
							<input
								type="number"
								{...register("biopsy_count", {
									required: "Dieses Feld ist erforderlich",
									valueAsNumber: true,
									min: {
										value: 0,
										message: "Der Wert muss größer oder gleich 0 sein",
									},
								})}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
								disabled={readOnly}
							/>
							{errors.biopsy_count && (
								<p className="text-red-500 text-sm mt-1">
									{errors.biopsy_count.message}
								</p>
							)}
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700">
								Was war das Ergebnis Ihrer letzten Biopsie? *
							</label>
							<select
								{...register("last_biopsy_result", {
									required: "Dieses Feld ist erforderlich",
								})}
								className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
								disabled={readOnly}
							>
								<option value="">Bitte auswählen</option>
								{BIOPSY_RESULTS.map((option) => (
									<option key={option} value={option}>
										{option}
									</option>
								))}
							</select>
							{errors.last_biopsy_result && (
								<p className="text-red-500 text-sm mt-1">
									{errors.last_biopsy_result.message}
								</p>
							)}
						</div>

						{lastBiopsyResult === "Karzinom (positiv)" && (
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Welcher Gleason-Score wurde festgestellt?
								</label>
								<div className="mt-1 grid grid-cols-2 md:grid-cols-3 gap-2">
									<Controller
										name="biopsy_gleason_score"
										control={control}
										render={({ field }) => (
											<>
												{GLEASON_SCORES.map((score) => (
													<div key={score} className="flex items-center">
														<input
															type="checkbox"
															id={`gleason-${score}`}
															value={score}
															checked={field.value?.includes(score) || false}
															onChange={(e) => {
																const values = field.value || [];
																if (e.target.checked) {
																	field.onChange([...values, score]);
																} else {
																	field.onChange(
																		values.filter((v) => v !== score)
																	);
																}
															}}
															className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
															disabled={readOnly}
														/>
														<label
															htmlFor={`gleason-${score}`}
															className="ml-2 block text-sm text-gray-700"
														>
															{score}
														</label>
													</div>
												))}
											</>
										)}
									/>
								</div>
							</div>
						)}
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

export default ProstateFollowUpForm;
