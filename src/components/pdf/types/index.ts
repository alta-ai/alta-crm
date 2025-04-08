import { RegistrationForm } from "./registration";
export type * from "./patient";
export type * from "./appointment";
export { AppointmentSchema } from "./appointment";
export type { RegistrationForm as RegistrationFormData };

export interface FormProps {
	onRender?: () => void;
}
