import {
	CategoryScale,
	Chart as ChartJS,
	LineElement,
	LinearScale,
	PointElement,
	TimeScale,
	Tooltip,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import Chart from "chart.js/auto";

import "chartjs-adapter-moment";
import { dumpPsaValues } from "../../types/utils";
import { ProstateNewPatientForm } from "../../types";

const LINEARIZATION_FACTOR = 8;

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Tooltip,
	TimeScale,
	annotationPlugin
);

function areSameDay(date1: Date, date2: Date) {
	return (
		date1.getFullYear() === date2.getFullYear() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getDate() === date2.getDate()
	);
}

const calculateAge = (date: Date, referenceDate: Date) => {
	const ageInMS = date.getTime() - referenceDate.getTime();
	return Math.floor(ageInMS / (1000 * 60 * 60 * 24 * 365.25));
};

interface CreatePSADiagramProps {
	formData: Partial<ProstateNewPatientForm>;
	setFinishedRendering: (finished: boolean) => void;
	referenceDate: Date;
}

export const createPSADiagram = ({
	formData,
	setFinishedRendering,
	referenceDate,
}: CreatePSADiagramProps) => {
	const psaData = dumpPsaValues(formData);

	let dates = [] as Date[];
	let psaValues = [] as number[];
	let lastPrintedTick = null as Date | null;
	let printedValues = [] as Date[];
	let timeHorizonInDays = 365;

	if (psaData) {
		dates = psaData?.map((series) => {
			const date = series.testDate;
			date.setDate(1);
			return date;
		});

		psaValues = psaData.map((series) => series.psaValue);

		timeHorizonInDays = Math.ceil(
			(dates[dates.length - 1].getTime() - dates[0].getTime()) /
				(1000 * 60 * 60 * 24)
		);

		lastPrintedTick = dates[0];
		printedValues = [dates[0], dates[dates.length - 1]];
	}

	const options = {
		devicePixelRatio: 10.0,
		animation: {
			onComplete: () => {
				setFinishedRendering(true);
				console.log("Finished rendering");
			},
			duration: 0.01,
		},
		plugins: {
			legend: {
				display: false,
			},
			annotation: {
				annotations: {
					line1: {
						type: "line",
						yMin: 4,
						yMax: 4,
						borderColor: "red",
						borderWidth: 1,
					},
				},
			},
		},
		scales: {
			x: {
				type: "time",
				time: {
					unit: "month",
					displayFormats: {
						month: "MM/YYYY",
					},
					tooltipFormat: "MM/YYYY",
				},
				ticks: {
					source: "labels",
					color: "black",
					font: {
						size: 11,
					},
					callback: (value, index) => {
						const date = dates[index];

						if (
							areSameDay(dates[0], date) ||
							areSameDay(dates[dates.length - 1], date)
						) {
							return [value, `${calculateAge(date, referenceDate)} Jahre`];
						}

						const daysSinceLastPrintedTick = Math.ceil(
							(date.getTime() - lastPrintedTick.getTime()) /
								(1000 * 60 * 60 * 24)
						);
						const daysTillLastMeasuredValues = Math.ceil(
							(dates[dates.length - 1].getTime() - date.getTime()) /
								(1000 * 60 * 60 * 24)
						);

						if (
							daysSinceLastPrintedTick >=
								timeHorizonInDays / LINEARIZATION_FACTOR &&
							!printedValues.includes(date) &&
							daysTillLastMeasuredValues >=
								timeHorizonInDays / LINEARIZATION_FACTOR
						) {
							printedValues.push(date);
							lastPrintedTick = date;
							return [value, `${calculateAge(date, referenceDate)} Jahre`];
						}

						return "";
					},
				},
				grid: {
					width: 1,
					color: (context) => {
						if (context.index === 0) return "black";
					},
				},
			},
			y: {
				beginAtZero: true,
				ticks: {
					color: "black",
				},
				grid: {
					width: 1,
					source: "data",
					color: (context) => {
						if (context.index === 0) return "black";
						else return "rgba(255, 255, 255, 0.2)";
					},
				},
				border: {
					display: false,
				},
			},
		},
	};

	const data = {
		labels: dates,
		datasets: [
			{
				borderColor: "#C4C4C4",
				width: 0.5,
				pointRadius: 4,
				pointOpacity: 1,
				pointBackgroundColor: "#C4C4C4",
				data: psaValues,
			},
		],
	};

	const canvasElement = document.getElementById("render-canvas-chart");

	if (!Chart.getChart(canvasElement)) {
		new Chart(canvasElement, {
			type: "line",
			data,
			options,
		});
	}
};
