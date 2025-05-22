import React from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Info } from "lucide-react";

import type { Appointment } from "@components/types";
import { useFormContext } from "@components/forms/formContext";

interface FormViewerProps {
	appointment: Appointment;
	FormComponent: React.FC<{
		readOnly: boolean;
	}>;
}

interface DataContext {
	submission: {
		created_at: Date;
		updated_at: Date;
	};
}

const FormViewer: React.FC<FormViewerProps> = ({
	appointment,
	FormComponent,
}) => {
	const { isLoading, form, data } = useFormContext<DataContext>();

	if (isLoading) {
		return <div className="text-gray-500">Formular wird geladen...</div>;
	}

	if (!form || !appointment) {
		return (
			<div className="text-red-500">Formular konnte nicht geladen werden</div>
		);
	}

	const hasSubmission = data?.submission && data.submission.created_at;

	return (
		<div className="space-y-6">
			<div className="bg-white p-6 rounded-lg shadow-sm">
				<h3 className="text-lg font-medium text-gray-900 mb-2">{form.name}</h3>
				{form.description && (
					<p className="text-sm text-gray-500">{form.description}</p>
				)}
			</div>

			<div className="bg-white p-6 rounded-lg shadow-sm">
				{hasSubmission ? (
					<div className="mb-6">
						<div className="flex items-start space-x-3">
							<Info className="h-5 w-5 text-blue-500 mt-0.5" />
							<div>
								<p className="text-sm text-gray-900">
									Formular wurde am{" "}
									{format(data.submission.created_at, "dd.MM.yyyy HH:mm", {
										locale: de,
									})}{" "}
									ausgefüllt
								</p>
								{data.submission.updated_at !== data.submission.created_at && (
									<p className="text-sm text-gray-500">
										Zuletzt bearbeitet:{" "}
										{format(data.submission.updated_at, "dd.MM.yyyy HH:mm", {
											locale: de,
										})}
									</p>
								)}
							</div>
						</div>
					</div>
				) : (
					<div className="mb-6">
						<div className="flex items-start space-x-3">
							<Info className="h-5 w-5 text-blue-500 mt-0.5" />
							<p className="text-sm text-gray-900">
								Dieses Formular wurde noch nicht ausgefüllt.
							</p>
						</div>
					</div>
				)}

				<FormComponent readOnly={false} />
			</div>
		</div>
	);
};

export default FormViewer;
