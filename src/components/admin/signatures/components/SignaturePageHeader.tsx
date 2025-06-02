import React from "react";
import classNames from "classnames";
import { useSignatureRequest } from "../SignatureRequestContext";
import {
	deriveDisplayedFullName,
	formatDate,
	formatDateString,
} from "../../../pdf/utils";

interface SignatureProgressBarProps {}

const SignatureProgressBar: React.FC<SignatureProgressBarProps> = () => {
	const { signatureDetails, activeSignatureIndex } = useSignatureRequest();

	if (!signatureDetails) return null;

	return (
		<div className="flex flex-wrap gap-y-2.5 text-[1.5vh] mt-2.5 border border-white p-1.5 rounded">
			{signatureDetails.forms.map((_f, index) => (
				<div key={_f.form.name} className="flex items-center font-light">
					<span
						className={classNames("mr-10", {
							"text-green-500": _f.signed,
							"text-red-500": !_f.completed,
							"text-white/30": !_f.needsSignature,
							"font-extrabold border-b-[3px] border-white":
								activeSignatureIndex === index,
						})}
					>
						{_f.form.name}
					</span>
					{signatureDetails.forms.length !== index + 1 && (
						<div className="h-full mr-[70px] relative">
							<div className="absolute left-[-40px] top-1/2 transform -translate-y-1/2 rotate-45 aspect-square h-[calc(100%/1.26)] border-t-2 border-r-2 border-white"></div>
						</div>
					)}
				</div>
			))}
		</div>
	);
};

interface SignaturePageHeaderProps {}

export const SignaturePageHeader: React.FC<SignaturePageHeaderProps> = () => {
	const { signatureDetails, closeSignatureRequest } = useSignatureRequest();

	if (!signatureDetails) return null;

	return (
		<div className="mt-[75px] w-full text-white relative align-top">
			<div className="absolute left-1/2 transform -translate-x-1/2 top-[-4vh]">
				<div className="text-[3vh] font-bold">Unterschriften</div>
			</div>

			<div
				className="absolute top-[-4vh] right-0 text-[2vh] border-b border-white cursor-pointer font-extralight hover:font-bold"
				onClick={closeSignatureRequest}
			>
				Zurück zur Übersicht
			</div>

			<div className="bg-gray-600 rounded p-2.5 text-[1.5vh] mt-5">
				<div>
					<span className="inline-block w-[350px]">Name des Patienten:</span>
					<span className="font-bold">
						{deriveDisplayedFullName({
							title: signatureDetails.patient.title || undefined,
							name: signatureDetails.patient.first_name,
							surname: signatureDetails.patient.last_name,
						})}
					</span>
				</div>
				<div>
					<span className="inline-block w-[350px]">Geburtsdatum:</span>
					<span className="font-bold">
						{formatDate(signatureDetails.patient.birth_date)}
					</span>
				</div>
				<div>
					<span className="inline-block w-[350px]">Untersuchungsdatum:</span>
					<span className="font-bold">
						{formatDate(signatureDetails.appointment.start_time)}
					</span>
				</div>
			</div>

			<SignatureProgressBar />
		</div>
	);
};
