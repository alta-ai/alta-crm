import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { X, Info, Calendar, MapPin, Monitor, Search } from "lucide-react";
import { Link } from "react-router-dom";
import PatientForm from "./PatientForm";

interface AppointmentBookingModalProps {
	isOpen: boolean;
	onClose: () => void;
	selectedSlot: Date;
	deviceId: string;
	onConfirm: () => void;
	isRescheduling?: boolean;
	appointmentToReschedule?: any;
	referringDoctorId?: string;
}

interface ExaminationWithPrices {
	id: string;
	name: string;
	duration: number;
	self_payer_without_contrast: number;
	self_payer_with_contrast: number;
	private_patient_without_contrast: number;
	private_patient_with_contrast: number;
	foreign_patient_without_contrast: number;
	foreign_patient_with_contrast: number;
}

interface InsuranceProvider {
	id: string;
	name: string;
}

interface Device {
	id: string;
	name: string;
	location_devices: Array<{
		location: {
			id: string;
			name: string;
		};
	}>;
}

type BillingType =
	| "self_payer"
	| "private_patient"
	| "foreign_patient"
	| "work_accident";

const BILLING_TYPE_LABELS: Record<BillingType, string> = {
	self_payer: "Selbstzahler",
	private_patient: "Privatpatient",
	foreign_patient: "Ausländischer Patient",
	work_accident: "Arbeitsunfall (Berufsgenossenschaft)",
};

const AppointmentBookingModal = ({
	isOpen,
	onClose,
	selectedSlot,
	deviceId,
	onConfirm,
	isRescheduling = false,
	appointmentToReschedule,
}: AppointmentBookingModalProps) => {
	const [step, setStep] = useState<"examination" | "patient" | "confirm">(
		"examination"
	);
	const [selectedExamination, setSelectedExamination] = useState<string>("");
	const [withContrastMedium, setWithContrastMedium] = useState(false);
	const [billingType, setBillingType] = useState<BillingType>("self_payer");
	const [insuranceProviderId, setInsuranceProviderId] = useState<string>("");
	const [hasBeihilfe, setHasBeihilfe] = useState<boolean | null>(null);
	const [hasTransfer, setHasTransfer] = useState<boolean | null>(null);
	const [referringDoctorId, setReferringDoctorId] = useState<string>("");
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [isSearchingDoctors, setIsSearchingDoctors] = useState(false);
	const [doctorSearchResults, setDoctorSearchResults] = useState<Array<any>>(
		[]
	);
	const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
	const [patientId, setPatientId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	// Get default appointment status
	const { data: defaultStatus } = useQuery({
		queryKey: ["defaultAppointmentStatus"],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("appointment_statuses")
				.select("id")
				.eq("name", "Geplant")
				.single();

			if (error) throw error;
			return data;
		},
	});

	// Initialize form with existing appointment data if rescheduling
	useEffect(() => {
		if (isRescheduling && appointmentToReschedule) {
			setSelectedExamination(appointmentToReschedule.examination.id);
			setWithContrastMedium(
				appointmentToReschedule.patient_data?.with_contrast_medium || false
			);
			setBillingType(appointmentToReschedule.billing_type as BillingType);
			setInsuranceProviderId(
				appointmentToReschedule.insurance_provider_id || ""
			);
			setHasBeihilfe(
				appointmentToReschedule.patient_data?.has_beihilfe || null
			);
			setHasTransfer(
				appointmentToReschedule.patient_data?.has_transfer || null
			);
			setPatientId(appointmentToReschedule.patient.id);
			setStep("confirm");

			// Überweiser-ID holen, falls vorhanden
			const fetchReferringDoctor = async () => {
				if (appointmentToReschedule.id) {
					const { data } = await supabase
						.from("appointment_referring_doctors")
						.select("referring_doctor_id")
						.eq("appointment_id", appointmentToReschedule.id)
						.maybeSingle();

					if (data && data.referring_doctor_id) {
						setReferringDoctorId(data.referring_doctor_id);
					}
				}
			};

			fetchReferringDoctor();
		}
	}, [isRescheduling, appointmentToReschedule]);

	// Lade den ausgewählten Arzt, wenn eine ID gesetzt wird
	useEffect(() => {
		if (referringDoctorId) {
			const fetchDoctorDetails = async () => {
				try {
					const { data, error } = await supabase
						.from("referring_doctors")
						.select(
							"id, title, first_name, last_name, specialty:medical_specialties(name), street, house_number, postal_code, city"
						)
						.eq("id", referringDoctorId)
						.single();

					if (error) throw error;
					if (data) {
						setSelectedDoctor(data);
					}
				} catch (err) {
					console.error("Error fetching doctor details:", err);
				}
			};

			// Wenn der Arzt nicht in den Suchergebnissen ist
			if (!doctorSearchResults.find((d) => d.id === referringDoctorId)) {
				fetchDoctorDetails();
			} else {
				setSelectedDoctor(
					doctorSearchResults.find((d) => d.id === referringDoctorId)
				);
			}
		} else {
			setSelectedDoctor(null);
		}
	}, [referringDoctorId, doctorSearchResults]);

	// Query examinations that can be performed on the selected device
	const { data: examinations } = useQuery({
		queryKey: [
			"examinations",
			deviceId,
			isRescheduling,
			appointmentToReschedule?.examination?.id,
		],
		queryFn: async () => {
			let query = supabase.from("examinations").select(`
          id,
          name,
          duration,
          self_payer_without_contrast,
          self_payer_with_contrast,
          private_patient_without_contrast,
          private_patient_with_contrast,
          foreign_patient_without_contrast,
          foreign_patient_with_contrast,
          examination_devices!inner(device_id)
        `);

			if (isRescheduling) {
				// Bei Umplanung: check sowohl die examination ID als auch device compatibility
				query = query
					.eq("id", appointmentToReschedule.examination.id)
					.eq("examination_devices.device_id", deviceId);
			} else {
				// Für neue Termine nach device filtern
				query = query.eq("examination_devices.device_id", deviceId);
			}

			query = query.order("name");

			const { data, error } = await query;
			if (error) throw error;

			if (data.length === 0 && isRescheduling) {
				// Fallback: Wenn die Untersuchung nicht für das neue Gerät verfügbar ist,
				// zeige zumindest die aktuelle Untersuchung an
				const { data: fallbackData, error: fallbackError } = await supabase
					.from("examinations")
					.select(
						`
            id,
            name,
            duration,
            self_payer_without_contrast,
            self_payer_with_contrast,
            private_patient_without_contrast,
            private_patient_with_contrast,
            foreign_patient_without_contrast,
            foreign_patient_with_contrast
          `
					)
					.eq("id", appointmentToReschedule.examination.id)
					.single();

				if (fallbackError) throw fallbackError;
				return [fallbackData] as ExaminationWithPrices[];
			}

			return data as ExaminationWithPrices[];
		},
	});

	const { data: insuranceProviders } = useQuery({
		queryKey: ["insuranceProviders"],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("insurance_providers")
				.select("*")
				.order("name");

			if (error) throw error;
			return data as InsuranceProvider[];
		},
	});

	const { data: device } = useQuery({
		queryKey: ["device", deviceId],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("devices")
				.select(
					`
          id,
          name,
          location_devices(
            location:locations(
              id,
              name
            )
          )
        `
				)
				.eq("id", deviceId)
				.single();

			if (error) throw error;
			return data as Device;
		},
	});

	const selectedExaminationData = examinations?.find(
		(e) => e.id === selectedExamination
	);
	const location = device?.location_devices[0]?.location;

	const getPrice = () => {
		if (!selectedExaminationData || billingType === "work_accident")
			return null;

		const priceKey = `${billingType}_${
			withContrastMedium ? "with" : "without"
		}_contrast` as keyof ExaminationWithPrices;
		return selectedExaminationData[priceKey];
	};

	// Funktion zum Suchen von Überweisern
	const searchDoctors = async (term: string) => {
		if (term.length < 3) {
			setDoctorSearchResults([]);
			return;
		}

		setIsSearchingDoctors(true);
		try {
			const { data, error } = await supabase
				.from("referring_doctors")
				.select(
					"id, title, first_name, last_name, specialty:medical_specialties(name), street, house_number, postal_code, city"
				)
				.or(`first_name.ilike.%${term}%,last_name.ilike.%${term}%`)
				.order("last_name, first_name")
				.limit(10);

			if (error) throw error;
			setDoctorSearchResults(data || []);
		} catch (err) {
			console.error("Error searching doctors:", err);
		} finally {
			setIsSearchingDoctors(false);
		}
	};

	const handlePatientComplete = async (patientId: string) => {
		try {
			setError(null);

			if (!selectedExaminationData) {
				throw new Error("Keine Untersuchung ausgewählt");
			}

			if (!defaultStatus?.id) {
				throw new Error("Kein Standard-Status gefunden");
			}

			const startTimeISO = selectedSlot.toISOString();
			const endTimeISO = new Date(
				selectedSlot.getTime() + (selectedExaminationData.duration || 0) * 60000
			).toISOString();

			let appointmentId;

			if (isRescheduling) {
				// Update existing appointment
				const { error: updateError } = await supabase
					.from("appointments")
					.update({
						device_id: deviceId,
						location_id: location?.id,
						examination_id: selectedExamination,
						start_time: startTimeISO,
						end_time: endTimeISO,
						billing_type: billingType,
						insurance_provider_id:
							billingType === "private_patient" ? insuranceProviderId : null,
						patient_data: {
							with_contrast_medium: withContrastMedium,
							has_beihilfe: hasBeihilfe,
							has_transfer: hasTransfer,
						},
						previous_appointment_date: appointmentToReschedule.start_time,
					})
					.eq("id", appointmentToReschedule.id);

				if (updateError) throw updateError;

				appointmentId = appointmentToReschedule.id;
			} else {
				// Create new appointment
				const { data: newAppointment, error: createError } = await supabase
					.from("appointments")
					.insert({
						device_id: deviceId,
						location_id: location?.id,
						examination_id: selectedExamination,
						start_time: startTimeISO,
						end_time: endTimeISO,
						status_id: defaultStatus.id,
						patient_id: patientId,
						billing_type: billingType,
						insurance_provider_id:
							billingType === "private_patient" ? insuranceProviderId : null,
						patient_data: {
							with_contrast_medium: withContrastMedium,
							has_beihilfe: hasBeihilfe,
							has_transfer: hasTransfer,
						},
					})
					.select("id")
					.single();

				if (createError) {
					console.error("Error creating appointment:", createError);
					throw createError;
				}

				appointmentId = newAppointment.id;
			}

			// Überweiser-Verknüpfung aktualisieren
			if (referringDoctorId) {
				if (isRescheduling) {
					// Alte Verknüpfung löschen
					await supabase
						.from("appointment_referring_doctors")
						.delete()
						.eq("appointment_id", appointmentId);
				}

				// Neue Verknüpfung erstellen
				const { error: referringDoctorError } = await supabase
					.from("appointment_referring_doctors")
					.insert({
						appointment_id: appointmentId,
						referring_doctor_id: referringDoctorId,
					});

				if (referringDoctorError) throw referringDoctorError;
			}

			onConfirm();
		} catch (err: any) {
			console.error("Error creating/updating appointment:", err);
			setError(
				err.message ||
					"Der Termin konnte nicht gespeichert werden. Bitte versuchen Sie es später erneut."
			);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
				<div className="flex items-center justify-between p-4 border-b">
					<h2 className="text-lg font-semibold text-gray-900">
						{isRescheduling ? "Termin verschieben" : "Termin buchen"}
					</h2>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-500"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				<div className="p-4">
					{error && (
						<div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
							<div className="flex">
								<div className="ml-3">
									<p className="text-sm text-red-700">{error}</p>
								</div>
							</div>
						</div>
					)}

					{/* Appointment Details */}
					<div className="mb-6 bg-gray-50 rounded-lg p-4 space-y-3">
						<div className="flex items-center text-sm text-gray-600">
							<Calendar className="h-5 w-5 text-gray-400 mr-2" />
							{format(selectedSlot, "EEEE, d. MMMM yyyy 'um' HH:mm 'Uhr'", {
								locale: de,
							})}
						</div>
						{location && (
							<div className="flex items-center text-sm text-gray-600">
								<MapPin className="h-5 w-5 text-gray-400 mr-2" />
								{location.name}
							</div>
						)}
						{device && (
							<div className="flex items-center text-sm text-gray-600">
								<Monitor className="h-5 w-5 text-gray-400 mr-2" />
								{device.name}
							</div>
						)}
						{selectedExaminationData && (
							<div className="text-sm text-gray-600 pl-7">
								{selectedExaminationData.name} (
								{selectedExaminationData.duration} Minuten)
							</div>
						)}
						{selectedDoctor && (
							<div className="text-sm text-gray-600 pl-7">
								Überweiser: {selectedDoctor.title} {selectedDoctor.first_name}{" "}
								{selectedDoctor.last_name}
							</div>
						)}
					</div>

					{isRescheduling ? (
						<div className="space-y-6">
							<div className="bg-white rounded-lg border border-gray-200 p-4">
								<h3 className="text-sm font-medium text-gray-900 mb-4">
									Termin bestätigen
								</h3>
								<div className="space-y-2">
									<p className="text-sm text-gray-600">
										<span className="font-medium">Patient:</span>{" "}
										{appointmentToReschedule.patient.first_name}{" "}
										{appointmentToReschedule.patient.last_name}
									</p>
									<p className="text-sm text-gray-600">
										<span className="font-medium">Untersuchung:</span>{" "}
										{appointmentToReschedule.examination.name}
									</p>
									<p className="text-sm text-gray-600">
										<span className="font-medium">Abrechnungsart:</span>{" "}
										{BILLING_TYPE_LABELS[appointmentToReschedule.billing_type]}
									</p>
									{selectedDoctor && (
										<p className="text-sm text-gray-600">
											<span className="font-medium">Überweiser:</span>{" "}
											{selectedDoctor.title} {selectedDoctor.first_name}{" "}
											{selectedDoctor.last_name}
										</p>
									)}
								</div>
							</div>

							<div className="flex justify-end space-x-3">
								<button
									type="button"
									onClick={onClose}
									className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
								>
									Abbrechen
								</button>
								<button
									onClick={() =>
										handlePatientComplete(appointmentToReschedule.patient.id)
									}
									className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
								>
									Termin verschieben
								</button>
							</div>
						</div>
					) : (
						<div className="space-y-6">
							{/* Regular booking form content */}
							{step === "examination" ? (
								<div className="space-y-6">
									{/* Examination Selection */}
									<div>
										<label className="block text-sm font-medium text-gray-700">
											Untersuchung
										</label>
										<div className="grid grid-cols-1 gap-2">
											{examinations?.map((examination) => (
												<button
													key={examination.id}
													onClick={() => setSelectedExamination(examination.id)}
													className={`
                            px-4 py-3 rounded-lg border-2 text-left transition-colors
                            ${
															selectedExamination === examination.id
																? "border-blue-500 bg-blue-50 text-blue-700"
																: "border-gray-200 hover:border-gray-300 text-gray-700"
														}
                          `}
												>
													<div className="font-medium">{examination.name}</div>
													<div className="text-sm text-gray-500">
														Dauer: {examination.duration} Minuten
													</div>
												</button>
											))}
										</div>
									</div>

									{/* Transfer Question */}
									{selectedExamination && (
										<div>
											<label className="block text-sm font-medium text-gray-700">
												Kommen Sie auf Überweisung? *
											</label>
											<div className="space-x-4">
												{["Ja", "Nein"].map((option) => (
													<label
														key={option}
														className="inline-flex items-center"
													>
														<input
															type="radio"
															checked={hasTransfer === (option === "Ja")}
															onChange={() => setHasTransfer(option === "Ja")}
															className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
														/>
														<span className="ml-2 text-sm text-gray-700">
															{option}
														</span>
													</label>
												))}
											</div>
										</div>
									)}

									{/* Überweisender Arzt */}
									{hasTransfer && (
										<div>
											<label className="block text-sm font-medium text-gray-700">
												Überweisender Arzt *
											</label>
											<div className="mt-1">
												{referringDoctorId ? (
													// Ausgewählter Überweiser
													<div className="flex items-center justify-between p-2 border rounded-md">
														<div>
															{selectedDoctor ? (
																<>
																	<div className="text-sm font-medium">
																		{selectedDoctor.title}{" "}
																		{selectedDoctor.first_name}{" "}
																		{selectedDoctor.last_name}
																	</div>
																	<div className="text-xs text-gray-500">
																		{selectedDoctor.specialty?.name}
																	</div>
																</>
															) : (
																"Arzt wird geladen..."
															)}
														</div>
														<button
															type="button"
															onClick={() => setReferringDoctorId("")}
															className="text-gray-400 hover:text-gray-500"
														>
															<X className="h-4 w-4" />
														</button>
													</div>
												) : (
													// Suchfeld
													<div>
														<div className="relative">
															<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
																<Search className="h-5 w-5 text-gray-400" />
															</div>
															<input
																type="text"
																value={searchTerm}
																onChange={(e) => {
																	setSearchTerm(e.target.value);
																	searchDoctors(e.target.value);
																}}
																placeholder="Nach Namen suchen..."
																className="block w-full pl-10 pr-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
															/>
															{searchTerm && (
																<button
																	type="button"
																	onClick={() => {
																		setSearchTerm("");
																		setDoctorSearchResults([]);
																	}}
																	className="absolute inset-y-0 right-0 pr-3 flex items-center"
																>
																	<X className="h-4 w-4 text-gray-400 hover:text-gray-500" />
																</button>
															)}
														</div>

														{/* Suchergebnisse */}
														{isSearchingDoctors ? (
															<div className="mt-1 p-2 text-sm text-gray-500">
																Suche läuft...
															</div>
														) : doctorSearchResults.length > 0 ? (
															<div className="mt-1 border rounded-md max-h-60 overflow-y-auto">
																<ul className="divide-y divide-gray-200">
																	{doctorSearchResults.map((doctor) => (
																		<li
																			key={doctor.id}
																			className="p-2 hover:bg-gray-50 cursor-pointer"
																			onClick={() => {
																				setReferringDoctorId(doctor.id);
																				setSelectedDoctor(doctor);
																				setSearchTerm("");
																				setDoctorSearchResults([]);
																			}}
																		>
																			<div className="text-sm font-medium">
																				{doctor.title} {doctor.first_name}{" "}
																				{doctor.last_name}
																			</div>
																			<div className="text-xs text-gray-500">
																				{doctor.specialty.name}
																			</div>
																			<div className="text-xs text-gray-500 mt-1">
																				{doctor.street} {doctor.house_number},{" "}
																				{doctor.postal_code} {doctor.city}
																			</div>
																		</li>
																	))}
																</ul>
															</div>
														) : searchTerm.length > 2 ? (
															<div className="mt-1 p-2 text-sm text-gray-500">
																Keine Ergebnisse gefunden.
																<Link
																	to="/admin/referring-doctors/new"
																	className="ml-1 text-blue-600 hover:text-blue-800"
																>
																	Neuen Überweiser anlegen
																</Link>
															</div>
														) : searchTerm.length > 0 ? (
															<div className="mt-1 p-2 text-sm text-gray-500">
																Bitte mindestens 3 Zeichen eingeben...
															</div>
														) : null}
													</div>
												)}
											</div>
										</div>
									)}

									{/* Contrast Medium Option */}
									{selectedExamination && billingType !== "work_accident" && (
										<div>
											<label className="block text-sm font-medium text-gray-700">
												Kontrastmittel
											</label>
											<div className="space-y-2">
												<label className="flex items-center">
													<input
														type="radio"
														checked={!withContrastMedium}
														onChange={() => setWithContrastMedium(false)}
														className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
													/>
													<span className="ml-2 text-sm text-gray-700">
														Ohne Kontrastmittel
													</span>
												</label>
												<label className="flex items-center">
													<input
														type="radio"
														checked={withContrastMedium}
														onChange={() => setWithContrastMedium(true)}
														className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
													/>
													<span className="ml-2 text-sm text-gray-700">
														Mit Kontrastmittel
													</span>
												</label>
											</div>
										</div>
									)}

									{/* Billing Type Selection */}
									{selectedExamination && (
										<div>
											<label className="block text-sm font-medium text-gray-700">
												Abrechnungsart
											</label>
											<div className="space-y-2">
												{(
													Object.entries(BILLING_TYPE_LABELS) as [
														BillingType,
														string
													][]
												).map(([value, label]) => (
													<label key={value} className="flex items-center">
														<input
															type="radio"
															checked={billingType === value}
															onChange={() => {
																setBillingType(value);
																if (value !== "private_patient") {
																	setInsuranceProviderId("");
																	setHasBeihilfe(null);
																}
															}}
															className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
														/>
														<span className="ml-2 text-sm text-gray-700">
															{label}
														</span>
													</label>
												))}
											</div>
										</div>
									)}

									{/* Insurance Provider Selection */}
									{selectedExamination && billingType === "private_patient" && (
										<>
											<div>
												<label className="block text-sm font-medium text-gray-700">
													Private Krankenversicherung
												</label>
												<select
													value={insuranceProviderId}
													onChange={(e) =>
														setInsuranceProviderId(e.target.value)
													}
													className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
												>
													<option value="">Bitte wählen</option>
													{insuranceProviders?.map((provider) => (
														<option key={provider.id} value={provider.id}>
															{provider.name}
														</option>
													))}
												</select>
											</div>

											{/* Beihilfe Question */}
											<div>
												<label className="block text-sm font-medium text-gray-700">
													Sind Sie Beihilfe berechtigt? *
												</label>
												<div className="space-x-4">
													{["Ja", "Nein"].map((option) => (
														<label
															key={option}
															className="inline-flex items-center"
														>
															<input
																type="radio"
																checked={hasBeihilfe === (option === "Ja")}
																onChange={() => setHasBeihilfe(option === "Ja")}
																className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
															/>
															<span className="ml-2 text-sm text-gray-700">
																{option}
															</span>
														</label>
													))}
												</div>
											</div>
										</>
									)}

									{/* Price Display */}
									{selectedExamination && billingType !== "work_accident" && (
										<div className="bg-gray-50 p-4 rounded-lg">
											<div className="flex items-start">
												<Info className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
												<div>
													<p className="text-sm font-medium text-gray-900">
														Preis:{" "}
														{new Intl.NumberFormat("de-DE", {
															style: "currency",
															currency: "EUR",
														}).format(getPrice() || 0)}
													</p>
													<p className="text-sm text-gray-500 mt-1">
														{withContrastMedium
															? "Preis inklusive Kontrastmittel"
															: "Preis ohne Kontrastmittel"}
													</p>
												</div>
											</div>
										</div>
									)}

									{/* Work Accident Info */}
									{selectedExamination && billingType === "work_accident" && (
										<div className="bg-yellow-50 p-4 rounded-lg">
											<div className="flex items-start">
												<Info className="h-5 w-5 text-yellow-500 mt-0.5 mr-2" />
												<div>
													<p className="text-sm font-medium text-yellow-800">
														Arbeitsunfall (Berufsgenossenschaft)
													</p>
													<p className="text-sm text-yellow-700 mt-1">
														Die Abrechnung erfolgt direkt mit der zuständigen
														Berufsgenossenschaft.
													</p>
												</div>
											</div>
										</div>
									)}

									<div className="flex justify-end">
										<button
											onClick={() => setStep("patient")}
											disabled={
												!selectedExamination ||
												hasTransfer === null ||
												(hasTransfer && !referringDoctorId) ||
												(billingType === "private_patient" &&
													(!insuranceProviderId || hasBeihilfe === null))
											}
											className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
										>
											Weiter
										</button>
									</div>
								</div>
							) : (
								<PatientForm onComplete={handlePatientComplete} />
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default AppointmentBookingModal;
