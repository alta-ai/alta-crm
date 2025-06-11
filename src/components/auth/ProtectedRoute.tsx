import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";

interface ProtectedRouteProps {
	children: ReactNode;
	allowedRoles: ("admin" | "doctor")[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
	const { userData, isLoading } = useAuth();
	const location = useLocation();

	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
					<p className="mt-4 text-sm text-gray-600">Laden...</p>
				</div>
			</div>
		);
	}

	if (!userData) {
		console.log("[ProtectedRoute] No user, redirecting to login");
		// Redirect to login if not authenticated
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	if (!allowedRoles.includes(userData.role)) {
		console.log("[ProtectedRoute] User role not allowed, redirecting");
		// Redirect based on role
		const redirectPath = "/redirect";
		return <Navigate to={redirectPath} replace />;
	}

	console.log(
		"[ProtectedRoute] User authenticated and authorized, rendering children"
	);
	return <>{children}</>;
}

export default ProtectedRoute;
