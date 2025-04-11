export type * from "./patient";
export { PatientSchema, PartialPatientSchema } from "./patient";
export type * from "./appointment";
export { AppointmentSchema, PartialAppointmentSchema } from "./appointment";
export type * from "./insurance_providers";
export { InsuranceProviderSchema } from "./insurance_providers";

export * from "./forms";
export type * from "./forms";

export interface FormProps {
	onRender?: () => void;
}
