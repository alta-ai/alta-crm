import React, { useContext, useEffect, ReactNode } from "react";

import { useFormData } from "./formDataContext";
import { createPSADiagram } from "../resources/PSADiagram";

const PSADiagramContext = React.createContext<{ chart: string | null } | null>(
	null
);

export const PSADiagramContextProvider = ({
	children,
}: {
	children: ReactNode;
}) => {
	const { formData, patientData } = useFormData();
	const [finishedRendering, setFinishedRendering] = React.useState(false);

	const canvasElement = document.getElementById(
		"render-canvas-chart"
	) as HTMLCanvasElement | null;

	useEffect(() => {
		if (formData) {
			createPSADiagram({
				formData,
				setFinishedRendering,
				referenceDate: patientData.birth_date as Date,
			});
		}
	}, [formData]);

	useEffect(() => {
		if (finishedRendering) {
			document.dispatchEvent(new Event("renderPSADiagramFinished"));
		}
	}, [finishedRendering]);

	return (
		<PSADiagramContext.Provider
			value={{
				chart: canvasElement?.toDataURL("image/png") || null,
			}}
		>
			{children}
		</PSADiagramContext.Provider>
	);
};

export const usePSADiagram = () => {
	return useContext(PSADiagramContext);
};
