import { Outlet } from "react-router-dom";
import { Logo } from "../components/ui";
import UserMenu from "../components/admin/UserMenu";
import { useAuth } from "../contexts/AuthContext";

function PublicLayout() {
	const { userData } = useAuth();

	return (
		<div className="min-h-screen flex flex-col bg-background">
			{/* Header with UserMenu */}
			{userData && (
				<header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
					<div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
						<div className="flex justify-between items-center h-20">
							<div className="flex items-center space-x-4">
								<Logo className="flex items-center justify-center" />
							</div>
							<div className="flex items-center space-x-4">
								<UserMenu sidebarOpen={true} dropdownDirection="down" />
							</div>
						</div>
					</div>
				</header>
			)}

			{/* Main Content */}
			<div className="flex-1 flex">
				<div className="flex flex-col justify-center items-center w-full px-4 py-12">
					{!userData && <Logo />}
					<div className="w-full max-w-4xl">
						<Outlet />
					</div>
				</div>
			</div>
		</div>
	);
}

export default PublicLayout;
