import React, { useState, useRef, useEffect } from "react";
import { LogOut, ChevronUp } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { cn } from "../../lib/utils";

interface UserMenuProps {
	sidebarOpen: boolean;
}

const UserMenu: React.FC<UserMenuProps> = ({ sidebarOpen }) => {
	const { user, logout } = useAuth();
	const [isOpen, setIsOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	// Close menu when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const handleLogout = async () => {
		try {
			await logout();
			setIsOpen(false);
		} catch (error) {
			console.error("Error during logout:", error);
		}
	};

	const getUserDisplayName = () => {
		if (!user) return "Unbekannter Benutzer";
		return user.name || user.email || "Benutzer";
	};

	const getUserInitials = () => {
		const name = getUserDisplayName();
		if (name === "Unbekannter Benutzer" || name === "Benutzer") {
			return "U";
		}

		const words = name.split(" ");
		if (words.length >= 2) {
			return (words[0][0] + words[1][0]).toUpperCase();
		}
		return name.substring(0, 2).toUpperCase();
	};

	if (!user) {
		return null;
	}

	return (
		<div className="relative" ref={menuRef}>
			{/* User Menu Button */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className={cn(
					"w-full flex items-center p-2 text-sm font-medium rounded-md transition-colors",
					"text-gray-600 hover:bg-gray-50 hover:text-gray-900",
					!sidebarOpen && "justify-center"
				)}
				title={!sidebarOpen ? getUserDisplayName() : undefined}
			>
				{/* User Avatar */}
				<div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
					<span className="text-sm font-medium text-blue-600">
						{getUserInitials()}
					</span>
				</div>

				{sidebarOpen && (
					<>
						<div className="ml-3 flex-1 min-w-0">
							<p className="text-sm font-medium text-gray-900 truncate">
								{getUserDisplayName()}
							</p>
							<p className="text-xs text-gray-500 truncate">{user.email}</p>
						</div>
						<ChevronUp
							className={cn(
								"ml-2 h-4 w-4 transition-transform duration-200",
								isOpen ? "" : "transform rotate-180"
							)}
						/>
					</>
				)}
			</button>

			{/* Dropdown Menu */}
			{isOpen && (
				<div
					className={cn(
						"absolute bottom-full mb-2 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50",
						sidebarOpen ? "left-0 right-0" : "left-0 w-48"
					)}
				>
					<div className="px-4 py-2 border-b border-gray-100">
						<p className="text-sm font-medium text-gray-900 truncate">
							{getUserDisplayName()}
						</p>
						<p className="text-xs text-gray-500 truncate">{user.email}</p>
						<p className="text-xs text-gray-400 capitalize">{user.role}</p>
					</div>

					<button
						onClick={handleLogout}
						className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
					>
						<LogOut className="h-4 w-4 mr-3" />
						Abmelden
					</button>
				</div>
			)}
		</div>
	);
};

export default UserMenu;
