import Icon from "./Icon";

interface PageNavigatorProps {
	currentPage: number;
	numPages: number;
	onPreviousPage: () => void;
	onNextPage: () => void;
}

const PageNavigator: React.FC<PageNavigatorProps> = ({
	currentPage,
	numPages,
	onPreviousPage,
	onNextPage,
}) => {
	if (numPages <= 1) return null;

	return (
		<div className="flex h-20 items-center justify-center text-white">
			<button
				className={`flex items-center justify-center p-[1.5vh] rounded-full hover:bg-gray-700/50 transition-all duration-300 shadow-md bg-gray-800/50 mx-2 ${
					currentPage === 0 ? "opacity-0 pointer-events-none" : "opacity-100"
				}`}
				onClick={onPreviousPage}
			>
				<Icon type="chevron-left" className="text-[3.5vh]" />
			</button>

			<span className="mx-5 text-lg font-medium">
				{`Seiten ${2 * currentPage + 1}-${2 * currentPage + 2} / ${numPages}`}
			</span>

			<button
				className={`flex items-center justify-center p-[1.5vh] rounded-full hover:bg-gray-700/50 transition-all duration-300 shadow-md bg-gray-800/50 mx-2 ${
					currentPage >= Math.ceil(numPages / 2) - 1
						? "opacity-0 pointer-events-none"
						: "opacity-100"
				}`}
				onClick={onNextPage}
			>
				<Icon type="chevron-right" className="text-[3.5vh]" />
			</button>
		</div>
	);
};

export default PageNavigator;
