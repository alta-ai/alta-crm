import React, { useState } from "react";
import {
	generateFormInputToken,
	type GenerateTokenRequest,
} from "../lib/supabase";

interface TokenData {
	appointment_id: string;
	examination_id: string;
	expiration_hours: number;
}

const CreateToken: React.FC = () => {
	const [formData, setFormData] = useState<TokenData>({
		appointment_id: "",
		examination_id: "",
		expiration_hours: 24,
	});
	const [generatedToken, setGeneratedToken] = useState<string>("");
	const [generatedUrl, setGeneratedUrl] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>("");

	const generateToken = async () => {
		setLoading(true);
		setError("");

		try {
			if (!formData.appointment_id.trim() || !formData.examination_id.trim()) {
				throw new Error("Both Appointment ID and Examination ID are required");
			}

			// Call the utility function to generate the token
			const tokenRequest: GenerateTokenRequest = {
				appointment_id: formData.appointment_id.trim(),
				examination_id: formData.examination_id.trim(),
				expiration_hours: formData.expiration_hours,
			};

			const token = await generateFormInputToken(tokenRequest);

			// Generate full URL
			const baseUrl = window.location.origin;
			const fullUrl = `${baseUrl}/form-input?token=${encodeURIComponent(
				token
			)}`;

			setGeneratedToken(token);
			setGeneratedUrl(fullUrl);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to generate token");
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: name === "expiration_hours" ? parseInt(value) || 1 : value,
		}));
	};

	const copyToClipboard = async (text: string, type: string) => {
		try {
			await navigator.clipboard.writeText(text);
			// You could add a toast notification here
			alert(`${type} copied to clipboard!`);
		} catch (err) {
			console.error("Failed to copy:", err);
			alert("Failed to copy to clipboard");
		}
	};

	const clearForm = () => {
		setFormData({
			appointment_id: "",
			examination_id: "",
			expiration_hours: 24,
		});
		setGeneratedToken("");
		setGeneratedUrl("");
		setError("");
	};

	return (
		<div className="create-token min-h-screen bg-gray-50 py-8">
			<div className="container mx-auto px-4 max-w-4xl">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">
						Token Generator
					</h1>
					<p className="text-gray-600">
						Create secure access tokens for external form access
					</p>
				</div>

				<div className="bg-white shadow-lg rounded-lg overflow-hidden">
					{/* Form Section */}
					<div className="p-6 border-b border-gray-200">
						<h2 className="text-xl font-semibold text-gray-800 mb-6">
							Token Configuration
						</h2>

						<div className="grid md:grid-cols-2 gap-6">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Appointment ID <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									name="appointment_id"
									value={formData.appointment_id}
									onChange={handleInputChange}
									placeholder="Enter appointment ID"
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									required
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Examination ID <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									name="examination_id"
									value={formData.examination_id}
									onChange={handleInputChange}
									placeholder="Enter examination ID"
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									required
								/>
							</div>

							<div className="md:col-span-2">
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Token Expiration (hours)
								</label>
								<input
									type="number"
									name="expiration_hours"
									value={formData.expiration_hours}
									onChange={handleInputChange}
									min="1"
									max="168"
									className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								/>
								<p className="text-sm text-gray-500 mt-1">
									Token will expire in {formData.expiration_hours} hours (max
									168 hours/7 days)
								</p>
							</div>
						</div>

						{error && (
							<div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
								<div className="flex items-center">
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
									<span>{error}</span>
								</div>
							</div>
						)}

						<div className="flex gap-4 mt-6">
							<button
								onClick={generateToken}
								disabled={loading}
								className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
							>
								{loading ? (
									<>
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
										Generating...
									</>
								) : (
									<>
										<svg
											className="w-4 h-4 mr-2"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
											/>
										</svg>
										Generate Token
									</>
								)}
							</button>

							<button
								onClick={clearForm}
								className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
							>
								Clear
							</button>
						</div>
					</div>

					{/* Results Section */}
					{generatedToken && (
						<div className="p-6">
							<h3 className="text-lg font-semibold text-gray-800 mb-4">
								Generated Token & URL
							</h3>

							<div className="space-y-4">
								{/* Token */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Secure Token
									</label>
									<div className="flex">
										<input
											type="text"
											value={generatedToken}
											readOnly
											className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-l-lg font-mono text-sm"
										/>
										<button
											onClick={() => copyToClipboard(generatedToken, "Token")}
											className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-r-lg transition-colors"
										>
											Copy
										</button>
									</div>
								</div>

								{/* Full URL */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Complete Access URL
									</label>
									<div className="flex">
										<input
											type="text"
											value={generatedUrl}
											readOnly
											className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-l-lg font-mono text-sm"
										/>
										<button
											onClick={() => copyToClipboard(generatedUrl, "URL")}
											className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg transition-colors"
										>
											Copy URL
										</button>
									</div>
								</div>

								{/* Test Link */}
								<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm font-medium text-blue-800">
												Test the generated link
											</p>
											<p className="text-sm text-blue-600">
												Open the form in a new tab to verify access
											</p>
										</div>
										<a
											href={generatedUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
										>
											Test Link
										</a>
									</div>
								</div>

								{/* Token Info */}
								<div className="bg-gray-50 rounded-lg p-4">
									<h4 className="font-medium text-gray-800 mb-2">
										Token Information
									</h4>
									<div className="text-sm text-gray-600 space-y-1">
										<p>
											• Appointment ID:{" "}
											<span className="font-mono">
												{formData.appointment_id}
											</span>
										</p>
										<p>
											• Examination ID:{" "}
											<span className="font-mono">
												{formData.examination_id}
											</span>
										</p>
										<p>
											• Expires:{" "}
											{new Date(
												Date.now() + formData.expiration_hours * 3600 * 1000
											).toLocaleString()}
										</p>
										<p>• Security: HMAC-SHA256 signed with secret key</p>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default CreateToken;
