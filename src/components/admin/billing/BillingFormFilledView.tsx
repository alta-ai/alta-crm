import React, { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../contexts/AuthContext";

interface FormQuestion {
	id: string;
	question_text: string;
	question_type:
		| "yes_no"
		| "single_choice"
		| "multiple_choice"
		| "text"
		| "number"
		| "bullet_points";
	required: boolean;
	depends_on_question_id: string | null;
	depends_on_option_id: string | null;
	options: FormOption[];
}

interface FormOption {
	id: string;
	option_text: string;
	billing_code_id: string | null;
	option_type: string | null;
}

interface BillingFormFilledViewProps {
	examinationId: string;
	formId: string;
	onComplete?: () => void;
}

const BillingFormFilledView: React.FC<BillingFormFilledViewProps> = ({
	examinationId,
	formId,
	onComplete,
}) => {
	const { userData } = useAuth();
	const [formTitle, setFormTitle] = useState("");
	const [questions, setQuestions] = useState<FormQuestion[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [answers, setAnswers] = useState<Record<string, any>>({});
	const [validationErrors, setValidationErrors] = useState<
		Record<string, string>
	>({});

	useEffect(() => {
		const loadFormData = async () => {
			try {
				setLoading(true);
				setError(null);

				// Lade den Abrechnungsbogen
				const { data: formData, error: formError } = await supabase
					.from("billing_forms")
					.select("*")
					.eq("id", formId)
					.single();

				if (formError) throw formError;
				setFormTitle(formData.name);

				// Lade die Fragen des Abrechnungsbogens
				const { data: questionsData, error: questionsError } = await supabase
					.from("billing_form_questions")
					.select("*")
					.eq("form_id", formId)
					.order("order_index");

				if (questionsError) throw questionsError;

				// Debug-Ausgabe zur Überprüfung der Abhängigkeiten
				console.log(
					"Geladene Fragen mit Abhängigkeiten:",
					questionsData.map((q) => ({
						id: q.id,
						text: q.question_text,
						depends_on_question_id: q.depends_on_question_id,
						depends_on_option_id: q.depends_on_option_id,
					}))
				);

				// Lade die Optionen für jede Frage
				const formattedQuestions: FormQuestion[] = [];

				for (const question of questionsData) {
					const { data: optionsData, error: optionsError } = await supabase
						.from("billing_form_options")
						.select("*")
						.eq("question_id", question.id)
						.order("order_index");

					if (optionsError) throw optionsError;

					// Debug-Ausgabe der Optionen
					if (question.depends_on_question_id) {
						console.log(
							`Optionen für abhängige Frage ${question.question_text}:`,
							optionsData
						);
					}

					formattedQuestions.push({
						...question,
						options: optionsData,
					});
				}

				setQuestions(formattedQuestions);

				// Prüfe, ob bereits Antworten existieren
				const { data: existingFormData, error: existingFormError } =
					await supabase
						.from("examination_billing_forms")
						.select("id")
						.eq("examination_id", examinationId)
						.eq("form_id", formId)
						.maybeSingle();

				if (existingFormError) throw existingFormError;

				if (existingFormData) {
					// Lade vorhandene Antworten
					const { data: existingAnswers, error: answersError } = await supabase
						.from("examination_billing_answers")
						.select("*")
						.eq("examination_billing_form_id", existingFormData.id);

					if (answersError) throw answersError;

					const savedAnswers: Record<string, any> = {};
					existingAnswers.forEach((answer) => {
						const question = formattedQuestions.find(
							(q) => q.id === answer.question_id
						);
						if (!question) return;

						if (question.question_type === "multiple_choice") {
							if (!savedAnswers[answer.question_id]) {
								savedAnswers[answer.question_id] = [];
							}
							if (answer.option_id) {
								savedAnswers[answer.question_id].push(answer.option_id);
							}
						} else if (question.question_type === "text") {
							savedAnswers[answer.question_id] = answer.text_answer || "";
						} else if (question.question_type === "number") {
							savedAnswers[answer.question_id] =
								answer.number_answer !== null ? answer.number_answer : "";
						} else if (question.question_type === "bullet_points") {
							if (!savedAnswers[answer.question_id]) {
								savedAnswers[answer.question_id] = question.options.map(
									() => false
								);
							}
							const optionIndex = question.options.findIndex(
								(opt) => opt.id === answer.option_id
							);
							if (optionIndex >= 0) {
								savedAnswers[answer.question_id][optionIndex] = true;
							}
						} else {
							// yes_no oder single_choice
							savedAnswers[answer.question_id] = answer.option_id;
						}
					});

					setAnswers(savedAnswers);
				} else {
					// Initialisiere leere Antworten
					const initialAnswers: Record<string, any> = {};
					formattedQuestions.forEach((question) => {
						if (
							question.question_type === "yes_no" ||
							question.question_type === "single_choice"
						) {
							initialAnswers[question.id] = null;
						} else if (question.question_type === "multiple_choice") {
							initialAnswers[question.id] = [];
						} else if (question.question_type === "text") {
							initialAnswers[question.id] = "";
						} else if (question.question_type === "number") {
							initialAnswers[question.id] = "";
						} else if (question.question_type === "bullet_points") {
							initialAnswers[question.id] = question.options.map(() => false);
						}
					});
					setAnswers(initialAnswers);
				}
			} catch (err: any) {
				console.error("Error loading form data:", err);
				setError(err.message || "Fehler beim Laden des Abrechnungsbogens");
			} finally {
				setLoading(false);
			}
		};

		loadFormData();
	}, [examinationId, formId]);

	const handleAnswerChange = (questionId: string, value: any) => {
		setAnswers((prev) => {
			const newAnswers = {
				...prev,
				[questionId]: value,
			};

			// Überprüfe, ob sich die Sichtbarkeit von abhängigen Fragen ändert
			const updatedAnswers = { ...newAnswers };

			// Sammeln aller Fragen, die direkt abhängig sind
			const directDependentQuestions = questions.filter(
				(q) => q.depends_on_question_id === questionId
			);

			// Rekursive Hilfsfunktion, um alle abhängigen Fragen zu aktualisieren
			const updateDependentQuestions = (dependsOnQuestionId: string) => {
				// Finde alle Fragen, die von dieser Antwort abhängen
				const dependentQuestions = questions.filter(
					(q) => q.depends_on_question_id === dependsOnQuestionId
				);

				dependentQuestions.forEach((question) => {
					const shouldShow = shouldShowQuestionWithAnswers(
						question,
						updatedAnswers
					);

					// Wenn Frage neu sichtbar wird, initialisiere Antworten
					if (shouldShow && updatedAnswers[question.id] === undefined) {
						if (
							question.question_type === "yes_no" ||
							question.question_type === "single_choice"
						) {
							updatedAnswers[question.id] = null;
						} else if (question.question_type === "multiple_choice") {
							updatedAnswers[question.id] = [];
						} else if (question.question_type === "text") {
							updatedAnswers[question.id] = "";
						} else if (question.question_type === "number") {
							updatedAnswers[question.id] = "";
						} else if (question.question_type === "bullet_points") {
							updatedAnswers[question.id] = question.options.map(() => false);
						}

						// Rekursiv auch die von dieser Frage abhängigen Fragen überprüfen
						updateDependentQuestions(question.id);
					}
					// Wenn Frage nicht mehr sichtbar ist, entferne Antworten
					else if (!shouldShow && updatedAnswers[question.id] !== undefined) {
						delete updatedAnswers[question.id];

						// Auch alle weiteren abhängigen Fragen entfernen
						questions
							.filter((q) => q.depends_on_question_id === question.id)
							.forEach((q) => {
								delete updatedAnswers[q.id];
								updateDependentQuestions(q.id);
							});
					}
				});
			};

			// Starte die rekursive Aktualisierung mit den direkten Abhängigkeiten
			updateDependentQuestions(questionId);

			return updatedAnswers;
		});

		// Wenn der Wert gesetzt wird, können wir den Validierungsfehler entfernen
		if (validationErrors[questionId]) {
			setValidationErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[questionId];
				return newErrors;
			});
		}
	};

	// Hilfsfunktion für die Überprüfung der Sichtbarkeit mit bestimmten Antworten
	const shouldShowQuestionWithAnswers = (
		question: FormQuestion,
		currentAnswers: Record<string, any>
	) => {
		// Wenn keine Abhängigkeit existiert, immer anzeigen
		if (!question.depends_on_question_id || !question.depends_on_option_id) {
			return true;
		}

		// Debug-Logging, um Abhängigkeiten zu sehen
		console.log("Prüfe Abhängigkeit für Frage:", {
			frage_id: question.id,
			frage_text: question.question_text,
			depends_on_question_id: question.depends_on_question_id,
			depends_on_option_id: question.depends_on_option_id,
			answer: currentAnswers[question.depends_on_question_id],
		});

		// Prüfe, ob die abhängige Frage mit der richtigen Option beantwortet wurde
		const dependentAnswer = currentAnswers[question.depends_on_question_id];

		// Wenn keine Antwort für die Abhängigkeitsfrage vorliegt, nicht anzeigen
		if (dependentAnswer === null || dependentAnswer === undefined) {
			return false;
		}

		// Prüfen, ob die Antwort mit der gewünschten Option übereinstimmt
		if (Array.isArray(dependentAnswer)) {
			// Für multiple_choice: Wenn eine der ausgewählten Optionen die abhängige Option ist
			const result = dependentAnswer.includes(question.depends_on_option_id);
			console.log(
				`multiple_choice: ${result ? "Zeige Frage" : "Verstecke Frage"}`
			);
			return result;
		} else {
			// Für yes_no und single_choice: Wenn die ausgewählte Option die abhängige Option ist
			const result = dependentAnswer === question.depends_on_option_id;
			console.log(
				`single_choice/yes_no: ${result ? "Zeige Frage" : "Verstecke Frage"}`
			);
			return result;
		}
	};

	const validateForm = () => {
		const errors: Record<string, string> = {};

		questions.forEach((question) => {
			// Prüfe nur Fragen, die angezeigt werden und erforderlich sind
			if (
				!shouldShowQuestionWithAnswers(question, answers) ||
				!question.required
			)
				return;

			const answer = answers[question.id];
			let isValid = false;

			if (
				question.question_type === "yes_no" ||
				question.question_type === "single_choice"
			) {
				isValid = answer !== null && answer !== undefined;
			} else if (question.question_type === "multiple_choice") {
				isValid = Array.isArray(answer) && answer.length > 0;
			} else if (question.question_type === "text") {
				isValid =
					answer !== null && answer !== undefined && answer.trim() !== "";
			} else if (question.question_type === "number") {
				isValid = answer !== null && answer !== undefined && answer !== "";
			} else if (question.question_type === "bullet_points") {
				isValid =
					Array.isArray(answer) && answer.some((checked) => checked === true);
			}

			if (!isValid) {
				errors[question.id] = "Diese Frage muss beantwortet werden";
			}
		});

		setValidationErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmit = async () => {
		if (!validateForm()) {
			// Zur ersten Frage mit Fehler scrollen
			const firstErrorId = Object.keys(validationErrors)[0];
			if (firstErrorId) {
				const element = document.getElementById(`question-${firstErrorId}`);
				if (element) element.scrollIntoView({ behavior: "smooth" });
			}
			return;
		}

		try {
			setSaving(true);
			setError(null);

			// Erstelle oder finde den ausgefüllten Abrechnungsbogen
			let filledFormId;

			const { data: existingFormData, error: existingFormError } =
				await supabase
					.from("examination_billing_forms")
					.select("id")
					.eq("examination_id", examinationId)
					.eq("form_id", formId)
					.maybeSingle();

			if (existingFormError) throw existingFormError;

			if (existingFormData) {
				filledFormId = existingFormData.id;

				// Lösche alle bestehenden Antworten
				const { error: deleteError } = await supabase
					.from("examination_billing_answers")
					.delete()
					.eq("examination_billing_form_id", filledFormId);

				if (deleteError) throw deleteError;
			} else {
				// Erstelle einen neuen ausgefüllten Abrechnungsbogen
				const { data: newFormData, error: insertFormError } = await supabase
					.from("examination_billing_forms")
					.insert({
						examination_id: examinationId,
						form_id: formId,
						created_by: userData?.id,
					})
					.select()
					.single();

				if (insertFormError) throw insertFormError;

				filledFormId = newFormData.id;
			}

			// Speichere alle Antworten, einschließlich der Abhängigkeiten
			for (const questionId in answers) {
				const question = questions.find((q) => q.id === questionId);
				// Nur fortfahren, wenn die Frage existiert
				if (!question) continue;

				const answer = answers[questionId];

				// Debug logging zur Verfolgung der Speicherung
				console.log("Speichere Antwort für Frage:", {
					frage_id: question.id,
					frage_text: question.question_text,
					type: question.question_type,
					answer: answer,
					depends_on_question_id: question.depends_on_question_id,
					depends_on_option_id: question.depends_on_option_id,
				});

				// Antwort speichern basierend auf dem Fragetyp
				if (
					question.question_type === "yes_no" ||
					question.question_type === "single_choice"
				) {
					if (answer) {
						await supabase.from("examination_billing_answers").insert({
							examination_billing_form_id: filledFormId,
							question_id: questionId,
							option_id: answer,
						});
					}
				} else if (question.question_type === "multiple_choice") {
					if (Array.isArray(answer) && answer.length > 0) {
						for (const optionId of answer) {
							await supabase.from("examination_billing_answers").insert({
								examination_billing_form_id: filledFormId,
								question_id: questionId,
								option_id: optionId,
							});
						}
					}
				} else if (question.question_type === "text") {
					await supabase.from("examination_billing_answers").insert({
						examination_billing_form_id: filledFormId,
						question_id: questionId,
						option_id: null,
						text_answer: answer,
					});
				} else if (question.question_type === "number") {
					await supabase.from("examination_billing_answers").insert({
						examination_billing_form_id: filledFormId,
						question_id: questionId,
						option_id: null,
						number_answer: answer === "" ? null : Number(answer),
					});
				} else if (question.question_type === "bullet_points") {
					if (Array.isArray(answer)) {
						for (let index = 0; index < answer.length; index++) {
							if (answer[index] && question.options[index]) {
								await supabase.from("examination_billing_answers").insert({
									examination_billing_form_id: filledFormId,
									question_id: questionId,
									option_id: question.options[index].id,
								});
							}
						}
					}
				}
			}

			// Weiterleiten oder Callback aufrufen
			if (onComplete) {
				onComplete();
			}
		} catch (err: any) {
			console.error("Error saving form answers:", err);
			setError(err.message || "Fehler beim Speichern der Antworten");
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-gray-600">Lade Abrechnungsbogen...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
				{error}
			</div>
		);
	}

	return (
		<div className="bg-white shadow-sm rounded-lg p-6">
			<h1 className="text-xl font-semibold text-gray-900 mb-6">{formTitle}</h1>

			<div className="space-y-6">
				{questions.map(
					(question) =>
						shouldShowQuestionWithAnswers(question, answers) && (
							<div
								key={question.id}
								id={`question-${question.id}`}
								className={`border ${
									validationErrors[question.id]
										? "border-red-300 bg-red-50"
										: "border-gray-200"
								} rounded-md p-4`}
							>
								<div className="flex items-start mb-3">
									<div className="flex-1">
										<h3 className="text-md font-medium text-gray-800">
											{question.question_text}
											{question.required && (
												<span className="text-red-500 ml-1">*</span>
											)}
										</h3>
										{validationErrors[question.id] && (
											<p className="text-sm text-red-600 mt-1">
												{validationErrors[question.id]}
											</p>
										)}
									</div>
								</div>

								<div className="mt-2">
									{question.question_type === "yes_no" && (
										<div className="flex space-x-4">
											{question.options.map((option) => (
												<label
													key={option.id}
													className="inline-flex items-center cursor-pointer"
												>
													<input
														type="radio"
														id={`${question.id}-${option.id}`}
														name={question.id}
														className="form-radio text-blue-600"
														checked={answers[question.id] === option.id}
														onChange={() =>
															handleAnswerChange(question.id, option.id)
														}
													/>
													<span className="ml-2 text-gray-700">
														{option.option_text}
													</span>
												</label>
											))}
										</div>
									)}

									{question.question_type === "single_choice" && (
										<div className="flex flex-col space-y-2">
											{question.options.map((option) => (
												<label
													key={option.id}
													className="flex items-start cursor-pointer py-1"
												>
													<input
														type="radio"
														id={`${question.id}-${option.id}`}
														name={question.id}
														className="form-radio text-blue-600 mt-1"
														checked={answers[question.id] === option.id}
														onChange={() =>
															handleAnswerChange(question.id, option.id)
														}
													/>
													<span className="ml-2 text-gray-700">
														{option.option_text}
													</span>
												</label>
											))}
										</div>
									)}

									{question.question_type === "multiple_choice" && (
										<div className="flex flex-col space-y-2">
											{question.options.map((option) => (
												<label
													key={option.id}
													className="flex items-start cursor-pointer py-1"
												>
													<input
														type="checkbox"
														className="form-checkbox text-blue-600 mt-1"
														checked={(answers[question.id] || []).includes(
															option.id
														)}
														onChange={(e) => {
															const currentAnswers = [
																...(answers[question.id] || []),
															];
															if (e.target.checked) {
																// Hinzufügen
																handleAnswerChange(question.id, [
																	...currentAnswers,
																	option.id,
																]);
															} else {
																// Entfernen
																handleAnswerChange(
																	question.id,
																	currentAnswers.filter(
																		(id) => id !== option.id
																	)
																);
															}
														}}
													/>
													<span className="ml-2 text-gray-700">
														{option.option_text}
													</span>
												</label>
											))}
										</div>
									)}

									{question.question_type === "text" && (
										<div>
											<textarea
												className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
												rows={3}
												value={answers[question.id] || ""}
												onChange={(e) =>
													handleAnswerChange(question.id, e.target.value)
												}
											/>
										</div>
									)}

									{question.question_type === "number" && (
										<div>
											<input
												type="number"
												className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
												value={answers[question.id] || ""}
												onChange={(e) =>
													handleAnswerChange(question.id, e.target.value)
												}
											/>
										</div>
									)}

									{question.question_type === "bullet_points" && (
										<div className="space-y-2">
											{question.options.map((option, index) => (
												<label
													key={option.id}
													className="inline-flex items-center cursor-pointer block"
												>
													<input
														type="checkbox"
														className="form-checkbox text-blue-600"
														checked={answers[question.id]?.[index] || false}
														onChange={(e) => {
															const newBulletAnswers = [
																...(answers[question.id] || []),
															];
															newBulletAnswers[index] = e.target.checked;
															handleAnswerChange(question.id, newBulletAnswers);
														}}
													/>
													<span className="ml-2 text-gray-700">
														{option.option_text}
													</span>
												</label>
											))}
										</div>
									)}
								</div>
							</div>
						)
				)}
			</div>

			<div className="mt-8 flex justify-end">
				<button
					type="button"
					disabled={saving}
					onClick={handleSubmit}
					className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
				>
					{saving ? "Wird gespeichert..." : "Speichern"}
				</button>
			</div>
		</div>
	);
};

export default BillingFormFilledView;
