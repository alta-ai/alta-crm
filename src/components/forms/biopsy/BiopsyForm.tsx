import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Info } from "lucide-react";

import {
	defaultBiopsyForm,
	type BiopsyForm as BiopsyFormType,
} from "../../types";
import type { BiopsyFormDataContextType } from "./BiopsyFormData";
import { useFormContext } from "../formContext";

interface BiopsyFormProps {
	onComplete?: () => void;
	readOnly?: boolean;
}

export const BiopsyForm = ({ onComplete, readOnly }: BiopsyFormProps) => {
	const { data, mutateFn } = useFormContext<BiopsyFormDataContextType>();

	const [isSaving, setIsSaving] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [saveSuccess, setSaveSuccess] = useState(false);
	const [currentStep, setCurrentStep] = useState(1);
	const totalSteps = 4;
	const [stepValidationErrors, setStepValidationErrors] = useState<string[]>(
		[]
	);

	const {
		register,
		handleSubmit,
		watch,
		control,
		setValue,
		getValues,
		trigger, // <-- Added trigger for validation
		formState: { errors },
	} = useForm<BiopsyFormType>({
		defaultValues: data?.submission || defaultBiopsyForm,
	});

	// Watch fields for conditional rendering
	const hasDisordersOfMetabolismOrOrgans = watch(
		"has_disorders_of_metabolism_or_organs"
	) as unknown as string;
	const riskFactors = watch("risk_factors") || [];
	const hasAcuteInfectiousDisease = watch(
		"has_acute_infectious_disease"
	) as unknown as string;
	const hasInfectiousDisease = watch(
		"has_infectious_disease"
	) as unknown as string;
	const takingBloodThinningMedication = watch(
		"taking_blood_thinning_medication"
	) as unknown as string;
	const stoppedMedication = watch("stopped_medication");
	const takingRegularMedication = watch(
		"taking_regular_medication"
	) as unknown as string;
	const takenAspirinOrBloodThinner = watch(
		"taken_aspirin_or_blood_thinner"
	) as unknown as string;
	const surgeryOnUrinaryOrgans = watch(
		"surgery_on_urinary_organs"
	) as unknown as string;

	// Reset dependent fields when the controlling field is false
	useEffect(() => {
		if (hasDisordersOfMetabolismOrOrgans !== "true") {
			setValue("which_disorders", "");
		}
	}, [hasDisordersOfMetabolismOrOrgans, setValue]);

	useEffect(() => {
		if (!riskFactors.includes("weitere Risikofaktoren")) {
			setValue("further_risk_factors", "");
		}
	}, [riskFactors, setValue]);

	useEffect(() => {
		if (hasAcuteInfectiousDisease !== "true") {
			setValue("which_acute_infectious_disease", "");
		}
	}, [hasAcuteInfectiousDisease, setValue]);

	useEffect(() => {
		if (hasInfectiousDisease !== "true") {
			setValue("which_infectious_disease", "");
		}
	}, [hasInfectiousDisease, setValue]);

	useEffect(() => {
		if (takingBloodThinningMedication !== "true") {
			setValue("which_blood_thinning_medication", "");
			setValue("since_when_taking_medication", "");
		}
	}, [takingBloodThinningMedication, setValue]);

	useEffect(() => {
		if (stoppedMedication !== "Ja, abgesetzt") {
			setValue("when_stopped_medication_in_days", null);
		}
	}, [stoppedMedication, setValue]);

	useEffect(() => {
		if (stoppedMedication !== "Ja, umgestellt") {
			setValue("which_new_medication", "");
			setValue("when_adapted_medication_in_days", null);
		}
	}, [stoppedMedication, setValue]);

	useEffect(() => {
		if (takingRegularMedication !== "true") {
			setValue("which_regular_medication", "");
		}
	}, [takingRegularMedication, setValue]);

	useEffect(() => {
		if (takenAspirinOrBloodThinner !== "true") {
			setValue("when_taken_aspirin_or_blood_thinner", null);
		}
	}, [takenAspirinOrBloodThinner, setValue]);

	useEffect(() => {
		if (surgeryOnUrinaryOrgans !== "true") {
			setValue("which_surgery", "");
		}
	}, [surgeryOnUrinaryOrgans, setValue]);

	// Function to render a radio group
	const renderRadioGroup = (
		name: keyof BiopsyFormType,
		label: string,
		options: string[] = ["Ja", "Nein"],
		required = false
	) => {
		return (
			<Controller
				key={`${name}-${currentStep}`} // Add key to force re-render when step changes
				name={name as any}
				control={control}
				rules={required ? { required: `${label} ist erforderlich` } : {}}
				render={({ field, fieldState: { error } }) => (
					<div className="space-y-2">
						<label className="block text-sm font-medium text-gray-700">
							{label} {required && "*"}
						</label>
						<div className="space-x-4">
							{options.map((option) => {
								const value =
									option === "Ja"
										? "true"
										: option === "Nein"
										? "false"
										: option;
								return (
									<label key={option} className="inline-flex items-center">
										<input
											type="radio"
											value={value}
											checked={field.value === value}
											onChange={(e) => field.onChange(e.target.value)}
											className="form-radio h-4 w-4 text-blue-600"
											disabled={readOnly}
										/>
										<span className="ml-2 text-gray-700">{option}</span>
									</label>
								);
							})}
						</div>
						{error && <p className="text-red-500 text-sm">{error.message}</p>}
					</div>
				)}
			/>
		);
	};

	// Function to render a checkbox group
	const renderCheckboxGroup = (
		options: { label: string; value: string }[],
		fieldName: keyof BiopsyFormType,
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
									<div key={option.value} className="flex items-center">
										<input
											type="checkbox"
											id={`${fieldName}-${option.value}`}
											value={option.value}
											checked={field.value?.includes(option.value) || false}
											onChange={(e) => {
												const values = field.value || [];
												if (e.target.checked) {
													field.onChange([...values, option.value]);
												} else {
													field.onChange(
														values.filter((v: string) => v !== option.value)
													);
												}
											}}
											className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
											disabled={readOnly}
										/>
										<label
											htmlFor={`${fieldName}-${option.value}`}
											className="ml-2 block text-sm text-gray-700"
										>
											{option.label}
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

	const nextStep = async () => {
		let fieldsToValidate: (keyof BiopsyFormType)[] = [];
		switch (currentStep) {
			case 1:
				fieldsToValidate = ["consent_pelvis_ct"];
				break;
			case 2:
				// No required fields in step 2
				fieldsToValidate = [];
				break;
			case 3:
				fieldsToValidate = [
					"has_disorders_of_metabolism_or_organs",
					"risk_factors",
					"has_acute_infectious_disease",
					"has_infectious_disease",
				];
				if (hasDisordersOfMetabolismOrOrgans === "true")
					fieldsToValidate.push("which_disorders");
				if ((watch("risk_factors") || []).includes("weitere Risikofaktoren"))
					fieldsToValidate.push("further_risk_factors");
				if (hasAcuteInfectiousDisease === "true")
					fieldsToValidate.push("which_acute_infectious_disease");
				if (hasInfectiousDisease === "true")
					fieldsToValidate.push("which_infectious_disease");
				break;
			case 4:
				fieldsToValidate = [
					"taking_blood_thinning_medication",
					"stopped_medication",
					"taking_regular_medication",
					"taken_aspirin_or_blood_thinner",
				];
				if (takingBloodThinningMedication === "true")
					fieldsToValidate.push(
						"which_blood_thinning_medication",
						"since_when_taking_medication"
					);
				if (watch("stopped_medication") === "Ja, abgesetzt")
					fieldsToValidate.push("when_stopped_medication_in_days");
				if (watch("stopped_medication") === "Ja, umgestellt")
					fieldsToValidate.push(
						"which_new_medication",
						"when_adapted_medication_in_days"
					);
				if (takingRegularMedication === "true")
					fieldsToValidate.push("which_regular_medication");
				if (takenAspirinOrBloodThinner === "true")
					fieldsToValidate.push("when_taken_aspirin_or_blood_thinner");
				break;
			default:
				fieldsToValidate = [];
		}
		if (fieldsToValidate.length === 0) {
			setCurrentStep(currentStep + 1);
			window.scrollTo(0, 0);
			return;
		}
		const isStepValid = await trigger(fieldsToValidate);
		if (isStepValid) {
			setStepValidationErrors([]);
			setCurrentStep(currentStep + 1);
			window.scrollTo(0, 0);
		} else {
			const errorMessages = fieldsToValidate
				.filter((field) => errors[field])
				.map((field) => errors[field]?.message || `${field} is required`);
			setStepValidationErrors(errorMessages);
		}
	};

	const prevStep = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1);
			window.scrollTo(0, 0);
		}
	};

	const onFormSubmit = async (data: BiopsyFormType) => {
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

	// Risk factor options
	const riskFactorOptions = [
		{ label: "Rauchen", value: "Rauchen" },
		{ label: "Bluthochdruck", value: "Bluthochdruck" },
		{ label: "Cholesterin", value: "Cholesterin" },
		{ label: "familiäre Vorbelastung", value: "familiäre Vorbelastung" },
		{ label: "weitere Risikofaktoren", value: "weitere Risikofaktoren" },
		{ label: "nein", value: "nein" },
	];

	// Render different form sections based on current step
	const renderFormStep = () => {
		console.log(getValues());

		switch (currentStep) {
			case 1:
				return (
					<>
						{/* Introduction */}
						<div className="prose max-w-none bg-white p-6 rounded-lg shadow-sm mb-6">
							<h3 className="text-xl font-semibold">
								Aufklärungsbogen Biopsie
							</h3>
							<div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-4">
								<div className="flex">
									<Info
										className="text-yellow-500 mr-2"
										style={{
											height: "16px",
											width: "16px",
											minWidth: "16px",
											flexShrink: 0,
										}}
									/>
									<p className="text-sm text-yellow-700">
										Der folgende Aufklärungsbogen befindet sich ebenfalls noch
										als PDF im Anhang Ihrer Terminbestätigung. Aber wir bitten
										Sie, wenn möglich, die Unterlagen digital auszufüllen.
										Vielen Dank
									</p>
								</div>
							</div>

							<h4 className="font-semibold mt-6">
								BITTE BEACHTEN SIE FOLGENDE PUNKTE VOR DER 3-D LIVE
								MRT-PROSTATABIOPSIE
							</h4>
							<ul className="list-disc pl-6 space-y-2">
								<li>
									Sie haben am Tag, an dem die MRT-Untersuchung der Prostata
									durchgeführt wurde, vorab einen allgemeinen Aufklärungsbogen
									inkl. der Voraussetzungen für eine MRT-Untersuchung
									ausgefüllt. Unsere Prostatabiopsie verläuft auch
									MRT-kontrolliert. Wir weisen Sie daher nochmals auf folgende
									Punkte hin:
									<ul className="list-disc pl-6 space-y-1 mt-1">
										<li>
											Sie dürfen keinen Herzschrittmacher, Defibrillator,
											künstliche Metallherzklappe und/oder Insulinpumpe tragen.
										</li>
										<li>
											Nach einer Implantation und/oder Einbringung von
											Metallteilen (gilt nicht für Zahnersatz, sondern für z. B.
											Hörimplantate, Gelenkprothesen, Operationsnägel,
											Gefäßclips, Stents, Metallclips, Metallplatten) darf die
											MRT-Untersuchung frühestens 6 Wochen nach Einbringung
											erfolgen.
										</li>
									</ul>
								</li>
								<li>
									Falls bereits eine Stanzbiopsie erfolgt ist, sollten zwischen
									dieser und unserem Termin mindestens 6 Wochen liegen.
								</li>
								<li>
									Am Tag der Biopsie keine Cremes oder Lotionen zur Pflege im
									Gesäß-Becken-Bereich verwenden.
								</li>
								<li>
									Nehmen Sie bitte 7 Tage vor der Biopsie keine blutverdünnenden
									Medikamente wie z. B. Aspirin bzw. Medikamente, die den
									Wirkstoff ASS (Acetylsalicylsäure) enthalten, ein.
								</li>
							</ul>
						</div>

						{/* COMPUTERTOMOGRAPHIE DES BECKENS */}
						<div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
							<h4 className="text-lg font-semibold">
								COMPUTERTOMOGRAPHIE DES BECKENS
							</h4>
							<p className="text-gray-700">
								Für die gezielten Gewebeentnahmen unter MRT-Kontrolle nutzen wir
								den Zugangsweg über den Gesäßmuskel
								(transgluteal-transforaminal). Dieser Zugangsweg muss exakt
								geplant, gemessen und bestimmt werden, um die verdächtige(n)
								Stelle(n) in der Prostata gezielt biopsieren zu können. Dafür
								führen wir vorab eine Low-Dose (niedrig dosiert) CT-Untersuchung
								des Beckens durch. Diese Untersuchung funktioniert über
								Röntgenstrahlen und lässt – und das kann die MRT nicht leisten –
								eine klare Definition der Grenze zwischen Weichteilgewebe wie z.
								B. Bändern und den knöchernen Strukturen zu.
							</p>

							{renderRadioGroup(
								"consent_pelvis_ct",
								"Sind Sie damit einverstanden?",
								["Ja", "Nein"],
								true
							)}
						</div>
					</>
				);
			case 2:
				return (
					<>
						{/* BIOPSIEVERFAHREN */}
						<div className="prose max-w-none bg-white p-6 rounded-lg shadow-sm mb-6">
							<h3 className="text-xl font-semibold">BIOPSIEVERFAHREN</h3>
							<p>
								Mit unserer 3-D live MRT-gesteuerten Kombinationsbiopsie
								entnehmen wir gezielte Proben aus verdächtigen Stellen in der
								Prostata und zusätzlich systematische Proben. Gemäß der
								S3-Leitlinie weist diese Art der Prostatabiopsie die höchste
								Detektionsrate auf.
							</p>
							<p>
								Auszug S3-Leitlinie Prostatakarzinom, Version 6.1, Juli 2021,
								5.2.1. Erstbiopsie, 5.15 Evidenzbasiertes Statement geprüft
								2021: „Die Kombination aus mpMRT-gestützter, gezielter plus
								systematischer Biopsie erreicht bessere Detektionsraten als die
								jeweiligen Methoden allein."
							</p>
							<p>
								Unsere Kombinationsbiopsie ist nicht nur MRT-gestützt, sondern
								live MRT-gesteuert. Verdächtige Areale biopsieren wir im
								MRT-Gerät über aktuelle Live-Bilder der Areale. Weiterhin nutzen
								wir für die Biopsie den Zugangsweg über den Gesäßmuskel
								(transgluteal-transforaminal), was für den Patienten bedeutet,
								dass keine Darmbakterien in die Prostata gelangen können und
								somit eine präventive Antibiotika-Einnahme entfällt.
							</p>
						</div>

						{/* ES KANN IN EINZELFÄLLEN ZU KOMPLIKATIONEN KOMMEN */}
						<div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
							<h3 className="text-lg font-semibold mb-4">
								ES KANN IN EINZELFÄLLEN ZU KOMPLIKATIONEN KOMMEN
							</h3>
							<ul className="list-disc pl-6 space-y-2">
								<li>
									Es kann bei der Biopsie zu kleinen Einblutungen im Bereich der
									Entnahmestelle in der Prostata kommen, die in der Regel weder
									therapiert noch kontrolliert werden müssen. In extrem seltenen
									Fällen kann durch Verletzungen von Prostata umgebenen
									Gefäßkonvoluten die Blutung jedoch stärker sein, so dass der
									Bluterguss durch eine weitere MRT-gesteuerte Punktion
									entlastet werden muss.
								</li>
								<li>
									Kleine Verletzungen der von der Prostata umschlossenen
									Harnröhre bei der Biopsie sind selten und schließen sich in
									der Regel von selbst. Der Urin und das Ejakulat können in
									manchen Fällen auch noch für einige Wochen blutig sein.
								</li>
								<li>
									Verletzungen benachbarter Organe sind extrem selten. Eine
									medikamentöse oder operative Therapie kann dann erforderlich
									werden.
								</li>
								<li>
									Infektionen der Prostata und auch der (Neben-) Hoden sind sehr
									selten. Eine prophylaktische Antibiotika-Einnahme ist nicht
									erforderlich.
								</li>
								<li>
									Überempfindlichkeitsreaktionen auf das örtliche
									Betäubungsmittel sind sehr selten. Eine Allergie kann zu einer
									Beeinträchtigung der Atemfunktion bis hin zum Atemstillstand
									und zu schweren Herz-Kreislaufstörungen bis hin zum
									Herz-Kreislaufstillstand (Schock) führen.
								</li>
							</ul>
						</div>
					</>
				);
			case 3:
				return (
					<>
						{/* Medical conditions */}
						<div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
							<h3 className="text-lg font-semibold mb-4">
								Medizinische Vorgeschichte
							</h3>

							{renderRadioGroup(
								"has_disorders_of_metabolism_or_organs",
								"Sind Störungen des Stoffwechsels (z.B. Diabetes mellitus) oder wichtiger Organe (z.B. Herz, Nieren) bekannt?",
								["Ja", "Nein"],
								true
							)}

							{hasDisordersOfMetabolismOrOrgans === "true" && (
								<div>
									<label className="block text-sm font-medium text-gray-700">
										Welche Störungen sind bekannt? *
									</label>
									<input
										type="text"
										{...register("which_disorders", {
											required: "Diese Angabe ist erforderlich",
										})}
										className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
										disabled={readOnly}
									/>
									{errors.which_disorders && (
										<p className="text-red-500 text-sm mt-1">
											{errors.which_disorders.message}
										</p>
									)}
								</div>
							)}

							{renderCheckboxGroup(
								riskFactorOptions,
								"risk_factors",
								"Sind bei Ihnen folgende Risikofaktoren bekannt?",
								true
							)}

							{riskFactors.includes("weitere Risikofaktoren") && (
								<div>
									<label className="block text-sm font-medium text-gray-700">
										Welche weiteren Risikofaktoren? *
									</label>
									<input
										type="text"
										{...register("further_risk_factors", {
											required: "Diese Angabe ist erforderlich",
										})}
										className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
										disabled={readOnly}
									/>
									{errors.further_risk_factors && (
										<p className="text-red-500 text-sm mt-1">
											{errors.further_risk_factors.message}
										</p>
									)}
								</div>
							)}
						</div>

						{/* Infectious diseases */}
						<div className="bg-white p-6 rounded-lg shadow-sm space-y-6 mt-6">
							<h3 className="text-lg font-semibold mb-4">
								Infektionskrankheiten
							</h3>

							{renderRadioGroup(
								"has_acute_infectious_disease",
								"Besteht eine akute Infektionskrankheit (z.B. der Harnwege)?",
								["Ja", "Nein"],
								true
							)}

							{hasAcuteInfectiousDisease === "true" && (
								<div>
									<label className="block text-sm font-medium text-gray-700">
										Welche akute Infektionskrankheit besteht? *
									</label>
									<input
										type="text"
										{...register("which_acute_infectious_disease", {
											required: "Diese Angabe ist erforderlich",
										})}
										className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
										disabled={readOnly}
									/>
									{errors.which_acute_infectious_disease && (
										<p className="text-red-500 text-sm mt-1">
											{errors.which_acute_infectious_disease.message}
										</p>
									)}
								</div>
							)}

							{renderRadioGroup(
								"has_infectious_disease",
								"Besteht eine Infektionskrankheit (z.B. Hepatitis, HIV)?",
								["Ja", "Nein"],
								true
							)}

							{hasInfectiousDisease === "true" && (
								<div>
									<label className="block text-sm font-medium text-gray-700">
										Welche Infektionskrankheit ist bei Ihnen bekannt? *
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
					</>
				);
			case 4:
				return (
					<>
						{/* Blood thinning medications */}
						<div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
							<h3 className="text-lg font-semibold mb-4">
								Blutverdünnende Medikamente
							</h3>

							{renderRadioGroup(
								"taking_blood_thinning_medication",
								"Nehmen Sie regelmäßig blutverdünnende Medikamente ein?",
								["Ja", "Nein"],
								true
							)}

							{takingBloodThinningMedication === "true" && (
								<div className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-gray-700">
											Welche? (z.B. ASS/Aspirin, Plavix, Xarelto) *
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

									<div className="space-y-2">
										<label className="block text-sm font-medium text-gray-700">
											Haben Sie das Medikament, wie vorgeschrieben, 7 Tage
											vorher abgesetzt bzw. umgestellt?
										</label>
										<div className="space-x-4">
											{["Ja, abgesetzt", "Ja, umgestellt", "Nein"].map(
												(option) => (
													<label
														key={option}
														className="inline-flex items-center"
													>
														<input
															type="radio"
															value={option}
															{...register("stopped_medication")}
															className="form-radio h-4 w-4 text-blue-600"
															disabled={readOnly}
														/>
														<span className="ml-2 text-gray-700">{option}</span>
													</label>
												)
											)}
										</div>
									</div>

									{stoppedMedication === "Ja, abgesetzt" && (
										<div>
											<label className="block text-sm font-medium text-gray-700">
												Vor wie viel Tagen abgesetzt? *
											</label>
											<input
												type="number"
												{...register("when_stopped_medication_in_days", {
													required: "Diese Angabe ist erforderlich",
													valueAsNumber: true,
													min: {
														value: 0,
														message: "Der Wert muss mindestens 0 sein",
													},
												})}
												className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
												disabled={readOnly}
											/>
											{errors.when_stopped_medication_in_days && (
												<p className="text-red-500 text-sm mt-1">
													{errors.when_stopped_medication_in_days.message}
												</p>
											)}
										</div>
									)}

									{stoppedMedication === "Ja, umgestellt" && (
										<>
											<div>
												<label className="block text-sm font-medium text-gray-700">
													Auf welches Medikament umgestellt? *
												</label>
												<input
													type="text"
													{...register("which_new_medication", {
														required: "Diese Angabe ist erforderlich",
													})}
													className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
													disabled={readOnly}
												/>
												{errors.which_new_medication && (
													<p className="text-red-500 text-sm mt-1">
														{errors.which_new_medication.message}
													</p>
												)}
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700">
													Vor wie vielen Tagen umgestellt? *
												</label>
												<input
													type="number"
													{...register("when_adapted_medication_in_days", {
														required: "Diese Angabe ist erforderlich",
														valueAsNumber: true,
														min: {
															value: 0,
															message: "Der Wert muss mindestens 0 sein",
														},
													})}
													className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
													disabled={readOnly}
												/>
												{errors.when_adapted_medication_in_days && (
													<p className="text-red-500 text-sm mt-1">
														{errors.when_adapted_medication_in_days.message}
													</p>
												)}
											</div>
										</>
									)}
								</div>
							)}

							{renderRadioGroup(
								"taking_regular_medication",
								"Nehmen Sie regelmäßig Medikamente (außer Blutverdünner) ein?",
								["Ja", "Nein"],
								true
							)}

							{takingRegularMedication === "true" && (
								<div>
									<label className="block text-sm font-medium text-gray-700">
										Welche anderen Medikamente nehmen Sie regelmäßig ein? *
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

							{renderRadioGroup(
								"taken_aspirin_or_blood_thinner",
								"Haben Sie in den letzten 7 Tagen Aspirin (ASS) oder einen anderen Blutverdünner eingenommen?",
								["Ja", "Nein"],
								true
							)}

							{takenAspirinOrBloodThinner === "true" && (
								<div>
									<label className="block text-sm font-medium text-gray-700">
										Vor wie vielen Tagen haben Sie Aspirin (ASS) oder einen
										anderen Blutverdünner eingenommen?
									</label>
									<input
										type="number"
										{...register("when_taken_aspirin_or_blood_thinner", {
											valueAsNumber: true,
											min: {
												value: 0,
												message: "Der Wert muss mindestens 0 sein",
											},
											max: {
												value: 7,
												message: "Der Wert darf maximal 7 sein",
											},
										})}
										className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
										disabled={readOnly}
									/>
									{errors.when_taken_aspirin_or_blood_thinner && (
										<p className="text-red-500 text-sm mt-1">
											{errors.when_taken_aspirin_or_blood_thinner.message}
										</p>
									)}
								</div>
							)}
						</div>

						{/* Medical history */}
						<div className="bg-white p-6 rounded-lg shadow-sm space-y-6 mt-6">
							<h3 className="text-lg font-semibold mb-4">
								Medizinische Vorgeschichte
							</h3>

							{renderRadioGroup(
								"increased_bleeding",
								"Kam es bei früheren Operationen oder Verletzungen zu verstärkter Blutung?",
								["Ja", "Nein"],
								true
							)}

							{renderRadioGroup(
								"suppuration_or_abscesses",
								"Kam es früher bei Eingriffen zu Eiterungen oder Abszessen?",
								["Ja", "Nein"],
								true
							)}

							{renderRadioGroup(
								"surgery_on_urinary_organs",
								"Wurden Sie bereits früher an den Harnorganen operiert?",
								["Ja", "Nein"],
								true
							)}

							{surgeryOnUrinaryOrgans === "true" && (
								<div>
									<label className="block text-sm font-medium text-gray-700">
										Welche OP wurde wann durchgeführt: *
									</label>
									<input
										type="text"
										{...register("which_surgery", {
											required: "Diese Angabe ist erforderlich",
										})}
										className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
										disabled={readOnly}
									/>
									{errors.which_surgery && (
										<p className="text-red-500 text-sm mt-1">
											{errors.which_surgery.message}
										</p>
									)}
								</div>
							)}

							{renderRadioGroup(
								"increased_bleeding_tendency",
								"Besteht bei Ihnen eine erhöhte Blutungsneigung (z.B. häufiges Nasenbluten, Blutergüsse)?",
								["Ja", "Nein"],
								true
							)}

							{renderRadioGroup(
								"has_allergies",
								"Wurden Allergien/Unverträglichkeiten (z.B. gegen Pflaster, Medikamente) beobachtet?",
								["Ja", "Nein"],
								true
							)}
						</div>
					</>
				);
			default:
				return null;
		}
	};

	return (
		<form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
			{/* Step indicator */}
			<div className="flex justify-between bg-white p-4 rounded-lg shadow-sm mb-4">
				{Array.from({ length: totalSteps }).map((_, index) => (
					<div
						key={index}
						className={`flex-1 text-center ${
							index + 1 === currentStep
								? "font-semibold text-blue-600"
								: index + 1 < currentStep
								? "text-gray-500"
								: "text-gray-300"
						}`}
					>
						Schritt {index + 1} von {totalSteps}
					</div>
				))}
			</div>

			{renderFormStep()}

			{/* Display step validation errors */}
			{stepValidationErrors.length > 0 && (
				<div className="text-red-500 text-sm">
					{stepValidationErrors.map((err, idx) => (
						<p key={idx}>{err}</p>
					))}
				</div>
			)}

			{/* Navigation buttons */}
			<div className="flex justify-between mt-6">
				{currentStep > 1 ? (
					<button
						type="button"
						onClick={prevStep}
						className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
					>
						Zurück
					</button>
				) : (
					<div></div>
				)}

				{currentStep < totalSteps ? (
					<button
						type="button"
						onClick={nextStep}
						className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
					>
						Weiter
					</button>
				) : (
					<div className="flex items-center justify-between">
						<div>
							{saveError && (
								<p className="text-sm text-red-600 mr-4">{saveError}</p>
							)}
							{saveSuccess && (
								<p className="text-sm text-green-600 mr-4">
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
			</div>
		</form>
	);
};

export default BiopsyForm;
