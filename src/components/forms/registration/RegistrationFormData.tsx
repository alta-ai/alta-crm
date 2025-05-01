import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { supabase } from "../../../lib/supabase";

import type {
	RegistrationForm as RegistrationFormType,
	Appointment,
	InsuranceProvider,
} from "../../types";
import { RegistrationFormSchema, InsuranceProviderSchema } from "../../types";
import { format } from "date-fns";
import { useFormContext } from "../formContext";
import { FormType } from "../../types/constants";
import { boolToString, stringToBool } from "../../types/utils";

interface RegistrationFormDataProps {
	appointment: Appointment;
	formType: FormType;
	stringify?: boolean;
}

export interface RegistrationFormDataContextType {
	insurances: InsuranceProvider[];
	submission: RegistrationFormType;
}

export const RegistrationFormData = ({
	appointment,
	formType: formType,
	stringify = true,
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
		queryKey: ["form", formType],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("forms")
				.select("*")
				.eq("form_type", formType)
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
			...(stringify && boolToString(RegistrationFormSchema, form)),
			birth_date: form.birth_date
				? format(new Date(form.birth_date), "yyyy-MM-dd")
				: "",
		};
	}, []);

	const submission = useMemo(() => {
		return rawSubmission ? transformFormData(rawSubmission) : null;
	}, [rawSubmission, transformFormData]);

	// Mutation for saving form data
	const saveMutation = useMutation({
		mutationFn: async (formData: any) => {
			// Convert string boolean values to actual booleans
			const submissionData = RegistrationFormSchema.parse({
				...formData,
				appointment_id: appointment.id,
				patient_id: appointment?.patient.id,
				...(stringify && stringToBool(RegistrationFormSchema, form)),
			});

			// Remove populated fields
			delete submissionData.insurance;

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
				...appointment.patient,
				...(appointment.patient.birth_date && {
					birth_date: format(appointment.patient.birth_date, "yyyy-MM-dd"),
				}),
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
		if (!isLoadingInsurances && !isLoadingSubmission) {
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
