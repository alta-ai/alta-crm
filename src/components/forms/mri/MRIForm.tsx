import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Info, AlertCircle } from "lucide-react";

import type { MRIForm as MRIFormType } from "../../types";
import type { MRIFormDataContextType } from "./MRIFormData";
import { useFormContext } from "../formContext";
import { GENDER } from "../../types/constants";

interface MRIFormProps {
	onComplete?: () => void;
	readOnly?: boolean;
}

export const MRIForm = ({ onComplete, readOnly }: MRIFormProps) => {
	const { data, mutateFn } = useFormContext<MRIFormDataContextType>();

	const [isSaving, setIsSaving] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [saveSuccess, setSaveSuccess] = useState(false);

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm<MRIFormType>({ defaultValues: data?.submission });

	// Watch fields for conditional rendering
	const heartPacemaker = watch(
		"wearing_interfearing_devices"
	) as unknown as string;
	const brainHeartSurgery = watch("had_brain_or_heart_op") as unknown as string;
	const organsRemoved = watch("had_organ_removed") as unknown as string;
	const kidneyDisease = watch("has_kidney_disease") as unknown as string;
	const implantsOrMetal = watch(
		"wearing_interfearing_implants_or_metal_objects"
	) as unknown as string;
	const metalInjuries = watch(
		"has_injuries_by_metallic_objects"
	) as unknown as string;
	const allergies = watch("has_allergies") as unknown as string;
	const preliminaryExams = watch(
		"has_preliminary_examinations"
	) as unknown as string;
	const infectiousDisease = watch(
		"has_infectious_disease"
	) as unknown as string;
	const bloodThinners = watch("taking_blood_thinners") as unknown as string;
	const regularMedication = watch(
		"taking_other_medications"
	) as unknown as string;
	const pregnancy = watch("pregnant") as unknown as string;

	// Reset dependent fields when conditional fields are toggled to false
	useEffect(() => {
		if (heartPacemaker === "false") {
			setValue("interfearing_devices", null);
		}
	}, [heartPacemaker, setValue]);

	useEffect(() => {
		if (brainHeartSurgery === "false") {
			setValue("which_op", null);
			setValue("when_op", null);
		}
	}, [brainHeartSurgery, setValue]);

	useEffect(() => {
		if (organsRemoved === "false") {
			setValue("which_organ", null);
			setValue("when_organ", null);
		}
	}, [organsRemoved, setValue]);

	useEffect(() => {
		if (kidneyDisease === "false") {
			setValue("which_kidney_disease", null);
		}
	}, [kidneyDisease, setValue]);

	useEffect(() => {
		if (implantsOrMetal === "false") {
			setValue("which_interfearing_implants", null);
			setValue("when_interfearing_implants", null);
		}
	}, [implantsOrMetal, setValue]);

	useEffect(() => {
		if (metalInjuries === "false") {
			setValue("which_injuries", null);
		}
	}, [metalInjuries, setValue]);

	useEffect(() => {
		if (allergies === "false") {
			setValue("which_allergies", null);
		}
	}, [allergies, setValue]);

	useEffect(() => {
		if (preliminaryExams === "false") {
			setValue("preliminary_examinations_details", null);
			setValue("preliminary_examinations_date", null);
		}
	}, [preliminaryExams, setValue]);

	useEffect(() => {
		if (infectiousDisease === "false") {
			setValue("infectious_disease_details", null);
		}
	}, [infectiousDisease, setValue]);

	useEffect(() => {
		if (bloodThinners === "false") {
			setValue("blood_thinners_details", null);
			setValue("blood_thinners_since", null);
		}
	}, [bloodThinners, setValue]);

	useEffect(() => {
		if (regularMedication === "false") {
			setValue("other_medications_details", null);
		}
	}, [regularMedication, setValue]);

	useEffect(() => {
		if (pregnancy === "false") {
			setValue("last_menstruation", null);
		}
	}, [pregnancy, setValue]);

	const onFormSubmit = async (data: MRIFormType) => {
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
			{/* MRI Information */}
			<div className="prose max-w-none bg-white p-6 rounded-lg shadow-sm">
				<h3 className="text-xl font-semibold mb-4">
					Aufklärungsbogen für Magnet-Resonanz-Tomographie (MRT)
				</h3>
				<div>
					<h4 className="text-lg font-medium">Untersuchungsablauf</h4>
					<p className="text-gray-700">
						Die Kernspintomographie oder auch Magnet-Resonanz-Tomographie (kurz
						MRT) ist ein Untersuchungsverfahren, das mit Hilfe von einem starken
						Magnetfeld und Hochfrequenzwellen Schnittbilder erzeugt. Dabei wird
						die zu untersuchende Region in die Mitte der MRT-Röhre positioniert,
						wobei bei vielen Untersuchungen der Kopf außerhalb liegt. Die Länge
						der Untersuchung variiert, je nach Fragestellung und Körperregion,
						zwischen 20-60 Minuten. In seltenen Fällen kann das auch eine Stunde
						oder länger dauern.
					</p>
					<p className="text-gray-700">
						Das MRT-Team wird Sie darüber genau informieren. Außerdem wird es,
						aufgrund von schnell wechselnden Magnetfeldern, sehr laut während
						der Untersuchung. Damit Sie Ihr Gehör dabei nicht schädigen,
						erhalten Sie von den MRT-Mitarbeiter*innen einen Lärmschutz in Form
						von Kopfhörern und/oder Ohrstöpsel. Sobald es laut wird, ist es
						wichtig, dass Sie den gesamten Körper ruhig liegen lassen. Jede
						Bewegung kann zu verwackelten Bildern führen, was die Auswertung
						erschwert.
					</p>
				</div>

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
			</div>

			{/* Medical Questions */}
			<div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
				<h3 className="text-lg font-semibold mb-4">Medizinische Fragen</h3>

				{/* Heart Pacemaker */}
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Tragen Sie einen Herzschrittmacher, elektrische Implantate (z. B.
							ICD, CRT) oder eine künstliche Metallherzklappe? *
						</label>
						<div className="mt-2 space-x-4">
							{["Ja", "Nein"].map((option) => (
								<label key={option} className="inline-flex items-center">
									<input
										type="radio"
										value={option === "Ja" ? "true" : "false"}
										{...register("wearing_interfearing_devices", {
											required: "Diese Angabe ist erforderlich",
										})}
										className="form-radio h-4 w-4 text-blue-600"
										disabled={readOnly}
									/>
									<span className="ml-2 text-gray-700">{option}</span>
								</label>
							))}
						</div>
						{errors.wearing_interfearing_devices && (
							<p className="text-red-500 text-sm mt-1">
								{errors.wearing_interfearing_devices.message}
							</p>
						)}
					</div>

					{heartPacemaker === "true" && (
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Welche? *
							</label>
							<input
								type="text"
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
								placeholder="Bitte angeben"
								{...register("interfearing_devices", {
									required: "Diese Angabe ist erforderlich",
								})}
								disabled={readOnly}
							/>
							{errors.interfearing_devices && (
								<p className="text-red-500 text-sm mt-1">
									{errors.interfearing_devices.message}
								</p>
							)}
						</div>
					)}
				</div>

				{/* Brain/Heart Surgery */}
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Wurden Sie schon einmal am Gehirn oder Herzen operiert? *
						</label>
						<div className="mt-2 space-x-4">
							{["Ja", "Nein"].map((option) => (
								<label key={option} className="inline-flex items-center">
									<input
										type="radio"
										value={option === "Ja" ? "true" : "false"}
										{...register("had_brain_or_heart_op", {
											required: "Diese Angabe ist erforderlich",
										})}
										className="form-radio h-4 w-4 text-blue-600"
										disabled={readOnly}
									/>
									<span className="ml-2 text-gray-700">{option}</span>
								</label>
							))}
						</div>
						{errors.had_brain_or_heart_op && (
							<p className="text-red-500 text-sm mt-1">
								{errors.had_brain_or_heart_op.message}
							</p>
						)}
					</div>

					{brainHeartSurgery === "true" && (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Was wurde operiert? *
								</label>
								<input
									type="text"
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
									placeholder="Bitte angeben"
									{...register("which_op", {
										required: "Diese Angabe ist erforderlich",
									})}
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
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
									placeholder="Datum oder Zeitraum"
									{...register("when_op", {
										required: "Diese Angabe ist erforderlich",
									})}
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
				</div>

				{/* Organs Removed */}
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Wurden bei Ihnen bereits Organe entfernt? *
						</label>
						<div className="mt-2 space-x-4">
							{["Ja", "Nein"].map((option) => (
								<label key={option} className="inline-flex items-center">
									<input
										type="radio"
										value={option === "Ja" ? "true" : "false"}
										{...register("had_organ_removed", {
											required: "Diese Angabe ist erforderlich",
										})}
										className="form-radio h-4 w-4 text-blue-600"
										disabled={readOnly}
									/>
									<span className="ml-2 text-gray-700">{option}</span>
								</label>
							))}
						</div>
						{errors.had_organ_removed && (
							<p className="text-red-500 text-sm mt-1">
								{errors.had_organ_removed.message}
							</p>
						)}
					</div>

					{organsRemoved === "true" && (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Welche Organe wurden entfernt? *
								</label>
								<input
									type="text"
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
									placeholder="Bitte angeben"
									{...register("which_organ", {
										required: "Diese Angabe ist erforderlich",
									})}
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
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
									placeholder="Datum oder Zeitraum"
									{...register("when_organ", {
										required: "Diese Angabe ist erforderlich",
									})}
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
				</div>

				{/* Kidney Disease */}
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Leiden Sie an einer Nierenerkrankung? *
						</label>
						<div className="mt-2 space-x-4">
							{["Ja", "Nein"].map((option) => (
								<label key={option} className="inline-flex items-center">
									<input
										type="radio"
										value={option === "Ja" ? "true" : "false"}
										{...register("has_kidney_disease", {
											required: "Diese Angabe ist erforderlich",
										})}
										className="form-radio h-4 w-4 text-blue-600"
										disabled={readOnly}
									/>
									<span className="ml-2 text-gray-700">{option}</span>
								</label>
							))}
						</div>
						{errors.has_kidney_disease && (
							<p className="text-red-500 text-sm mt-1">
								{errors.has_kidney_disease.message}
							</p>
						)}
					</div>

					{kidneyDisease === "true" && (
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Welche Nierenerkrankung? *
							</label>
							<input
								type="text"
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
								placeholder="Bitte angeben"
								{...register("which_kidney_disease", {
									required: "Diese Angabe ist erforderlich",
								})}
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

				{/* Implants/Metal */}
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Tragen Sie Implantate und/oder Metallteile (gilt nicht für
							Zahnersatz) in/an Ihrem Körper? (z. B. Hörimplantat,
							Gelenkprothesen, Operationsnägel, Gefäßclips, Stents, Metallclips,
							Metallplatten, Medikamentenpumpen, Piercings, Tätowierungen,
							Permanent-Make-up, Kupferspirale) *
						</label>
						<div className="mt-2 space-x-4">
							{["Ja", "Nein"].map((option) => (
								<label key={option} className="inline-flex items-center">
									<input
										type="radio"
										value={option === "Ja" ? "true" : "false"}
										{...register(
											"wearing_interfearing_implants_or_metal_objects",
											{
												required: "Diese Angabe ist erforderlich",
											}
										)}
										className="form-radio h-4 w-4 text-blue-600"
										disabled={readOnly}
									/>
									<span className="ml-2 text-gray-700">{option}</span>
								</label>
							))}
						</div>
						{errors.wearing_interfearing_implants_or_metal_objects && (
							<p className="text-red-500 text-sm mt-1">
								{errors.wearing_interfearing_implants_or_metal_objects.message}
							</p>
						)}
					</div>

					{implantsOrMetal === "true" && (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Welche? *
								</label>
								<input
									type="text"
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
									placeholder="Bitte angeben"
									{...register("which_interfearing_implants", {
										required: "Diese Angabe ist erforderlich",
									})}
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
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
									placeholder="Datum oder Zeitraum"
									{...register("when_interfearing_implants")}
									disabled={readOnly}
								/>
							</div>
						</div>
					)}
				</div>

				{/* Metal Injuries */}
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Haben Sie Verletzungen durch metallische Objekte erlitten? (z. B.
							Granatsplitter, Verletzungen im Auge) *
						</label>
						<div className="mt-2 space-x-4">
							{["Ja", "Nein"].map((option) => (
								<label key={option} className="inline-flex items-center">
									<input
										type="radio"
										value={option === "Ja" ? "true" : "false"}
										{...register("has_injuries_by_metallic_objects", {
											required: "Diese Angabe ist erforderlich",
										})}
										className="form-radio h-4 w-4 text-blue-600"
										disabled={readOnly}
									/>
									<span className="ml-2 text-gray-700">{option}</span>
								</label>
							))}
						</div>
						{errors.has_injuries_by_metallic_objects && (
							<p className="text-red-500 text-sm mt-1">
								{errors.has_injuries_by_metallic_objects.message}
							</p>
						)}
					</div>

					{metalInjuries === "true" && (
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Welche? *
							</label>
							<input
								type="text"
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
								placeholder="Bitte angeben"
								{...register("which_injuries", {
									required: "Diese Angabe ist erforderlich",
								})}
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

				{/* Allergies */}
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Sind bei Ihnen Allergien bekannt? (z. B. Kontrastmittel,
							Medikamente, Histamin) *
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
										disabled={readOnly}
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
								Welche? *
							</label>
							<input
								type="text"
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
								placeholder="Bitte angeben"
								{...register("which_allergies", {
									required: "Diese Angabe ist erforderlich",
								})}
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

				{/* Glaucoma */}
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Besteht bei Ihnen ein erhöhter Augeninnendruck (Glaukom)? *
						</label>
						<div className="mt-2 space-x-4">
							{["Ja", "Nein"].map((option) => (
								<label key={option} className="inline-flex items-center">
									<input
										type="radio"
										value={option === "Ja" ? "true" : "false"}
										{...register("has_glaucoma", {
											required: "Diese Angabe ist erforderlich",
										})}
										className="form-radio h-4 w-4 text-blue-600"
										disabled={readOnly}
									/>
									<span className="ml-2 text-gray-700">{option}</span>
								</label>
							))}
						</div>
						{errors.has_glaucoma && (
							<p className="text-red-500 text-sm mt-1">
								{errors.has_glaucoma.message}
							</p>
						)}
					</div>
				</div>

				{/* Preliminary Exams */}
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Gibt es Voruntersuchungen des heute zu untersuchenden Körperteils?
							(z. B. Röntgen, CT, MR, Nuklearmedizin) *
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
										disabled={readOnly}
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

					{preliminaryExams === "true" && (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Welche? *
								</label>
								<input
									type="text"
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
									placeholder="Bitte angeben"
									{...register("preliminary_examinations_details", {
										required: "Diese Angabe ist erforderlich",
									})}
									disabled={readOnly}
								/>
								{errors.preliminary_examinations_details && (
									<p className="text-red-500 text-sm mt-1">
										{errors.preliminary_examinations_details.message}
									</p>
								)}
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Wann war die Voruntersuchung? *
								</label>
								<input
									type="text"
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
									placeholder="Datum oder Zeitraum"
									{...register("preliminary_examinations_date", {
										required: "Diese Angabe ist erforderlich",
									})}
									disabled={readOnly}
								/>
								{errors.preliminary_examinations_date && (
									<p className="text-red-500 text-sm mt-1">
										{errors.preliminary_examinations_date.message}
									</p>
								)}
							</div>
						</div>
					)}
				</div>

				{/* Infectious Disease */}
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Ist bei Ihnen eine Infektionskrankheit bekannt? (z. B. Hepatitis,
							HIV, etc.) *
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
										disabled={readOnly}
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
								disabled={readOnly}
							/>
							{errors.infectious_disease_details && (
								<p className="text-red-500 text-sm mt-1">
									{errors.infectious_disease_details.message}
								</p>
							)}
						</div>
					)}
				</div>

				{/* Blood Thinners */}
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
										disabled={readOnly}
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
									Welche? (z. B. ASS/Aspirin, Plavix, Xarelto) *
								</label>
								<input
									type="text"
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
									placeholder="Bitte angeben"
									{...register("blood_thinners_details", {
										required: "Diese Angabe ist erforderlich",
									})}
									disabled={readOnly}
								/>
								{errors.blood_thinners_details && (
									<p className="text-red-500 text-sm mt-1">
										{errors.blood_thinners_details.message}
									</p>
								)}
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Seit wann nehmen Sie Blutverdünner? *
								</label>
								<input
									type="text"
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
									placeholder="Datum oder Zeitraum"
									{...register("blood_thinners_since", {
										required: "Diese Angabe ist erforderlich",
									})}
									disabled={readOnly}
								/>
								{errors.blood_thinners_since && (
									<p className="text-red-500 text-sm mt-1">
										{errors.blood_thinners_since.message}
									</p>
								)}
							</div>
						</div>
					)}
				</div>

				{/* Regular Medication */}
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Nehmen Sie regelmäßig sonstige Medikamente ein? *
						</label>
						<div className="mt-2 space-x-4">
							{["Ja", "Nein"].map((option) => (
								<label key={option} className="inline-flex items-center">
									<input
										type="radio"
										value={option === "Ja" ? "true" : "false"}
										{...register("taking_other_medications", {
											required: "Diese Angabe ist erforderlich",
										})}
										className="form-radio h-4 w-4 text-blue-600"
										disabled={readOnly}
									/>
									<span className="ml-2 text-gray-700">{option}</span>
								</label>
							))}
						</div>
						{errors.taking_other_medications && (
							<p className="text-red-500 text-sm mt-1">
								{errors.taking_other_medications.message}
							</p>
						)}
					</div>

					{regularMedication === "true" && (
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Welche sonstigen Medikamente nehmen Sie regelmäßig ein? *
							</label>
							<input
								type="text"
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
								placeholder="Bitte angeben"
								{...register("other_medications_details", {
									required: "Diese Angabe ist erforderlich",
								})}
								disabled={readOnly}
							/>
							{errors.other_medications_details && (
								<p className="text-red-500 text-sm mt-1">
									{errors.other_medications_details.message}
								</p>
							)}
						</div>
					)}
				</div>

				{/* Claustrophobia */}
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Leiden Sie an Klaustrophobie (Angst in engen Räumen, Platzangst)?
							*
						</label>
						<div className="mt-2 space-x-4">
							{["Ja", "Nein"].map((option) => (
								<label key={option} className="inline-flex items-center">
									<input
										type="radio"
										value={option === "Ja" ? "true" : "false"}
										{...register("has_claustrophobia", {
											required: "Diese Angabe ist erforderlich",
										})}
										className="form-radio h-4 w-4 text-blue-600"
										disabled={readOnly}
									/>
									<span className="ml-2 text-gray-700">{option}</span>
								</label>
							))}
						</div>
						{errors.has_claustrophobia && (
							<p className="text-red-500 text-sm mt-1">
								{errors.has_claustrophobia.message}
							</p>
						)}
					</div>
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
							<label className="block text-sm font-medium text-gray-700">
								Besteht eine Schwangerschaft? *
							</label>
							<div className="mt-2 space-x-4">
								{["Ja", "Nein"].map((option) => (
									<label key={option} className="inline-flex items-center">
										<input
											type="radio"
											value={option === "Ja" ? "true" : "false"}
											{...register("pregnant", {
												required: "Diese Angabe ist erforderlich",
											})}
											className="form-radio h-4 w-4 text-blue-600"
											disabled={readOnly}
										/>
										<span className="ml-2 text-gray-700">{option}</span>
									</label>
								))}
							</div>
							{errors.pregnant && (
								<p className="text-red-500 text-sm mt-1">
									{errors.pregnant.message}
								</p>
							)}
						</div>

						{pregnancy === "false" && (
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Wann war die letzte Regelblutung? *
								</label>
								<input
									type="text"
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
									placeholder="Datum oder Zeitraum"
									{...register("last_menstruation", {
										required: "Diese Angabe ist erforderlich",
									})}
									disabled={readOnly}
								/>
								{errors.last_menstruation && (
									<p className="text-red-500 text-sm mt-1">
										{errors.last_menstruation.message}
									</p>
								)}
							</div>
						)}

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

			{/* Consent */}
			<div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
				<div>
					<label className="flex items-start">
						<input
							type="checkbox"
							className="form-checkbox mt-1 h-4 w-4 text-blue-600"
							{...register("consent_form_read", {
								required:
									"Bitte bestätigen Sie, dass Sie den Aufklärungsbogen gelesen und verstanden haben",
							})}
							disabled={readOnly}
						/>
						<span className="ml-2 text-sm text-gray-700">
							Den Aufklärungsbogen habe ich gelesen und verstanden. *
						</span>
					</label>
					{errors.consent_form_read && (
						<p className="text-red-500 text-sm mt-1">
							{errors.consent_form_read.message}
						</p>
					)}
				</div>

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
						disabled={isSaving || readOnly}
						className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
					>
						{isSaving ? "Wird gespeichert..." : "Speichern"}
					</button>
				</div>
			</div>
		</form>
	);
};

export default MRIForm;
