import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { Info } from "lucide-react";

import {
	defaultProstateNewPatientForm,
	type ProstateNewPatientForm as ProstateNewPatientFormType,
} from "../../types";
import type { ProstateNewPatientDataContextType } from "./ProstateNewPatientFormData";
import { useFormContext } from "../formContext";
import PSATable from "../components/PSATable";
import { usePrevious } from "../../pdf/contexts";

interface ProstateNewPatientFormProps {
	onComplete?: () => void;
	readOnly?: boolean;
}

// Define constants for drop-down options
const FAMILY_MEMBERS = ["Vater", "Bruder", "Onkel", "Großvater"];
const DISEASE_TYPES = [
	"Prostatavergrößerung",
	"Prostataentzündung",
	"Prostatakrebs",
];
const UROLOGIST_RECOMMENDATIONS = [
	"keine, da keine Diagnose bekannt ist ",
	"Empfehlung zur Biopsie",
	"Empfehlung zur MRT",
	"Empfehlung zur antibiotischen Therapie",
	"Empfehlung zur PSA- und/oder klinischen Kontrolle",
];
const DIAGNOSIS_TYPES = [
	"Prostatavergrößerung",
	"Prostataentzündung",
	"Prostatakrebs",
];
const TREATMENT_TYPES = [
	"nein, da keine Diagnose bekannt ist",
	"nein, da bisher keine Notwendigkeit bestand",
	"nein, da ich Sorge/Angst vor Nebenwirkungen/Komplikationen habe",
	"nein, aus anderen Gründen",
	"ja, wegen gutartiger Prostatavergrösserung (BPH, BPS, Hyperplasie)",
	"ja, wegen Prostataentzündung (Prostatitis)",
	"ja, wegen Prostatakrebs",
];

const ENLARGEMENT_THERAPY_TYPES = [
	"TURP",
	"Greenlight-Laser",
	"HoLEP (Holmium-Laser)",
	"Medikamente",
	"andere Behandlung",
];
const ENLARGEMENT_MEDICATION_TYPES = [
	"pflanzlich/naturheilkundlich/homöopathisch",
	"andere (z.B. Tamsulosin, Finasterid)",
];

const INFLAMMATION_THERAPY_TYPES = ["Antibiotika", "andere, welche"];
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
const FREQUENCY_OPTIONS = [
	"gar nicht",
	"manchmal",
	"1 mal",
	"2 mal",
	"3 mal",
	"4 mal",
	"5 mal",
	"oder öfter",
];

const DURATION_OPTIONS = [
	"ich habe keine Beschwerden",
	"seit kurzem",
	"weniger als 1 Jahr",
	"1 bis 5 Jahre",
	"mehr als 5 Jahre",
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
const PALPATION_RESULTS = [
	"nein",
	"ja, war unauffällig",
	"ja, war vergrößert",
	"ja, war krebsverdächtig",
];
const ULTRASOUND_RESULTS = [
	"nein",
	"ja, war unauffällig",
	"ja, war vergrößert",
	"ja, war krebsverdächtig",
];
const BIOPSY_TYPES = [
	"nein",
	"ja, ultraschallgesteuert (klassisch ohne MRT)",
	"ja, Fusionsbiopsie (mit MRT-Aufnahmen)",
	"ja, Sättigungsbiopsie (mehr als 20 Proben)",
	"ja, jedoch bin ich mir unsicher, welche Biopsie bei mir durchgeführt wurde",
];
const BIOPSY_ROUTES = [
	"durch den Enddarm (transrektal)",
	"durch den Damm (transperineal)",
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
const MRI_CD_OPTIONS = [
	"ja, ich bringe die CD mit",
	"nein, ich schicke die CD vorher per Post",
	"nein, ich habe keine CD von dieser Untersuchung",
];

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

	const formRef = useRef<HTMLFormElement>(null);

	// Watch fields for conditional rendering
	const familyProstateDisease = watch(
		"family_prostate_disease"
	) as unknown as string;
	const urologistTreatment = watch("urologist_treatment") as unknown as string;
	const knownDiagnosis = watch("known_diagnosis") as unknown as string;
	const prostateTreated = watch("prostate_treated") as unknown as string[];
	const hadMRI = watch("had_mri") as unknown as string;
	const urinationSymptoms = watch("urination_symptoms") || [];
	const biopsyTypes = watch("biopsy_types") as unknown as string[];
	const previousBiopsyTypes = usePrevious(biopsyTypes);

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
			setValue("prostate_treated", []);
			setValue("prostate_not_treated_reason", "");
		}
	}, [knownDiagnosis, setValue]);

	useEffect(() => {
		if (!prostateTreated?.includes("nein, aus anderen Gründen")) {
			setValue("prostate_not_treated_reason", "");
		}

		// reset prostate enlargment fields
		if (
			!prostateTreated?.includes(
				"ja, wegen gutartiger Prostatavergrösserung (BPH, BPS, Hyperplasie)"
			)
		) {
			setValue("enlargement_therapy_type", []);
			setValue("enlargement_therapy_other", "");
			setValue("enlargement_therapy_date", "");
			setValue("enlargement_medication_type", []);
			setValue("enlargement_medication_other", "");
			setValue("enlargement_medication_since", "");
		}

		// reset prostate inflammation fields
		if (
			!prostateTreated?.includes("ja, wegen Prostataentzündung (Prostatitis)")
		) {
			setValue("inflammation_therapy_type", []);
			setValue("inflammation_therapy_other", "");
			setValue("inflammation_therapy_date", "");
			setValue("inflammation_therapy_duration", "");
		}

		// reset prostate cancer fields
		if (!prostateTreated?.includes("ja, wegen Prostatakrebs")) {
			setValue("cancer_therapy_type", []);
			setValue("cancer_therapy_other", "");
			setValue("cancer_therapy_date", "");
		}
	}, [prostateTreated, setValue]);

	useEffect(() => {
		if (hadMRI !== "true") {
			setValue("mri_date", "");
			setValue("brings_mri_cd", "");
		}
	}, [hadMRI, setValue]);

	useEffect(() => {
		if (!urinationSymptoms.includes("Schmerzen")) {
			setValue("urination_pain_location", "");
		}
	}, [urinationSymptoms, setValue]);

	useEffect(() => {
		// reset biopsy types
		if (
			biopsyTypes?.includes("nein") &&
			!previousBiopsyTypes?.includes("nein")
		) {
			setValue("biopsy_types", ["nein"]);
			return;
		}

		if (
			biopsyTypes?.includes(
				"ja, jedoch bin ich mir unsicher, welche Biopsie bei mir durchgeführt wurde"
			) &&
			!previousBiopsyTypes?.includes(
				"ja, jedoch bin ich mir unsicher, welche Biopsie bei mir durchgeführt wurde"
			)
		) {
			setValue("biopsy_types", [
				"ja, jedoch bin ich mir unsicher, welche Biopsie bei mir durchgeführt wurde",
			]);
		}

		// if "nein" is selected and there are other types, remove "nein"
		if (biopsyTypes?.includes("nein") && biopsyTypes?.length > 1) {
			setValue(
				"biopsy_types",
				biopsyTypes.filter((type) => type !== "nein")
			);
		}
	}, [biopsyTypes, setValue]);

	useEffect(() => {
		if (
			biopsyTypes.length === 0 ||
			(biopsyTypes.length === 1 && biopsyTypes.includes("nein"))
		) {
			setValue("biopsy_count", null);
			setValue("biopsy_gleason_score", []);
			setValue("prostate_not_treated_reason", null);
			setValue("last_usg_biopsy_date", null);
			setValue("last_fusion_biopsy_date", null);
			setValue("last_saturation_biopsy_date", null);
			setValue("last_unknown_biopsy_date", null);
			setValue("last_biopsy_access_route", null);
			setValue("last_biopsy_result", null);
		}
	}, [biopsyTypes, setValue]);

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
						rules={{
							required: required
								? "Bitte wählen Sie mindestens eine Option"
								: undefined,
							validate: required
								? (value) =>
										(Array.isArray(value) && value.length > 0) ||
										"Bitte wählen Sie mindestens eine Option"
								: undefined,
						}}
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

	const scrollToFirstError = () => {
		// Use setTimeout to ensure DOM has been updated with error messages
		setTimeout(() => {
			if (formRef.current) {
				const firstErrorElement =
					formRef.current.querySelector(".text-red-500");
				if (firstErrorElement) {
					// Scroll with an offset to position the error at the top of the viewport
					firstErrorElement.scrollIntoView({
						behavior: "smooth",
						block: "center",
					});
				}
			}
		}, 0); // Even a 0ms timeout ensures this runs after React's render cycle
	};

	return (
		<form
			ref={formRef}
			onSubmit={handleSubmit(onFormSubmit, scrollToFirstError)}
			className="space-y-8"
		>
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

						{renderCheckboxGroup(
							TREATMENT_TYPES,
							"prostate_treated",
							"Wurde die Prostata bereits behandelt?",
							true
						)}

						{prostateTreated?.includes("nein, aus anderen Gründen") && (
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
						{prostateTreated.includes(
							"ja, wegen gutartiger Prostatavergrösserung (BPH, BPS, Hyperplasie)"
						) && (
							<div className="border-t pt-4 space-y-4">
								<h4 className="text-base font-medium mb-3 ">
									Behandlung der Prostatavergrößerung
								</h4>

								{renderCheckboxGroup(
									ENLARGEMENT_THERAPY_TYPES,
									"enlargement_therapy_type",
									"Art der Therapie"
								)}

								{watch("enlargement_therapy_type")?.includes(
									"andere Behandlung"
								) && (
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

								{(watch("enlargement_therapy_type") || []).length > 0 && (
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
								)}

								{watch("enlargement_therapy_type")?.includes("Medikamente") && (
									<div className="space-y-4">
										{renderCheckboxGroup(
											ENLARGEMENT_MEDICATION_TYPES,
											"enlargement_medication_type",
											"Welche Medikamente?"
										)}

										{watch("enlargement_medication_type")?.includes(
											"andere (z.B. Tamsulosin, Finasterid)"
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

						{prostateTreated.includes(
							"ja, wegen Prostataentzündung (Prostatitis)"
						) && (
							<div className="border-t pt-4 space-y-4">
								<h4 className="text-base font-medium mb-3">
									Behandlung der Prostataentzündung
								</h4>

								{renderCheckboxGroup(
									INFLAMMATION_THERAPY_TYPES,
									"inflammation_therapy_type",
									"Art der Therapie"
								)}

								{watch("inflammation_therapy_type")?.includes(
									"andere, welche"
								) && (
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

								{(watch("inflammation_therapy_type") || []).length > 0 && (
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
								)}

								{(watch("inflammation_therapy_type") || []).length > 0 && (
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
								)}
							</div>
						)}

						{prostateTreated.includes("ja, wegen Prostatakrebs") && (
							<div className="border-t pt-4 space-y-4">
								<h4 className="text-base font-medium mb-3">
									Behandlung des Prostatakrebses
								</h4>

								{renderCheckboxGroup(
									CANCER_THERAPY_TYPES,
									"cancer_therapy_type",
									"Art der Therapie"
								)}

								{watch("cancer_therapy_type")?.includes(
									"andere Behandlung"
								) && (
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

								{(watch("cancer_therapy_type") || []).length > 0 && (
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
								)}
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

				{watch("urination_symptoms")?.includes("Schmerzen") && (
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
					"Hat Ihr Urologe Ihre Prostata abgetastet? Wie war der Befund?",
					true
				)}

				{renderCheckboxGroup(
					ULTRASOUND_RESULTS,
					"urologist_ultrasound",
					"Hat Ihr Urologe eine Ultraschalluntersuchung durchgeführt? Wie war der Befund?",
					true
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
					"Wurde bei Ihnen bereits eine Prostatabiopsie durchgeführt? Wenn ja, welche Art?",
					true
				)}

				{(watch("biopsy_types") || []).length > 0 &&
					!watch("biopsy_types")?.includes("nein") && (
						<>
							{watch("biopsy_types")?.includes(
								"ja, ultraschallgesteuert (klassisch ohne MRT)"
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

							{watch("biopsy_types")?.includes(
								"ja, Fusionsbiopsie (mit MRT-Aufnahmen)"
							) && (
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

							{watch("biopsy_types")?.includes(
								"ja, Sättigungsbiopsie (mehr als 20 Proben)"
							) && (
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

							{watch("biopsy_types")?.includes(
								"ja, jedoch bin ich mir unsicher, welche Biopsie bei mir durchgeführt wurde"
							) && (
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
							)}
						</>
					)}

				{(watch("biopsy_types") || []).length > 0 &&
					!watch("biopsy_types")?.includes("nein") && (
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
