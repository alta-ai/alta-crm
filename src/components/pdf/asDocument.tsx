import { Document } from "@react-pdf/renderer";

export const asDocument = (Form) => (props) =>
	<Document onRender={props?.onRender}>{Form(props)}</Document>;
