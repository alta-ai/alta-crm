import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

interface Appointment {
	id: string;
	location_id: string | null;
	device_id: string | null;
	examination_id: string | null;
	start_time: string;
	end_time: string;
	created_at: string | null;
	updated_at: string | null;
	patient_id: string | null;
	billing_type: string;
	previous_appointment_id: string | null;
	status_id: string;
	body_side: string | null;
	has_transfer: boolean | null;
	referring_doctor: string | null;
	with_contrast_medium: boolean | null;
}

const TestComponent: React.FC = () => {
	const [appointments, setAppointments] = useState<Appointment[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchAppointments = async () => {
		try {
			setLoading(true);
			const { data, error } = await supabase
				.from("appointments")
				.select("*")
				.order("start_time", { ascending: true });

			if (error) {
				throw error;
			}

			setAppointments(data || []);
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchAppointments();

		const testDB1 = async () => {
			const { data: debugInfo } = await supabase.rpc("debug_rls_issue");
			console.log("Debug Info:", debugInfo);
			const { data: hookInfo } = await supabase.rpc("check_auth_hook_config");
			console.log("Auth Hook Info:", hookInfo);

			const { data: testData } = await supabase
				.from("debug_test_table")
				.select("*");
			console.log("Test Data (should work):", testData);

			const { data: roleAssignment } = await supabase.rpc(
				"assign_admin_role_to_current_user"
			);
			console.log("Role Assignment:", roleAssignment);

			const { data: rolesData, error } = await supabase
				.from("roles")
				.select("*");
			console.log("Roles Data:", rolesData, "Error:", error);
		};

		const testDB2 = async () => {
			// First, refresh the session to get updated JWT claims
			const { error: refreshError } = await supabase.auth.refreshSession();
			if (refreshError) {
				console.error("Refresh error:", refreshError);
			} else {
				console.log("Session refreshed successfully");
			}

			// Wait a moment for the refresh to complete
			await new Promise((resolve) => setTimeout(resolve, 1000));

			const { data: debugInfo } = await supabase.rpc("debug_rls_issue");
			console.log("Debug Info:", debugInfo);

			// ... rest of your existing test code
		};

		testDB2();
	}, []);

	if (loading) {
		return <div className="p-4">Loading appointments...</div>;
	}

	if (error) {
		return <div className="p-4 text-red-600">Error: {error}</div>;
	}

	return (
		<div className="p-6">
			<h2 className="text-2xl font-bold mb-4">Appointments</h2>

			{appointments.length === 0 ? (
				<p className="text-gray-500">No appointments found.</p>
			) : (
				<div className="overflow-x-auto">
					<table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Patient ID
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Start Time
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									End Time
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Billing Type
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Status ID
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Referring Doctor
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{appointments.map((appointment) => (
								<tr key={appointment.id} className="hover:bg-gray-50">
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
										{appointment.patient_id || "N/A"}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{new Date(appointment.start_time).toLocaleString()}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{new Date(appointment.end_time).toLocaleString()}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{appointment.billing_type}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{appointment.status_id}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{appointment.referring_doctor || "N/A"}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			<button
				onClick={fetchAppointments}
				className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
			>
				Refresh
			</button>
		</div>
	);
};

export default TestComponent;
