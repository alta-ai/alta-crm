import { useState } from "react";
import { useForm } from "react-hook-form";
import { Info } from "lucide-react";
import { PrivacyForm as PrivacyFormType } from "../../types";
import { useFormContext } from "../formContext";
import type { PrivacyFormDataContextType } from "./PrivacyFormData";

interface PrivacyFormProps {
	onComplete?: () => void;
	readOnly?: boolean;
}

export const PrivacyForm = ({ onComplete, readOnly }: PrivacyFormProps) => {
	const { data, mutateFn } = useFormContext<PrivacyFormDataContextType>();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<PrivacyFormType>({ defaultValues: data?.submission });

	const [isSaving, setIsSaving] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [saveSuccess, setSaveSuccess] = useState(false);

	const onFormSubmit = async (data: PrivacyFormType) => {
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
			<div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
				<h2 className="text-2xl font-bold">
					Datenschutz-Grundverordnung (DSGVO) ab dem 25.05.2018
				</h2>

				<div className="prose max-w-none space-y-4">
					<p className="text-gray-700">
						Ihre Gesundheit und der sichere Umgang mit Ihren Daten sind uns
						wichtig. Im Zuge des Inkrafttretens der Datenschutz-Grundverordnung
						(DSGVO) am 25.05.2018 informieren wir Sie, dass wir, alle
						Mitarbeiter der ALTA Klinik, Vertretungsärzte, Vertretungspersonal,
						Hospitanten und MRT-Dienstleister zur Erbringung unserer Leistung
						Ihre personenbezogenen Daten benötigen, die bei uns gespeichert
						werden. Dazu gehören Ihre personenbezogenen Daten, wie Name,
						Geburtsdatum, Adresse, Telefon, E-Mail, Versicherungsstatus, Beruf.
						Ebenso gehören personenbezogene Daten besonderer Kategorie gem. Art.
						9 (2) lit. h DGSVO, wie Gesundheit, dazu. Wir nutzen Ihre Daten für
						die Terminvereinbarung, Kontaktaufnahme, für die Durchführung einer
						Untersuchung oder Behandlung, für die Bereitstellung der Ergebnisse,
						zur Dokumentation des Behandlungsverlaufes und zur Abrechnung der
						von uns erbrachten Leistungen. Wenn Laborleistungen, pathologische
						Leistungen in Anspruch genommen werden, sind Sie einverstanden, dass
						wir in diesem Zusammenhang Ihre personenbezogenen Daten übermitteln
						dürfen. Weiterhin klären wir Sie auf, dass unsere externen IT- und
						Technologie-Dienstleistungsunternehmen Zugriff auf Ihre
						personenbezogenen (wie z.B. Name) sowie personenbezogene Daten
						besonderer Kategorien (wie z.B. Gesundheit) haben. Um Ihre Daten zu
						schützen, haben wir technisch-organisatorische Maßnahmen ergriffen.
						Mehr Informationen bietet Ihnen unsere „Patienteninformation zur
						Datenverarbeitung in der ALTA Klinik“.
					</p>

					<div className="bg-blue-50 border-l-4 border-blue-500 p-4">
						<div className="flex">
							<Info className="h-6 w-6 text-blue-500 mr-2" />
							<div>
								<p className="text-blue-700">
									Die Patienteninformation zur Datenverarbeitung in der ALTA
									Klinik finden Sie unter dem folgenden Link:
								</p>
								<a
									className="text-blue-700 underline"
									href="https://www.alta-klinik.de/kontakt/datenschutz/patienteninformation-zur-datenverarbeitung/"
								>
									https://www.alta-klinik.de/kontakt/datenschutz/patienteninformation-zur-datenverarbeitung/
								</a>
							</div>
						</div>
					</div>
				</div>

				<div className="space-y-10">
					{/* E-Mail */}
					<div>
						<label className="block text-lg font-medium text-black-700">
							E-Mail *
						</label>
						<p className="text-gray-700">
							Sind Sie damit einverstanden, dass Ihre Arztbefunde und damit
							zusammenhängende Unterlagen und Informationen an Sie per E-Mail
							versendet werden? Wir weisen Sie darauf hin, dass bei einer
							Übersendung eine unberechtigte Kenntnisnahme Dritter vom Inhalt
							sowie eine Veränderung des Inhalts trotz ausreichender
							Vorkehrungen nicht ausgeschlossen werden kann.
						</p>
						<div className="mt-2 space-x-4">
							{["Ja", "Nein"].map((option) => (
								<label key={option} className="inline-flex items-center">
									<input
										type="radio"
										value={option === "Ja" ? "true" : "false"}
										disabled={readOnly}
										{...register("email_consent", {
											required: "Diese Angabe ist erforderlich",
										})}
										className="form-radio h-4 w-4 text-blue-600"
									/>
									<span className="ml-2 text-gray-700">{option}</span>
								</label>
							))}
						</div>
						{errors.email_consent && (
							<p className="text-red-500 text-sm mt-1">
								{errors.email_consent.message}
							</p>
						)}
					</div>

					{/* Appointment Reminder */}
					<div>
						<label className="block text-lg font-medium text-black-700">
							Terminerinnerung - Recall *
						</label>
						<p className="text-gray-700">
							Sind Sie damit einverstanden, dass wir Sie über eine ggf.
							notwendige Verlaufskontrolle erinnern?
						</p>
						<div className="mt-2 space-x-4">
							{["Ja", "Nein"].map((option) => (
								<label key={option} className="inline-flex items-center">
									<input
										type="radio"
										value={option === "Ja" ? "true" : "false"}
										disabled={readOnly}
										{...register("appointment_reminder_consent", {
											required: "Diese Angabe ist erforderlich",
										})}
										className="form-radio h-4 w-4 text-blue-600"
									/>
									<span className="ml-2 text-gray-700">{option}</span>
								</label>
							))}
						</div>
						{errors.appointment_reminder_consent && (
							<p className="text-red-500 text-sm mt-1">
								{errors.appointment_reminder_consent.message}
							</p>
						)}
					</div>

					{/* Request Reports */}
					<div>
						<label className="block text-lg font-medium text-black-700">
							Anforderung von Befunden *
						</label>
						<p className="text-gray-700">
							Sind Sie damit einverstanden, dass wir betreffende
							Behandlungsdaten und Befunde bei anderen Ärzten, Zahnärzten,
							Psychotherapeuten und sonstigen Leistungserbringern zum Zweck der
							Dokumentation und Behandlung anfordern?
						</p>
						<div className="mt-2 space-x-4">
							{["Ja", "Nein"].map((option) => (
								<label key={option} className="inline-flex items-center">
									<input
										type="radio"
										value={option === "Ja" ? "true" : "false"}
										disabled={readOnly}
										{...register("request_report_consent", {
											required: "Diese Angabe ist erforderlich",
										})}
										className="form-radio h-4 w-4 text-blue-600"
									/>
									<span className="ml-2 text-gray-700">{option}</span>
								</label>
							))}
						</div>
						{errors.request_report_consent && (
							<p className="text-red-500 text-sm mt-1">
								{errors.request_report_consent.message}
							</p>
						)}
					</div>

					{/* Transmit Reports */}
					<div>
						<label className="block text-lg font-medium text-black-700">
							Übermittlung von Befunden *
						</label>
						<p className="text-gray-700">
							Sind Sie damit einverstanden, dass wir betreffende
							Behandlungsdaten und Befunde durch die ALTA Klinik an andere
							Ärzte, Zahnärzte, Psychotherapeuten und sonstige
							Leistungserbringern zum Zweck der Dokumentation und Behandlung
							übermitteln?
						</p>
						<div className="mt-2 space-x-4">
							{["Ja", "Nein"].map((option) => (
								<label key={option} className="inline-flex items-center">
									<input
										type="radio"
										value={option === "Ja" ? "true" : "false"}
										disabled={readOnly}
										{...register("transmit_report_consent", {
											required: "Diese Angabe ist erforderlich",
										})}
										className="form-radio h-4 w-4 text-blue-600"
									/>
									<span className="ml-2 text-gray-700">{option}</span>
								</label>
							))}
						</div>
						{errors.transmit_report_consent && (
							<p className="text-red-500 text-sm mt-1">
								{errors.transmit_report_consent.message}
							</p>
						)}
					</div>

					{/* Data processing */}
					<div>
						<label className="block text-lg font-medium text-black-700">
							Anonymisierte Datenverarbeitung zu Forschungszwecken *
						</label>
						<p className="text-gray-700">
							Sind Sie damit einverstanden, dass Ihre personenbezogenen Daten
							von der ALTA Klinik in anonymisierter oder pseudonymisierter Form
							zu Zwecken klinisch wissenschaftlicher Untersuchungen
							weiterverarbeitet, an beteiligte Dritte weitergeleitet und
							veröffentlicht werden?
						</p>
						<div className="mt-2 space-x-4">
							{["Ja", "Nein"].map((option) => (
								<label key={option} className="inline-flex items-center">
									<input
										type="radio"
										value={option === "Ja" ? "true" : "false"}
										disabled={readOnly}
										{...register("data_processing_consent", {
											required: "Diese Angabe ist erforderlich",
										})}
										className="form-radio h-4 w-4 text-blue-600"
									/>
									<span className="ml-2 text-gray-700">{option}</span>
								</label>
							))}
						</div>
						{errors.data_processing_consent && (
							<p className="text-red-500 text-sm mt-1">
								{errors.data_processing_consent.message}
							</p>
						)}
					</div>
				</div>
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
					disabled={isSaving}
					className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
				>
					{isSaving ? "Wird gespeichert..." : "Speichern"}
				</button>
			</div>
		</form>
	);
};

export default PrivacyForm;
