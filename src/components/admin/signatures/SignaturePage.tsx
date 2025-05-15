import React from "react";
import {
	SignaturePageHeader,
	PageHeader,
	NoRequestPage,
	SignatureDialog,
} from "./components";
import {
	useSignatureRequest,
	withSignatureRequest,
} from "./SignatureRequestContext";

const SignaturePage: React.FC = () => {
	const { hasOpenRequest } = useSignatureRequest();

	return (
		<div className="signature-page bg-gray-800 w-full h-screen p-2.5">
			<PageHeader />

			{hasOpenRequest ? (
				<div className="h-[100%] flex flex-col gap-[3vh] items-center px-[5%]">
					<SignaturePageHeader />
					<SignatureDialog />
				</div>
			) : (
				<NoRequestPage />
			)}
		</div>
	);
};

export default withSignatureRequest(SignaturePage);
