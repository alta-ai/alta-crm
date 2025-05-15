import React from "react";
import { useSignatureRequest } from "../../SignatureRequestContext";
import { supabase } from "../../../../../lib/supabase";

interface ConsentProps {
	onNext: () => void;
	isShown?: boolean;
}

export const DataPrivacyImageConsent: React.FC<ConsentProps> = ({
	onNext,
	isShown,
}) => {
	const { signatureDetails } = useSignatureRequest();

	if (!isShown || !signatureDetails) {
		return null;
	}

	const sendAnswer = async (consentGiven: boolean) => {
		const { error } = await supabase
			.from("privacy_form_submissions")
			.update({
				foto_consent: consentGiven,
			})
			.eq("appointment_id", signatureDetails.appointment.id);

		if (error) {
			console.error("Error updating privacy form submission: ", error);
		}
	};

	return (
		<div className="flex flex-col text-white text-3xl mt-[15vh]">
			<span className="mb-5 text-4xl font-medium">
				Weitere Angaben in Bezug auf ihren Datenschutz
			</span>
			<span>
				Sind Sie damit einverstanden, dass intern ein Foto von Ihnen gespeichert
				wird?
			</span>

			<div className="flex mt-20 justify-center">
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
