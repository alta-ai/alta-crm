import { useForm } from "react-hook-form";

type FormData = {
	[key: string]: string | boolean;
};

interface CostReimbursementFormProps {
	onComplete: () => void;
}

const CostReimbursementForm = ({ onComplete }: CostReimbursementFormProps) => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormData>();

	const onSubmit = (data: FormData) => {
		console.log("Form data:", data);
		onComplete();
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
			<div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
				<h2 className="text-2xl font-bold">Kostenerstattung</h2>

				<div className="prose max-w-none">
					<p className="text-gray-700">
						Hiermit nehme ich zur Kenntnis, dass ein privatärztlicher
						Behandlungsvertrag zwischen mir und der ALTA Klinik geschlossen
						wird. Rechnungen zwischen mir und der ALTA Klinik werde ich in
						voller Höhe vollständig selber tragen, unabhängig von der
						Erstattungsregelung meiner privaten Krankenversicherung,
						Beihilfestelle oder anderen Leistungsträgern.
					</p>

					<p className="text-gray-700">
						Eine Abrechnung über die gesetzlichen Krankenkassen oder privaten
						Zusatzversicherungen ist nicht möglich. Als privatversicherter
						Patient, oder PBeaKK oder KVB I-III Versicherter mit ggf.
						Beihilfeanspruch nehme ich zur Kenntnis, dass Untersuchungen oder
						Leistungen im Einzelfall bis zum 3,5-fachen Steigerungsfaktor
						abgerechnet werden können, falls Abweichungen im Ablauf der
						Untersuchung entstehen, oder das Krankheitsbild, der Zeitaufwand
						oder die Umstände dieses erfordern (GOÄ § 5, Abs. 2).
					</p>

					<p className="text-gray-700">
						Ich wurde darüber aufgeklärt, dass gerade in diesen Fällen die
						Kosten von den jeweiligen Leistungsträgern teilweise nicht bzw.
						nicht vollständig erstattet werden können.
					</p>
				</div>

				<div className="space-y-4">
					<label className="flex items-center space-x-3">
						<input
							type="checkbox"
							{...register("fgmo", {
								required:
									"Bitte bestätigen Sie, dass Sie die Kostenerstattung gelesen und verstanden haben",
							})}
							className="form-checkbox h-5 w-5 text-blue-600 rounded"
						/>
						<span className="text-sm text-gray-700">
							Hiermit bestätige ich, dass ich die Kostenerstattung gelesen und
							verstanden habe.
						</span>
					</label>
					{errors.fgmo && (
						<p className="text-red-500 text-sm">{errors.fgmo.message}</p>
					)}
				</div>
			</div>

			{/* Submit Button */}
			<div className="flex justify-end">
				<button
					type="submit"
					className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
				>
					Weiter zum Datenschutz
				</button>
			</div>
		</form>
	);
};

export default CostReimbursementForm;
