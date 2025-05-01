const styling = {
	page: {
		backgroundColor: "white",
		padding: "25px 30px",
		margin: 0,
		fontFamily: "Roboto",
		fontSize: "12px",
	},
	row: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
	},
	rowElement: {
		width: "49.0%",
	},
	longRowElement: {
		width: "100%",
	},
	FormTypeLines: {
		FormRow: {
			marginBottom: "4px",
			fontSize: "11px",
		},
		BoxSelection: {
			display: "flex",
			flexDirection: "row",
			checkbox: {
				marginRight: "10px",
			},
		},
	},
	QuestionBox: {
		border: "2px solid black",
		padding: "5px",
	},

	Center: {
		display: "flex" as const,
		justifyContent: "center" as const,
		alignItems: "center" as const,
	},

	Column: {
		display: "flex",
		flexDirection: "column",
	},

	Row: {
		display: "flex" as const,
		flexDirection: "row" as const,
	},

	Emph: {
		fontWeight: "bold",
		border: "2px solid red",
		padding: "5px",
	},
};

export default styling;
