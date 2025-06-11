export { PatientSchema, type Patient } from "./patient";
export { AppointmentSchema, type Appointment } from "./appointment";
export {
	InsuranceProviderSchema,
	type InsuranceProvider,
} from "./insurance_providers";
export { AppointmentStatusSchema, type AppointmentStatus } from "./status";
export { ExaminationSchema, type Examination } from "./examination";
export { DeviceSchema, type Device } from "./device";
export { LocationSchema, type Location } from "./location";
export { SignatureSchema, type Signature } from "./signature";
export { FormSchema, type Form } from "./forms_table";
export {
	ExaminationFormSchema,
	type ExaminationForm,
} from "./examination_forms";

export * from "./forms";
export type * from "./forms";

export interface FormProps {
	onRender?: () => void;
}

export { type User, type UserProfile } from "./user";
