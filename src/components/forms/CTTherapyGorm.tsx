import React from 'react';
import { useForm } from 'react-hook-form';
import { Info } from 'lucide-react';

type FormData = {
  [key: string]: string | string[];
};

const CTTherapyForm = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<FormData>();

  // Watch fields for conditional rendering
  const gender = watch("pdpvt");
  const allergies = watch("xmmcl");
  const bloodThinners = watch("4av0y");
  
  const onSubmit = (data: FormData) => {
    console.log("Form data:", data);
    // Here you would make your API call
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* CT-Therapy Information */}
      <div className="prose max-w-none bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold mb-4">Informationen zur CT-Therapie</h3>
        <p className="text-gray-700">
          Die CT-gesteuerte Therapie ist ein seit mehreren Jahren etabliertes Behandlungsverfahren. 
          Zielgruppe sind Patienten, bei denen degenerative Veränderungen der Wirbelsäule bzw. ein 
          Bandscheibenvorfall diagnostiziert wurde. Unter computertomographischer Kontrolle wird eine 
          dünne Nadel an das Wirbelgelenk bzw. in den Wirbelkanal vorgeschoben und das entsprechende 
          Medikament injiziert.
        </p>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4">
          <div className="flex">
            <Info className="h-6 w-6 text-blue-500 mr-2" />
            <p className="text-sm text-blue-700">
              Nach der Therapie ist eine Wartezeit von mindestens 30 Minuten zur Beobachtung einzuhalten.
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
                  {...register("pdpvt", { required: "Bitte wählen Sie Ihr Geschlecht" })}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-gray-700">{option}</span>
              </label>
            ))}
          </div>
          {errors["pdpvt"] && (
            <p className="text-red-500 text-sm mt-1">{errors["pdpvt"].message}</p>
          )}
        </div>

        {/* Title, First and Last Name */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Titel
            </label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              {...register("mzb1q")}
            >
              <option value=""></option>
              <option value="Dr.">Dr.</option>
              <option value="Prof. Dr.">Prof. Dr.</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Vorname *
            </label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              placeholder="Bitte geben Sie Ihren Vornamen ein"
              {...register("fft3q", { required: "Vorname ist erforderlich" })}
            />
            {errors["fft3q"] && (
              <p className="text-red-500 text-sm mt-1">{errors["fft3q"].message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nachname *
            </label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              placeholder="Bitte geben Sie Ihren Nachnamen ein"
              {...register("ljemv", { required: "Nachname ist erforderlich" })}
            />
            {errors["ljemv"] && (
              <p className="text-red-500 text-sm mt-1">{errors["ljemv"].message}</p>
            )}
          </div>
        </div>

        {/* Birth Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Geburtsdatum *
          </label>
          <input
            type="date"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            {...register("lyqyx", { required: "Geburtsdatum ist erforderlich" })}
          />
          {errors["lyqyx"] && (
            <p className="text-red-500 text-sm mt-1">{errors["lyqyx"].message}</p>
          )}
        </div>

        {/* Height and Weight */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Wie groß sind Sie? (in cm) *
            </label>
            <input
              type="number"
              min="0"
              max="220"
              step="0.01"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              placeholder="Ihre Größe in cm"
              {...register("nrbpc", {
                required: "Bitte geben Sie Ihre Größe an",
                min: { value: 0, message: "Bitte geben Sie eine gültige Größe ein" },
                max: { value: 220, message: "Bitte geben Sie eine gültige Größe ein" }
              })}
            />
            {errors["nrbpc"] && (
              <p className="text-red-500 text-sm mt-1">{errors["nrbpc"].message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Wie viel wiegen Sie? (in kg) *
            </label>
            <input
              type="number"
              min="0"
              max="300"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              placeholder="Bitte in kg und ohne Nachkommastelle angeben"
              {...register("4zbwz", {
                required: "Bitte geben Sie Ihr Gewicht an",
                min: { value: 0, message: "Bitte geben Sie ein gültiges Gewicht ein" },
                max: { value: 300, message: "Bitte geben Sie ein gültiges Gewicht ein" }
              })}
            />
            {errors["4zbwz"] && (
              <p className="text-red-500 text-sm mt-1">{errors["4zbwz"].message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Medical History */}
      <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
        <h3 className="text-lg font-semibold mb-4">Medizinische Vorgeschichte</h3>

        {/* Previous Contrast Media */}
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
                    {...register("5g0mp", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors["5g0mp"] && (
              <p className="text-red-500 text-sm mt-1">{errors["5g0mp"].message}</p>
            )}
          </div>
        </div>

        {/* Contrast Media Side Effects */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Haben Sie nach Röntgenkontrastmittelgabe Nebenwirkungen verspürt? (Hautrötung, Jucken, Niesreiz, Luftnot, Kreislaufbeschwerden, Bewusstlosigkeit) *
            </label>
            <div className="mt-2 space-x-4">
              {["Ja", "Nein"].map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={option}
                    {...register("lz4ja", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors["lz4ja"] && (
              <p className="text-red-500 text-sm mt-1">{errors["lz4ja"].message}</p>
            )}
          </div>
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
                    {...register("xmmcl", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors["xmmcl"] && (
              <p className="text-red-500 text-sm mt-1">{errors["xmmcl"].message}</p>
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
                {...register("4saej", { required: "Diese Angabe ist erforderlich" })}
              />
              {errors["4saej"] && (
                <p className="text-red-500 text-sm mt-1">{errors["4saej"].message}</p>
              )}
            </div>
          )}
        </div>

        {/* Thyroid */}
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
                    {...register("ud5da", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors["ud5da"] && (
              <p className="text-red-500 text-sm mt-1">{errors["ud5da"].message}</p>
            )}
          </div>
        </div>

        {/* Osteoporosis */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Besteht bei Ihnen Osteoporose? *
            </label>
            <div className="mt-2 space-x-4">
              {["Ja", "Nein"].map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={option}
                    {...register("8psvu", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors["8psvu"] && (
              <p className="text-red-500 text-sm mt-1">{errors["8psvu"].message}</p>
            )}
          </div>
        </div>

        {/* Hepatitis */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Besteht bei Ihnen eine Hepatitis? *
            </label>
            <div className="mt-2 space-x-4">
              {["Ja", "Nein"].map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={option}
                    {...register("xmshx", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors["xmshx"] && (
              <p className="text-red-500 text-sm mt-1">{errors["xmshx"].message}</p>
            )}
          </div>
        </div>

        {/* Diabetes */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Sind Sie Diabetiker/in? *
            </label>
            <div className="mt-2 space-x-4">
              {["Ja", "Nein"].map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={option}
                    {...register("s0w23", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors["s0w23"] && (
              <p className="text-red-500 text-sm mt-1">{errors["s0w23"].message}</p>
            )}
          </div>
        </div>

        {/* High Blood Pressure */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Besteht bei Ihnen Bluthochdruck? *
            </label>
            <div className="mt-2 space-x-4">
              {["Ja", "Nein"].map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={option}
                    {...register("oiiit", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors["oiiit"] && (
              <p className="text-red-500 text-sm mt-1">{errors["oiiit"].message}</p>
            )}
          </div>
        </div>

        {/* Glaucoma */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Besteht bei Ihnen ein erhöhter Augeninnendruck (Glaukom)? *
            </label>
            <div className="mt-2 space-x-4">
              {["Ja", "Nein"].map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={option}
                    {...register("k1pja", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors["k1pja"] && (
              <p className="text-red-500 text-sm mt-1">{errors["k1pja"].message}</p>
            )}
          </div>
        </div>

        {/* Stomach or Duodenal Ulcer */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Ist in Ihrer Vorgeschichte ein Magen- oder Zwölffingerdarmgeschwür bekannt? *
            </label>
            <div className="mt-2 space-x-4">
              {["Ja", "Nein"].map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={option}
                    {...register("82x3r", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors["82x3r"] && (
              <p className="text-red-500 text-sm mt-1">{errors["82x3r"].message}</p>
            )}
          </div>
        </div>

        {/* Thrombosis or Pulmonary Embolism */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Ist in Ihrer Vorgeschichte eine Thrombose oder Lungenembolie bekannt? *
            </label>
            <div className="mt-2 space-x-4">
              {["Ja", "Nein"].map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={option}
                    {...register("bu3ds", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors["bu3ds"] && (
              <p className="text-red-500 text-sm mt-1">{errors["bu3ds"].message}</p>
            )}
          </div>
        </div>

        {/* Blood Thinners */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Werden Sie mit blutgerinnungshemmenden Mitteln behandelt? *
            </label>
            <div className="mt-2 space-x-4">
              {["Ja", "Nein"].map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={option}
                    {...register("4av0y", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors["4av0y"] && (
              <p className="text-red-500 text-sm mt-1">{errors["4av0y"].message}</p>
            )}
          </div>

          {bloodThinners === "Ja" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mit welchem blutgerinnungshemmenden Mitteln werden Sie behandelt? *
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                placeholder="Bitte angeben"
                {...register("tm0ei", { required: "Diese Angabe ist erforderlich" })}
              />
              {errors["tm0ei"] && (
                <p className="text-red-500 text-sm mt-1">{errors["tm0ei"].message}</p>
              )}
            </div>
          )}
        </div>

        {/* For female patients only */}
        {gender === "weiblich" && (
          <>
            <div className="space-y-4 border-t pt-4 mt-6">
              <h4 className="text-md font-medium text-gray-800">Für Patientinnen</h4>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register("cdzb8", { required: "Diese Bestätigung ist erforderlich" })}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Ich bestätige hiermit, dass bei mir z. Zt. keine Schwangerschaft besteht. Eine fragliche Schwangerschaft während der Therapie werde ich sofort mitteilen. Mir ist eine mögliche Schädigung von Röntgenstrahlen für das ungeborene Leben bekannt.
                  </span>
                </label>
                {errors["cdzb8"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["cdzb8"].message}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Wann war Ihre letzte Regelblutung? *
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  placeholder="Bitte angeben"
                  {...register("ijov0", { required: "Diese Angabe ist erforderlich" })}
                />
                {errors["ijov0"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["ijov0"].message}</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Important Information Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
        <h3 className="text-lg font-semibold mb-4">Wichtige Hinweise</h3>
        <div className="prose max-w-none text-gray-700">
          <p>
            Die CT-gesteuerte Therapie ist ein seit mehreren Jahren etabliertes Behandlungsverfahren. Zielgruppe sind Patienten, bei denen degenerative Veränderungen der Wirbelsäule bzw. ein Bandscheibenvorfall diagnostiziert wurde. Unter computertomographischer Kontrolle wird eine dünne Nadel an das Wirbelgelenk bzw. in den Wirbelkanal vorgeschoben und das entsprechende Medikament injiziert. So kann eine hohe örtliche Wirkdosis am Nerv, der Nervenwurzel sowie der Gelenkskapsel erreicht werden.
          </p>
          <p>
            <strong>Nach der Therapie ist eine Wartezeit von mindestens 30 Minuten zur Beobachtung einzuhalten.</strong> Örtliche Betäubung und Kontrastmittel können zu allergischen Reaktionen führen. In sehr seltenen Fällen sind dabei Schockreaktionen möglich, die notfallmäßig therapiert werden müssten.
          </p>
          <p>
            <strong>Als mögliche Nebenwirkungen können auftreten:</strong> Wadenkrämpfe, Gewichtszunahme, Blutzuckeranstieg, Anstieg des Blutdrucks, Akne, Rötung des Gesichtes, vermehrte Brüchigkeit kleiner Gefäße mit Auftreten von blauen Flecken und Zyklusstörungen bei Frauen.
          </p>
        </div>
      </div>

      {/* Confirmation */}
      <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              {...register("confirmation", { required: "Bitte bestätigen Sie, dass Sie den Aufklärungsbogen gelesen und verstanden haben" })}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="text-sm text-gray-700">Den Aufklärungsbogen habe ich gelesen und verstanden.</span>
          </label>
          {errors["confirmation"] && (
            <p className="text-red-500 text-sm">{errors["confirmation"].message}</p>
          )}
        </div>
      </div>

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

export default CTTherapyForm;
