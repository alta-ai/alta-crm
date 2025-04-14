import { createContext, useContext, ReactNode, useState } from "react";

interface FormContextType<T> {
	data: T | null;
	setData: (newData: T | null) => void;
	form: any;
	setForm: (form: any) => void;
	isLoading: boolean;
	setIsLoading: (isLoading: boolean) => void;
	mutateFn: any;
	setMutateFn: (mutateFn: any) => void;
}

const FormContext = createContext<FormContextType<any> | null>(null);

interface FormContextProviderProps {
	children: ReactNode;
}

export const FormContextProvider = <T,>({
	children,
}: FormContextProviderProps) => {
	const [data, setData] = useState<T | null>(null);
	const [form, setForm] = useState<any>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [mutateFn, setMutateFn] = useState<((newData?: T) => void) | null>(
		null
	);

	return (
		<FormContext.Provider
			value={{
				data,
				setData,
				form,
				setForm,
				isLoading,
				setIsLoading,
				mutateFn,
				setMutateFn,
			}}
		>
			{children}
		</FormContext.Provider>
	);
};

export const useFormContext = <T,>(): FormContextType<T> => {
	const context = useContext(FormContext);
	if (context === null) {
		throw new Error("useFormContext must be used within a FormContextProvider");
	}
	return context as FormContextType<T>;
};

export const withFormContext = <T,>(
	Component: React.FC<T>
): React.FC<Omit<T, keyof FormContextType<T>>> => {
	return (props) => {
		const formContext = useFormContext<T>();
		return <Component {...(props as T)} {...formContext} />;
	};
};
