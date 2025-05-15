import React, { useRef, useEffect, useState } from "react";
import SignaturePadWrapper from "react-signature-pad-wrapper";
import classNames from "classnames";

import { useSignatureRequest } from "../SignatureRequestContext";

interface SignaturePadProps {}

export const SignaturePad: React.FC<SignaturePadProps> = () => {
	const { activeSignatureIndex, onConfirmSignature, closeSignatureRequest } =
		useSignatureRequest();

	const sigPadRef = useRef<SignaturePadWrapper>(null);

	const [rendered, setRendered] = useState(false);
	const [isEmpty, setIsEmpty] = useState(true);

	useEffect(() => {
		if (!rendered) return;

		const signaturePad = sigPadRef.current?.instance;
		if (signaturePad) {
			signaturePad.addEventListener("beginStroke", () => {
				setIsEmpty(false);
			});
		}
	}, [rendered]);

	useEffect(() => {
		if (!sigPadRef.current || rendered) return;
		setRendered(true);
	}, [sigPadRef, rendered]);

	const onClear = () => {
		if (!rendered || !sigPadRef.current) return;
		sigPadRef.current.clear();
		setIsEmpty(true);
	};

	const cropSignatureCanvas = (
		canvas: HTMLCanvasElement,
		format: string
	): string => {
		// Create a duplicate canvas
		const croppedCanvas = document.createElement("canvas");
		const croppedCtx = croppedCanvas.getContext("2d");

		if (!croppedCtx) return "";

		croppedCanvas.width = canvas.width;
		croppedCanvas.height = canvas.height;
		croppedCtx.drawImage(canvas, 0, 0);

		// Find the bounds of the signature
		const w = croppedCanvas.width;
		const h = croppedCanvas.height;
		const pix = { x: [] as number[], y: [] as number[] };
		const imageData = croppedCtx.getImageData(0, 0, w, h);

		for (let y = 0; y < h; y++) {
			for (let x = 0; x < w; x++) {
				const index = (y * w + x) * 4;
				if (imageData.data[index + 3] > 0) {
					pix.x.push(x);
					pix.y.push(y);
				}
			}
		}

		// Sort the arrays
		pix.x.sort((a, b) => a - b);
		pix.y.sort((a, b) => a - b);

		// If there's no signature, return the original
		if (pix.x.length === 0) return canvas.toDataURL(format);

		const n = pix.x.length - 1;
		const cropW = pix.x[n] - pix.x[0];
		const cropH = pix.y[n] - pix.y[0];

		// Get the cropped signature
		const cut = croppedCtx.getImageData(pix.x[0], pix.y[0], cropW, cropH);

		croppedCanvas.width = cropW;
		croppedCanvas.height = cropH;
		croppedCtx.putImageData(cut, 0, 0);

		return croppedCanvas.toDataURL(format);
	};

	const onSubmit = () => {
		if (!rendered || !sigPadRef.current || isEmpty) return;

		const canvas = sigPadRef.current.canvas?.current;

		if (!canvas) return;

		const dataURL = cropSignatureCanvas(canvas, "image/png");

		onClear();

		// In a real application, you would implement this callback to handle form submission
		const transmitSignedFormCallback = async () => {
			console.log("Form signed and submitted");
			// Additional logic for form transmission
			return Promise.resolve();
		};

		// Confirm signature
		onConfirmSignature({
			signature: dataURL,
			callback: transmitSignedFormCallback,
		});
	};

	return (
		<div className="w-full h-[20vh] rounded">
			<div className="flex justify-between mt-5">
				<button
					className="bg-red-800 rounded px-8 py-2 text-white text-xl shadow-lg"
					onClick={onClear}
				>
					Signatur löschen
				</button>
				<button
					className={classNames(
						"bg-green-800 rounded px-8 py-2 text-white text-xl shadow-lg",
						{
							"opacity-20 pointer-events-none": isEmpty,
						}
					)}
					onClick={onSubmit}
				>
					Signatur bestätigen
				</button>
			</div>

			<div className="mt-2 border border-black w-full h-[70%] relative inline-block">
				<div className="relative z-10 w-full h-full">
					<SignaturePadWrapper
						options={{
							minWidth: 2.5,
							maxWidth: 5,
							penColor: "rgb(0, 35, 92)",
							throttle: 0,
							minDistance: 0,
						}}
						canvasProps={{
							className: "z-10 rounded bg-white w-full h-full",
						}}
						ref={sigPadRef}
					/>
				</div>
				<svg
					className="absolute bottom-[35px] left-[40px] w-10 h-10 opacity-20 z-20"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
				>
					<path
						d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
				{rendered && isEmpty && (
					<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl opacity-20 font-medium cursor-default pointer-events-none select-none z-20">
						Bitte hier unterschreiben!
					</div>
				)}
				<div className="absolute bottom-5 w-[calc(100%-50px)] left-1/2 transform -translate-x-1/2 border-b-2 border-black z-20"></div>
			</div>
		</div>
	);
};
