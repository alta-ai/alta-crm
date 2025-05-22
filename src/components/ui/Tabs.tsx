import { useState } from "react";

export interface TabSelectorProps {
	isActive: boolean;
}

interface Tab {
	tabSelectorComponent: React.FC<TabSelectorProps>;
	tabContentComponent: React.FC;
	onClick?: () => void;
}

interface TabsProps {
	tabs: Tab[];
	defaultTab: number;
}

export const Tabs = ({ tabs, defaultTab }: TabsProps) => {
	const [activeTab, setActiveTab] = useState(defaultTab);

	return (
		<div>
			<nav className="-mb-px flex space-x-8" aria-label="Tabs">
				{tabs.map(({ tabSelectorComponent: TabSelector, onClick }, index) => (
					<div
						className="tab-wrapper"
						key={index}
						onClick={() => {
							setActiveTab(index);
							if (onClick) {
								onClick();
							}
						}}
					>
						<TabSelector isActive={index === activeTab} />
					</div>
				))}
			</nav>
			<div className="mt-4">{tabs[activeTab].tabContentComponent({})}</div>
		</div>
	);
};
