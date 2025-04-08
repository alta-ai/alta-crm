import { RegistrationForm } from "./registration";
export type * from "./patient";
export { PatientSchema, PartialPatientSchema } from "./patient";
export type * from "./appointment";
export { AppointmentSchema } from "./appointment";
export type { RegistrationForm };

export interface FormProps {
	onRender?: () => void;
}
