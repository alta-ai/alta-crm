import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { validateFormInputToken, type DecodedToken } from "../lib/supabase";

const FormInput: React.FC = () => {
	const [searchParams] = useSearchParams();
	const [decodedData, setDecodedData] = useState<DecodedToken | null>(null);
	const [error, setError] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		const token = searchParams.get("token");

		if (!token) {
			setError("No access token provided in URL");
			setLoading(false);
			return;
		}

		validateFormInputToken(token)
			.then((data) => {
				setDecodedData(data);
			})
			.catch((err) => {
				setError(err.message);
			})
			.finally(() => {
				setLoading(false);
			});
	}, [searchParams]);

	if (loading) {
		return (
			<div className="form-input flex items-center justify-center min-h-screen bg-gray-50">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<div className="text-lg text-gray-700">Verifying access token...</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="form-input flex items-center justify-center min-h-screen bg-gray-50">
				<div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md shadow-lg">
					<div className="flex items-center mb-2">
						<svg
							className="w-5 h-5 mr-2"
							fill="currentColor"
							viewBox="0 0 20 20"
						>
							<path
								fillRule="evenodd"
								d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
								clipRule="evenodd"
							/>
						</svg>
						<strong className="font-bold">Access Denied</strong>
					</div>
					<span className="block">{error}</span>
					<div className="mt-3 text-sm text-red-600">
						Please ensure you have a valid access link or contact support if you
						believe this is an error.
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="form-input min-h-screen bg-gray-50 py-8">
			<div className="container mx-auto px-4 max-w-4xl">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">
						Medical Form Access
					</h1>
					<p className="text-gray-600">Secure external access portal</p>
				</div>

				<div className="bg-white shadow-lg rounded-lg overflow-hidden">
					{/* Header with verification status */}
					<div className="bg-green-50 border-b border-green-200 px-6 py-4">
						<div className="flex items-center">
							<svg
								className="w-5 h-5 text-green-500 mr-2"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clipRule="evenodd"
								/>
							</svg>
							<span className="text-green-800 font-medium">
								Access Verified (Server-Side)
							</span>
						</div>
					</div>

					<div className="p-6">
						{/* Session Information */}
						{decodedData && (
							<div className="mb-8">
								<h2 className="text-xl font-semibold text-gray-800 mb-4">
									Session Information
								</h2>
								<div className="grid md:grid-cols-2 gap-4">
									<div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
										<label className="block text-sm font-medium text-blue-700 mb-1">
											Appointment ID
										</label>
										<p className="text-lg font-mono text-blue-900">
											{decodedData.appointment_id}
										</p>
									</div>

									<div className="bg-green-50 border border-green-200 p-4 rounded-lg">
										<label className="block text-sm font-medium text-green-700 mb-1">
											Examination ID
										</label>
										<p className="text-lg font-mono text-green-900">
											{decodedData.examination_id}
										</p>
									</div>
								</div>
							</div>
						)}

						{/* Form Section */}
						<div className="border-t pt-6">
							<h3 className="text-lg font-semibold text-gray-800 mb-4">
								Patient Information Form
							</h3>
							<div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
								<p className="text-gray-600 mb-4">
									Welcome! This secure form allows you to provide information
									for your upcoming appointment without needing to register an
									account.
								</p>

								{/* Placeholder for actual form */}
								<div className="space-y-4">
									<div className="text-sm text-gray-500 italic border-l-4 border-blue-300 pl-4 py-2">
										📝 Form implementation placeholder
										<br />
										<span className="text-xs">
											Add your form fields here based on appointment_id:{" "}
											{decodedData?.appointment_id}
											<br />
											and examination_id: {decodedData?.examination_id}
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default FormInput;
