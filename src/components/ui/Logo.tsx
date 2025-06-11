import React from "react";

interface LogoProps {
	className?: string;
}

const Logo: React.FC<LogoProps> = ({
	className = "flex items-center justify-center mb-8",
}) => {
	return (
		<div className={className}>
			<div className="flex flex-col">
				<div className="text-2xl md:text-3xl font-bold text-primary">
					ALTA Klinik
				</div>
				<div className="text-xs text-gray-600 mt-1"></div>
			</div>
		</div>
	);
};

export default Logo;
