import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { supabase } from "../../../lib/supabase";

import type {
	RegistrationForm as RegistrationFormType,
	Appointment,
	InsuranceProvider,
} from "../../types";
import {
	RegistrationFormSchema,
	InsuranceProviderSchema,
	toDBRegistrationForm,
} from "../../types";
import { format } from "date-fns";
import { useFormContext } from "../formContext";

interface RegistrationFormDataProps {
	appointment: Appointment;
	formId: string;
}

interface RegistrationFormDataContextType {
	insurances: InsuranceProvider[];
	submission: RegistrationFormType | null;
}

export const RegistrationFormData = ({
	appointment,
	formId,
}: RegistrationFormDataProps): ReactNode => {
	const { setIsLoading, setData, setForm, data, setMutateFn } =
		useFormContext<RegistrationFormDataContextType>();

	const [refreshKey, setRefreshKey] = useState(0);

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

	// Load insurance providers
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

	useEffect(() => {
		const isLoading =
			isLoadingForm || isLoadingSubmission || isLoadingInsurances;

		setIsLoading(isLoading);

		if (!isLoading) {
			setMutateFn(saveMutation);
		}
	}, [isLoadingForm, isLoadingSubmission, isLoadingInsurances]);

	useEffect(() => {
		if (!isLoadingInsurances && !isLoadingInsurances) {
			setData({
				...data,
				submission: createInitialData() as any,
				insurances: insurances || [],
			});
		}

		if (!isLoadingForm) {
			setForm(form);
		}
	}, [form, submission, insurances]);

	return <></>;
};

export default RegistrationFormData;
