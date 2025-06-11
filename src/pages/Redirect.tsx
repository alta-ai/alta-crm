import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface RedirectReason {
	code: string;
	title: string;
	message: string;
	icon: JSX.Element;
	actions: Array<{
		label: string;
		href?: string;
		action?: () => void;
		variant: "primary" | "secondary";
	}>;
}

const Redirect: React.FC = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const { userData } = useAuth();
	const [countdown, setCountdown] = useState(10);

	const reason = searchParams.get("reason") || "unauthorized";
	const returnUrl =
		searchParams.get("return") || userData?.default_route || "/home";

	// Countdown timer for auto-redirect
	useEffect(() => {
		if (reason === "session_expired" || reason === "token_expired") {
			const timer = setInterval(() => {
				setCountdown((prev) => {
					if (prev <= 1) {
						navigate("/login");
						return 0;
					}
					return prev - 1;
				});
			}, 1000);

			return () => clearInterval(timer);
		}
	}, [reason, navigate]);

	const redirectReasons: Record<string, RedirectReason> = {
		unauthorized: {
			code: "unauthorized",
			title: "Access Denied",
			message:
				"You don't have permission to access this page. Please contact your administrator if you believe this is an error.",
			icon: (
				<svg
					className="w-16 h-16 text-red-500"
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
			),
			actions: [
				{
					label: "Go to Dashboard",
					href: userData?.default_route || "/home",
					variant: "primary",
				},
				{
					label: "Contact Support",
					href: "mailto:support@altadicom.com",
					variant: "secondary",
				},
			],
		},

		insufficient_role: {
			code: "insufficient_role",
			title: "Insufficient Permissions",
			message: `Your current role (${
				userData?.role || "user"
			}) doesn't have the required permissions to access this page.`,
			icon: (
				<svg
					className="w-16 h-16 text-orange-500"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
					/>
				</svg>
			),
			actions: [
				{
					label: "Return to Dashboard",
					href: userData?.default_route || "/home",
					variant: "primary",
				},
				{
					label: "Request Access",
					href: "mailto:admin@altadicom.com?subject=Access Request",
					variant: "secondary",
				},
			],
		},

		session_expired: {
			code: "session_expired",
			title: "Session Expired",
			message:
				"Your session has expired for security reasons. You will be redirected to the login page shortly.",
			icon: (
				<svg
					className="w-16 h-16 text-yellow-500"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			),
			actions: [
				{
					label: "Login Now",
					action: () => navigate("/login"),
					variant: "primary",
				},
			],
		},

		token_expired: {
			code: "token_expired",
			title: "Access Token Expired",
			message:
				"Your access token has expired. Please log in again to continue.",
			icon: (
				<svg
					className="w-16 h-16 text-red-500"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
					/>
				</svg>
			),
			actions: [
				{
					label: "Login Again",
					action: () => navigate("/login"),
					variant: "primary",
				},
			],
		},

		maintenance: {
			code: "maintenance",
			title: "Maintenance Mode",
			message:
				"This feature is currently under maintenance. Please try again later or contact support if this is urgent.",
			icon: (
				<svg
					className="w-16 h-16 text-blue-500"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
					/>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
					/>
				</svg>
			),
			actions: [
				{
					label: "Go Back",
					action: () => window.history.back(),
					variant: "primary",
				},
				{
					label: "Contact Support",
					href: "mailto:support@altadicom.com",
					variant: "secondary",
				},
			],
		},

		not_found: {
			code: "not_found",
			title: "Page Not Found",
			message:
				"The page you're looking for doesn't exist or has been moved. Please check the URL or navigate to a different page.",
			icon: (
				<svg
					className="w-16 h-16 text-gray-500"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.476.901-6.074 2.379L12 21l5.074-3.621A7.962 7.962 0 0115 13.291V12a8 8 0 10-6 0v1.291z"
					/>
				</svg>
			),
			actions: [
				{
					label: "Go to Dashboard",
					href: userData?.default_route || "/home",
					variant: "primary",
				},
				{
					label: "Go Back",
					action: () => window.history.back(),
					variant: "secondary",
				},
			],
		},

		network_error: {
			code: "network_error",
			title: "Connection Error",
			message:
				"Unable to connect to the server. Please check your internet connection and try again.",
			icon: (
				<svg
					className="w-16 h-16 text-red-500"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
					/>
				</svg>
			),
			actions: [
				{
					label: "Try Again",
					action: () => window.location.reload(),
					variant: "primary",
				},
				{
					label: "Go to Dashboard",
					href: userData?.default_route || "/home",
					variant: "secondary",
				},
			],
		},
	};

	const currentReason = redirectReasons[reason] || redirectReasons.unauthorized;

	const handleAction = (action: RedirectReason["actions"][0]) => {
		if (action.action) {
			action.action();
		} else if (action.href) {
			if (action.href.startsWith("mailto:") || action.href.startsWith("http")) {
				window.open(action.href, "_blank");
			} else {
				navigate(action.href);
			}
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div className="text-center">
					{/* Icon */}
					<div className="flex justify-center mb-6">{currentReason.icon}</div>

					{/* Title */}
					<h1 className="text-3xl font-bold text-gray-900 mb-4">
						{currentReason.title}
					</h1>

					{/* Message */}
					<p className="text-gray-600 mb-8 leading-relaxed">
						{currentReason.message}
					</p>

					{/* Countdown for session expired */}
					{(reason === "session_expired" || reason === "token_expired") && (
						<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
							<div className="flex items-center">
								<svg
									className="w-5 h-5 text-yellow-500 mr-2"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
										clipRule="evenodd"
									/>
								</svg>
								<span className="text-sm text-yellow-800">
									Redirecting to login in {countdown} seconds...
								</span>
							</div>
						</div>
					)}

					{/* User Info */}
					{userData && (
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
							<div className="text-sm text-blue-800">
								<p>
									<strong>Current User:</strong> {userData.email}
								</p>
								<p>
									<strong>Role:</strong> {userData.role}
								</p>
							</div>
						</div>
					)}

					{/* Actions */}
					<div className="space-y-4">
						{currentReason.actions.map((action, index) => (
							<button
								key={index}
								onClick={() => handleAction(action)}
								className={`w-full px-6 py-3 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
									action.variant === "primary"
										? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
										: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-blue-500"
								}`}
							>
								{action.label}
							</button>
						))}
					</div>

					{/* Help Section */}
					<div className="mt-8 pt-6 border-t border-gray-200">
						<p className="text-sm text-gray-500 mb-4">
							Need help? Contact our support team
						</p>
						<div className="flex justify-center space-x-6 text-sm">
							<a
								href="mailto:support@altadicom.com"
								className="text-blue-600 hover:text-blue-500 flex items-center"
							>
								<svg
									className="w-4 h-4 mr-1"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
									<path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
								</svg>
								Email Support
							</a>
							<a
								href="tel:+1234567890"
								className="text-blue-600 hover:text-blue-500 flex items-center"
							>
								<svg
									className="w-4 h-4 mr-1"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
								</svg>
								Call Support
							</a>
						</div>
					</div>

					{/* Debug Info (only in development) */}
					{process.env.NODE_ENV === "development" && (
						<div className="mt-6 p-3 bg-gray-100 rounded text-xs text-left">
							<strong>Debug Info:</strong>
							<div>Reason: {reason}</div>
							<div>Return URL: {returnUrl}</div>
							<div>User Role: {userData?.role || "none"}</div>
							<div>Default Route: {userData?.default_route || "none"}</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Redirect;
