import type {
	UseFormRegister,
	FieldErrors,
	UseFormTrigger,
} from "react-hook-form";

interface PSATableProps {
	count: number;
	showFreePSA?: boolean;
	register: UseFormRegister<any>;
	errors: FieldErrors<any>;
	trigger: UseFormTrigger<any>;
	readOnly?: boolean;
}

export const PSATable = ({
	count,
	showFreePSA = false,
	register,
	errors,
	trigger,
	readOnly = false,
}: PSATableProps) => {
	const indices = Array.from({ length: count }, (_, i) => i + 1);
	return (
		<div className="bg-white p-6 rounded-lg shadow-sm space-y-8">
			<h3 className="text-lg font-semibold mb-4">PSA-Werte im Verlauf</h3>
			<div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
				<p className="text-sm text-blue-700">
					<strong>Wichtig!</strong> Bitte nehmen Sie sich die Zeit und tragen
					Sie alle PSA-Werte, die der ALTA Klinik noch nicht bekannt sind, für
					unsere Ärzte ein. Sie können ein, zwei oder auch mehrere PSA-Werte
					angeben. Der PSA-Verlauf ist für eine genaue Diagnose sehr wichtig.
					Wenn Sie den genauen Tag nicht wissen, wählen Sie einfach den 1. des
					Monats aus.
				</p>
			</div>
			<div className="space-y-10">
				{indices.map((index) => {
					// For the PSA value: add setValueAs to return undefined for an empty string.
					const { onBlur: onBlurValue, ...psaValueRest } = register(
						`psa_value_${index}` as any,
						{
							required:
								index === 1 ? "Bitte geben Sie einen PSA-Wert ein" : false,
							setValueAs: (value) =>
								["", null, undefined].includes(value)
									? null
									: parseFloat(value),
							validate: (val) => {
								if (index !== 1 && (!val || val.toString().trim() === ""))
									return true;
								const num = parseFloat(val);
								if (isNaN(num)) return "Bitte eine gültige Zahl eingeben";
								if (num <= 0) return "Der Wert muss größer als 0 sein";
								return true;
							},
						}
					);
					// For the PSA date: similarly, use setValueAs.
					const { onBlur: onBlurDate, ...psaDateRest } = register(
						`psa_date_${index}` as any,
						{
							required: index === 1 ? "Bitte geben Sie ein Datum ein" : false,
							setValueAs: (value) => (value === "" ? null : value),
							validate: (val) => {
								if (index !== 1 && (!val || val.trim() === "")) return true;
								const pattern =
									/^(0[1-9]|[12]\d|3[01])\.(0[1-9]|1[0-2])\.\d{4}$/;
								return pattern.test(val) || "Das Datum ist ungültig";
							},
						}
					);
					return (
						<div
							key={index}
							className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end"
						>
							<div className="relative">
								<label className="block text-sm font-medium text-gray-700">
									{index}. PSA-Wert
								</label>
								<input
									type="number"
									{...psaValueRest}
									onBlur={(e) => {
										onBlurValue(e);
										trigger(`psa_value_${index}`);
									}}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
									placeholder="in ng/ml z. B. 5.78"
									disabled={readOnly}
									step={0.001}
								/>
								{errors[`psa_value_${index}`] && (
									<p className="absolute top-full mt-1 left-0 text-red-500 text-sm">
										{String(errors[`psa_value_${index}`]?.message)}
									</p>
								)}
							</div>
							<div className="relative">
								<label className="block text-sm font-medium text-gray-700">
									{index}. Datum{" "}
									{index === 1 &&
										"(Wenn Sie den genauen Tag nicht wissen, wählen Sie einfach den 1. des Monats aus.)"}
								</label>
								<input
									type="text"
									{...psaDateRest}
									onBlur={(e) => {
										onBlurDate(e);
										trigger(`psa_date_${index}`);
									}}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
									placeholder="z.B. 01.01.2024"
									disabled={readOnly}
								/>
								{errors[`psa_date_${index}`] && (
									<p className="absolute top-full mt-1 left-0 text-red-500 text-sm">
										{String(errors[`psa_date_${index}`]?.message)}
									</p>
								)}
							</div>
						</div>
					);
				})}
			</div>

			{showFreePSA && (
				<div>
					<label className="block text-sm font-medium text-gray-700">
						Freies PSA (falls bekannt)
					</label>
					<input
						type="number"
						step="0.01"
						{...register("free_psa_value", {
							valueAsNumber: true,
							setValueAs: (value) => (value === "" ? null : value),
							min: {
								value: 0,
								message: "Der Wert muss größer als 0 sein",
							},
						})}
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
						placeholder="Freies PSA in ng/ml"
						disabled={readOnly}
					/>
					{errors["free_psa_value"] && (
						<p className="text-red-500 text-sm mt-1">
							{String(errors["free_psa_value"]?.message)}
						</p>
					)}
				</div>
			)}
		</div>
	);
};

export default PSATable;
