import { useEffect, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { pdfjs, Document, Page } from "react-pdf";
import { useAsync } from "react-use";

import PageNavigator from "./PageNavigator";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useWindowSize } from "../contexts";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
	"pdfjs-dist/build/pdf.worker.min.mjs",
	import.meta.url
).toString();

interface PDFViewerProps {
	value: any | null;
}

const PDFViewer = ({ value }: PDFViewerProps) => {
	const { height: windowHeight } = useWindowSize();

	const [numPages, setNumPages] = useState(0);
	const [currentPage, setCurrentPage] = useState(0);

	const [previousRenderValue, setPreviousRenderValue] = useState(null);

	const render = useAsync(async () => {
		if (!value) return null;

		const blob = await pdf(value).toBlob();
		console.log("Blob", blob);

		const url = URL.createObjectURL(blob);

		return url;
	}, [value, windowHeight]);

	const onPreviousPage = () => {
		setCurrentPage((prev) => prev - 1);
	};

	const onNextPage = () => {
		setCurrentPage((prev) => prev + 1);
	};

	const onDocumentLoad = (d) => {
		if (!isFirstRendering) return;
		setNumPages(d.numPages);
		setCurrentPage((prev) => Math.min(prev, d.numPages));
	};

	const isFirstRendering = !previousRenderValue;

	const isLatestValueRendered = previousRenderValue === render.value;
	const isBusy = render.loading || !isLatestValueRendered;

	const shouldShowTextLoader = isFirstRendering && isBusy;
	const shouldShowPreviousDocument = !isFirstRendering && isBusy;

	return (
		<div className="flex flex-col relative flex-1 h-[55%] text-white">
			<div
				className={`absolute inset-0 flex items-center justify-center z-[1000] transition-opacity duration-1000 
					${
						shouldShowTextLoader
							? "opacity-100 pointer-events-auto"
							: "opacity-0 pointer-events-none"
					}
					`}
			>
				PDF wird gerendert...
			</div>

			<div
				className={`absolute inset-0 flex items-center justify-center bg-white z-[1000] transition-opacity duration-1000 
					${
						!render.loading && !value
							? "opacity-100 pointer-events-auto"
							: "opacity-0 pointer-events-none"
					}`}
			>
				Keine valides PDF-Datei gefunden
			</div>

			{!render.loading && value && (
				<>
					<div className="flex flex-row p-4 gap-6 z-[500] items-center justify-between overflow-x-auto">
						<Document
							key={render.value}
							className={`${
								shouldShowPreviousDocument ? "absolute" : ""
							} [&.previous-document_canvas]:opacity-50 [&.rendering-document_.react-pdf__Page]:shadow-none`}
							file={render.value}
							loading={null}
							onLoadSuccess={onDocumentLoad}
						>
							<Page
								key={2 * currentPage + 1}
								pageNumber={2 * currentPage + 1}
								onRenderSuccess={() => setPreviousRenderValue(render.value)}
								className="shadow-lg"
								height={windowHeight * 0.5}
							/>
						</Document>
						{2 * currentPage + 2 <= numPages && (
							<Document
								key={render.value}
								className={`${
									shouldShowPreviousDocument ? "absolute" : ""
								} [&.previous-document_canvas]:opacity-50 [&.rendering-document_.react-pdf__Page]:shadow-none`}
								file={render.value}
								loading={null}
								onLoadSuccess={onDocumentLoad}
							>
								<Page
									key={2 * currentPage + 2}
									pageNumber={2 * currentPage + 2}
									onRenderSuccess={() => setPreviousRenderValue(render.value)}
									height={windowHeight * 0.5}
									className="shadow-lg"
								/>
							</Document>
						)}
					</div>

					<PageNavigator
						currentPage={currentPage}
						numPages={numPages}
						onNextPage={onNextPage}
						onPreviousPage={onPreviousPage}
					/>
				</>
			)}
		</div>
	);
};

export default PDFViewer;
