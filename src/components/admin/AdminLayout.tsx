import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
	FileText,
	Monitor,
	MapPin,
	Calendar,
	Settings,
	Mail,
	ChevronLeft,
	ChevronRight,
	Users,
	BarChart2,
	UserPlus,
	Receipt,
	CreditCard,
	CheckSquare,
	File,
} from "lucide-react";
import { cn } from "../../lib/utils";
import UserMenu from "./UserMenu";

const AdminLayout = () => {
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const location = useLocation();

	const navigation = [
		{ name: "Untersuchungen", href: "/admin", icon: FileText },
		{ name: "Patienten", href: "/admin/patients", icon: Users },
		{ name: "Überweiser", href: "/admin/referring-doctors", icon: UserPlus },
		{ name: "To-Dos", href: "/admin/todos", icon: CheckSquare },
		{ name: "Geräte", href: "/admin/devices", icon: Monitor },
		{ name: "Formulare", href: "/admin/forms", icon: File },
		{ name: "Abrechnung", href: "/admin/billing", icon: CreditCard },
		{ name: "Abrechnungsbögen", href: "/admin/billing/forms", icon: Receipt },
		{ name: "Standorte", href: "/admin/locations", icon: MapPin },
		{ name: "Termine", href: "/admin/appointments", icon: Calendar },
		{ name: "Statistiken", href: "/admin/statistics", icon: BarChart2 },
		{ name: "E-Mails", href: "/admin/emails", icon: Mail },
		{ name: "Einstellungen", href: "/admin/settings", icon: Settings },
	];

	const isActive = (path: string) => {
		if (path === "/admin") {
			return location.pathname === "/admin";
		}
		return location.pathname.startsWith(path);
	};

	const isAppointmentsPage = location.pathname === "/admin/appointments";

	return (
		<div className="min-h-screen bg-gray-100 flex">
			{/* Main Sidebar */}
			<div
				className={cn(
					"flex flex-col fixed inset-y-0 z-50 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
					sidebarOpen ? "w-64" : "w-16"
				)}
			>
				<div className="flex-1 flex flex-col pt-5 pb-4">
					<div className="flex items-center justify-between px-4">
						{sidebarOpen && <h1 className="text-xl font-bold">ALTA Admin</h1>}
						<button
							onClick={() => setSidebarOpen(!sidebarOpen)}
							className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
						>
							{sidebarOpen ? (
								<ChevronLeft className="h-5 w-5" />
							) : (
								<ChevronRight className="h-5 w-5" />
							)}
						</button>
					</div>
					<nav className="mt-5 flex-1 px-2 space-y-1">
						{navigation.map((item) => {
							const active = isActive(item.href);
							const Icon = item.icon;

							return (
								<Link
									key={item.name}
									to={item.href}
									className={cn(
										"group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
										active
											? "bg-gray-100 text-gray-900"
											: "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
									)}
									title={!sidebarOpen ? item.name : undefined}
								>
									<Icon
										className={cn(
											"flex-shrink-0 h-6 w-6",
											active
												? "text-gray-500"
												: "text-gray-400 group-hover:text-gray-500"
										)}
									/>
									{sidebarOpen && <span className="ml-3">{item.name}</span>}
								</Link>
							);
						})}
					</nav>

					{/* User Menu at the bottom */}
					<div className="px-2 pb-2">
						<UserMenu sidebarOpen={sidebarOpen} />
					</div>
				</div>
			</div>

			{/* Main content */}
			<div
				className={cn(
					"flex-1 transition-all duration-300 ease-in-out",
					sidebarOpen ? "ml-64" : "ml-16"
				)}
			>
				<main
					className={cn(
						"h-screen overflow-auto",
						isAppointmentsPage
							? ""
							: "max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6"
					)}
				>
					<Outlet />
				</main>
			</div>
		</div>
	);
};

export default AdminLayout;
