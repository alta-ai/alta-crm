import React from "react";
import { PDFViewer, Document } from "@react-pdf/renderer";

interface PDFPreviewProps {
	document: React.ReactElement<typeof Document>;
	fileName?: string;
	contexts?: Array<(child: React.ReactElement) => React.ReactElement>; // Array of functions to wrap the document
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({
	document,
	contexts = [], // Default to an empty array
}) => {
	// Wrap the document with all provided context functions
	const wrappedDocument = contexts.reduceRight<React.ReactElement>(
		(child, wrapContext) => wrapContext(child),
		document
	);

	return (
		<div className="flex flex-col h-[calc(100vh-200px)]">
			{/* PDF Viewer */}
			<div className="flex-1 bg-gray-100">
				<PDFViewer style={{ width: "100%", height: "100%" }}>
					{wrappedDocument}
				</PDFViewer>
			</div>
		</div>
	);
};
