import React from "react";

const Logo: React.FC = () => {
	return (
		<div className="flex items-center justify-center mb-8">
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
