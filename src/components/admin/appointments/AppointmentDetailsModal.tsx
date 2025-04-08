import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { supabase } from "../../../lib/supabase";
import { cn } from "../../../lib/utils";
import AppointmentDetails from "./details/AppointmentDetails";
import AppointmentComments from "./details/AppointmentComments";
import DocumentUpload from "./DocumentUpload";
import ReferringDoctorSection from "./ReferringDoctorSection";
import ReportSection from "./ReportSection";
import FormSection from "./details/FormSection";
import PatientPhotoModal from "./details/PatientPhotoModal";
import { Appointment } from "../../pdf/types";

export interface AppointmentDetailsProps {
	appointment: Appointment;
	onReschedule: () => void;
	refetchAppointments?: () => void;
}

const AppointmentDetailsModal: React.FC<
	AppointmentDetailsProps & {
		isOpen: boolean;
		onClose: () => void;
	}
> = ({ isOpen, onClose, appointment, onReschedule, refetchAppointments }) => {
	const [activeTab, setActiveTab] = useState<
		| "details"
		| "forms"
		| "documents"
		| "comments"
		| "referringDoctor"
		| "report"
	>("details");
	const [error, setError] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [currentStatusId, setCurrentStatusId] = useState(appointment.status.id);
	const [isStatusChanging, setIsStatusChanging] = useState(false);
	const [showPhotoModal, setShowPhotoModal] = useState(false);
	const queryClient = useQueryClient();

	// Fetch appointment statuses
	const { data: statuses } = useQuery({
		queryKey: ["appointmentStatuses"],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("appointment_statuses")
				.select("*")
				.order("name");

			if (error) throw error;
			return data;
		},
	});

	// Load patient photo
	const { data: patientPhoto } = useQuery({
		queryKey: ["patient-photo", appointment.patient.id],
		queryFn: async () => {
			try {
				const { data, error } = await supabase
					.from("patient_photos")
					.select("photo_data")
					.eq("patient_id", appointment.patient.id)
					.eq("active", true)
					.maybeSingle();

				if (error) {
					console.error("Fehler beim Laden des Patientenfotos:", error);
					return null;
				}

				return data?.photo_data || null;
			} catch (err) {
				console.error("Fehler bei der Foto-Abfrage:", err);
				return null;
			}
		},
		retry: false,
		staleTime: 60000,
	});

	// Lade vollständige Patientendaten inkl. Geburtsdatum
	const { data: patientData } = useQuery({
		queryKey: ["patient-details", appointment.patient.id],
		queryFn: async () => {
			try {
				const { data, error } = await supabase
					.from("patients")
					.select("*")
					.eq("id", appointment.patient.id)
					.single();

				if (error) {
					console.error("Fehler beim Laden der Patientendaten:", error);
					return null;
				}

				return data;
			} catch (err) {
				console.error("Fehler bei der Patientendaten-Abfrage:", err);
				return null;
			}
		},
		retry: false,
		staleTime: 60000,
	});

	const handleCancel = async () => {
		try {
			setIsDeleting(true);
			setError(null);

			const { error } = await supabase
				.from("appointments")
				.update({
					status_id: (
						await supabase
							.from("appointment_statuses")
							.select("id")
							.eq("name", "Storniert")
							.single()
					).data?.id,
				})
				.eq("id", appointment.id);

			if (error) throw error;

			refetchAppointments?.();
			onClose();
		} catch (error: any) {
			console.error("Error cancelling appointment:", error);
			setError(
				"Der Termin konnte nicht storniert werden. Bitte versuchen Sie es später erneut."
			);
		} finally {
			setIsDeleting(false);
		}
	};

	const handleStatusChange = async (statusId: string) => {
		try {
			setIsStatusChanging(true);
			setError(null);
			setCurrentStatusId(statusId);

			const { error } = await supabase
				.from("appointments")
				.update({ status_id: statusId })
				.eq("id", appointment.id);

			if (error) throw error;

			refetchAppointments?.();
		} catch (error: any) {
			console.error("Error updating appointment status:", error);
			setError("Der Status konnte nicht aktualisiert werden");
			setCurrentStatusId(appointment.status.id);
		} finally {
			setIsStatusChanging(false);
		}
	};

	if (!isOpen) return null;

	const currentStatus = statuses?.find((s) => s.id === currentStatusId);

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
				<div className="flex items-center justify-between p-4 border-b">
					<div className="flex items-center space-x-4">
						<h2 className="text-lg font-semibold text-gray-900">
							Termin Details
						</h2>
						<div className="border-l border-gray-200 pl-4">
							<nav className="flex space-x-4">
								<button
									onClick={() => setActiveTab("details")}
									className={cn(
										"px-3 py-2 text-sm font-medium rounded-md",
										activeTab === "details"
											? "bg-gray-100 text-gray-900"
											: "text-gray-500 hover:text-gray-700"
									)}
								>
									Details
								</button>
								<button
									onClick={() => setActiveTab("forms")}
									className={cn(
										"px-3 py-2 text-sm font-medium rounded-md",
										activeTab === "forms"
											? "bg-gray-100 text-gray-900"
											: "text-gray-500 hover:text-gray-700"
									)}
								>
									Formulare
								</button>
								<button
									onClick={() => setActiveTab("documents")}
									className={cn(
										"px-3 py-2 text-sm font-medium rounded-md",
										activeTab === "documents"
											? "bg-gray-100 text-gray-900"
											: "text-gray-500 hover:text-gray-700"
									)}
								>
									Dokumente
								</button>
								<button
									onClick={() => setActiveTab("comments")}
									className={cn(
										"px-3 py-2 text-sm font-medium rounded-md",
										activeTab === "comments"
											? "bg-gray-100 text-gray-900"
											: "text-gray-500 hover:text-gray-700"
									)}
								>
									Kommentare
								</button>
								<button
									onClick={() => setActiveTab("referringDoctor")}
									className={cn(
										"px-3 py-2 text-sm font-medium rounded-md",
										activeTab === "referringDoctor"
											? "bg-gray-100 text-gray-900"
											: "text-gray-500 hover:text-gray-700"
									)}
								>
									Überweiser
								</button>
								<button
									onClick={() => setActiveTab("report")}
									className={cn(
										"px-3 py-2 text-sm font-medium rounded-md",
										activeTab === "report"
											? "bg-gray-100 text-gray-900"
											: "text-gray-500 hover:text-gray-700"
									)}
								>
									Befund
								</button>
							</nav>
						</div>
					</div>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-500"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				<div className="p-4">
					{/* Einheitlicher Header für alle Tabs außer Details */}
					{activeTab !== "details" && (
						<div className="bg-gray-50 p-3 rounded-md mb-6">
							<p className="text-sm font-medium text-gray-800">
								{`${appointment.patient.name} ${appointment.patient.surname}`},
								geb.:{" "}
								{patientData?.birth_date
									? format(new Date(patientData.birth_date), "dd.MM.yyyy", {
											locale: de,
									  })
									: "Unbekannt"}{" "}
								- {appointment.examination?.name || "Untersuchung"} am{" "}
								{format(new Date(appointment.timing.start), "dd.MM.yyyy", {
									locale: de,
								})}{" "}
								in der {appointment.location.name || "ALTA Klinik Bielefeld"}
							</p>
						</div>
					)}

					{activeTab === "details" ? (
						<AppointmentDetails
							appointment={appointment}
							error={error}
							setError={setError}
							isDeleting={isDeleting}
							handleCancel={handleCancel}
							handleStatusChange={handleStatusChange}
							currentStatus={currentStatus}
							isStatusChanging={isStatusChanging}
							statuses={statuses || []}
							onReschedule={onReschedule}
							patientPhoto={patientPhoto}
							setShowPhotoModal={setShowPhotoModal}
						/>
					) : activeTab === "forms" ? (
						<FormSection
							appointment={appointment}
							onPhotoUpdated={() => {
								queryClient.invalidateQueries({
									queryKey: ["patient-photo", appointment.patient.id],
								});
							}}
						/>
					) : activeTab === "documents" ? (
						<DocumentUpload appointmentId={appointment.id} />
					) : activeTab === "comments" ? (
						<AppointmentComments appointmentId={appointment.id} />
					) : activeTab === "referringDoctor" ? (
						<ReferringDoctorSection
							appointmentId={appointment.id}
							onUpdateComplete={() => {
								queryClient.invalidateQueries({
									queryKey: ["appointment-referring-doctor", appointment.id],
								});
								if (refetchAppointments) {
									refetchAppointments();
								}
							}}
						/>
					) : (
						<ReportSection
							appointmentId={appointment.id}
							patientId={appointment.patient.id}
						/>
					)}
				</div>
			</div>

			{/* Photo Modal */}
			{showPhotoModal && patientPhoto && (
				<PatientPhotoModal
					photoUrl={patientPhoto}
					onClose={() => setShowPhotoModal(false)}
				/>
			)}
		</div>
	);
};

export default AppointmentDetailsModal;
