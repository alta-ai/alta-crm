import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";

import {
	type ProstateHoLEPForm as ProstateHoLEPFormType,
	type Appointment,
	type Patient,
	ProstateHoLEPFormSchema,
} from "../../types";
import { useFormContext } from "../formContext";
import { boolToString, stringToBool } from "../../types/utils";
import { FormType } from "../../types/constants";

interface ProstateHoLEPFormDataProps {
	appointment: Appointment;
	formType: FormType;
}

export interface ProstateHoLEPFormDataContextType {
	submission: ProstateHoLEPFormType;
	patient: Patient;
}

export const ProstateHoLEPFormData = ({
	appointment,
	formType: formType,
}: ProstateHoLEPFormDataProps): ReactNode => {
	const { setIsLoading, setData, setForm, data, setMutateFn } =
		useFormContext<ProstateHoLEPFormDataContextType>();

	const [refreshKey, setRefreshKey] = useState(0);

	const queryClient = useQueryClient();

	// Load form submission if it exists
	const {
		data: rawSubmission,
		isLoading: isLoadingSubmission,
		refetch: refetchSubmission,
	} = useQuery({
		queryKey: ["prostate_holep_form_submissions", appointment.id, refreshKey],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("prostate_holep_form_submissions")
				.select(
					`
          *
        `
				)
				.eq("patient_id", appointment.patient.id)
				.maybeSingle();

			if (error) {
				console.error(error);
				throw error;
			}

			try {
				return ProstateHoLEPFormSchema.parse(data) as ProstateHoLEPFormType;
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

	const transformFormData = useCallback((form: ProstateHoLEPFormType) => {
		if (!form) return null;

		// cast boolean fields to string
		return boolToString(ProstateHoLEPFormSchema, form);
	}, []);

	const submission = useMemo(() => {
		return rawSubmission ? transformFormData(rawSubmission) : null;
	}, [rawSubmission, transformFormData]);

	// Mutation for saving form data
	const saveMutation = useMutation({
		mutationFn: async (formData: ProstateHoLEPFormType) => {
			// Convert string boolean values to actual booleans
			const submissionData = {
				...formData,
				patient_id: appointment?.patient.id,
				appointment_id: appointment.id,
				...stringToBool(ProstateHoLEPFormSchema, formData),
			};

			if (rawSubmission) {
				// Update existing submission
				const { error } = await supabase
					.from("prostate_holep_form_submissions")
					.update(submissionData)
					.eq("id", rawSubmission.id);

				if (error) {
					console.error(error);
					throw error;
				}
			} else {
				// Create new submission
				const { error } = await supabase
					.from("prostate_holep_form_submissions")
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
					"prostate_holep_form_submissions",
					appointment.id,
					refreshKey,
				],
			});

			queryClient.refetchQueries({
				queryKey: ["prostate_holep_form_submissions", appointment.id],
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
				submission: submission as ProstateHoLEPFormType,
				patient: appointment.patient as Patient,
			});
		}

		if (!isLoadingForm) {
			setForm(form);
		}
	}, [form, submission]);

	return <></>;
};

export default ProstateHoLEPFormData;
