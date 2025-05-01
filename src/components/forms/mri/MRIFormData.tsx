import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";

import {
	type MRIForm as MRIFormType,
	type Appointment,
	type Patient,
	MRIFormSchema,
} from "../../types";
import { useFormContext } from "../formContext";
import { boolToString, stringToBool } from "../../types/utils";
import { FormType } from "../../types/constants";

interface MRIFormDataProps {
	appointment: Appointment;
	formType: FormType;
	stringify?: boolean; // added
}

export interface MRIFormDataContextType {
	submission: MRIFormType;
	patient: Patient;
}

export const MRIFormData = ({
	appointment,
	formType: formType,
	stringify = true, // added default
}: MRIFormDataProps): ReactNode => {
	const { setIsLoading, setData, setForm, data, setMutateFn } =
		useFormContext<MRIFormDataContextType>();

	const [refreshKey, setRefreshKey] = useState(0);

	const queryClient = useQueryClient();

	// Load form submission if it exists
	const {
		data: rawSubmission,
		isLoading: isLoadingSubmission,
		refetch: refetchSubmission,
	} = useQuery({
		queryKey: ["mri_consent_form_submissions", appointment.id, refreshKey],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("mri_consent_form_submissions")
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
				return MRIFormSchema.parse(data) as MRIFormType;
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
		(form: MRIFormType) => {
			if (!form) return null;

			// cast boolean fields to string if stringify is true
			return stringify ? boolToString(MRIFormSchema, form) : form;
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
				...(stringify ? stringToBool(MRIFormSchema, formData) : {}),
			};

			if (submission) {
				// Update existing submission
				const { error } = await supabase
					.from("mri_consent_form_submissions")
					.update(submissionData)
					.eq("id", submission.id);

				if (error) {
					console.error(error);
					throw error;
				}
			} else {
				// Create new submission
				const { error } = await supabase
					.from("mri_consent_form_submissions")
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
				queryKey: ["mri_consent_form_submissions", appointment.id, refreshKey],
			});

			queryClient.refetchQueries({
				queryKey: ["mri_consent_form_submissions", appointment.id],
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
				submission: submission as MRIFormType,
				patient: appointment.patient as Patient,
			});
		}

		if (!isLoadingForm) {
			setForm(form);
		}
	}, [form, submission]);

	return <></>;
};

export default MRIFormData;
