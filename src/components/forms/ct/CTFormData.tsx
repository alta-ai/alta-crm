import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";

import {
	type CTForm as CTFormType,
	type Appointment,
	type Patient,
	CTFormSchema,
} from "../../types";
import { useFormContext } from "../formContext";
import { boolToString, stringToBool } from "../../types/utils";
import { FormType } from "../../types/constants";

interface CTFormDataProps {
	appointment: Appointment;
	formType: FormType;
	stringify?: boolean; // added
}

export interface CTFormDataContextType {
	submission: CTFormType;
	patient: Patient;
}

export const CTFormData = ({
	appointment,
	formType: formType,
	stringify = true, // added default
}: CTFormDataProps): ReactNode => {
	const { setIsLoading, setData, setForm, data, setMutateFn } =
		useFormContext<CTFormDataContextType>();

	const [refreshKey, setRefreshKey] = useState(0);

	const queryClient = useQueryClient();

	// Load form submission if it exists
	const {
		data: rawSubmission,
		isLoading: isLoadingSubmission,
		refetch: refetchSubmission,
	} = useQuery({
		queryKey: ["c_form_submissions", appointment.id, refreshKey],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("c_form_submissions")
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
				return CTFormSchema.parse(data) as CTFormType;
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

	const transformFormData = useCallback(
		(form: CTFormType) => {
			if (!form) return null;

			// cast boolean fields to string if stringify is true
			return stringify ? boolToString(CTFormSchema, form) : form;
		},
		[stringify]
	);

	const submission = useMemo(() => {
		return rawSubmission ? transformFormData(rawSubmission) : null;
	}, [rawSubmission, transformFormData]);

	// Mutation for saving form data
	const saveMutation = useMutation({
		mutationFn: async (formData: any) => {
			// Convert string boolean values to actual booleans
			const submissionData = {
				...formData,
				appointment_id: appointment.id,
				patient_id: appointment?.patient.id,
				...(stringify ? stringToBool(CTFormSchema, formData) : {}),
			};

			if (submission) {
				// Update existing submission
				const { error } = await supabase
					.from("c_form_submissions")
					.update(submissionData)
					.eq("id", submission.id);

				if (error) {
					console.error(error);
					throw error;
				}
			} else {
				// Create new submission
				const { error } = await supabase
					.from("c_form_submissions")
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
				queryKey: ["c_form_submissions", appointment.id, refreshKey],
			});

			queryClient.refetchQueries({
				queryKey: ["c_form_submissions", appointment.id],
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
				submission: submission as CTFormType,
				patient: appointment.patient as Patient,
			});
		}

		if (!isLoadingForm) {
			setForm(form);
		}
	}, [form, submission]);

	return <></>;
};

export default CTFormData;
