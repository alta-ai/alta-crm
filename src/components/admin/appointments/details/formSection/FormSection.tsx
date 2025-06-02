import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "../../../../../lib/supabase";
import { Appointment, Patient, PatientSchema } from "../../../../types";
import { FormType } from "../../../../types/constants";
import { Tabs } from "../../../../ui";
import { FormTabContent, FormTabSelector } from "./tabs/FormTab";
import { BillingTabContent, BillingTabSelector } from "./tabs/AccountingTab";

interface FormSectionProps {
	appointment: Appointment;
	examinationId: string;
}

const FormSection: React.FC<FormSectionProps> = ({ appointment }) => {
	// Load patient data for PDF
	const {
		data: patient,
		isLoading: isLoadingPatientData,
		error,
	} = useQuery({
		queryKey: ["patient", appointment.patient?.id],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("patients")
				.select(
					`
					gender,
					title,
					patient_number,
					first_name,
					last_name,
					birth_date,
					phone,
					mobile,
					email,
					street,
					house_number,
					postal_code,
					city,
					country
					`
				)
				.eq("id", appointment.patient?.id)
				.single();

			if (error) {
				console.error(error);
				throw error;
			}

			try {
				const p = PatientSchema.partial().parse(data) as Patient;
				return p;
			} catch (valError) {
				console.error(valError);
			}
		},
	});

	if (error) {
		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
				<div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[85vh] flex items-center justify-center">
					<p className="text-red-500">
						Fehler beim Laden der Patientendaten: {error.message}
					</p>
				</div>
			</div>
		);
	}

	if (isLoadingPatientData) {
		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
				<div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[85vh] flex items-center justify-center">
					<p className="text-gray-500">Lade Patientendaten ...</p>
				</div>
			</div>
		);
	}

	return (
		<>
			{/* Tabs für Formulare und Abrechnungsbögen */}
			<div className="mb-6">
				<Tabs
					defaultTab={0}
					tabs={[
						{
							tabSelectorComponent: FormTabSelector,
							tabContentComponent: () => (
								<FormTabContent
									appointment={appointment}
									patient={patient as Patient}
								/>
							),
						},
						{
							tabSelectorComponent: BillingTabSelector,
							tabContentComponent: () => (
								<BillingTabContent
									examinationId={appointment.examination.id as string}
								/>
							),
						},
					]}
				/>
			</div>
		</>
	);
};

export default FormSection;
