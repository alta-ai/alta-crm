import React from "react";

interface PageHeaderProps {}

export const PageHeader: React.FC<PageHeaderProps> = () => {
	return (
		<div className="w-full h-[15%] p-5 absolute top-0 left-0">
			{/* You can add your logo or header content here */}
			<div className="text-white text-3xl font-bold">ALTA</div>
		</div>
	);
};
