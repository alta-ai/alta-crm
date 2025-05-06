import React from "react";

import { Document } from "@react-pdf/renderer";
import { CTForm } from "./CTForm";
import { MRIForm } from "./MRIForm";
import { FormProps } from "../types";

export const CTMRIForm: React.FC<FormProps> = (props) => {
	return (
		<Document onRender={props?.onRender}>
			<MRIForm onlyForMen={true} />

			<CTForm onlyForMen={true} />
		</Document>
	);
};
