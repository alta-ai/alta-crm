import React, { useEffect } from "react";
import { ComponentArrayRenderer } from "./CustomSignatureContent";
import {
	SignatureStages,
	useSignatureRequest,
} from "../SignatureRequestContext";
import { SignaturePad } from "./SignaturePad";
import { CustomPDFViewer } from "../../../pdf/customPDFViewer";
import { FormDataProvider, useForceUpdate } from "../../../pdf/contexts";
import {
	FormMap,
	nestContexts,
} from "../../appointments/details/formSection/formMap";
import { FormType } from "../../../types/constants";

export const SignatureDialog: React.FC = () => {
	const forceUpdate = useForceUpdate();

	const {
		signatureDetails,
		activeSignatureIndex,
		onFinishSignatureStage,
		closeSignatureRequest,
		getCustomComponents,
		signatureStage,
		setSignatureStage,
	} = useSignatureRequest();

	const CustomComponents = getCustomComponents();

	useEffect(() => {
		document.addEventListener("renderPSADiagramFinished", forceUpdate);
		return () => {
			document.removeEventListener("renderPSADiagramFinished", forceUpdate);
		};
	}, []);

	if (activeSignatureIndex === -1) {
		return (
			<div id="signature-pad" className="w-full h-[40vh] rounded">
				<div className="flex flex-col h-full items-center justify-center text-[3vh] text-white">
					<span className="mb-10">
						Keine offenen Dokumente zum Unterschreiben
					</span>
					<div
						className="flex items-center justify-center w-3/4 bg-gray-900 opacity-70 border border-white rounded px-3 py-2 shadow-lg shadow-black text-xl cursor-pointer hover:text-blue-400"
						onClick={closeSignatureRequest}
					>
						Zurück zur Übersicht
					</div>
				</div>
			</div>
		);
	}

	if (signatureStage === SignatureStages.BEFORE) {
		return (
			<ComponentArrayRenderer
				components={CustomComponents.before}
				finishedRenderingHook={() =>
					setSignatureStage(SignatureStages.SIGNATURE)
				}
			/>
		);
	}

	if (signatureStage === SignatureStages.SIGNATURE) {
		const formType = signatureDetails?.forms[activeSignatureIndex].form
			.form_type as FormType;

		const { pdfForm: Form, customContexts: CustomContexts } = FormMap[formType];

		const PDFDocument = (
			<FormDataProvider
				initialFormData={signatureDetails?.forms[activeSignatureIndex].data}
				initialPatientData={signatureDetails?.patient}
				initialAppointmentData={signatureDetails?.appointment}
			>
				{nestContexts(CustomContexts, formType, <Form />)}
			</FormDataProvider>
		);

		return (
			<>
				<CustomPDFViewer value={PDFDocument} />
				<SignaturePad />

				<canvas
					style={{ display: "none", maxWidth: "400px", maxHeight: "200px" }}
					id="render-canvas-chart"
				/>
			</>
		);
	}

	if (signatureStage === SignatureStages.AFTER) {
		return (
			<ComponentArrayRenderer
				components={CustomComponents.after}
				finishedRenderingHook={() => {
					setSignatureStage(SignatureStages.AFTER);
					onFinishSignatureStage();
				}}
			/>
		);
	}

	return null;
};
