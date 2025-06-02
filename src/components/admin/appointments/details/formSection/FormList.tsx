import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Camera, Eye, Pencil } from "lucide-react";
import { z } from "zod";

import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { FormType } from "@components/types/constants";
import { FormSchema, type Form } from "@components/types";
import { FormMap } from "./formMap";

interface FormListProps {
	appointmentId: string;
	examinationId: string;
	billingType: string;
	onPhotoCapture: () => void;
	onViewForm: (formType: FormType) => void;
	onPreviewForm: (formId: FormType) => void;
}

type FormList = {
	[K in FormType]: any;
};

const FormList: React.FC<FormListProps> = ({
	appointmentId,
	examinationId,
	billingType,
	onPhotoCapture,
	onViewForm,
	onPreviewForm,
}) => {
	// Load available forms for this examination and billing type
	const { data: forms, isLoading: isLoadingExamination } = useQuery<Form[]>({
		queryKey: ["examination-forms", examinationId, billingType],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("examination_forms")
				.select(
					`
          form:forms(
            id,
            name,
            description,
            form_type,
						editable
          ),
          billing_type
        `
				)
				.eq("examination_id", examinationId)
				.order("order");

			if (error) {
				console.error(error);
				throw error;
			}

			// Filter forms by billing type
			const formData = data
				.filter((ef) => ef.billing_type.includes(billingType))
				.map((ef) => ef.form);

			try {
				const p = z.array(FormSchema.partial()).parse(formData) as Form[];
				return p;
			} catch (valError) {
				console.error(valError);
				return [] as Form[];
			}
		},
	});

	// Load form submissions for this appointment
	const { data: submissions, isLoading: isLoadingSubmissions } =
		useQuery<FormList>({
			queryKey: ["form-submissions", appointmentId],
			queryFn: async () => {
				// Load all form submissions for this appointment
				const promises = Object.values(FormType).map((formType) =>
					FormMap[formType]?.tableName
						? supabase
								.from(FormMap[formType]?.tableName)
								.select("*")
								.eq("appointment_id", appointmentId)
								.maybeSingle()
						: null
				);

				const resolved = await Promise.all(promises);
				const dataMap = Object.values(FormType).reduce<Record<FormType, any>>(
					(acc, key, index) => {
						acc[key] = resolved[index]?.data;
						return acc;
					},
					{} as Record<FormType, any>
				);

				return dataMap;
			},
		});

	const { data: signatures, isLoading: isLoadingSignatures } =
		useQuery<FormList>({
			queryKey: ["signatures", appointmentId],
			queryFn: async () => {
				// Load all form submissions for this appointment
				const promises = Object.values(FormType).map((f) =>
					supabase
						.from("signatures")
						.select("id, form:forms!inner(form_type)")
						.eq("appointment_id", appointmentId)
						.eq("form.form_type", f)
						.maybeSingle()
				);

				const resolved = await Promise.all(promises);
				const dataMap = Object.values(FormType).reduce<Record<FormType, any>>(
					(acc, key, index) => {
						acc[key] = resolved[index].data;
						return acc;
					},
					{} as Record<FormType, any>
				);

				return dataMap;
			},
		});

	if (isLoadingExamination || isLoadingSubmissions || isLoadingSignatures) {
		return <div className="text-gray-500">Formulare werden geladen...</div>;
	}

	return (
		<div className="space-y-3">
			{/* Photo Capture Button */}
			<button
				onClick={onPhotoCapture}
				className="w-full flex items-center p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
			>
				<Camera className="h-5 w-5 mr-3 text-blue-600" />
				<span>Patientenfoto aufnehmen</span>
			</button>

			{/* Form List */}
			{forms?.map((form) => {
				const isSubmitted = submissions && submissions[form?.form_type];
				const isSigned = signatures && signatures[form?.form_type];

				return (
					<div
						key={form.id}
						className={cn(
							"w-full flex items-center justify-between p-3 text-left border rounded-lg transition-colors",
							isSubmitted || !form.editable
								? "border-green-200 bg-green-50 hover:bg-green-100"
								: "border-gray-200 hover:bg-gray-50"
						)}
					>
						<div>
							<span className="font-medium">{form.name}</span>
							{form.description && (
								<p className="text-sm text-gray-500 mt-1">{form.description}</p>
							)}
							<div className="flex space-x-2">
								{isSubmitted && (
									<span className="inline-flex items-center justify-center bg-green-200 border border-green-300 rounded-full px-2 py-1 text-sm text-green-700 mt-1">
										Ausgefüllt
									</span>
								)}
								{isSigned && (
									<span className="inline-flex items-center justify-center bg-blue-200 border border-blue-300 rounded-full px-2 py-1 text-sm text-blue-700 mt-1">
										Unterschrieben
									</span>
								)}
							</div>
						</div>
						<div className="flex space-x-3">
							<button
								onClick={(e) => {
									e.stopPropagation();
									onPreviewForm(form.form_type);
								}}
								title="PDF Vorschau"
								className="text-gray-400 hover:text-gray-600"
							>
								<Eye className="h-4 w-4" />
							</button>

							{form.editable && (
								<button
									onClick={(e) => {
										e.stopPropagation();
										onViewForm(form.form_type);
									}}
									title="Formular bearbeiten"
									className="text-gray-400 hover:text-gray-600"
								>
									<Pencil className="h-4 w-4" />
								</button>
							)}
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default FormList;
