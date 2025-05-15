import React, { useContext, useEffect } from "react";

import { useFormData } from "./formDataContext";
import { FormType } from "../../types/constants";
import { Signature, SignatureSchema } from "../../types";
import { supabase } from "../../../lib/supabase";

interface SignatureContextType {
	data: Partial<Signature> | null;
}

const SignatureContext = React.createContext<SignatureContextType | null>(null);

export const SignatureContextProvider = <T extends Record<string, any>>({
	children,
	formType,
	...props
}: {
	children: React.ReactNode;
	formType: FormType;
	props: T;
}) => {
	const { appointmentData } = useFormData();
	const [data, setData] = React.useState<Partial<Signature> | null>(null);

	useEffect(() => {
		const fetchSignatures = async () => {
			const { data, error } = await supabase
				.from("signatures")
				.select("created_at, signature, form:forms!inner(form_type)")
				.eq("appointment_id", appointmentData.id)
				.eq("form.form_type", formType)
				.single();

			if (error) {
				console.error(error);
				return;
			}

			if (data) {
				setData(SignatureSchema.partial().parse(data));
			}
		};

		fetchSignatures();
	}, []);

	return (
		<SignatureContext.Provider value={{ data }}>
			{children}
		</SignatureContext.Provider>
	);
};

export const useSignature = () => {
	const context = useContext(SignatureContext);
	if (context === null) {
		throw new Error(
			"useSignature must be used within a SignatureContextProvider"
		);
	}
	return context;
};
