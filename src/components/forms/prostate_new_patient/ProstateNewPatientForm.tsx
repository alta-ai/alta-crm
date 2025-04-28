import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Info } from "lucide-react";

import {
	defaultProstateNewPatientForm,
	type ProstateNewPatientForm as ProstateNewPatientFormType,
} from "../../types";
import type { ProstateNewPatientDataContextType } from "./ProstateNewPatientFormData";
import { useFormContext } from "../formContext";
import PSATable from "../components/PSATable";

interface ProstateNewPatientFormProps {
	onComplete?: () => void;
	readOnly?: boolean;
}

// Define constants for drop-down options
const FAMILY_MEMBERS = [
	"Vater",
	"Bruder",
	"Onkel väterlicherseits",
	"Onkel mütterlicherseits",
	"Großvater väterlicherseits",
	"Großvater mütterlicherseits",
];
const DISEASE_TYPES = [
	"Prostatavergrößerung",
	"Prostataentzündung",
	"Prostatakrebs",
];
const UROLOGIST_RECOMMENDATIONS = [
	"Abklärung einer Prostatavergrößerung",
	"MRT-Untersuchung der Prostata",
	"Abklärung eines erhöhten PSA-Wertes",
	"Nachsorge bei Prostatakrebs",
	"Zweitmeinung",
];
const DIAGNOSIS_TYPES = [
	"Prostatavergrößerung",
	"Prostataentzündung",
	"Prostatakrebs",
	"Andere",
];
const ENLARGEMENT_THERAPY_TYPES = [
	"Medikamentöse Therapie",
	"Operation",
	"Andere",
];
const ENLARGEMENT_MEDICATION_TYPES = [
	"Alphablocker",
	"5-Alpha-Reduktasehemmer",
	"PDE-5-Hemmer",
	"Phytotherapeutika",
	"Andere",
];
const INFLAMMATION_THERAPY_TYPES = [
	"Antibiotika",
	"Antiphlogistika",
	"Alphablocker",
	"Andere",
];
const CANCER_THERAPY_TYPES = [
	"Active Surveillance",
	"Watchful Waiting",
	"Radikale Prostatektomie",
	"Strahlentherapie",
	"Brachytherapie",
	"Hormontherapie",
	"Fokaltherapie",
	"Andere",
];
const URINATION_SYMPTOMS = [
	"Schwacher Harnstrahl",
	"Häufiges Wasserlassen",
	"Starker Harndrang",
	"Harnverhalt",
	"Nachträufeln",
	"Schmerzen beim Wasserlassen",
	"Blut im Urin",
	"Keine",
];
const FREQUENCY_OPTIONS = ["0-1x", "2-3x", "4-5x", "mehr als 5x"];
const DURATION_OPTIONS = [
	"seit Tagen",
	"seit Wochen",
	"seit Monaten",
	"seit Jahren",
];
const SATISFACTION_LEVELS = [
	"sehr zufrieden",
	"zufrieden",
	"neutral",
	"unzufrieden",
	"sehr unzufrieden",
];
const PALPATION_RESULTS = [
	"nicht auffällig",
	"auffällig, aber nicht krebsverdächtig",
	"krebsverdächtig",
	"keine Angabe möglich",
];
const ULTRASOUND_RESULTS = [
	"nicht auffällig",
	"vergrößerte Prostata",
	"auffällige Prostatastruktur",
	"krebsverdächtige Areale",
	"keine Angabe möglich",
];
const BIOPSY_TYPES = [
	"Ultraschallgesteuerte Biopsie",
	"Fusionsbiopsie",
	"Sättigungsbiopsie",
	"Art unbekannt",
];
const BIOPSY_ROUTES = [
	"durch den Enddarm (transrektal)",
	"durch den Damm (perineal)",
];
const BIOPSY_RESULTS = [
	"gutartig",
	"Prostatakrebs",
	"andere Veränderungen",
	"keine Angabe möglich",
];
const GLEASON_SCORES = [
	"3+3",
	"3+4",
	"4+3",
	"3+5",
	"5+3",
	"4+4",
	"4+5",
	"5+4",
	"5+5",
];
const MRI_CD_OPTIONS = ["Ja", "Nein", "Weiß ich nicht"];

export const ProstateNewPatientForm = ({
	onComplete,
	readOnly,
}: ProstateNewPatientFormProps) => {
	const { data, mutateFn } =
		useFormContext<ProstateNewPatientDataContextType>();

	const [isSaving, setIsSaving] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [saveSuccess, setSaveSuccess] = useState(false);

	const {
		register,
		handleSubmit,
		watch,
		trigger,
		control,
		setValue,
		formState: { errors },
	} = useForm<ProstateNewPatientFormType>({
		defaultValues: data?.submission || defaultProstateNewPatientForm,
	});

	// Watch fields for conditional rendering
	const familyProstateDisease = watch(
		"family_prostate_disease"
	) as unknown as string;
	const urologistTreatment = watch("urologist_treatment") as unknown as string;
	const knownDiagnosis = watch("known_diagnosis") as unknown as string;
	const prostateTreated = watch("prostate_treated") as unknown as string;
	const hadMRI = watch("had_mri") as unknown as string;
	const urinationSymptoms = watch("urination_symptoms") || [];
	const diagnosisType = watch("diagnosis_type") || [];

	// Reset fields based on conditional toggles
	useEffect(() => {
		if (familyProstateDisease !== "true") {
			setValue("family_member", []);
			setValue("family_disease_type", []);
		}
	}, [familyProstateDisease, setValue]);

	useEffect(() => {
		if (urologistTreatment !== "true") {
			setValue("urologist_recommendation", []);
		}
	}, [urologistTreatment, setValue]);

	useEffect(() => {
		if (knownDiagnosis !== "true") {
			setValue("diagnosis_type", []);
			setValue("prostate_treated", null);
			setValue("prostate_not_treated_reason", "");
			// Reset treatment sections
			setValue("enlargement_therapy_type", []);
			setValue("enlargement_therapy_other", "");
			setValue("enlargement_therapy_date", "");
			setValue("enlargement_medication_type", []);
			setValue("enlargement_medication_other", "");
			setValue("enlargement_medication_since", "");
			setValue("inflammation_therapy_type", []);
			setValue("inflammation_therapy_other", "");
			setValue("inflammation_therapy_date", "");
			setValue("inflammation_therapy_duration", "");
			setValue("cancer_therapy_type", []);
			setValue("cancer_therapy_other", "");
			setValue("cancer_therapy_date", "");
		}
	}, [knownDiagnosis, setValue]);

	useEffect(() => {
		if (hadMRI !== "true") {
			setValue("mri_date", "");
			setValue("brings_mri_cd", "");
		}
	}, [hadMRI, setValue]);

	useEffect(() => {
		if (!urinationSymptoms.includes("Schmerzen beim Wasserlassen")) {
			setValue("urination_pain_location", "");
		}
	}, [urinationSymptoms, setValue]);

	// Function to render a checkbox group
	const renderCheckboxGroup = (
		options: string[],
		fieldName: keyof ProstateNewPatientFormType,
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
													field.onChange(
														(values as string[]).filter(
															(v: string) => v !== option
														)
													);
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
		name: keyof ProstateNewPatientFormType,
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

	// Function to render a select dropdown
	const renderSelect = (
		name: keyof ProstateNewPatientFormType,
		label: string,
		options: string[],
		required = false,
		emptyOption = true
	) => {
		return (
			<div className="space-y-2">
				<label className="block text-sm font-medium text-gray-700">
					{label} {required && "*"}
				</label>
				<select
					{...register(
						name as any,
						required ? { required: `${label} ist erforderlich` } : {}
					)}
					className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
					disabled={readOnly}
				>
					{emptyOption && <option value="">Bitte auswählen</option>}
					{options.map((option) => (
						<option key={option} value={option}>
							{option}
						</option>
					))}
				</select>
				{errors[name] && (
					<p className="text-red-500 text-sm">
						{String(errors[name]?.message)}
					</p>
				)}
			</div>
		);
	};

	const onFormSubmit = async (data: ProstateNewPatientFormType) => {
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
					Fragebogen vor Prostata-MRT
				</h3>
				<p className="text-gray-700">
					Bitte füllen Sie diesen Fragebogen vor Ihrer Prostata-MRT-Untersuchung
					aus. Die Informationen helfen uns, Ihre Untersuchung optimal zu planen
					und auszuwerten.
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
				showFreePSA={true}
				register={register}
				trigger={trigger}
				errors={errors}
			/>

			{/* Family History */}
			<div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
				<h3 className="text-lg font-semibold mb-4">Familienanamnese</h3>

				{renderRadioGroup(
					"family_prostate_disease",
					"Ist in Ihrer Familie eine Prostataerkrankung bekannt?",
					["Ja", "Nein"],
					true
				)}

				{familyProstateDisease === "true" && (
					<div className="space-y-4">
						{renderCheckboxGroup(
							FAMILY_MEMBERS,
							"family_member",
							"Bei welchem Familienmitglied?",
							true
						)}

						{renderCheckboxGroup(
							DISEASE_TYPES,
							"family_disease_type",
							"Welche Prostataerkrankung?",
							true
						)}
					</div>
				)}
			</div>

			{/* Urologist Information */}
			<div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
				<h3 className="text-lg font-semibold mb-4">
					Urologische Vorbehandlung
				</h3>

				{renderRadioGroup(
					"urologist_treatment",
					"Sind Sie in urologischer Behandlung?",
					["Ja", "Nein"],
					true
				)}

				{urologistTreatment === "true" && (
					<div className="space-y-4">
						{renderCheckboxGroup(
							UROLOGIST_RECOMMENDATIONS,
							"urologist_recommendation",
							"Warum hat Ihr Urologe Sie zu uns überwiesen?",
							true
						)}
					</div>
				)}
			</div>

			{/* Diagnosis and Treatment */}
			<div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
				<h3 className="text-lg font-semibold mb-4">Diagnose und Behandlung</h3>

				{renderRadioGroup(
					"known_diagnosis",
					"Ist bei Ihnen bereits eine Prostataerkrankung bekannt?",
					["Ja", "Nein"],
					true
				)}

				{knownDiagnosis === "true" && (
					<div className="space-y-4">
						{renderCheckboxGroup(
							DIAGNOSIS_TYPES,
							"diagnosis_type",
							"Welche Erkrankung?",
							true
						)}

						{renderRadioGroup(
							"prostate_treated",
							"Wurde die Prostata bereits behandelt?",
							["Ja", "Nein"],
							true
						)}

						{prostateTreated === "false" && (
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Wenn nein, warum nicht?
								</label>
								<input
									type="text"
									{...register("prostate_not_treated_reason")}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
									disabled={readOnly}
								/>
							</div>
						)}

						{/* Show relevant treatment sections based on diagnosis type */}
						{diagnosisType.includes("Prostatavergrößerung") && (
							<div className="border-t pt-4 space-y-4">
								<h4 className="text-base font-medium mb-3 ">
									Behandlung der Prostatavergrößerung
								</h4>

								{renderCheckboxGroup(
									ENLARGEMENT_THERAPY_TYPES,
									"enlargement_therapy_type",
									"Art der Therapie"
								)}

								{watch("enlargement_therapy_type")?.includes("Andere") && (
									<div>
										<label className="block text-sm font-medium text-gray-700">
											Andere Therapie (bitte angeben)
										</label>
										<input
											type="text"
											{...register("enlargement_therapy_other")}
											className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
											disabled={readOnly}
										/>
									</div>
								)}

								<div>
									<label className="block text-sm font-medium text-gray-700">
										Wann wurde die Therapie durchgeführt?
									</label>
									<input
										type="text"
										{...register("enlargement_therapy_date")}
										className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
										placeholder="z.B. Mai 2023"
										disabled={readOnly}
									/>
								</div>

								{watch("enlargement_therapy_type")?.includes(
									"Medikamentöse Therapie"
								) && (
									<div className="space-y-4">
										{renderCheckboxGroup(
											ENLARGEMENT_MEDICATION_TYPES,
											"enlargement_medication_type",
											"Welche Medikamente?"
										)}

										{watch("enlargement_medication_type")?.includes(
											"Andere"
										) && (
											<div>
												<label className="block text-sm font-medium text-gray-700">
													Andere Medikamente (bitte angeben)
												</label>
												<input
													type="text"
													{...register("enlargement_medication_other")}
													className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
													disabled={readOnly}
												/>
											</div>
										)}

										<div>
											<label className="block text-sm font-medium text-gray-700">
												Seit wann nehmen Sie die Medikamente?
											</label>
											<input
												type="text"
												{...register("enlargement_medication_since")}
												className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
												placeholder="z.B. Januar 2023"
												disabled={readOnly}
											/>
										</div>
									</div>
								)}
							</div>
						)}

						{diagnosisType.includes("Prostataentzündung") && (
							<div className="border-t pt-4 space-y-4">
								<h4 className="text-base font-medium mb-3">
									Behandlung der Prostataentzündung
								</h4>

								{renderCheckboxGroup(
									INFLAMMATION_THERAPY_TYPES,
									"inflammation_therapy_type",
									"Art der Therapie"
								)}

								{watch("inflammation_therapy_type")?.includes("Andere") && (
									<div>
										<label className="block text-sm font-medium text-gray-700">
											Andere Therapie (bitte angeben)
										</label>
										<input
											type="text"
											{...register("inflammation_therapy_other")}
											className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
											disabled={readOnly}
										/>
									</div>
								)}

								<div>
									<label className="block text-sm font-medium text-gray-700">
										Wann wurde die Therapie durchgeführt?
									</label>
									<input
										type="text"
										{...register("inflammation_therapy_date")}
										className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
										placeholder="z.B. Mai 2023"
										disabled={readOnly}
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700">
										Wie lange dauerte die Therapie?
									</label>
									<input
										type="text"
										{...register("inflammation_therapy_duration")}
										className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
										placeholder="z.B. 2 Wochen"
										disabled={readOnly}
									/>
								</div>
							</div>
						)}

						{diagnosisType.includes("Prostatakrebs") && (
							<div className="border-t pt-4 space-y-4">
								<h4 className="text-base font-medium mb-3">
									Behandlung des Prostatakrebses
								</h4>

								{renderCheckboxGroup(
									CANCER_THERAPY_TYPES,
									"cancer_therapy_type",
									"Art der Therapie"
								)}

								{watch("cancer_therapy_type")?.includes("Andere") && (
									<div>
										<label className="block text-sm font-medium text-gray-700">
											Andere Therapie (bitte angeben)
										</label>
										<input
											type="text"
											{...register("cancer_therapy_other")}
											className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
											disabled={readOnly}
										/>
									</div>
								)}

								<div>
									<label className="block text-sm font-medium text-gray-700">
										Wann wurde die Therapie durchgeführt?
									</label>
									<input
										type="text"
										{...register("cancer_therapy_date")}
										className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
										placeholder="z.B. Mai 2023"
										disabled={readOnly}
									/>
								</div>
							</div>
						)}
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
					"Haben Sie eines der folgenden Symptome beim Wasserlassen?",
					true
				)}

				{watch("urination_symptoms")?.includes(
					"Schmerzen beim Wasserlassen"
				) && (
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Wo treten die Schmerzen auf?
						</label>
						<input
							type="text"
							{...register("urination_pain_location")}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
							placeholder="z.B. in der Harnröhre, im Unterbauch"
							disabled={readOnly}
						/>
					</div>
				)}

				{!watch("urination_symptoms")?.includes("Keine") && (
					<>
						{renderSelect(
							"night_urination_frequency",
							"Wie oft müssen Sie nachts aufstehen, um Wasser zu lassen?",
							FREQUENCY_OPTIONS
						)}

						{renderSelect(
							"urination_symptoms_duration",
							"Wie lange bestehen die Beschwerden schon?",
							DURATION_OPTIONS
						)}

						{renderSelect(
							"urination_satisfaction_level",
							"Wie zufrieden sind Sie mit Ihrer Blasenentleerung?",
							SATISFACTION_LEVELS
						)}
					</>
				)}
			</div>

			{/* Diagnostic Procedures */}
			<div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
				<h3 className="text-lg font-semibold mb-4">Bisherige Untersuchungen</h3>

				{renderCheckboxGroup(
					PALPATION_RESULTS,
					"urologist_palpation",
					"Hat Ihr Urologe Ihre Prostata abgetastet? Wie war der Befund?"
				)}

				{renderCheckboxGroup(
					ULTRASOUND_RESULTS,
					"urologist_ultrasound",
					"Hat Ihr Urologe eine Ultraschalluntersuchung durchgeführt? Wie war der Befund?"
				)}
			</div>

			{/* MRI Information */}
			<div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
				<h3 className="text-lg font-semibold mb-4">MRT-Untersuchung</h3>

				{renderRadioGroup(
					"had_mri",
					"Wurde bei Ihnen bereits eine MRT-Untersuchung der Prostata durchgeführt?",
					["Ja", "Nein"],
					true
				)}

				{hadMRI === "true" && (
					<>
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Wann wurde die MRT-Untersuchung durchgeführt?
							</label>
							<input
								type="text"
								{...register("mri_date")}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
								placeholder="z.B. Mai 2023"
								disabled={readOnly}
							/>
						</div>

						{renderRadioGroup(
							"brings_mri_cd",
							"Bringen Sie die CD/DVD der MRT-Untersuchung mit?",
							MRI_CD_OPTIONS
						)}
					</>
				)}
			</div>

			{/* Biopsy Information */}
			<div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
				<h3 className="text-lg font-semibold mb-4">Prostatabiopsie</h3>

				{renderCheckboxGroup(
					BIOPSY_TYPES,
					"biopsy_types",
					"Wurde bei Ihnen bereits eine Prostatabiopsie durchgeführt? Wenn ja, welche Art?"
				)}

				{watch("biopsy_types")?.length &&
				!watch("biopsy_types")?.includes("Art unbekannt") ? (
					<>
						{watch("biopsy_types")?.includes(
							"Ultraschallgesteuerte Biopsie"
						) && (
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Datum der letzten ultraschallgesteuerten Biopsie
								</label>
								<input
									type="text"
									{...register("last_usg_biopsy_date")}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
									placeholder="z.B. Mai 2023"
									disabled={readOnly}
								/>
							</div>
						)}

						{watch("biopsy_types")?.includes("Fusionsbiopsie") && (
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Datum der letzten Fusionsbiopsie
								</label>
								<input
									type="text"
									{...register("last_fusion_biopsy_date")}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
									placeholder="z.B. Mai 2023"
									disabled={readOnly}
								/>
							</div>
						)}

						{watch("biopsy_types")?.includes("Sättigungsbiopsie") && (
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Datum der letzten Sättigungsbiopsie
								</label>
								<input
									type="text"
									{...register("last_saturation_biopsy_date")}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
									placeholder="z.B. Mai 2023"
									disabled={readOnly}
								/>
							</div>
						)}
					</>
				) : watch("biopsy_types")?.includes("Art unbekannt") ? (
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Datum der letzten Biopsie (unbekannter Art)
						</label>
						<input
							type="text"
							{...register("last_unknown_biopsy_date")}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
							placeholder="z.B. Mai 2023"
							disabled={readOnly}
						/>
					</div>
				) : null}

				{watch("biopsy_types")?.length > 0 && (
					<>
						{renderRadioGroup(
							"last_biopsy_access_route",
							"Wie wurde die letzte Biopsie durchgeführt?",
							BIOPSY_ROUTES
						)}

						<div>
							<label className="block text-sm font-medium text-gray-700">
								Anzahl der bisherigen Biopsien
							</label>
							<input
								type="number"
								{...register("biopsy_count", {
									valueAsNumber: true,
									min: {
										value: 0,
										message: "Der Wert muss größer als oder gleich 0 sein",
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

						{renderSelect(
							"last_biopsy_result",
							"Ergebnis der letzten Biopsie",
							BIOPSY_RESULTS
						)}

						{watch("last_biopsy_result") === "Prostatakrebs" && (
							<div>
								{renderCheckboxGroup(
									GLEASON_SCORES,
									"biopsy_gleason_score",
									"Gleason-Score (falls bekannt)"
								)}
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

export default ProstateNewPatientForm;
