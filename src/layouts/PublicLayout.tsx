import { Outlet } from "react-router-dom";
import { Logo } from "../components/ui";

function PublicLayout() {
	return (
		<div className="min-h-screen flex bg-background">
			<div className="flex flex-col justify-center items-center w-full px-4 py-12">
				<Logo />
				<div className="w-full max-w-4xl">
					<Outlet />
				</div>
			</div>
		</div>
	);
}

export default PublicLayout;
