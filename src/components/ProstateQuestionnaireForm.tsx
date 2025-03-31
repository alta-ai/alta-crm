import React from 'react';
import { useForm } from 'react-hook-form';
import { Info } from 'lucide-react';

type FormData = {
  [key: string]: string | string[];
};

interface ProstateQuestionnaireFormProps {
  readOnly?: boolean;
}

const ProstateQuestionnaireForm = ({ readOnly = false }: ProstateQuestionnaireFormProps) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<FormData>();

  // Watch fields for conditional rendering
  const prostateBeenTreated = watch('prostateBeenTreated') as string;
  const prostateSymptoms = watch('prostateSymptoms') as string;
  const prostateScreening = watch('prostateScreening') as string;
  const prostateHistory = watch('prostateHistory') as string;
  const prostateOtherConditions = watch('prostateOtherConditions') as string;
  const prostateMedications = watch('prostateMedications') as string;

  const onSubmit = (data: FormData) => {
    console.log("Form data:", data);
    // Here you would handle form submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* General Information */}
      <div className="prose max-w-none bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold mb-4">Prostata-Fragebogen</h3>
        <p className="text-gray-700">
          Dieser Fragebogen hilft uns, Ihre Prostatabeschwerden besser einzuschätzen und die optimale 
          Behandlung für Sie zu finden. Bitte beantworten Sie die folgenden Fragen so genau wie möglich.
        </p>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4">
          <div className="flex">
            <Info className="h-6 w-6 text-blue-500 mr-2" />
            <p className="text-sm text-blue-700">
              Ihre Angaben werden vertraulich behandelt und dienen ausschließlich der medizinischen Beurteilung.
            </p>
          </div>
        </div>
      </div>

      {/* Previous Treatment */}
      <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
        <h3 className="text-lg font-semibold mb-4">Vorbehandlungen</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Wurden Sie bereits wegen Prostatabeschwerden behandelt? *
            </label>
            <div className="mt-2 space-x-4">
              {["Ja", "Nein"].map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={option}
                    disabled={readOnly}
                    {...register("prostateBeenTreated", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.prostateBeenTreated && (
              <p className="text-red-500 text-sm mt-1">{errors.prostateBeenTreated.message}</p>
            )}
          </div>

          {prostateBeenTreated === "Ja" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Welche Behandlungen haben Sie bisher erhalten? *
              </label>
              <textarea
                {...register("previousTreatments", { 
                  required: prostateBeenTreated === "Ja" ? "Bitte beschreiben Sie die bisherigen Behandlungen" : false 
                })}
                disabled={readOnly}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                placeholder="Bitte beschreiben Sie die Art der Behandlung und wann diese stattfand"
              />
              {errors.previousTreatments && (
                <p className="text-red-500 text-sm mt-1">{errors.previousTreatments.message}</p>
              )}
            </div>
          )}
        </div>

        {/* Current Symptoms */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Haben Sie aktuell Beschwerden? *
            </label>
            <div className="mt-2 space-x-4">
              {["Ja", "Nein"].map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={option}
                    disabled={readOnly}
                    {...register("prostateSymptoms", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.prostateSymptoms && (
              <p className="text-red-500 text-sm mt-1">{errors.prostateSymptoms.message}</p>
            )}
          </div>

          {prostateSymptoms === "Ja" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Welche Beschwerden haben Sie? *
              </label>
              <div className="mt-2 space-y-2">
                {[
                  "Häufiges Wasserlassen",
                  "Schwacher Harnstrahl",
                  "Nächtliches Wasserlassen",
                  "Schmerzen beim Wasserlassen",
                  "Blut im Urin",
                  "Erektionsstörungen",
                  "Andere Beschwerden"
                ].map((symptom) => (
                  <label key={symptom} className="flex items-center">
                    <input
                      type="checkbox"
                      value={symptom}
                      disabled={readOnly}
                      {...register("currentSymptoms", {
                        required: prostateSymptoms === "Ja" ? "Bitte wählen Sie mindestens ein Symptom" : false
                      })}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2 text-gray-700">{symptom}</span>
                  </label>
                ))}
              </div>
              {errors.currentSymptoms && (
                <p className="text-red-500 text-sm mt-1">{errors.currentSymptoms.message}</p>
              )}
            </div>
          )}
        </div>

        {/* PSA Screening */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Wurde bei Ihnen bereits eine PSA-Bestimmung durchgeführt? *
            </label>
            <div className="mt-2 space-x-4">
              {["Ja", "Nein"].map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={option}
                    disabled={readOnly}
                    {...register("prostateScreening", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.prostateScreening && (
              <p className="text-red-500 text-sm mt-1">{errors.prostateScreening.message}</p>
            )}
          </div>

          {prostateScreening === "Ja" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Letzter PSA-Wert (ng/ml) *
                </label>
                <input
                  type="text"
                  disabled={readOnly}
                  {...register("psaValue", { 
                    required: prostateScreening === "Ja" ? "Bitte geben Sie den PSA-Wert an" : false 
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
                {errors.psaValue && (
                  <p className="text-red-500 text-sm mt-1">{errors.psaValue.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Datum der PSA-Bestimmung *
                </label>
                <input
                  type="date"
                  disabled={readOnly}
                  {...register("psaDate", { 
                    required: prostateScreening === "Ja" ? "Bitte geben Sie das Datum an" : false 
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
                {errors.psaDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.psaDate.message}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Family History */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Gibt es in Ihrer Familie Fälle von Prostatakrebs? *
            </label>
            <div className="mt-2 space-x-4">
              {["Ja", "Nein", "Unbekannt"].map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={option}
                    disabled={readOnly}
                    {...register("prostateHistory", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.prostateHistory && (
              <p className="text-red-500 text-sm mt-1">{errors.prostateHistory.message}</p>
            )}
          </div>

          {prostateHistory === "Ja" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Welche Familienmitglieder sind/waren betroffen? *
              </label>
              <textarea
                {...register("familyHistoryDetails", { 
                  required: prostateHistory === "Ja" ? "Bitte geben Sie Details zur Familiengeschichte an" : false 
                })}
                disabled={readOnly}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                placeholder="z.B. Vater, Bruder, etc. und Alter bei Diagnose"
              />
              {errors.familyHistoryDetails && (
                <p className="text-red-500 text-sm mt-1">{errors.familyHistoryDetails.message}</p>
              )}
            </div>
          )}
        </div>

        {/* Other Conditions */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Haben Sie andere relevante Erkrankungen? *
            </label>
            <div className="mt-2 space-x-4">
              {["Ja", "Nein"].map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={option}
                    disabled={readOnly}
                    {...register("prostateOtherConditions", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.prostateOtherConditions && (
              <p className="text-red-500 text-sm mt-1">{errors.prostateOtherConditions.message}</p>
            )}
          </div>

          {prostateOtherConditions === "Ja" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Welche Erkrankungen haben Sie? *
              </label>
              <textarea
                {...register("otherConditionsDetails", { 
                  required: prostateOtherConditions === "Ja" ? "Bitte beschreiben Sie Ihre Erkrankungen" : false 
                })}
                disabled={readOnly}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                placeholder="Bitte beschreiben Sie relevante Erkrankungen"
              />
              {errors.otherConditionsDetails && (
                <p className="text-red-500 text-sm mt-1">{errors.otherConditionsDetails.message}</p>
              )}
            </div>
          )}
        </div>

        {/* Medications */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nehmen Sie regelmäßig Medikamente ein? *
            </label>
            <div className="mt-2 space-x-4">
              {["Ja", "Nein"].map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={option}
                    disabled={readOnly}
                    {...register("prostateMedications", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.prostateMedications && (
              <p className="text-red-500 text-sm mt-1">{errors.prostateMedications.message}</p>
            )}
          </div>

          {prostateMedications === "Ja" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Welche Medikamente nehmen Sie ein? *
              </label>
              <textarea
                {...register("medicationsDetails", { 
                  required: prostateMedications === "Ja" ? "Bitte listen Sie Ihre Medikamente auf" : false 
                })}
                disabled={readOnly}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                placeholder="Bitte geben Sie Name und Dosierung der Medikamente an"
              />
              {errors.medicationsDetails && (
                <p className="text-red-500 text-sm mt-1">{errors.medicationsDetails.message}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Submit Button - only show if not in readonly mode */}
      {!readOnly && (
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Formular absenden
          </button>
        </div>
      )}
    </form>
  );
};

export default ProstateQuestionnaireForm;