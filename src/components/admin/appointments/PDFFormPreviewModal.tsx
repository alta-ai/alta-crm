import React, { useEffect } from "react";
import { X, Download, ExternalLink, FileText } from "lucide-react";
import { PDFViewer, pdf } from "@react-pdf/renderer";

import { FormDataProvider } from "../../pdf/contexts/formDataContext";
import { Patient, Appointment } from "../../types";
import { useFormContext } from "../../forms/formContext";
import { useForceUpdate } from "../../pdf/contexts";
import { FormType } from "../../types/constants";
import { FormMap } from "./details/formMap";

interface PDFFormPreviewModalProps {
	onClose: () => void;
	formType: FormType;
	patientData: Patient;
	appointmentData: Appointment;
}

interface DataContext {
	submission: {
		created_at: Date;
		updated_at: Date;
	};
}

const PDFFormPreviewModal: React.FC<PDFFormPreviewModalProps> = ({
	onClose,
	formType,
	patientData,
	appointmentData,
}) => {
	const forceUpdate = useForceUpdate();
	const { isLoading, data } = useFormContext<DataContext>();

	const {
		pdfForm: Form,
		customContexts: CustomContexts,
		label: formName,
	} = FormMap[formType];

	const patientName = `${patientData.title ? patientData.title + " " : ""}${
		patientData.first_name
	} ${patientData.last_name}`;

	useEffect(() => {
		document.addEventListener("renderPSADiagramFinished", forceUpdate);
		return () => {
			document.removeEventListener("renderPSADiagramFinished", forceUpdate);
		};
	}, []);

	// Funktion zum Öffnen des PDFs in einem neuen Tab
	const openInNewTab = () => {
		// Ein temporäres Window-Objekt öffnen
		const newWindow = window.open("", "_blank", "width=800,height=800");

		if (!newWindow) {
			alert(
				"Bitte erlauben Sie Popups für diese Seite, um die PDF-Vorschau zu öffnen."
			);
			return;
		}

		// HTML für das neue Fenster vorbereiten
		newWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>PDF Vorschau - ${patientName}</title>
        <style>
          body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
          iframe { width: 100%; height: 100vh; border: none; }
          .loading { display: flex; justify-content: center; align-items: center; height: 100vh; }
        </style>
      </head>
      <body>
        <div id="pdf-container" class="loading">
          <p>PDF wird geladen...</p>
        </div>
      </body>
      </html>
    `);

		// Die PDF in einem iframe in dem neuen Fenster anzeigen
		// Hier würden wir normalerweise die PDF generieren und anzeigen
		// In diesem Fall zeigen wir einfach eine Nachricht an, dass dies in der vollständigen Implementierung erfolgen würde
		setTimeout(() => {
			if (newWindow && !newWindow.closed) {
				// In einer vollständigen Implementierung würde hier die PDF-URL übergeben werden
				const pdfContainer = newWindow.document.getElementById("pdf-container");
				if (pdfContainer) {
					pdfContainer.innerHTML = '<iframe src="about:blank"></iframe>';
				}
			}
		}, 500);
	};

	// Funktion zum Herunterladen des PDFs
	const handleDownload = async () => {
		try {
			// PDF erstellen
			const pdfDoc = pdf(
				<FormDataProvider
					initialFormData={data?.submission}
					initialPatientData={patientData}
					initialAppointmentData={appointmentData}
				>
					<Form />
				</FormDataProvider>
			);

			// PDF als Blob erzeugen
			const blob = await pdfDoc.toBlob();

			// Download-Link erzeugen
			const url = URL.createObjectURL(blob);
			const link = window.document.createElement("a");
			link.href = url;
			link.download = `Anmeldeformular_${patientName.replace(/\s+/g, "_")}.pdf`;
			window.document.body.appendChild(link);
			link.click();
			window.document.body.removeChild(link);
			URL.revokeObjectURL(url);
		} catch (err: any) {
			console.error("Error downloading PDF:", err);
			alert(
				"Fehler beim Herunterladen des PDFs: " +
					(err.message || "Unbekannter Fehler")
			);
		}
	};

	// Helper function to nest multiple context providers
	const nestContexts = (
		contexts: React.FC<{ children?: React.ReactNode }>[] | undefined,
		children: React.ReactNode
	): React.ReactNode => {
		return contexts
			? contexts.reduceRight((acc, Context) => {
					return <Context {...{ formType }}>{acc}</Context>;
			  }, children)
			: children;
	};

	if (isLoading) {
		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
				<div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[85vh] flex items-center justify-center">
					<p className="text-gray-500">Lade PDF...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[85vh] flex flex-col">
				<div className="flex items-center justify-between p-4 border-b">
					<div>
						<h2 className="text-lg font-semibold text-gray-900 flex items-center">
							<FileText className="h-5 w-5 mr-2 text-gray-500" />
							{formName}
						</h2>
						<p className="text-sm text-gray-500 mt-1">Patient: {patientName}</p>
					</div>
					<div className="flex items-center space-x-2">
						<button
							onClick={handleDownload}
							className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
							title="Herunterladen"
						>
							<Download className="h-5 w-5" />
						</button>
						<button
							onClick={openInNewTab}
							className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
							title="In neuem Tab öffnen"
						>
							<ExternalLink className="h-5 w-5" />
						</button>
						<button
							onClick={onClose}
							className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
						>
							<X className="h-5 w-5" />
						</button>
					</div>
				</div>

				{/* PDF Viewer */}
				<div className="flex-1 overflow-hidden">
					<PDFViewer style={{ width: "100%", height: "100%" }}>
						<FormDataProvider
							initialFormData={data?.submission}
							initialPatientData={patientData}
							initialAppointmentData={appointmentData}
						>
							{nestContexts(CustomContexts, <Form />)}
						</FormDataProvider>
					</PDFViewer>
				</div>
			</div>
		</div>
	);
};

export default PDFFormPreviewModal;
