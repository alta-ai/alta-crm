import React from "react";
import { useSignatureRequest } from "../../SignatureRequestContext";
import { supabase } from "../../../../../lib/supabase";

interface ConsentProps {
	onNext: () => void;
	isShown?: boolean;
}

export const BiopsyCTConsent: React.FC<ConsentProps> = ({
	onNext,
	isShown,
}) => {
	const { signatureDetails, refetchFormData, activeSignatureIndex } =
		useSignatureRequest();

	if (!isShown || !signatureDetails) {
		return null;
	}

	const sendAnswer = async (consentGiven: boolean) => {
		const { error } = await supabase
			.from("biopsy_form_submissions")
			.update({
				consent_pelvis_ct: consentGiven,
			})
			.eq("appointment_id", signatureDetails.appointment.id);

		if (error) {
			console.error("Error updating biopsy form submission: ", error);
		}

		refetchFormData(activeSignatureIndex);
	};

	return (
		<div className="flex flex-col text-white text-2xl mt-3">
			<span className="mb-5 text-4xl font-medium">
				Computertomographie (CT) des Beckens
			</span>
			<p className="text-white">
				Für die gezielten Gewebeentnahmen unter MRT-Kontrolle nutzen wir den
				Zugangsweg über den Gesäßmuskel (transgluteal-transforaminal). Dieser
				Zugangsweg muss exakt geplant, gemessen und bestimmt werden, um die
				verdächtige(n) Stelle(n) in der Prostata gezielt biopsieren zu können.
				Dafür führen wir vorab eine Low-Dose (niedrig dosiert) CT-Untersuchung
				des Beckens durch. Diese Untersuchung funktioniert über Röntgenstrahlen
				und lässt – und das kann die MRT nicht leisten – eine klare Definition
				der Grenze zwischen Weichteilgewebe wie z.B. Bändern und den knöchernen
				Strukturen zu. Diese Untersuchung ist für die Bestimmung des
				Zugangsweges der Biopsie notwendig, damit keine Widerstände wie z. B.
				durch Verkalkungen hinderlich sind. Eine weitere Information, die uns
				die CT-Untersuchung des Beckens gibt, ist der Nachweis bzw. Ausschluss
				von Phlebolithen im periprostatischen Fettgewebe sowie Verkalkungen in
				den erfassten Schlagadern.
			</p>
			<p className="text-white mt-5">Stimmen Sie dem zu?</p>

			<div className="flex mt-20 font-bold">
				<button
					className="bg-green-800 rounded min-w-[250px] px-8 py-3 text-white text-2xl shadow-lg mr-4"
					onClick={() => {
						sendAnswer(true);
						onNext();
					}}
				>
					Ja
				</button>
				<button
					className="bg-red-800 rounded min-w-[250px] px-8 py-3 text-white text-2xl shadow-lg"
					onClick={() => {
						sendAnswer(false);
						onNext();
					}}
				>
					Nein
				</button>
			</div>
		</div>
	);
};
