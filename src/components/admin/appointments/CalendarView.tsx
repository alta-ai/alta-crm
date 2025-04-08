import React, { useState, useEffect, useRef } from "react";
import {
	format,
	addDays,
	startOfWeek,
	endOfWeek,
	eachDayOfInterval,
	addWeeks,
	subWeeks,
	startOfMonth,
	endOfMonth,
	addMonths,
	subMonths,
	setMinutes,
	setHours,
	isSameDay,
	parseISO,
	isToday,
} from "date-fns";
import { z } from "zod";
import { de } from "date-fns/locale";
import {
	ChevronLeft,
	ChevronRight,
	ZoomIn,
	ZoomOut,
	CalendarDays,
	Calendar,
	Grid3X3,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";
import { cn } from "../../../lib/utils";
import AppointmentBookingModal from "./AppointmentBookingModal";
import AppointmentDetailsModal from "./AppointmentDetailsModal";
import { Appointment, AppointmentSchema } from "../../pdf/types";

interface Device {
	id: string;
	name: string;
	location_devices?: Array<{
		location: {
			id: string;
			name: string;
		};
	}>;
}

interface DeviceWorkingHours {
	day_of_week: number;
	start_time: string;
	end_time: string;
}

interface DeviceWorkingHoursException {
	start_date: string;
	end_date: string;
	start_time: string | null;
	end_time: string | null;
	reason: string;
}

interface CalendarViewProps {
	viewMode: "day" | "week" | "workweek" | "month";
	onViewModeChange?: (mode: "day" | "week" | "workweek" | "month") => void;
	selectedDevices: string[];
	devices: Device[];
	isRescheduling?: boolean;
	appointmentToReschedule?: any;
	onRescheduleStart?: (appointment: any) => void;
	onRescheduleComplete?: () => void;
	onSlotSelect?: (slot: Date, deviceId: string) => void;
	selectedSlot?: Date | null;
	selectedDeviceForReschedule?: string | null;
	currentDate?: Date;
	onDateChange?: (date: Date) => void;
	hideNavigation?: boolean;
	zoomLevel?: number;
	onScrollRef?: (ref: HTMLDivElement | null) => void;
	onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

const HOURS = Array.from({ length: 25 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

// Vordefinierte Farben für verschiedene Geräte
const DEVICE_COLORS = [
	{ bg: "bg-green-100", border: "border-green-200", text: "text-green-800" },
	{ bg: "bg-blue-100", border: "border-blue-200", text: "text-blue-800" },
	{ bg: "bg-purple-100", border: "border-purple-200", text: "text-purple-800" },
	{ bg: "bg-amber-100", border: "border-amber-200", text: "text-amber-800" },
	{ bg: "bg-rose-100", border: "border-rose-200", text: "text-rose-800" },
	{ bg: "bg-cyan-100", border: "border-cyan-200", text: "text-cyan-800" },
	{ bg: "bg-lime-100", border: "border-lime-200", text: "text-lime-800" },
	{ bg: "bg-indigo-100", border: "border-indigo-200", text: "text-indigo-800" },
];

const hideScrollbarStyles = `
  .hide-scrollbar {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
`;

const CalendarView = ({
	viewMode,
	onViewModeChange,
	selectedDevices,
	devices,
	isRescheduling = false,
	appointmentToReschedule,
	onRescheduleStart,
	onRescheduleComplete,
	onSlotSelect,
	selectedSlot,
	selectedDeviceForReschedule,
	currentDate: externalCurrentDate,
	onDateChange,
	hideNavigation = false,
	zoomLevel: externalZoomLevel,
	onScrollRef,
	onScroll,
}: CalendarViewProps) => {
	const [internalCurrentDate, setInternalCurrentDate] = useState(new Date());
	const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
	const [selectedAppointment, setSelectedAppointment] =
		useState<Appointment | null>(null);
	const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
	const [internalZoomLevel, setInternalZoomLevel] = useState(80);
	const scrollContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!document.getElementById("hide-scrollbar-styles")) {
			const styleElement = document.createElement("style");
			styleElement.id = "hide-scrollbar-styles";
			styleElement.innerHTML = hideScrollbarStyles;
			document.head.appendChild(styleElement);

			return () => {
				const existingStyle = document.getElementById("hide-scrollbar-styles");
				if (existingStyle) {
					document.head.removeChild(existingStyle);
				}
			};
		}
	}, []);

	const currentDate = externalCurrentDate || internalCurrentDate;
	const zoomLevel =
		externalZoomLevel !== undefined ? externalZoomLevel : internalZoomLevel;

	useEffect(() => {
		if (onScrollRef && scrollContainerRef.current) {
			onScrollRef(scrollContainerRef.current);
		}
	}, [onScrollRef, scrollContainerRef.current]);

	const dateRange = React.useMemo(() => {
		switch (viewMode) {
			case "day":
				return {
					start: new Date(
						currentDate.getFullYear(),
						currentDate.getMonth(),
						currentDate.getDate(),
						0,
						0,
						0
					),
					end: new Date(
						currentDate.getFullYear(),
						currentDate.getMonth(),
						currentDate.getDate(),
						23,
						59,
						59
					),
				};
			case "week":
				return {
					start: startOfWeek(currentDate, { weekStartsOn: 1 }), // Montag
					end: endOfWeek(currentDate, { weekStartsOn: 1 }), // Sonntag
				};
			case "workweek": {
				// Für Arbeitswoche (Mo-Fr)
				const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Montag
				const end = new Date(start);
				end.setDate(start.getDate() + 4); // Freitag (Montag + 4 Tage)
				end.setHours(23, 59, 59);
				return { start, end };
			}
			case "month":
				return {
					start: startOfMonth(currentDate),
					end: endOfMonth(currentDate),
				};
		}
	}, [currentDate, viewMode]);

	// Fetch appointment statuses
	const { data: appointmentStatuses } = useQuery({
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

	// Fetch working hours for devices
	const { data: deviceWorkingHours } = useQuery({
		queryKey: ["deviceWorkingHours", selectedDevices],
		queryFn: async () => {
			if (selectedDevices.length === 0) return {};

			const { data, error } = await supabase
				.from("device_working_hours")
				.select("device_id, day_of_week, start_time, end_time")
				.in("device_id", selectedDevices);

			if (error) throw error;

			// Group by device_id
			const workingHoursByDevice = data.reduce((acc, curr) => {
				if (!acc[curr.device_id]) {
					acc[curr.device_id] = [];
				}
				acc[curr.device_id].push(curr);
				return acc;
			}, {} as Record<string, DeviceWorkingHours[]>);

			return workingHoursByDevice;
		},
		enabled: selectedDevices.length > 0,
	});

	// Fetch working hours exceptions for devices
	const { data: deviceWorkingHoursExceptions } = useQuery({
		queryKey: [
			"deviceWorkingHoursExceptions",
			selectedDevices,
			dateRange.start,
			dateRange.end,
		],
		queryFn: async () => {
			if (selectedDevices.length === 0) return {};

			const { data, error } = await supabase
				.from("device_working_hours_exceptions")
				.select("device_id, start_date, end_date, start_time, end_time, reason")
				.in("device_id", selectedDevices)
				.or(
					`start_date.lte.${dateRange.end.toISOString()},end_date.gte.${dateRange.start.toISOString()}`
				);

			if (error) throw error;

			// Group by device_id
			const exceptionsByDevice = data.reduce((acc, curr) => {
				if (!acc[curr.device_id]) {
					acc[curr.device_id] = [];
				}
				acc[curr.device_id].push(curr);
				return acc;
			}, {} as Record<string, DeviceWorkingHoursException[]>);

			return exceptionsByDevice;
		},
		enabled: selectedDevices.length > 0,
	});

	const { data: appointments, refetch } = useQuery({
		queryKey: ["appointments", dateRange.start, dateRange.end, selectedDevices],
		queryFn: async () => {
			if (selectedDevices.length === 0) return [];

			const { data, error } = await supabase
				.from("appointments")
				.select(
					`
          id,
          start_time,
          end_time,
          patient_data,
          billing_type,
					body_side,
          status:appointment_statuses(
            id,
            name
          ),
          examination:examinations(
            id,
            name,
            duration
          ),
          device:devices(
            id,
            name
          ),
          location:locations(
            id,
            name
          ),
          patient:patients(
            id,
            first_name,
            last_name,
            email,
            phone
          ),
          previous_appointment:previous_appointment_id(
            start_time
          )
        `
				)
				.in("device_id", selectedDevices)
				.gte("start_time", dateRange.start.toISOString())
				.lte("end_time", dateRange.end.toISOString())
				.order("start_time");

			if (error) throw error;
			try {
				return z.array(AppointmentSchema).parse(data) as Appointment[];
			} catch (valError) {
				console.error(valError);
			}
		},
		enabled: selectedDevices.length > 0,
		refetchInterval: 30000, // Refetch every 30 seconds
	});

	// Function to check if a time slot is within working hours
	const isWithinWorkingHours = (date: Date, deviceId: string): boolean => {
		if (!deviceWorkingHours || !deviceWorkingHours[deviceId]) {
			return true; // Default to true if no working hours defined
		}

		const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay(); // Convert Sunday (0) to 7 to match our schema
		const timeString = format(date, "HH:mm:ss");

		// Check for exceptions first
		if (
			deviceWorkingHoursExceptions &&
			deviceWorkingHoursExceptions[deviceId]
		) {
			const dateString = format(date, "yyyy-MM-dd");

			for (const exception of deviceWorkingHoursExceptions[deviceId]) {
				if (
					dateString >= exception.start_date &&
					dateString <= exception.end_date
				) {
					// If start_time and end_time are null, the device is not available all day
					if (exception.start_time === null && exception.end_time === null) {
						return false;
					}

					// If we have specific hours for this exception
					if (exception.start_time && exception.end_time) {
						return (
							timeString >= exception.start_time &&
							timeString <= exception.end_time
						);
					}
				}
			}
		}

		// Check regular working hours
		const workingHoursForDay = deviceWorkingHours[deviceId].find(
			(wh) => wh.day_of_week === dayOfWeek
		);
		if (!workingHoursForDay) {
			return false; // No working hours defined for this day
		}

		return (
			timeString >= workingHoursForDay.start_time &&
			timeString <= workingHoursForDay.end_time
		);
	};

	// Lookup für Gerätefarben
	const getDeviceColorClasses = (deviceId: string, index: number) => {
		// Hashwert aus der Device-ID generieren, um konsistente Farbe pro Gerät zu haben
		let hashCode = 0;
		for (let i = 0; i < deviceId.length; i++) {
			hashCode = (hashCode << 5) - hashCode + deviceId.charCodeAt(i);
			hashCode = hashCode & hashCode; // Convert to 32bit integer
		}

		// Absoluten Wert nehmen und modulo DEVICE_COLORS.length
		const colorIndex = Math.abs(hashCode) % DEVICE_COLORS.length;
		return DEVICE_COLORS[colorIndex];
	};

	const navigate = (direction: "prev" | "next") => {
		if (externalCurrentDate && !onDateChange) return;

		let newDate;
		switch (viewMode) {
			case "day":
				newDate =
					direction === "next"
						? addDays(currentDate, 1)
						: addDays(currentDate, -1);
				break;
			case "week":
			case "workweek":
				newDate =
					direction === "next"
						? addWeeks(currentDate, 1)
						: subWeeks(currentDate, 1);
				break;
			case "month":
				newDate =
					direction === "next"
						? addMonths(currentDate, 1)
						: subMonths(currentDate, 1);
				break;
		}

		if (onDateChange) {
			onDateChange(newDate);
		} else {
			setInternalCurrentDate(newDate);
		}
	};

	const goToToday = () => {
		const today = new Date();
		if (onDateChange) {
			onDateChange(today);
		} else {
			setInternalCurrentDate(today);
		}
	};

	const handleZoomIn = () => {
		if (externalZoomLevel !== undefined) return;
		setInternalZoomLevel((prev) => Math.min(prev + 20, 160));
	};

	const handleZoomOut = () => {
		if (externalZoomLevel !== undefined) return;
		setInternalZoomLevel((prev) => Math.max(prev - 20, 40));
	};

	const handleViewModeChange = (
		mode: "day" | "week" | "workweek" | "month"
	) => {
		if (onViewModeChange) {
			onViewModeChange(mode);
		}
	};

	const handleSlotClick = (date: Date, hour: number, minute: number) => {
		const slotStart = setMinutes(setHours(date, hour), minute);

		if (isRescheduling) {
			onSlotSelect?.(slotStart, selectedDevices[0]);
			setIsBookingModalOpen(true);
		} else {
			onSlotSelect?.(slotStart, selectedDevices[0]);
			setIsBookingModalOpen(true);
		}
	};

	const handleAppointmentClick = (appointment: Appointment) => {
		setSelectedAppointment(appointment);
		setIsDetailsModalOpen(true);
	};

	const handleReschedule = () => {
		if (onRescheduleStart && selectedAppointment) {
			onRescheduleStart(selectedAppointment);
			setIsDetailsModalOpen(false);
		}
	};

	const handleBookingConfirm = () => {
		setIsBookingModalOpen(false);
		onRescheduleComplete?.();
		refetch();
	};

	// Funktion zur Erstellung eines Zeitrasters
	const createTimeGrid = (day: Date, appointments: Appointment[]) => {
		// Erstelle ein Raster für alle 15-Minuten-Slots des Tages
		const grid: { time: Date; appointments: Appointment[] }[] = [];

		// Für jeden Slot (24h * 4 Slots = 96 Slots)
		for (let hour = 0; hour < 24; hour++) {
			for (let minute of [0, 15, 30, 45]) {
				const slotTime = new Date(day);
				slotTime.setHours(hour, minute, 0, 0);

				// Finde alle Termine, die diesen Slot überlappen
				const slotAppointments = appointments.filter((apt) => {
					const aptStart = apt.timing.start;
					const aptEnd = apt.timing.end;

					return (
						isSameDay(aptStart, day) &&
						aptStart <= new Date(slotTime.getTime() + 15 * 60000) && // Slot-Ende
						aptEnd > slotTime // Slot-Start
					);
				});

				grid.push({
					time: slotTime,
					appointments: slotAppointments,
				});
			}
		}

		return grid;
	};

	const getAppointmentStyle = (
		appointment: Appointment,
		index: number,
		total: number
	) => {
		// Get status color from appointmentStatuses
		const status = appointmentStatuses?.find(
			(s) => s.id === appointment.status.id
		);
		const verschobenStatus = appointmentStatuses?.find(
			(s) => s.name === "Verschoben"
		);
		const isVerschoben = verschobenStatus && status?.id === verschobenStatus.id;

		// Basisstil basierend auf Status
		let baseStyle = {};

		if (isVerschoben) {
			// Verschobene Termine immer in Rot mit Durchstreichung
			baseStyle = {
				backgroundColor: "#dc262680", // Rot mit 50% Opacity
				borderLeft: "3px solid #dc2626", // Rot
				color: "#dc2626", // Rot
				textDecoration: "line-through",
			};
		} else if (appointment.previousAppointment) {
			// Termine, die aus verschobenen hervorgegangen sind in orange
			baseStyle = {
				backgroundColor: "#ea580c80", // orange-600 mit 50% opacity
				borderLeft: "3px solid #ea580c", // orange-600
				color: "#ea580c", // orange-600
			};
		} else {
			// Normale Termine in ihrer Status-Farbe
			baseStyle = {
				backgroundColor: `${status?.color}80`, // Color with 50% opacity
				borderLeft: `3px solid ${status?.color}`,
				color: status?.color,
			};
		}

		// Positionierung basierend auf Index und Gesamtzahl
		const width = total > 1 ? `${90 / total}%` : "90%";
		const left = total > 1 ? `${index * (90 / total)}%` : "0";

		return {
			...baseStyle,
			width,
			left,
			right: "auto",
		};
	};

	// Komponente für den Kalendernamen-Header
	const DeviceHeader = ({
		deviceId,
		index,
	}: {
		deviceId: string;
		index: number;
	}) => {
		const device = devices.find((d) => d.id === deviceId);
		if (!device) return null;

		// Ermittle den Standortnamen, falls vorhanden
		const locationName =
			device.location_devices && device.location_devices.length > 0
				? device.location_devices[0].location.name
				: "";

		const colorClasses = getDeviceColorClasses(deviceId, index);

		return (
			<div
				className={`${colorClasses.bg} p-2 flex justify-between items-center border-b ${colorClasses.border} sticky top-0 z-30`}
			>
				<div className={`font-medium ${colorClasses.text}`}>
					{device.name} {locationName && `- ${locationName}`}
				</div>
			</div>
		);
	};

	// Die renderMiniCalendar Funktion
	const renderMiniCalendar = () => {
		const start = new Date(
			currentDate.getFullYear(),
			currentDate.getMonth(),
			1
		);
		const end = new Date(
			currentDate.getFullYear(),
			currentDate.getMonth() + 1,
			0
		);
		const firstWeek = startOfWeek(start, { weekStartsOn: 1 });
		const lastWeek = endOfWeek(end, { weekStartsOn: 1 });
		const days = [];

		for (
			let day = new Date(firstWeek);
			day <= lastWeek;
			day.setDate(day.getDate() + 1)
		) {
			days.push(new Date(day));
		}

		return (
			<div className="p-4">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-sm font-medium text-gray-900">
						{format(currentDate, "MMMM yyyy", { locale: de })}
					</h3>
					<div className="flex space-x-1">
						<button
							onClick={() => {
								const newDate = subMonths(currentDate, 1);
								if (onDateChange) {
									onDateChange(newDate);
								} else {
									setInternalCurrentDate(newDate);
								}
							}}
							className="p-1 hover:bg-gray-100 rounded-full"
						>
							<ChevronLeft className="h-4 w-4 text-gray-600" />
						</button>
						<button
							onClick={() => {
								const newDate = addMonths(currentDate, 1);
								if (onDateChange) {
									onDateChange(newDate);
								} else {
									setInternalCurrentDate(newDate);
								}
							}}
							className="p-1 hover:bg-gray-100 rounded-full"
						>
							<ChevronRight className="h-4 w-4 text-gray-600" />
						</button>
					</div>
				</div>

				<div className="grid grid-cols-7 mb-2">
					{["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day) => (
						<div
							key={day}
							className="text-xs font-medium text-gray-500 text-center"
						>
							{day}
						</div>
					))}
				</div>

				<div className="grid grid-cols-7 gap-1">
					{days.map((day) => {
						const isCurrentDay = isToday(day);
						const isSelected = isSameDay(day, currentDate);
						const isCurrentMonth = day.getMonth() === currentDate.getMonth();

						return (
							<button
								key={day.toString()}
								onClick={() => {
									const newDate = new Date(day);
									if (onDateChange) {
										onDateChange(newDate);
									} else {
										setInternalCurrentDate(newDate);
									}
								}}
								className={cn(
									"text-sm p-2 text-center rounded",
									isCurrentDay && "bg-blue-50 text-blue-600",
									isSelected && "bg-blue-100 text-blue-700 font-medium",
									!isCurrentMonth && "text-gray-400"
								)}
							>
								{format(day, "d")}
							</button>
						);
					})}
				</div>
			</div>
		);
	};

	const renderDayView = () => {
		// Tagesansicht mit einem gemeinsamen Scroll-Container
		return (
			<div className="h-full flex flex-col">
				<div
					ref={scrollContainerRef}
					className="flex-1 overflow-y-auto"
					onScroll={onScroll}
				>
					{selectedDevices.map((deviceId, deviceIndex) => {
						// Filter appointments for this day and device
						const dayAppointments =
							appointments?.filter(
								(apt) =>
									isSameDay(apt.timing.start, currentDate) &&
									apt.device?.id === deviceId
							) || [];

						// Erstelle das Zeitraster für dieses Gerät
						const timeGrid = createTimeGrid(currentDate, dayAppointments);

						return (
							<div key={deviceId} className="mb-6">
								<DeviceHeader deviceId={deviceId} index={deviceIndex} />

								<div
									className="grid"
									style={{
										gridTemplateColumns: "60px 1fr",
										height: `${24 * zoomLevel}px`,
									}}
								>
									<div className="sticky left-0 bg-white border-r border-gray-200">
										{HOURS.map((hour) => (
											<div
												key={hour}
												style={{ height: `${zoomLevel}px` }}
												className="relative"
											>
												<div className="absolute -top-2 right-2 text-xs font-medium text-gray-500">
													{hour.toString().padStart(2, "0")}:00
												</div>
											</div>
										))}
									</div>

									<div className="border-r border-gray-200">
										{!hideNavigation && (
											<div className="sticky top-10 z-20 bg-white px-2 py-1 text-center border-l border-b border-gray-200">
												<div className="text-sm font-medium text-gray-900">
													{format(currentDate, "EEEE", { locale: de })}
												</div>
												<div className="text-sm text-gray-500">
													{format(currentDate, "d.M.yyyy")}
												</div>
											</div>
										)}

										{HOURS.map((hour) => (
											<div key={hour} style={{ height: `${zoomLevel}px` }}>
												{MINUTES.map((minute) => {
													// Finde den richtigen Slot im Grid
													const slotTime = new Date(currentDate);
													slotTime.setHours(hour, minute, 0, 0);

													// Finde alle Einträge für diesen Slot
													const gridSlot = timeGrid.find(
														(slot) =>
															slot.time.getHours() === hour &&
															slot.time.getMinutes() === minute
													);

													// Finde alle Termine dieses Geräts, die in diesem Slot beginnen
													const startingAppointments = dayAppointments.filter(
														(apt) => {
															return (
																apt.timing.start.getHours() === hour &&
																Math.floor(apt.timing.start.getMinutes() / 15) *
																	15 ===
																	minute
															);
														}
													);

													// Check if this time slot is within working hours
													const withinWorkingHours = isWithinWorkingHours(
														slotTime,
														deviceId
													);

													return (
														<div
															key={`${currentDate.toISOString()}-${deviceId}-${hour}-${minute}`}
															className={cn(
																"relative border-t border-gray-100 hover:bg-gray-50 cursor-pointer",
																minute === 0 && "border-t-2 border-gray-200",
																!withinWorkingHours && "bg-gray-100" // Add gray background for slots outside working hours
															)}
															style={{
																height: `${zoomLevel / 4}px`,
																minHeight: "15px",
															}}
															onClick={() => {
																handleSlotClick(currentDate, hour, minute);
															}}
														>
															{/* Nur Termine rendern, die in diesem Slot beginnen */}
															{startingAppointments.map(
																(appointment, index) => {
																	const appointmentDuration =
																		appointment.examination.duration;
																	const appointmentHeight =
																		(appointmentDuration / 15) *
																		(zoomLevel / 4);

																	// Finde alle überlappenden Termine im gleichen Zeitfenster
																	const overlappingAppointments =
																		gridSlot?.appointments || [];

																	const style = getAppointmentStyle(
																		appointment,
																		overlappingAppointments.indexOf(
																			appointment
																		),
																		overlappingAppointments.length
																	);

																	return (
																		<button
																			key={appointment.id}
																			onClick={(e) => {
																				e.stopPropagation();
																				handleAppointmentClick(appointment);
																			}}
																			className="absolute py-1 px-2 rounded text-sm transition-colors hover:bg-opacity-20"
																			style={{
																				...style,
																				top: "0",
																				height: `${appointmentHeight}px`,
																				minHeight: `${Math.max(
																					zoomLevel / 4,
																					24
																				)}px`,
																				zIndex: 10,
																			}}
																		>
																			<div className="font-medium truncate">
																				{appointment.examination.name}
																			</div>
																			{zoomLevel >= 60 &&
																				appointment.patient && (
																					<div className="text-xs truncate">
																						{appointment.patient.name}{" "}
																						{appointment.patient.surname}
																					</div>
																				)}
																		</button>
																	);
																}
															)}
														</div>
													);
												})}
											</div>
										))}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		);
	};

	// Gemeinsame Funktion für Wochen- und Arbeitswochenansicht
	const renderWeekViewBase = (isWorkWeek = false) => {
		// Bestimme die anzuzeigenden Tage basierend auf isWorkWeek
		let days;
		if (isWorkWeek) {
			// Nur Montag bis Freitag anzeigen (5 Tage)
			const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Montag
			days = Array.from({ length: 5 }, (_, i) => addDays(start, i));
		} else {
			// Alle Tage der Woche anzeigen (7 Tage)
			days = eachDayOfInterval({
				start: dateRange.start,
				end: dateRange.end,
			});
		}

		return (
			<div
				ref={scrollContainerRef}
				className="h-full flex-1 overflow-y-auto hide-scrollbar"
				onScroll={onScroll}
			>
				{selectedDevices.map((deviceId, deviceIndex) => {
					return (
						<div key={deviceId} className="mb-6">
							<div className="sticky top-0 z-30">
								<DeviceHeader deviceId={deviceId} index={deviceIndex} />

								<div className="bg-white">
									<table className="w-full table-fixed border-collapse">
										<colgroup>
											<col style={{ width: "60px" }} />
											{days.map((_, i) => (
												<col key={i} />
											))}
										</colgroup>
										<thead>
											<tr>
												<th className="border-b border-gray-200"></th>
												{days.map((day) => (
													<th
														key={day.toString()}
														className="border-l border-b border-gray-200 px-2 py-1 text-center"
													>
														<div className="text-sm font-medium text-gray-900">
															{format(day, "EEE", { locale: de })}
														</div>
														<div className="text-sm text-gray-500">
															{format(day, "d.M.")}
														</div>
													</th>
												))}
											</tr>
										</thead>
									</table>
								</div>
							</div>

							<div className="overflow-hidden">
								<table
									className="w-full table-fixed border-collapse"
									style={{ height: `${24 * zoomLevel}px` }}
								>
									<colgroup>
										<col style={{ width: "60px" }} />
										{days.map((_, i) => (
											<col key={i} />
										))}
									</colgroup>
									<tbody>
										{HOURS.map((hour) => (
											<tr key={hour} style={{ height: `${zoomLevel}px` }}>
												<td className="sticky left-0 bg-white border-r border-gray-200 relative">
													<div className="absolute -top-2 right-2 text-xs font-medium text-gray-500">
														{hour.toString().padStart(2, "0")}:00
													</div>
												</td>

												{days.map((day) => {
													// Für diesen Tag und dieses Gerät
													const dayAppointments =
														appointments?.filter(
															(apt) =>
																isSameDay(apt.timing.start, day) &&
																apt.device?.id === deviceId
														) || [];

													const grid = createTimeGrid(day, dayAppointments);

													return (
														<td
															key={day.toString()}
															className="border-r border-gray-200 p-0 align-top"
														>
															<div style={{ height: `${zoomLevel}px` }}>
																{MINUTES.map((minute) => {
																	// Finde den richtigen Slot im Grid
																	const slotTime = new Date(day);
																	slotTime.setHours(hour, minute, 0, 0);

																	// Finde den entsprechenden Grid-Slot
																	const gridSlot = grid.find(
																		(slot) =>
																			slot.time.getHours() === hour &&
																			slot.time.getMinutes() === minute
																	);

																	// Finde alle Termine, die in diesem Slot beginnen
																	const startingAppointments =
																		dayAppointments.filter((apt) => {
																			return (
																				isSameDay(apt.timing.start, day) &&
																				apt.timing.start.getHours() === hour &&
																				Math.floor(
																					apt.timing.start.getMinutes() / 15
																				) *
																					15 ===
																					minute
																			);
																		});

																	// Check if this time slot is within working hours
																	const withinWorkingHours =
																		isWithinWorkingHours(slotTime, deviceId);

																	return (
																		<div
																			key={`${day.toISOString()}-${hour}-${minute}`}
																			className={cn(
																				"relative border-t border-gray-100 hover:bg-gray-50 cursor-pointer",
																				minute === 0 &&
																					"border-t-2 border-gray-200",
																				!withinWorkingHours && "bg-gray-100" // Add gray background for slots outside working hours
																			)}
																			style={{
																				height: `${zoomLevel / 4}px`,
																				minHeight: "15px",
																			}}
																			onClick={() => {
																				handleSlotClick(day, hour, minute);
																			}}
																		>
																			{startingAppointments.map(
																				(appointment, index) => {
																					const appointmentDuration =
																						appointment.examination.duration;
																					const appointmentHeight =
																						(appointmentDuration / 15) *
																						(zoomLevel / 4);

																					// Finde alle überlappenden Termine im gleichen Zeitfenster
																					const overlappingAppointments =
																						gridSlot?.appointments || [];

																					const style = getAppointmentStyle(
																						appointment,
																						overlappingAppointments.indexOf(
																							appointment
																						),
																						overlappingAppointments.length
																					);

																					return (
																						<button
																							key={appointment.id}
																							onClick={(e) => {
																								e.stopPropagation();
																								handleAppointmentClick(
																									appointment
																								);
																							}}
																							className="absolute py-1 px-2 rounded text-sm transition-colors hover:bg-opacity-20"
																							style={{
																								...style,
																								top: "0",
																								height: `${appointmentHeight}px`,
																								minHeight: `${Math.max(
																									zoomLevel / 4,
																									24
																								)}px`,
																								zIndex: 10,
																							}}
																						>
																							<div className="font-medium truncate">
																								{appointment.examination.name}
																							</div>
																							{zoomLevel >= 60 &&
																								appointment.patient && (
																									<div className="text-xs truncate">
																										{appointment.patient.name}{" "}
																										{
																											appointment.patient
																												.surname
																										}
																									</div>
																								)}
																						</button>
																					);
																				}
																			)}
																		</div>
																	);
																})}
															</div>
														</td>
													);
												})}
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					);
				})}
			</div>
		);
	};

	// Spezielle Funktionen für die beiden Wochenansichten
	const renderWeekView = () => renderWeekViewBase(false);
	const renderWorkWeekView = () => renderWeekViewBase(true);

	const renderMonthView = () => {
		return (
			<div
				ref={scrollContainerRef}
				className="h-full flex-1 overflow-y-auto"
				onScroll={onScroll}
			>
				{selectedDevices.map((deviceId, deviceIndex) => {
					const start = startOfWeek(dateRange.start, { weekStartsOn: 1 });
					const end = endOfWeek(dateRange.end, { weekStartsOn: 1 });
					const days = eachDayOfInterval({ start, end });

					return (
						<div key={deviceId} className="mb-6">
							<div className="sticky top-0 z-30">
								<DeviceHeader deviceId={deviceId} index={deviceIndex} />

								<div className="grid grid-cols-7 gap-px bg-gray-200">
									{["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day) => (
										<div
											key={day}
											className="bg-gray-50 p-2 text-sm font-medium text-gray-900 text-center"
										>
											{day}
										</div>
									))}
								</div>
							</div>

							<div className="grid grid-cols-7 gap-px bg-gray-200">
								{days.map((day) => {
									const dayAppointments =
										appointments?.filter(
											(apt) =>
												isSameDay(apt.timing.start, day) &&
												apt.device?.id === deviceId
										) || [];

									// Gruppiere nach Startzeit
									const timeGroups: Record<string, Appointment[]> = {};

									dayAppointments.forEach((apt) => {
										const timeKey = format(apt.timing.start, "HH:mm");
										if (!timeGroups[timeKey]) {
											timeGroups[timeKey] = [];
										}
										timeGroups[timeKey].push(apt);
									});

									// Check if this day is within working hours
									const isWorkingDay =
										deviceWorkingHours &&
										deviceWorkingHours[deviceId]?.some((wh) => {
											const dayOfWeek = day.getDay() === 0 ? 7 : day.getDay();
											return wh.day_of_week === dayOfWeek;
										});

									// Check for exceptions
									const dateString = format(day, "yyyy-MM-dd");
									const hasException =
										deviceWorkingHoursExceptions &&
										deviceWorkingHoursExceptions[deviceId]?.some(
											(ex) =>
												dateString >= ex.start_date &&
												dateString <= ex.end_date &&
												ex.start_time === null
										);

									return (
										<div
											key={day.toString()}
											className={cn(
												"p-2 min-h-[100px] relative",
												!isSameDay(day, currentDate) &&
													format(day, "M") !== format(currentDate, "M") &&
													"bg-gray-50 text-gray-500",
												isSameDay(day, currentDate)
													? "bg-white"
													: !isWorkingDay || hasException
													? "bg-gray-100"
													: "bg-white"
											)}
											onClick={() => {
												if (!dayAppointments?.length) {
													handleSlotClick(day, 9, 0);
												}
											}}
										>
											<div className="text-sm font-medium">
												{format(day, "d")}
											</div>
											<div className="mt-1 space-y-1">
												{Object.entries(timeGroups).map(
													([timeKey, appts], groupIndex) => {
														return appts.map((appointment, index) => {
															const style = getAppointmentStyle(
																appointment,
																index,
																appts.length
															);
															const top = 24 + groupIndex * 28; // Position basierend auf Zeitgruppe

															return (
																<button
																	key={appointment.id}
																	onClick={(e) => {
																		e.stopPropagation();
																		handleAppointmentClick(appointment);
																	}}
																	className="px-2 py-1 rounded text-xs text-left absolute"
																	style={{
																		...style,
																		top: `${top}px`,
																	}}
																>
																	{format(appointment.timing.start, "HH:mm")} -{" "}
																	{appointment.examination.name}
																</button>
															);
														});
													}
												)}
											</div>
										</div>
									);
								})}
							</div>
						</div>
					);
				})}
			</div>
		);
	};

	// View selector Component
	const ViewSelector = () => (
		<div className="inline-flex rounded-md shadow-sm">
			<button
				onClick={() => handleViewModeChange("day")}
				className={cn(
					"relative inline-flex items-center px-3 py-2 text-sm font-medium border border-gray-300 rounded-l-md",
					viewMode === "day"
						? "bg-blue-100 text-blue-700 z-10"
						: "bg-white text-gray-700 hover:bg-gray-50"
				)}
			>
				<Calendar className="h-4 w-4 mr-1" />
				<span>Tag</span>
			</button>
			<button
				onClick={() => handleViewModeChange("workweek")}
				className={cn(
					"relative inline-flex items-center px-3 py-2 text-sm font-medium border border-gray-300 -ml-px",
					viewMode === "workweek"
						? "bg-blue-100 text-blue-700 z-10"
						: "bg-white text-gray-700 hover:bg-gray-50"
				)}
			>
				<CalendarDays className="h-4 w-4 mr-1" />
				<span>Arbeitswoche</span>
			</button>
			<button
				onClick={() => handleViewModeChange("week")}
				className={cn(
					"relative inline-flex items-center px-3 py-2 text-sm font-medium border border-gray-300 -ml-px",
					viewMode === "week"
						? "bg-blue-100 text-blue-700 z-10"
						: "bg-white text-gray-700 hover:bg-gray-50"
				)}
			>
				<CalendarDays className="h-4 w-4 mr-1" />
				<span>Woche</span>
			</button>
			<button
				onClick={() => handleViewModeChange("month")}
				className={cn(
					"relative inline-flex items-center px-3 py-2 text-sm font-medium border border-gray-300 -ml-px rounded-r-md",
					viewMode === "month"
						? "bg-blue-100 text-blue-700 z-10"
						: "bg-white text-gray-700 hover:bg-gray-50"
				)}
			>
				<Grid3X3 className="h-4 w-4 mr-1" />
				<span>Monat</span>
			</button>
		</div>
	);

	const getViewTitle = () => {
		switch (viewMode) {
			case "day":
				return format(currentDate, "EEEE, d. MMMM yyyy", { locale: de });
			case "week":
				return `${format(
					startOfWeek(currentDate, { weekStartsOn: 1 }),
					"d.M."
				)} - ${format(
					endOfWeek(currentDate, { weekStartsOn: 1 }),
					"d.M.yyyy"
				)}`;
			case "workweek":
				return `${format(
					startOfWeek(currentDate, { weekStartsOn: 1 }),
					"d.M."
				)} - ${format(
					addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), 4),
					"d.M.yyyy"
				)} (Mo-Fr)`;
			case "month":
				return format(currentDate, "MMMM yyyy", { locale: de });
			default:
				return "";
		}
	};

	return (
		<div className="flex flex-col h-full">
			{!hideNavigation && (
				<div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 z-40 bg-white">
					<div className="flex items-center space-x-4">
						<button
							onClick={goToToday}
							className="px-3 py-1.5 bg-white text-sm font-medium text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
						>
							Heute
						</button>

						<div className="flex items-center space-x-2">
							<button
								onClick={() => navigate("prev")}
								className="p-1.5 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
							>
								<ChevronLeft className="h-4 w-4 text-gray-600" />
							</button>
							<button
								onClick={() => navigate("next")}
								className="p-1.5 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
							>
								<ChevronRight className="h-4 w-4 text-gray-600" />
							</button>
						</div>

						<h2 className="text-lg font-semibold text-gray-900 ml-2">
							{getViewTitle()}
						</h2>
					</div>

					<div className="flex items-center space-x-4">
						<div className="flex items-center space-x-2 bg-white rounded-lg shadow-sm border border-gray-200 p-1">
							<button
								onClick={handleZoomOut}
								className="p-1 hover:bg-gray-100 rounded"
								title="Verkleinern"
							>
								<ZoomOut className="h-4 w-4 text-gray-600" />
							</button>
							<button
								onClick={handleZoomIn}
								className="p-1 hover:bg-gray-100 rounded"
								title="Vergrößern"
							>
								<ZoomIn className="h-4 w-4 text-gray-600" />
							</button>
						</div>

						<ViewSelector />
					</div>
				</div>
			)}

			<div className="flex flex-1 overflow-hidden">
				{viewMode === "day" && !hideNavigation && (
					<div className="w-64 border-r border-gray-200 bg-white">
						{renderMiniCalendar()}
					</div>
				)}

				<div className="flex-1 overflow-hidden">
					{viewMode === "day" && renderDayView()}
					{viewMode === "week" && renderWeekView()}
					{viewMode === "workweek" && renderWorkWeekView()}
					{viewMode === "month" && renderMonthView()}
				</div>
			</div>

			{selectedSlot && selectedDeviceForReschedule === selectedDevices[0] && (
				<AppointmentBookingModal
					isOpen={isBookingModalOpen}
					onClose={() => {
						setIsBookingModalOpen(false);
						onRescheduleComplete?.();
					}}
					selectedSlot={selectedSlot}
					deviceId={selectedDevices[0]}
					onConfirm={handleBookingConfirm}
					isRescheduling={isRescheduling}
					appointmentToReschedule={appointmentToReschedule}
				/>
			)}

			{selectedAppointment && (
				<AppointmentDetailsModal
					isOpen={isDetailsModalOpen}
					onClose={() => {
						setIsDetailsModalOpen(false);
						setSelectedAppointment(null);
					}}
					appointment={selectedAppointment}
					onReschedule={handleReschedule}
					refetchAppointments={refetch}
				/>
			)}
		</div>
	);
};

export default CalendarView;
