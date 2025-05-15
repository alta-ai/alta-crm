import { useState } from "react";
import { useForm } from "react-hook-form";
import { Info } from "lucide-react";
import { IPSSForm as IPSSFormType } from "../../types";
import { useFormContext } from "../formContext";
import type { IPSSFormDataContextType } from "./IPSSFormData";

interface IPSSFormProps {
	onComplete?: () => void;
	readOnly?: boolean;
}

const ANSWER_TYPE_1 = [
	"niemals",
	"seltener als in einem von fünf Fällen",
	"seltener als in der Hälfte der Fälle",
	"unge­fähr in der Hälfte der Fälle",
	"in mehr als der Hälfte aller Fälle",
	"fast immer",
];

const ANSWER_TYPE_2 = [
	"nie",
	"einmal",
	"zweimal",
	"dreimal",
	"viermal",
	"fünfmal",
];

const ANSWER_TYPE_3 = [
	"ausgezeichnet",
	"zufrieden",
	"überwiegend zufrieden",
	"gemischt, teils zufrieden, teils unzufrieden",
	"unglücklich",
	"sehr schlecht",
];

export const IPSSForm = ({ onComplete, readOnly }: IPSSFormProps) => {
	const { data, mutateFn } = useFormContext<IPSSFormDataContextType>();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<IPSSFormType>({ defaultValues: data?.submission as any });

	const [isSaving, setIsSaving] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [saveSuccess, setSaveSuccess] = useState(false);

	const renderSelect = (
		name: keyof IPSSFormType,
		label: string,
		options: string[],
		required = false,
		emptyOption = true,
		useIndices = true
	) => {
		return (
			<div className="space-y-2">
				<label className="block text-sm font-medium text-gray-700">
					{label} {required && "*"}
				</label>
				<select
					{...register(
						name as any,
						required ? { required: `${label} ist erforderlich` } : {}
					)}
					className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
					disabled={readOnly}
				>
					{emptyOption && <option value="">Bitte auswählen</option>}
					{options.map((option, index) => (
						<option
							key={useIndices ? index : option}
							value={useIndices ? index : option}
						>
							{option}
						</option>
					))}
				</select>
				{errors[name] && (
					<p className="text-red-500 text-sm">
						{String(errors[name]?.message)}
					</p>
				)}
			</div>
		);
	};

	const onFormSubmit = async (data: IPSSFormType) => {
		try {
			setIsSaving(true);
			setSaveError(null);
			setSaveSuccess(false);

			// compute ipss score
			data.ipss_score =
				data.bladder_not_empty_after_urinating +
				data.urinating_twice_in_two_hours +
				data.restart_urination +
				data.struggling_delay_urination +
				data.weak_urine_stream +
				data.strain_to_urinate +
				data.get_up_at_night_to_urinate +
				7;

			mutateFn.mutate(data);

			setSaveSuccess(true);
			setTimeout(() => setSaveSuccess(false), 3000);
		} catch (error: any) {
			console.error("Error saving form:", error);
			setSaveError(error.message || "Fehler beim Speichern des Formulars");
		} finally {
			setIsSaving(false);
		}

		if (onComplete) {
			onComplete();
		}
	};

	return (
		<form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
			<div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
				<div className="space-y-10">
					{renderSelect(
						"bladder_not_empty_after_urinating",
						"Wie oft während des letzten Monats hatten Sie das Gefühl, dass Ihre Blase nach dem Wasserlassen nicht ganz entleert war?",
						ANSWER_TYPE_1,
						true
					)}

					{renderSelect(
						"urinating_twice_in_two_hours",
						"Wie oft während des letzten Monats mussten Sie in weniger als zwei Stunden ein zweites Mal Wasser lassen?",
						ANSWER_TYPE_1,
						true
					)}

					{renderSelect(
						"restart_urination",
						"Wie oft während des letzten Monats mussten Sie beim Wasserlassen mehrmals aufhören und neu beginnen?",
						ANSWER_TYPE_1,
						true
					)}

					{renderSelect(
						"struggling_delay_urination",
						"Wie oft während des letzten Monats hatten Sie Schwierigkeiten, das Wasserlassen hinauszuzögern?",
						ANSWER_TYPE_1,
						true
					)}

					{renderSelect(
						"weak_urine_stream",
						"Wie oft während des letzten Monats hatten Sie einen schwachen Strahl beim Wasserlassen?",
						ANSWER_TYPE_1,
						true
					)}

					{renderSelect(
						"strain_to_urinate",
						"Wie oft während des letzten Monats mussten Sie pressen oder sich anstrengen, um mit dem Wasserlassen zu beginnen?",
						ANSWER_TYPE_1,
						true
					)}

					{renderSelect(
						"get_up_at_night_to_urinate",
						"Wie oft sind Sie während des letzten Monats im Durchschnitt nachts aufgestanden, um Wasser zu lassen? Maßgebend ist der Zeitraum vom Zubettgehen bis zum Aufstehen am Morgen",
						ANSWER_TYPE_2,
						true
					)}

					{renderSelect(
						"urination_symptoms_satisfaction_level",
						"Wie würden Sie sich fühlen, wenn sich Ihre Symptome beim Wasserlassen zukünftig nicht mehr ändern würden?",
						ANSWER_TYPE_3,
						true,
						true,
						false
					)}
				</div>
			</div>

			{/* Save Button - only show if onSubmit is provided */}
			<div className="flex items-center justify-between">
				<div>
					{saveError && <p className="text-sm text-red-600">{saveError}</p>}
					{saveSuccess && (
						<p className="text-sm text-green-600">
							Formular wurde erfolgreich gespeichert
						</p>
					)}
				</div>
				<button
					type="submit"
					disabled={isSaving}
					className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
				>
					{isSaving ? "Wird gespeichert..." : "Speichern"}
				</button>
			</div>
		</form>
	);
};

export default IPSSForm;
