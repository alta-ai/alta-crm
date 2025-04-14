import React from 'react';
import { useForm } from 'react-hook-form';
import { Info, AlertCircle } from 'lucide-react';

type FormData = {
  [key: string]: string | string[] | boolean;
};

const CTConsentForm = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<FormData>();

  // Watch fields for conditional rendering
  const gender = watch("gender");
  const previousContrastMedia = watch("previousContrastMedia");
  const allergies = watch("allergies");
  const prelimExams = watch("prelimExams");
  const thyroidMedication = watch("thyroidMedication");
  const bloodThinners = watch("bloodThinners");
  const infectiousDisease = watch("infectiousDisease");
  
  const onSubmit = (data: FormData) => {
    console.log("Form data:", data);
    // Here you would make your API call
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* CT Information */}
      <div className="prose max-w-none bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold mb-4">Aufklärungsbogen für Computertomographie (CT) mit Kontrastmittel</h3>
        <p className="text-gray-700">
          Die Computertomographie (CT) ist ein diagnostisches Verfahren, bei dem die zu untersuchende Körperregion mit Verwendung von Röntgenstrahlen dargestellt wird. 
          Die Strahlenbelastung wird dabei so gering wie möglich gehalten (low-dose-CT).
        </p>
        <p className="text-gray-700">
          Bei einigen Fragestellungen ist für die CT-Untersuchung die Gabe eines Kontrastmittels notwendig. 
          Die Entscheidung über eine möglich notwendige Kontrastmittelgabe trifft der Arzt.
        </p>
        <p className="text-gray-700">
          Bei CT-Untersuchungen wird das Kontrastmittel über eine elektrische Pumpe in die Armvene gespritzt und/oder oral verabreicht. 
          Dabei können vorübergehend ein Wärmegefühl und ein leichtes Unwohlsein auftreten, was nach kurzer Zeit von selbst verschwindet. 
          Das Kontrastmittel wird eingesetzt zur Beurteilung der Organe und Gefäße.
        </p>
        <p className="text-gray-700">
          Röntgen-Kontrastmittel enthalten Jod. Manche Patienten sind dagegen allergisch und dürfen auf diese Weise nicht untersucht werden. 
          Auch bei einer Schilddrüsenüberfunktion und/oder Einnahme von metforminhaltigen Medikamenten bei Diabetes mellitus darf Jod nicht gegeben werden.
        </p>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
          <div className="flex">
            <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
            <p className="text-sm text-red-700">
              <strong>Sollte der Verdacht auf eine Schwangerschaft bestehen, bitten wir Sie, um sofortige Mitteilung, da Sie in diesem Fall NICHT im CT-Gerät untersucht werden dürfen bzw. sollten!</strong>
            </p>
          </div>
        </div>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4">
          <div className="flex">
            <Info className="h-6 w-6 text-blue-500 mr-2" />
            <p className="text-sm text-blue-700">
              Während der Untersuchungszeit sind wir immer in Ihrer unmittelbaren Nähe. Bitte teilen Sie uns alles mit, was Sie beunruhigt, insbesondere, wenn Sie folgende Symptome verspüren: Nies- oder Juckreiz, Quaddelbildung, Husten, Atemschwierigkeiten, Schwindel, Übelkeit oder Schmerzen im Bereich der Injektionsnadel.
            </p>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
        <h3 className="text-lg font-semibold mb-4">Persönliche Informationen</h3>
        
        {/* Gender Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Geschlecht *
          </label>
          <div className="space-x-4">
            {["weiblich", "männlich", "divers"].map((option) => (
              <label key={option} className="inline-flex items-center">
                <input
                  type="radio"
                  value={option}
                  {...register("gender", { required: "Bitte wählen Sie Ihr Geschlecht" })}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-gray-700">{option}</span>
              </label>
            ))}
          </div>
          {errors.gender && (
            <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>
          )}
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nachname *
            </label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              placeholder="Bitte geben Sie Ihren Nachnamen ein"
              {...register("lastName", { required: "Nachname ist erforderlich" })}
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Vorname *
            </label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              placeholder="Bitte geben Sie Ihren Vornamen ein"
              {...register("firstName", { required: "Vorname ist erforderlich" })}
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
            )}
          </div>
        </div>

        {/* Height and Weight */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Größe (in cm) *
            </label>
            <input
              type="number"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              placeholder="Ihre Größe in cm"
              {...register("height", {
                required: "Bitte geben Sie Ihre Größe an",
                min: { value: 0, message: "Bitte geben Sie eine gültige Größe ein" },
                max: { value: 220, message: "Bitte geben Sie eine gültige Größe ein" }
              })}
            />
            {errors.height && (
              <p className="text-red-500 text-sm mt-1">{errors.height.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Gewicht (in kg) *
            </label>
            <input
              type="number"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              placeholder="Ihr Gewicht in kg"
              {...register("weight", {
                required: "Bitte geben Sie Ihr Gewicht an",
                min: { value: 25, message: "Bitte geben Sie ein gültiges Gewicht ein" },
                max: { value: 250, message: "Bitte geben Sie ein gültiges Gewicht ein" }
              })}
            />
            {errors.weight && (
              <p className="text-red-500 text-sm mt-1">{errors.weight.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Medical History */}
      <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
        <h3 className="text-lg font-semibold mb-4">Medizinische Vorgeschichte</h3>

        {/* Previous contrast media */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Sind Sie früher schon einmal mit Röntgenkontrastmittel untersucht worden? *
            </label>
            <div className="mt-2 space-x-4">
              {["Ja", "Nein"].map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={option}
                    {...register("previousContrastMedia", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.previousContrastMedia && (
              <p className="text-red-500 text-sm mt-1">{errors.previousContrastMedia.message}</p>
            )}
          </div>

          {previousContrastMedia === "Ja" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Haben Sie nach Röntgenkontrastmittelgabe Nebenwirkungen verspürt? Übelkeit, Hautrötung, Jucken, Niesreiz, Luftnot, Kreislaufbeschwerden, Bewusstlosigkeit? *
              </label>
              <div className="mt-2 space-x-4">
                {["Ja", "Nein"].map((option) => (
                  <label key={option} className="inline-flex items-center">
                    <input
                      type="radio"
                      value={option}
                      {...register("contrastMediaSideEffects", { required: "Diese Angabe ist erforderlich" })}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2 text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
              {errors.contrastMediaSideEffects && (
                <p className="text-red-500 text-sm mt-1">{errors.contrastMediaSideEffects.message}</p>
              )}
            </div>
          )}
        </div>

        {/* Allergies */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Sind bei Ihnen Allergien bekannt? *
            </label>
            <div className="mt-2 space-x-4">
              {["Ja", "Nein"].map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={option}
                    {...register("allergies", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.allergies && (
              <p className="text-red-500 text-sm mt-1">{errors.allergies.message}</p>
            )}
          </div>

          {allergies === "Ja" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Gegen was sind Sie allergisch? *
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                placeholder="Bitte angeben"
                {...register("allergiesDescription", { required: "Diese Angabe ist erforderlich" })}
              />
              {errors.allergiesDescription && (
                <p className="text-red-500 text-sm mt-1">{errors.allergiesDescription.message}</p>
              )}
            </div>
          )}
        </div>

        {/* Asthma */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Leiden Sie unter Asthma? *
            </label>
            <div className="mt-2 space-x-4">
              {["Ja", "Nein"].map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={option}
                    {...register("asthma", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.asthma && (
              <p className="text-red-500 text-sm mt-1">{errors.asthma.message}</p>
            )}
          </div>
        </div>

        {/* Previous Examinations */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Gibt es Voruntersuchungen des heute zu untersuchenden Körperteils (Röntgen, CT, MR, Nuklearmedizin, PET)? *
            </label>
            <div className="mt-2 space-x-4">
              {["Ja", "Nein"].map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={option}
                    {...register("prelimExams", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.prelimExams && (
              <p className="text-red-500 text-sm mt-1">{errors.prelimExams.message}</p>
            )}
          </div>

          {prelimExams === "Ja" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Welche Voruntersuchungen gibt es? *
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  placeholder="Bitte angeben"
                  {...register("prelimExamsDescription", { required: "Diese Angabe ist erforderlich" })}
                />
                {errors.prelimExamsDescription && (
                  <p className="text-red-500 text-sm mt-1">{errors.prelimExamsDescription.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Wann wurden diese Untersuchungen gemacht?
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  placeholder="Datum oder Zeitraum"
                  {...register("prelimExamsDate")}
                />
              </div>
            </div>
          )}
        </div>

        {/* Thyroid function */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Ist bei Ihnen eine Überfunktion der Schilddrüse bekannt? *
            </label>
            <div className="mt-2 space-x-4">
              {["Ja", "Nein"].map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={option}
                    {...register("thyroidOverfunction", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.thyroidOverfunction && (
              <p className="text-red-500 text-sm mt-1">{errors.thyroidOverfunction.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nehmen Sie Schilddrüsenmedikamente? *
            </label>
            <div className="mt-2 space-x-4">
              {["Ja", "Nein"].map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={option}
                    {...register("thyroidMedication", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.thyroidMedication && (
              <p className="text-red-500 text-sm mt-1">{errors.thyroidMedication.message}</p>
            )}
          </div>

          {thyroidMedication === "Ja" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Welche Schilddrüsenmedikamente nehmen Sie? *
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                placeholder="Bitte angeben"
                {...register("thyroidMedicationDescription", { required: "Diese Angabe ist erforderlich" })}
              />
              {errors.thyroidMedicationDescription && (
                <p className="text-red-500 text-sm mt-1">{errors.thyroidMedicationDescription.message}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Wurden Sie an der Schilddrüse operiert oder hatten Sie eine Radiojodtherapie? *
            </label>
            <div className="mt-2 space-x-4">
              {["Ja", "Nein"].map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={option}
                    {...register("thyroidSurgery", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.thyroidSurgery && (
              <p className="text-red-500 text-sm mt-1">{errors.thyroidSurgery.message}</p>
            )}
          </div>
        </div>

        {/* Diabetes */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Besteht einer Zuckerkrankheit (Diabetes mellitus)? *
            </label>
            <div className="mt-2 space-x-4">
              {["Ja", "Nein"].map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={option}
                    {...register("diabetes", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.diabetes && (
              <p className="text-red-500 text-sm mt-1">{errors.diabetes.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nehmen Sie Metformin oder ähnliche Medikamente ein? *
            </label>
            <div className="mt-2 space-x-4">
              {["Ja", "Nein"].map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={option}
                    {...register("metformin", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.metformin && (
              <p className="text-red-500 text-sm mt-1">{errors.metformin.message}</p>
            )}
          </div>
        </div>

        {/* Kidney function */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Ist bei Ihnen eine Einschränkung der Nierenfunktion bekannt? *
            </label>
            <div className="mt-2 space-x-4">
              {["Ja", "Nein"].map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={option}
                    {...register("kidneyImpairment", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.kidneyImpairment && (
              <p className="text-red-500 text-sm mt-1">{errors.kidneyImpairment.message}</p>
            )}
          </div>
        </div>

        {/* Blood thinners */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nehmen Sie Blutverdünner? *
            </label>
            <div className="mt-2 space-x-4">
              {["Ja", "Nein"].map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={option}
                    {...register("bloodThinners", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.bloodThinners && (
              <p className="text-red-500 text-sm mt-1">{errors.bloodThinners.message}</p>
            )}
          </div>

          {bloodThinners === "Ja" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Welche? (z.B. ASS/Aspirin, Plavix, Xarelto) *
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  placeholder="Bitte angeben"
                  {...register("bloodThinnersDescription", { required: "Diese Angabe ist erforderlich" })}
                />
                {errors.bloodThinnersDescription && (
                  <p className="text-red-500 text-sm mt-1">{errors.bloodThinnersDescription.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Seit wann nehmen Sie Blutverdünner?
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  placeholder="Datum oder Zeitraum"
                  {...register("bloodThinnersDate")}
                />
              </div>
            </div>
          )}
        </div>

        {/* Infectious disease */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Ist bei Ihnen eine Infektionskrankheit (Hepatitis, HIV etc.) bekannt? *
            </label>
            <div className="mt-2 space-x-4">
              {["Ja", "Nein"].map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={option}
                    {...register("infectiousDisease", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.infectiousDisease && (
              <p className="text-red-500 text-sm mt-1">{errors.infectiousDisease.message}</p>
            )}
          </div>

          {infectiousDisease === "Ja" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Welche? *
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                placeholder="Bitte angeben"
                {...register("infectiousDiseaseDescription", { required: "Diese Angabe ist erforderlich" })}
              />
              {errors.infectiousDiseaseDescription && (
                <p className="text-red-500 text-sm mt-1">{errors.infectiousDiseaseDescription.message}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pregnancy section - only for female patients */}
      {gender === "weiblich" && (
        <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
          <h3 className="text-lg font-semibold mb-4">Angaben für weibliche Patienten</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 font-bold">
                Schwangerschaft *
              </label>
              <div className="mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    {...register("noPregnancy", { required: "Bitte bestätigen Sie diesen Hinweis" })}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">
                    Ich bestätige hiermit, dass bei mir z. Z. keine Schwangerschaft besteht. Mir ist die Schädigung von Röntgenstrahlen auf das ungeborene Leben bekannt.
                  </span>
                </label>
                {errors.noPregnancy && (
                  <p className="text-red-500 text-sm mt-1">{errors.noPregnancy.message}</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Wann war Ihre letzte Regelblutung? *
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                placeholder="Datum oder Zeitraum"
                {...register("lastPeriod", { required: "Diese Angabe ist erforderlich" })}
              />
              {errors.lastPeriod && (
                <p className="text-red-500 text-sm mt-1">{errors.lastPeriod.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Stillen Sie zurzeit?
              </label>
              <div className="mt-2 space-x-4">
                {["Ja", "Nein"].map((option) => (
                  <label key={option} className="inline-flex items-center">
                    <input
                      type="radio"
                      value={option}
                      {...register("breastfeeding")}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2 text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Formular absenden
        </button>
      </div>
    </form>
  );
};

export default CTConsentForm;
