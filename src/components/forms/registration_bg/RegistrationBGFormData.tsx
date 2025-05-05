import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";

import {
	type RegistrationBGForm as RegistrationBGFormType,
	type Appointment,
	type Patient,
	RegistrationBGFormSchema,
} from "../../types";
import { useFormContext } from "../formContext";
import { boolToString, extract, stringToBool } from "../../types/utils";
import { FormType } from "../../types/constants";

interface RegistrationBGFormDataProps {
	appointment: Appointment;
	formType: FormType;
	stringify?: boolean;
}

export interface RegistrationBGFormDataContextType {
	submission: RegistrationBGFormType;
	patient: Patient;
}

export const RegistrationBGFormData = ({
	appointment,
	formType: formType,
	stringify = true,
}: RegistrationBGFormDataProps): ReactNode => {
	const { setIsLoading, setData, setForm, data, setMutateFn } =
		useFormContext<RegistrationBGFormDataContextType>();

	const [refreshKey, setRefreshKey] = useState(0);

	const queryClient = useQueryClient();

	// Load form submission if it exists
	const {
		data: rawSubmission,
		isLoading: isLoadingSubmission,
		refetch: refetchSubmission,
	} = useQuery({
		queryKey: ["registration_bg_form_submissions", appointment.id, refreshKey],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("registration_bg_form_submissions")
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
				return RegistrationBGFormSchema.parse(data) as RegistrationBGFormType;
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
		(form: RegistrationBGFormType) => {
			if (!form) return null;

			// cast boolean fields to string if stringify is true
			return stringify ? boolToString(RegistrationBGFormSchema, form) : form;
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
				...(stringify ? stringToBool(RegistrationBGFormSchema, formData) : {}),
			};

			if (submission) {
				// Update existing submission
				const { error } = await supabase
					.from("registration_bg_form_submissions")
					.update(submissionData)
					.eq("id", submission.id);

				if (error) {
					console.error(error);
					throw error;
				}
			} else {
				// Create new submission
				const { error } = await supabase
					.from("registration_bg_form_submissions")
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
				queryKey: [
					"registration_bg_form_submissions",
					appointment.id,
					refreshKey,
				],
			});

			queryClient.refetchQueries({
				queryKey: ["registration_bg_form_submissions", appointment.id],
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
				submission: (submission || {
					...extract(RegistrationBGFormSchema, appointment.patient),
				}) as RegistrationBGFormType,
				patient: appointment.patient as Patient,
			});
		}

		if (!isLoadingForm) {
			setForm(form);
		}
	}, [form, submission]);

	return <></>;
};

export default RegistrationBGFormData;
