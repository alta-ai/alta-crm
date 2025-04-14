import React, { useCallback, useMemo } from "react";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Info } from "lucide-react";

import { supabase } from "../../../../lib/supabase";
import RegistrationForm from "../../../forms/RegistrationForm";
import {
	RegistrationFormSchema,
	InsuranceProviderSchema,
} from "../../../types";
import { toDBRegistrationForm } from "../../../types/forms/registration";

import type {
	RegistrationForm as RegistrationFormType,
	Appointment,
	InsuranceProvider,
} from "../../../types";

interface FormViewerProps {
	formId: string;
	appointment: Appointment;
	formType: string;
}

const FormViewer: React.FC<FormViewerProps> = ({ formId, appointment }) => {
	const [refreshKey, setRefreshKey] = React.useState(0);

	const queryClient = useQueryClient();

	// Load form submission if it exists
	const {
		data: rawSubmission,
		isLoading: isLoadingSubmission,
		refetch: refetchSubmission,
	} = useQuery({
		queryKey: ["registration-form-submission", appointment.id, refreshKey],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("registration_form_submissions")
				.select(
					`
            *,
            insurance:insurance_providers(
              id,
              name,
              type
            )
          `
				)
				.eq("appointment_id", appointment.id)
				.maybeSingle();

			if (error) {
				console.error(error);
				throw error;
			}

			try {
				return RegistrationFormSchema.parse(data) as RegistrationFormType;
			} catch (valError) {
				console.error(valError);
			}
		},
	});

	// Abrufen der Versicherungen
	const { data: insurances = [], isLoading: isLoadingInsurances } = useQuery<
		InsuranceProvider[]
	>({
		queryKey: ["insuranceProviders"],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("insurance_providers")
				.select("*")
				.order("name");

			if (error) {
				console.error(error);
				throw error;
			}

			try {
				const _insurances = z
					.array(InsuranceProviderSchema)
					.parse(data) as InsuranceProvider[];
				return _insurances;
			} catch (valError) {
				console.error(valError);
			}

			return [];
		},
	});

	const transformFormData = useCallback((form: RegistrationFormType) => {
		if (!form) return null;

		return {
			...form,
			birthdate: form.birthdate
				? format(new Date(form.birthdate), "yyyy-MM-dd")
				: "",
			details: {
				...form.details,
				hasBeihilfe: form.details?.hasBeihilfe?.toString() || "false",
				hasTransfer: form.details?.hasTransfer?.toString() || "false",
				currentTreatment: form.details?.currentTreatment?.toString() || "false",
				sendReportToDoctor:
					form.details?.sendReportToDoctor?.toString() || "false",
				doctorRecommendation:
					form.details?.doctorRecommendation?.toString() || "false",
			},
		};
	}, []);

	const submission = useMemo(() => {
		return rawSubmission ? transformFormData(rawSubmission) : null;
	}, [rawSubmission, transformFormData]);

	// Load form data
	const { data: form, isLoading: isLoadingForm } = useQuery({
		queryKey: ["form", formId],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("forms")
				.select("*")
				.eq("id", formId)
				.single();

			if (error) throw error;
			return data;
		},
	});

	// Mutation for saving form data
	const saveMutation = useMutation({
		mutationFn: async (formData: any) => {
			// Convert string boolean values to actual booleans
			const submissionData = toDBRegistrationForm({
				...formData,
				appointment_id: appointment.id,
				patient_id: appointment?.patient.id,
				has_beihilfe: formData.has_beihilfe === "true",
				has_transfer: formData.has_transfer === "true",
				current_treatment: formData.current_treatment === "true",
				doctor_recommendation: formData.doctor_recommendation === "true",
				send_report_to_doctor: formData.send_report_to_doctor === "true",
			});

			if (submission) {
				// Update existing submission
				const { error } = await supabase
					.from("registration_form_submissions")
					.update(submissionData)
					.eq("id", submission.id);

				if (error) {
					console.error(error);
					throw error;
				}
			} else {
				// Create new submission
				const { error } = await supabase
					.from("registration_form_submissions")
					.insert([submissionData]);

				if (error) {
					console.error(error);
					throw error;
				}
			}
		},
		onSuccess: async () => {
			// Invalidate relevant queries
			queryClient.invalidateQueries({
				queryKey: ["registration-form-submission", appointment.id, refreshKey],
			});
			queryClient.invalidateQueries({ queryKey: ["patients"] });
			queryClient.invalidateQueries({
				queryKey: ["patient-details", appointment?.patient.id],
			});

			queryClient.refetchQueries({
				queryKey: ["registration-form-submission", appointment.id],
			});

			setRefreshKey(refreshKey + 1);

			await refetchSubmission();
		},
		onError: (error) => {
			console.error("Error saving form data:", error);
		},
	});

	if (isLoadingForm || isLoadingSubmission || isLoadingInsurances) {
		return <div className="text-gray-500">Formular wird geladen...</div>;
	}

	if (!form || !appointment) {
		return (
			<div className="text-red-500">Formular konnte nicht geladen werden</div>
		);
	}

	const createInitialData = () => {
		return (
			submission || {
				gender: appointment.patient.gender,
				title: appointment.patient.title,
				name: appointment.patient.name,
				surname: appointment.patient.surname,
				birthdate: format(appointment.patient.birthdate, "yyyy-MM-dd"),
				contact: appointment.patient.contact,
			}
		);
	};

	// Prepare initial data from patient if no submission exists

	return (
		<div className="space-y-6">
			<div className="bg-white p-6 rounded-lg shadow-sm">
				<h3 className="text-lg font-medium text-gray-900 mb-2">{form.name}</h3>
				{form.description && (
					<p className="text-sm text-gray-500">{form.description}</p>
				)}
			</div>

			<div className="bg-white p-6 rounded-lg shadow-sm">
				{submission ? (
					<div className="mb-6">
						<div className="flex items-start space-x-3">
							<Info className="h-5 w-5 text-blue-500 mt-0.5" />
							<div>
								<p className="text-sm text-gray-900">
									Formular wurde am{" "}
									{format(submission.createdAt, "dd.MM.yyyy HH:mm", {
										locale: de,
									})}{" "}
									ausgefüllt
								</p>
								{submission.updatedAt !== submission.createdAt && (
									<p className="text-sm text-gray-500">
										Zuletzt bearbeitet:{" "}
										{format(submission.updatedAt, "dd.MM.yyyy HH:mm", {
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

				<RegistrationForm
					initialData={createInitialData() as any}
					onSubmit={saveMutation.mutate as any}
					insurances={insurances}
					readOnly={false}
				/>
			</div>
		</div>
	);
};

export default FormViewer;
