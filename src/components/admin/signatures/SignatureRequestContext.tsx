import React, {
	createContext,
	useState,
	useEffect,
	useContext,
	ReactNode,
} from "react";

import {
	CUSTOM_SIGNATURE_CONTENT,
	type CustomComponents,
} from "./customSignatureContent";

import { supabase } from "../../../lib/supabase";
import { FormType } from "../../types/constants";
import { FormMap } from "../appointments/details/formMap";
import {
	Appointment,
	AppointmentSchema,
	Patient,
	PatientSchema,
} from "../../types";

export interface SignatureDetails {
	appointment: Partial<Appointment>;
	patient: Partial<Patient>;
	forms: ExaminationForm[];
}

interface ExaminationForm {
	order: number;
	form: FormInfo;
	data?: any;
	completed: boolean;
	signed: boolean;
}

interface FormInfo {
	id: string;
	name: string;
	form_type: FormType;
}

export enum SignatureStages {
	BEFORE = "before",
	SIGNATURE = "signature",
	AFTER = "after",
}

interface SignatureRequestContextValue {
	signatureDetails: SignatureDetails | null;
	refetch: () => void;
	activeSignatureIndex: number;
	hasOpenRequest: boolean;
	getCustomComponents: () => CustomComponents;
	refetchFormData: (signatureIndex: number) => void;
	onConfirmSignature: ({
		signature,
		callback,
	}: {
		signature: string;
		callback?: () => Promise<void>;
	}) => Promise<void>;
	onFinishSignatureStage: () => void;
	closeSignatureRequest: () => void;
	signatureStage: SignatureStages;
	setSignatureStage: React.Dispatch<React.SetStateAction<SignatureStages>>;
	ConnectedSignaturePad: () => JSX.Element;
}

interface SignatureRequestProviderProps {
	children: ReactNode;
	pollingFrequency?: number;
}

const inferNextUnsignedIndex = ({
	forms,
	currentIndex = -1,
}: {
	forms: ExaminationForm[];
	currentIndex?: number;
}): number => {
	const index = forms.findIndex(
		(form, index) => !form.signed && form.completed && index > currentIndex
	);
	return index;
};

const SignatureRequestContext = createContext<
	SignatureRequestContextValue | undefined
>(undefined);

export const SignatureRequestProvider: React.FC<
	SignatureRequestProviderProps
> = ({ children, pollingFrequency = 15 }) => {
	// These states are used to manage the signature request
	const [signatureDetails, setSignatureDetails] =
		useState<SignatureDetails | null>(null);
	const [activePolling, setActivePolling] = useState<boolean>(true);
	const [deviceID, setDeviceID] = useState<string | null>(null);
	const [activeSignatureIndex, setActiveSignatureIndex] = useState<number>(0);
	const [signatureStage, setSignatureStage] = useState<SignatureStages>(
		SignatureStages.BEFORE
	);

	const fetchFormData = async (formInfo: FormInfo, appointmentID: string) => {
		try {
			let { data, error } = await supabase
				.from(FormMap[formInfo.form_type].tableName)
				.select("*")
				.eq("appointment_id", appointmentID)
				.single();

			if (error) {
				console.error(`Error fetching form ${formInfo.name}: `, error);
				return null;
			}

			return data;
		} catch (err) {
			console.error(err);
			return null;
		}
	};

	const populateSignatures = async (formID: string, appointmentID: string) => {
		try {
			let { data, error } = await supabase
				.from("signatures")
				.select(
					`
					signature
					`
				)
				.eq("form_id", formID)
				.eq("appointment_id", appointmentID)
				.single();

			if (error) {
				console.error("Error fetching signature request", error);
				return null;
			}

			return data;
		} catch (err) {
			console.error(err);
			return null;
		}
	};

	const fetchRelevantForms = async (
		examinationID: string,
		appointmentID: string
	): Promise<ExaminationForm[]> => {
		try {
			let { data, error } = await supabase
				.from("examination_forms")
				.select(
					`
					order,
					form:forms(
						id,
						name,
						form_type
					)
					`
				)
				.eq("examination_id", examinationID)
				.order("order", { ascending: true })
				.overrideTypes<Array<ExaminationForm>>();

			if (data) {
				data = await Promise.all(
					data.map(async (f) => {
						const formData = await fetchFormData(f.form, appointmentID);
						const signature = await populateSignatures(
							f.form.id,
							appointmentID
						);

						return {
							...f,
							data: { ...formData, ...signature },
							completed: formData !== null,
							signed: signature !== null,
						};
					})
				);
			}

			if (error) {
				console.error("Error fetching signature request", error);
				return [];
			}

			return data || [];
		} catch (err) {
			console.error(err);
			return [];
		}
	};

	// Function to fetch recent signature request entry ID
	const fetchRecentSignatureRequest = async () => {
		if (!deviceID || !activePolling) return;

		try {
			let { data, error } = await supabase
				.from("signature_requests")
				.select(
					`
					*,
					appointment:appointments(
						*,
						examination:examinations(
							id
						)
					),
					patient:patients(
						*
					)
					`
				)
				.order("created_at", { ascending: false })
				.limit(1)
				.single();

			if (error) {
				console.error("Error fetching signature request", error);
				throw error;
			}

			console.log(data);

			fetchRelevantForms(
				data?.appointment?.examination?.id,
				data?.appointment?.id
			)
				.then((forms) => {
					setActiveSignatureIndex(inferNextUnsignedIndex({ forms }));
					setSignatureDetails({
						forms,
						appointment: AppointmentSchema.partial().parse(data?.appointment),
						patient: PatientSchema.partial().parse(data?.patient),
					});
					setActivePolling(false);
				})
				.catch((err) => {
					console.error("Error fetching forms: ", err);
					setActivePolling(false);
				});
		} catch (err) {
			console.error(err);
		}
	};

	const storeSignatureRequest = async (signature: string) => {
		const { error } = await supabase.from("signatures").insert({
			appointment_id: signatureDetails?.appointment.id,
			patient_id: signatureDetails?.patient.id,
			form_id: signatureDetails?.forms[activeSignatureIndex].form.id,
			signature: signature,
		});

		if (error) {
			console.error("Error storing signature request", error);
			throw error;
		}
	};

	const refetchFormData = async (signatureIndex: number) => {
		if (!signatureDetails) return;

		const form = signatureDetails?.forms[signatureIndex].form;
		fetchFormData(form, signatureDetails?.appointment.id as string).then(
			(newData) =>
				setSignatureDetails((prevState) => {
					if (!prevState) return null;

					const newForms = [...prevState.forms];
					newForms[signatureIndex].data = newData;
					return {
						...prevState,
						forms: newForms,
					};
				})
		);
	};

	// Polling the recent signature request at configurable intervals
	useEffect(() => {
		if (!activePolling) return;

		fetchRecentSignatureRequest();
		const intervalId = setInterval(
			fetchRecentSignatureRequest,
			pollingFrequency * 1000
		);
		return () => clearInterval(intervalId);
	}, [deviceID, activePolling]);

	useEffect(() => {
		setDeviceID("mock-device-id"); // In real implementation, get this from user context
	}, []);

	/**
	 * Function to handle signature confirmation
	 */
	const onConfirmSignature = ({
		signature,
		callback = async () => {},
	}: {
		signature: string;
		callback?: () => Promise<void>;
	}) => {
		return new Promise<void>((resolve, reject) => {
			// In real scenario, you would post to your API
			// For now, just simulate success
			setTimeout(async () => {
				try {
					// Show success notification (implement with your preferred notification system)
					storeSignatureRequest(signature);

					await callback();

					setSignatureStage(SignatureStages.AFTER);
					resolve();
				} catch (e) {
					console.error("Error occurred", e);
					reject(e);
				}
			}, 500);
		});
	};

	/**
	 * Function to finish the signature stage
	 */
	const onFinishSignatureStage = () => {
		setSignatureStage(SignatureStages.BEFORE);

		setActiveSignatureIndex(
			inferNextUnsignedIndex({
				forms: signatureDetails!.forms,
				currentIndex: activeSignatureIndex,
			})
		);

		setSignatureDetails((prevState) => {
			if (!prevState) return null;

			const newForms = [...prevState.forms];
			newForms[activeSignatureIndex].signed = true;
			return {
				...prevState,
				forms: newForms,
			};
		});
	};

	/**
	 * Close the signature request
	 */
	const closeSignatureRequest = () => {
		setSignatureDetails(null);
		setActivePolling(true);
		setSignatureStage(SignatureStages.BEFORE);
	};

	/**
	 * Get custom components for the form
	 */
	const getCustomComponents = (): CustomComponents => {
		if (!signatureDetails) return { before: [], after: [] };

		const form = signatureDetails.forms[activeSignatureIndex]?.form.form_type;
		return CUSTOM_SIGNATURE_CONTENT[form] || { before: [], after: [] };
	};

	/**
	 * Renders the signature pad component
	 */
	const ConnectedSignaturePad = () => {
		// Import the actual SignaturePad component
		const { SignaturePad } = require("./SignaturePad");
		return <SignaturePad />;
	};

	return (
		<SignatureRequestContext.Provider
			value={{
				signatureDetails,
				refetch: fetchRecentSignatureRequest,
				activeSignatureIndex,
				hasOpenRequest: signatureDetails !== null,
				refetchFormData,
				getCustomComponents,
				onConfirmSignature,
				onFinishSignatureStage,
				closeSignatureRequest,
				signatureStage,
				setSignatureStage,
				ConnectedSignaturePad,
			}}
		>
			{children}
		</SignatureRequestContext.Provider>
	);
};

// Custom hook to use the context
export const useSignatureRequest = (): SignatureRequestContextValue => {
	const context = useContext(SignatureRequestContext);
	if (context === undefined) {
		throw new Error(
			"useSignatureRequest must be used within a SignatureRequestProvider"
		);
	}
	return context;
};

// HOC to wrap components with SignatureRequestProvider
export const withSignatureRequest = <P extends object>(
	Component: React.ComponentType<P>
): React.FC<P> => {
	return (props: P) => {
		return (
			<SignatureRequestProvider>
				<Component {...props} />
			</SignatureRequestProvider>
		);
	};
};
