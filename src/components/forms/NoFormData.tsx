import { ReactNode, useEffect } from "react";

import { useFormContext } from "./formContext";

export const NoFormData = (): ReactNode => {
	const { setIsLoading } = useFormContext<any>();

	useEffect(() => {
		setIsLoading(false);
	}, []);

	return <></>;
};

export default NoFormData;
