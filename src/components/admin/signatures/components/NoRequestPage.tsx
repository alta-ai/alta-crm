import React from "react";
import { useSignatureRequest } from "../SignatureRequestContext";

interface NoRequestPageProps {}

export const NoRequestPage: React.FC<NoRequestPageProps> = () => {
	const { refetch } = useSignatureRequest();

	return (
		<div className="flex flex-col justify-center items-center text-[3vh] h-[85%] text-white">
			<h2 className="mb-6">Keine offenen Formulare zum Unterschreiben</h2>
			<div
				className="flex items-center justify-center cursor-pointer bg-gray-900 opacity-70 border border-white rounded px-5 py-3 shadow-lg hover:text-blue-400"
				onClick={() => {
					refetch();
				}}
			>
				<p className="mr-2">Signaturanfrage erneut laden</p>
				<svg
					className="w-[5vh] h-[5vh]"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<path d="M23 4v6h-6"></path>
					<path d="M1 20v-6h6"></path>
					<path d="M3.51 9a9 9 0 0114.85-3.36L23 10"></path>
					<path d="M1 14l4.64 4.36A9 9 0 0020.49 15"></path>
				</svg>
			</div>
		</div>
	);
};
