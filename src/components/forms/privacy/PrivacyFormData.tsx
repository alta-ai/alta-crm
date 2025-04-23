import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { supabase } from "../../../lib/supabase";

import {
	type PrivacyForm as PrivacyFormType,
	type Appointment,
	PrivacyFormSchema,
} from "../../types";
import { useFormContext } from "../formContext";
import { boolToString, stringToBool } from "../../types/utils";

interface PrivacyFormDataProps {
	appointment: Appointment;
	formId: string;
}

export interface PrivacyFormDataContextType {
	submission: PrivacyFormType;
}

export const PrivacyFormData = ({
	appointment,
	formId,
}: PrivacyFormDataProps): ReactNode => {
	const { setIsLoading, setData, setForm, data, setMutateFn } =
		useFormContext<PrivacyFormDataContextType>();

	const [refreshKey, setRefreshKey] = useState(0);

	const queryClient = useQueryClient();

	// Load form submission if it exists
	const {
		data: rawSubmission,
		isLoading: isLoadingSubmission,
		refetch: refetchSubmission,
	} = useQuery({
		queryKey: ["privacy_form_submissions", appointment.id, refreshKey],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("privacy_form_submissions")
				.select(
					`
            *
          `
				)
				.eq("appointment_id", appointment.id)
				.maybeSingle();

			if (error) {
				console.error(error);
				throw error;
			}

			try {
				return PrivacyFormSchema.parse(data) as PrivacyFormType;
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

	const transformFormData = useCallback((form: PrivacyFormType) => {
		if (!form) return null;

		// cast boolean fields to string
		return boolToString(PrivacyFormSchema, form);
	}, []);

	const submission = useMemo(() => {
		return rawSubmission ? transformFormData(rawSubmission) : null;
	}, [rawSubmission, transformFormData]);

	// Mutation for saving form data
	const saveMutation = useMutation({
		mutationFn: async (formData: any) => {
			// Convert string boolean values to actual booleans
			const submissionData = {
				appointment_id: appointment.id,
				patient_id: appointment?.patient.id,
				...stringToBool(PrivacyFormSchema, formData),
			};

			if (submission) {
				// Update existing submission
				const { error } = await supabase
					.from("privacy_form_submissions")
					.update(submissionData)
					.eq("id", submission.id);

				if (error) {
					console.error(error);
					throw error;
				}
			} else {
				// Create new submission
				const { error } = await supabase
					.from("privacy_form_submissions")
					.insert(submissionData);

				if (error) {
					console.error(error);
					throw error;
				}
			}
		},
		onSuccess: async () => {
			// Invalidate relevant queries
			queryClient.invalidateQueries({
				queryKey: ["privacy_form_submissions", appointment.id, refreshKey],
			});
			queryClient.refetchQueries({
				queryKey: ["privacy_form_submissions", appointment.id],
			});

			setRefreshKey(refreshKey + 1);

			await refetchSubmission();
		},
		onError: (error) => {
			console.error("Error saving form data:", error);
		},
	});

	useEffect(() => {
		const isLoading = isLoadingForm || isLoadingSubmission;

		setIsLoading(isLoading);

		if (!isLoading) {
			setMutateFn(saveMutation);
		}
	}, [isLoadingForm, isLoadingSubmission]);

	useEffect(() => {
		if (!isLoadingSubmission) {
			setData({
				...data,
				submission: submission as any,
			});
		}

		if (!isLoadingForm) {
			setForm(form);
		}
	}, [form, submission]);

	return <></>;
};

export default PrivacyFormData;
