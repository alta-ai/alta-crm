import React, { useContext, useEffect, ReactNode } from "react";
import Chart from "chart.js/auto";
import { Document } from "@react-pdf/renderer";
import { v4 as uuidv4 } from "uuid";

import { useFormData } from "./formDataContext";
import { createPSADiagram } from "../resources/PSADiagram";
import { useForceUpdate } from "./useForceRerender";

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
				referenceDate: patientData.birth_date,
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
