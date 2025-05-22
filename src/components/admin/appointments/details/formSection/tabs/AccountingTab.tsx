import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@lib/supabase";
import { ExternalLink, ArrowLeft } from "lucide-react";

import { TabSelectorProps } from "@components/ui";
import { cn } from "@components/styling";
import { BillingFormFilledView } from "@components/admin/billing";

export const BillingTabSelector = ({ isActive }: TabSelectorProps) => {
	return (
		<button
			className={cn(
				"whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm",
				isActive
					? "border-blue-500 text-blue-600"
					: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
			)}
		>
			Abrechnungsbögen
		</button>
	);
};

interface BillingTabContentProps {
	examinationId: string;
}

export const BillingTabContent = ({
	examinationId,
}: BillingTabContentProps) => {
	const [selectedBillingFormId, setSelectedBillingFormId] = useState<
		string | null
	>(null);

	// Lade Untersuchungsdetails, um die Kategorie-ID zu erhalten
	const { data: examination, isLoading: isLoadingExamination } = useQuery({
		queryKey: ["examination-details", examinationId],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("examinations")
				.select(
					`
					id,
					name,
					category_id
				`
				)
				.eq("id", examinationId)
				.single();

			if (error) throw error;
			return data;
		},
	});

	// Lade Abrechnungsbögen, die zur Kategorie der Untersuchung passen
	const {
		data: categoryBillingForms,
		isLoading: isLoadingCategoryBillingForms,
	} = useQuery({
		queryKey: ["category-billing-forms", examination?.category_id],
		queryFn: async () => {
			if (!examination?.category_id) return [];

			const { data, error } = await supabase
				.from("billing_forms")
				.select(
					`
					id,
					name,
					description
				`
				)
				.eq("category_id", examination.category_id);

			if (error) throw error;
			return data;
		},
		enabled: !!examination?.category_id,
	});

	// Lade bereits ausgefüllte Abrechnungsbögen für diese Untersuchung
	const { data: filledBillingForms, isLoading: isLoadingFilledBillingForms } =
		useQuery({
			queryKey: ["filled-billing-forms", examinationId],
			queryFn: async () => {
				const { data, error } = await supabase
					.from("examination_billing_forms")
					.select(
						`
					id,
					form_id,
					created_at,
					billing_form:billing_forms(
						id,
						name,
						description
					)
				`
					)
					.eq("examination_id", examinationId);

				if (error) throw error;
				return data;
			},
		});

	return (
		<div>
			{/* Wenn ein Abrechnungsbogen ausgewählt ist, zeigen wir ihn an */}
			{selectedBillingFormId ? (
				<>
					<button
						onClick={() => setSelectedBillingFormId(null)}
						className="mb-6 text-sm text-blue-600 hover:text-blue-800 flex items-center"
					>
						<ArrowLeft className="h-4 w-4 mr-1" />
						Zurück zur Übersicht
					</button>

					<BillingFormFilledView
						examinationId={examinationId}
						formId={selectedBillingFormId}
						onComplete={() => setSelectedBillingFormId(null)}
					/>
				</>
			) : (
				<>
					<div className="flex justify-between items-center mb-4">
						<h3 className="text-lg font-medium">Abrechnungsbögen</h3>
					</div>

					{isLoadingExamination ||
					isLoadingCategoryBillingForms ||
					isLoadingFilledBillingForms ? (
						<div className="py-4 text-gray-500">Lade Abrechnungsbögen...</div>
					) : (
						<div className="space-y-6">
							{/* Bereits ausgefüllte Abrechnungsbögen */}
							{filledBillingForms && filledBillingForms.length > 0 && (
								<div className="mb-8">
									<h4 className="text-md font-medium mb-3">
										Ausgefüllte Abrechnungsbögen
									</h4>
									<div className="space-y-3">
										{filledBillingForms.map((filledForm: any) => (
											<div
												key={filledForm.id}
												className="w-full flex items-center justify-between p-3 text-left border rounded-lg border-green-200 bg-green-50 hover:bg-green-100 cursor-pointer"
												onClick={() => {
													setSelectedBillingFormId(filledForm.form_id);
												}}
											>
												<div>
													<span className="font-medium">
														{filledForm.billing_form.name}
													</span>
													{filledForm.billing_form.description && (
														<p className="text-sm text-gray-500 mt-1">
															{filledForm.billing_form.description}
														</p>
													)}
													<p className="text-xs text-gray-500 mt-1">
														Ausgefüllt am:{" "}
														{new Date(
															filledForm.created_at
														).toLocaleDateString()}
													</p>
												</div>
												<ExternalLink className="h-4 w-4 text-gray-400" />
											</div>
										))}
									</div>
								</div>
							)}

							{/* Verfügbare Abrechnungsbögen für die Kategorie */}
							<div>
								<h4 className="text-md font-medium mb-3">
									Verfügbare Abrechnungsbögen
								</h4>
								{categoryBillingForms && categoryBillingForms.length > 0 ? (
									<div className="space-y-3">
										{categoryBillingForms.map((billingForm: any) => {
											// Prüfen, ob bereits ausgefüllt
											const isAlreadyFilled = filledBillingForms?.some(
												(filledForm: any) =>
													filledForm.form_id === billingForm.id
											);

											return (
												<div
													key={billingForm.id}
													className={cn(
														"w-full flex items-center justify-between p-3 text-left border rounded-lg transition-colors cursor-pointer",
														isAlreadyFilled
															? "border-green-200 bg-green-50 hover:bg-green-100"
															: "border-gray-200 hover:bg-gray-50"
													)}
													onClick={() => {
														setSelectedBillingFormId(billingForm.id);
													}}
												>
													<div>
														<span className="font-medium">
															{billingForm.name}
														</span>
														{billingForm.description && (
															<p className="text-sm text-gray-500 mt-1">
																{billingForm.description}
															</p>
														)}
														{isAlreadyFilled && (
															<p className="text-xs text-green-600 mt-1">
																Ausgefüllt
															</p>
														)}
													</div>
													<ExternalLink className="h-4 w-4 text-gray-400" />
												</div>
											);
										})}
									</div>
								) : (
									<div className="py-4 text-gray-500">
										Keine Abrechnungsbögen für diese Untersuchungskategorie
										verfügbar.
									</div>
								)}
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
};
