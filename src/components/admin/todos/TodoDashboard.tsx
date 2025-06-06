import React, { useState } from "react";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";
import {
	Check,
	Flag,
	Phone,
	Info,
	Search,
	Filter,
	AlertCircle,
	Calendar,
	User,
	X,
	Stethoscope,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../../../lib/utils";

interface Todo {
	id: string;
	content: string;
	created_at: string;
	appointment_id: string;
	comment_type: "info" | "anruf";
	priority: boolean;
	completed: boolean;
	user_profile?: {
		title: string | null;
		first_name: string;
		last_name: string;
	};
	appointment?: {
		start_time: string;
		examination: {
			name: string;
		};
		patient: {
			id: string;
			first_name: string;
			last_name: string;
		};
	};
}

// Typen für die verschiedenen Filter
type TypeFilter = "all" | "info" | "anruf";
type StatusFilter = "all" | "completed" | "pending";
type PriorityFilter = "all" | "priority";

const TodoDashboard = () => {
	// Separate Zustände für jeden Filter-Typ
	const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
	const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");

	const [searchQuery, setSearchQuery] = useState("");
	const [error, setError] = useState<string | null>(null);
	const queryClient = useQueryClient();

	// Alle To-Dos laden - jetzt mit Untersuchungsdaten
	const { data: todos, isLoading } = useQuery({
		queryKey: ["todos"],
		queryFn: async () => {
			try {
				const { data, error } = await supabase
					.from("appointment_comments")
					.select(
						`
            id,
            content,
            created_at,
            appointment_id,
            completed,
            comment_type,
            priority,
            user_profile:user_profile!user_id(
              title,
              first_name,
              last_name
            ),
            appointment:appointments(
              start_time,
              examination:examinations(
                name
              ),
              patient:patients(
                id,
                first_name,
                last_name
              )
            )
          `
					)
					.eq("is_todo", true)
					.order("created_at", { ascending: false });

				if (error) throw error;
				return data || [];
			} catch (err) {
				console.error("Error loading todos:", err);
				setError("Fehler beim Laden der To-Dos");
				return [];
			}
		},
	});

	// Kommentar als erledigt markieren
	const handleMarkTodoAsCompleted = async (todoId: string) => {
		try {
			setError(null);

			const { error } = await supabase
				.from("appointment_comments")
				.update({ completed: true })
				.eq("id", todoId);

			if (error) throw error;

			// Daten aktualisieren
			queryClient.invalidateQueries(["todos"]);
			queryClient.invalidateQueries(["appointment-comments"]);
		} catch (err: any) {
			console.error("Error marking todo as completed:", err);
			setError(err.message || "Fehler beim Markieren des To-Dos als erledigt");
		}
	};

	// To-Dos filtern mit kombinierten Filtern
	const filterTodos = (todosToFilter: Todo[]) => {
		// Zuerst nach Suchbegriff filtern
		let filtered = todosToFilter;

		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(todo) =>
					todo.content.toLowerCase().includes(query) ||
					todo.appointment?.patient.first_name.toLowerCase().includes(query) ||
					todo.appointment?.patient.last_name.toLowerCase().includes(query) ||
					(todo.appointment?.examination?.name &&
						todo.appointment.examination.name.toLowerCase().includes(query))
			);
		}

		// Dann kombinierte Filter anwenden (UND-Verknüpfung)

		// Typ-Filter
		if (typeFilter !== "all") {
			filtered = filtered.filter((todo) => todo.comment_type === typeFilter);
		}

		// Status-Filter
		if (statusFilter === "completed") {
			filtered = filtered.filter((todo) => todo.completed);
		} else if (statusFilter === "pending") {
			filtered = filtered.filter((todo) => !todo.completed);
		}

		// Prioritäts-Filter
		if (priorityFilter === "priority") {
			filtered = filtered.filter((todo) => todo.priority);
		}

		return filtered;
	};

	// Filter zurücksetzen
	const resetFilters = () => {
		setTypeFilter("all");
		setStatusFilter("all");
		setPriorityFilter("all");
	};

	// Prüfen ob Filter aktiv sind
	const isFilterActive =
		typeFilter !== "all" || statusFilter !== "all" || priorityFilter !== "all";

	if (isLoading) {
		return <div className="text-center py-4">To-Dos werden geladen...</div>;
	}

	const filteredTodos = todos ? filterTodos(todos) : [];

	// Bestimme den Titel basierend auf den aktiven Filtern
	let todoTitle = "To-Dos";
	if (typeFilter !== "all") {
		todoTitle += ` (${typeFilter === "info" ? "Info" : "Anruf"})`;
	}
	if (statusFilter !== "all") {
		todoTitle += ` • ${
			statusFilter === "completed" ? "Erledigt" : "Unerledigt"
		}`;
	}
	if (priorityFilter !== "all") {
		todoTitle += " • Mit Priorität";
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-2xl font-semibold text-gray-900 mb-6">
				To-Do Übersicht
			</h1>

			{error && (
				<div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
					<div className="flex">
						<AlertCircle className="h-5 w-5 text-red-400" />
						<div className="ml-3">
							<p className="text-sm text-red-700">{error}</p>
						</div>
					</div>
				</div>
			)}

			{/* Filter- und Suchbereich */}
			<div className="bg-white shadow-sm rounded-lg p-4 mb-6">
				<div className="flex flex-wrap gap-4 items-center">
					{/* Suchfeld */}
					<div className="relative flex-grow max-w-md">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Search className="h-5 w-5 text-gray-400" />
						</div>
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Suche nach To-Dos oder Patienten..."
							className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
						/>
					</div>

					{/* Mehrere Filter nebeneinander */}
					<div className="flex flex-wrap gap-2 items-center">
						<Filter className="h-5 w-5 text-gray-400" />

						{/* Typ-Filter */}
						<select
							value={typeFilter}
							onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
							className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
						>
							<option value="all">Alle Typen</option>
							<option value="info">Info</option>
							<option value="anruf">Anruf</option>
						</select>

						{/* Status-Filter */}
						<select
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
							className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
						>
							<option value="all">Alle Status</option>
							<option value="pending">Unerledigte</option>
							<option value="completed">Erledigte</option>
						</select>

						{/* Prioritäts-Filter */}
						<select
							value={priorityFilter}
							onChange={(e) =>
								setPriorityFilter(e.target.value as PriorityFilter)
							}
							className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
						>
							<option value="all">Alle Prioritäten</option>
							<option value="priority">Nur mit Priorität</option>
						</select>

						{/* Reset-Button, nur anzeigen wenn Filter aktiv sind */}
						{isFilterActive && (
							<button
								onClick={resetFilters}
								className="inline-flex items-center px-2 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
							>
								<X className="h-4 w-4 mr-1" /> Filter zurücksetzen
							</button>
						)}
					</div>
				</div>
			</div>

			{/* To-Do Liste */}
			<div className="bg-white shadow-sm rounded-lg overflow-hidden">
				<div className="px-6 py-4 border-b border-gray-200">
					<h2 className="text-lg font-medium text-gray-900">
						{todoTitle}{" "}
						{filteredTodos.length > 0 && `(${filteredTodos.length})`}
					</h2>
				</div>

				{filteredTodos.length > 0 ? (
					<div className="divide-y divide-gray-200">
						{filteredTodos.map((todo) => (
							<div
								key={todo.id}
								className={cn(
									"p-4 hover:bg-gray-50",
									todo.completed ? "bg-gray-50" : "",
									todo.priority === true
										? "!border-l-4 !border-l-orange-400"
										: "border-l-4 border-l-gray-200"
								)}
							>
								<div className="flex justify-between items-start">
									<div className="flex-1">
										<div className="flex items-center mb-1">
											{todo.comment_type === "info" ? (
												<Info className="h-4 w-4 text-blue-500 mr-2" />
											) : (
												<Phone className="h-4 w-4 text-green-500 mr-2" />
											)}
											<span className="text-xs font-medium text-gray-500">
												{todo.comment_type === "info" ? "Info" : "Anruf"}
											</span>
											{todo.priority && (
												<Flag
													className="h-4 w-4 text-orange-500 ml-2"
													title="Priorität"
												/>
											)}
											{todo.completed && (
												<span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
													Erledigt
												</span>
											)}
										</div>

										<p className="text-sm text-gray-900 mb-2">{todo.content}</p>

										{todo.appointment && (
											<div className="flex flex-wrap text-xs text-gray-500 space-x-3">
												<div className="flex items-center">
													<User className="h-3.5 w-3.5 mr-1" />
													<Link
														to={`/admin/patients/${todo.appointment.patient.id}/history`}
														className="text-blue-600 hover:underline"
													>
														{todo.appointment.patient.first_name}{" "}
														{todo.appointment.patient.last_name}
													</Link>
												</div>

												<div className="flex items-center">
													<Calendar className="h-3.5 w-3.5 mr-1" />
													{format(
														parseISO(todo.appointment.start_time),
														"dd.MM.yyyy HH:mm",
														{ locale: de }
													)}
													{todo.appointment.examination?.name && (
														<>
															<span className="mx-1">•</span>
															<Stethoscope className="h-3.5 w-3.5 mr-1 text-blue-500" />
															<span>{todo.appointment.examination.name}</span>
														</>
													)}
												</div>
											</div>
										)}

										<p className="text-xs text-gray-500 mt-1">
											{todo.user_profile?.title && (
												<span>{todo.user_profile.title} </span>
											)}
											{todo.user_profile?.first_name || "Unbekannt"}{" "}
											{todo.user_profile?.last_name || ""}
											{" • "}
											{format(parseISO(todo.created_at), "dd.MM.yyyy HH:mm", {
												locale: de,
											})}
										</p>
									</div>

									{!todo.completed && (
										<button
											onClick={() => handleMarkTodoAsCompleted(todo.id)}
											className="ml-2 p-2 rounded-full hover:bg-green-100 text-gray-400 hover:text-green-600"
											title="Als erledigt markieren"
										>
											<Check className="h-5 w-5" />
										</button>
									)}
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="p-6 text-center text-gray-500">
						Keine To-Dos gefunden
					</div>
				)}
			</div>
		</div>
	);
};

export default TodoDashboard;
