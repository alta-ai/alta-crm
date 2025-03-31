import React from 'react';
import { useForm } from 'react-hook-form';
import { Info } from 'lucide-react';

type FormData = {
  [key: string]: string | string[];
};

const CompleteForm = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<FormData>();

  // Watch fields for conditional rendering
  const heartDevice = watch("rmgwwd28f167bae");           // Herzschrittmacher/Implantate
  const operatedBefore = watch("isamp1f9248e977");        // Gehirn/Herz-OP
  const organRemoved = watch("p189o65ab167fd0");          // Organe entfernt?
  const kidneyDisease = watch("6ftde3b93d57953");         // Nierenerkrankung?
  const implants = watch("lxysrc6d70d47cc");              // Implantate/Metallteile?
  const injuries = watch("p2i4t92aac09583");              // Verletzungen durch Metall
  const allergies = watch("1gfbm562cb21a1b");            // Allergien?
  const prelimExam = watch("ywatf9112555d21");           // Voruntersuchung?
  const infectious = watch("xxn2scd3eefcdb4");           // Infektionskrankheit?
  const bloodThinners = watch("3sqmweae690741c");        // Blutverdünner?
  const otherMeds = watch("yvzvp0e8978675b");           // sonstige Medikamente?
  const pregnancy = watch("1c2i68c7be79dbd");           // Schwangerschaft?
  const gender = watch("2sv5d");                        // Geschlecht
  
  const onSubmit = (data: FormData) => {
    console.log("Form data:", data);
    // Here you would make your API call
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* MRT Information */}
      <div className="prose max-w-none bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold mb-4">Untersuchungsablauf</h3>
        <p className="text-gray-700">
          Die Kernspintomographie oder auch Magnet-Resonanz-Tomographie (kurz MRT) ist ein Untersuchungsverfahren, 
          das mit Hilfe von einem starken Magnetfeld und Hochfrequenzwellen Schnittbilder erzeugt. Dabei wird die 
          zu untersuchende Region in die Mitte der MRT-Röhre positioniert, wobei bei vielen Untersuchungen der Kopf 
          außerhalb liegt.
        </p>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4">
          <div className="flex">
            <Info className="h-6 w-6 text-blue-500 mr-2" />
            <p className="text-sm text-blue-700">
              Die Länge der Untersuchung variiert, je nach Fragestellung und Körperregion, zwischen 20-60 Minuten.
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
                  {...register("2sv5d", { required: "Bitte wählen Sie Ihr Geschlecht" })}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-gray-700">{option}</span>
              </label>
            ))}
          </div>
          {errors["2sv5d"] && (
            <p className="text-red-500 text-sm mt-1">{errors["2sv5d"].message}</p>
          )}
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nachname
            </label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              placeholder="Bitte geben Sie Ihren Nachnamen ein"
              {...register("14k5a")}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Vorname
            </label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              placeholder="Bitte geben Sie Ihren Vornamen ein"
              {...register("rsxua")}
            />
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
              {...register("v2za5d8ceb1f77f", {
                required: "Bitte geben Sie Ihre Größe an",
                min: { value: 0, message: "Bitte geben Sie eine gültige Größe ein" },
                max: { value: 220, message: "Bitte geben Sie eine gültige Größe ein" }
              })}
            />
            {errors["v2za5d8ceb1f77f"] && (
              <p className="text-red-500 text-sm mt-1">{errors["v2za5d8ceb1f77f"].message}</p>
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
              {...register("k9qt71102a356d6", {
                required: "Bitte geben Sie Ihr Gewicht an",
                min: { value: 25, message: "Bitte geben Sie ein gültiges Gewicht ein" },
                max: { value: 250, message: "Bitte geben Sie ein gültiges Gewicht ein" }
              })}
            />
            {errors["k9qt71102a356d6"] && (
              <p className="text-red-500 text-sm mt-1">{errors["k9qt71102a356d6"].message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Medical History */}
      <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
        <h3 className="text-lg font-semibold mb-4">Medizinische Vorgeschichte</h3>

        {/* Heart Device */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tragen Sie einen Herzschrittmacher, elektrische Implantate (z. B. ICD, CRT) oder eine künstliche Metallherzklappe? *
            </label>
            <div className="mt-2 space-x-4">
              {["Ja", "Nein"].map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={option}
                    {...register("rmgwwd28f167bae", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors["rmgwwd28f167bae"] && (
              <p className="text-red-500 text-sm mt-1">{errors["rmgwwd28f167bae"].message}</p>
            )}
          </div>

          {heartDevice === "Ja" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Welche? *
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                {...register("gfmqkae17492d59", { required: "Bitte geben Sie an, welche Implantate" })}
              />
              {errors["gfmqkae17492d59"] && (
                <p className="text-red-500 text-sm mt-1">{errors["gfmqkae17492d59"].message}</p>
              )}
            </div>
          )}
        </div>

        {/* Previous Operations */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Wurden Sie schon einmal am Gehirn oder Herzen operiert? *
            </label>
            <div className="mt-2 space-x-4">
              {["Ja", "Nein"].map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={option}
                    {...register("isamp1f9248e977", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors["isamp1f9248e977"] && (
              <p className="text-red-500 text-sm mt-1">{errors["isamp1f9248e977"].message}</p>
            )}
          </div>

          {operatedBefore === "Ja" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Was wurde operiert? *
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  placeholder="Operierte Organe/Regionen"
                  {...register("1e4qe2195af1d86", { required: "Diese Angabe ist erforderlich" })}
                />
                {errors["1e4qe2195af1d86"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["1e4qe2195af1d86"].message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Wann war die OP? *
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  placeholder="Datum der OP"
                  {...register("bxjc161f5f2405", { required: "Diese Angabe ist erforderlich" })}
                />
                {errors["bxjc161f5f2405"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["bxjc161f5f2405"].message}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Removed Organs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Wurden bei Ihnen bereits Organe entfernt? *
            </label>
            <div className="mt-2 space-x-4">
              {["Ja", "Nein"].map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={option}
                    {...register("p189o65ab167fd0", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors["p189o65ab167fd0"] && (
              <p className="text-red-500 text-sm mt-1">{errors["p189o65ab167fd0"].message}</p>
            )}
          </div>

          {organRemoved === "Ja" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Welche Organe wurden entfernt? *
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  placeholder="Bitte angeben"
                  {...register("b5dw97633da7e49", { required: "Diese Angabe ist erforderlich" })}
                />
                {errors["b5dw97633da7e49"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["b5dw97633da7e49"].message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Wann wurden Organe entfernt? *
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  placeholder="Datum oder Zeitraum"
                  {...register("3711ia9e098a2c5", { required: "Diese Angabe ist erforderlich" })}
                />
                {errors["3711ia9e098a2c5"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["3711ia9e098a2c5"].message}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Kidney Disease */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Leiden Sie an einer Nierenerkrankung? *
            </label>
            <div className="mt-2 space-x-4">
              {["Ja", "Nein"].map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={option}
                    {...register("6ftde3b93d57953", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors["6ftde3b93d57953"] && (
              <p className="text-red-500 text-sm mt-1">{errors["6ftde3b93d57953"].message}</p>
            )}
          </div>

          {kidneyDisease === "Ja" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Welche Nierenerkrankung? *
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                placeholder="Bitte angeben"
                {...register("49wxyaa04473815", { required: "Diese Angabe ist erforderlich" })}
              />
              {errors["49wxyaa04473815"] && (
                <p className="text-red-500 text-sm mt-1">{errors["49wxyaa04473815"].message}</p>
              )}
            </div>
          )}
        </div>

        {/* Implants and Metal Parts */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tragen Sie Implantate und/oder Metallteile (gilt nicht für Zahnersatz) in/an Ihrem Körper? (z. B. Hörimplantat, Gelenkprothesen, Operationsnägel, Gefäßclips, Stents, Metallclips, Metallplatten, Medikamentenpumpen, Piercings, Tätowierungen, Permanent-Make-up, Kupferspirale) *
            </label>
            <div className="mt-2 space-x-4">
              {["Ja", "Nein"].map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={option}
                    {...register("lxysrc6d70d47cc", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors["lxysrc6d70d47cc"] && (
              <p className="text-red-500 text-sm mt-1">{errors["lxysrc6d70d47cc"].message}</p>
            )}
          </div>

          {implants === "Ja" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Welche? *
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  placeholder="Bitte angeben"
                  {...register("124myc5a4d04a1c", { required: "Diese Angabe ist erforderlich" })}
                />
                {errors["124myc5a4d04a1c"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["124myc5a4d04a1c"].message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Wann?
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  {...register("5z6rh0d54a836aa")}
                />
              </div>
            </div>
          )}
        </div>

        {/* Metal Injuries */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Haben Sie Verletzungen durch metallische Objekte erlitten? (z. B. Granatsplitter, Verletzungen im Auge) *
            </label>
            <div className="mt-2 space-x-4">
              {["Ja", "Nein"].map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={option}
                    {...register("p2i4t92aac09583", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors["p2i4t92aac09583"] && (
              <p className="text-red-500 text-sm mt-1">{errors["p2i4t92aac09583"].message}</p>
            )}
          </div>

          {injuries === "Ja" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Welche? *
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                placeholder="Bitte angeben"
                {...register("7a3p9c16242c500", { required: "Diese Angabe ist erforderlich" })}
              />
              {errors["7a3p9c16242c500"] && (
                <p className="text-red-500 text-sm mt-1">{errors["7a3p9c16242c500"].message}</p>
              )}
            </div>
          )}
        </div>

        {/* Allergies */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Sind bei Ihnen Allergien bekannt? (z. B. Kontrastmittel, Medikamente, Histamin) *
            </label>
            <div className="mt-2 space-x-4">
              {["Ja", "Nein"].map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={option}
                    {...register("1gfbm562cb21a1b", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors["1gfbm562cb21a1b"] && (
              <p className="text-red-500 text-sm mt-1">{errors["1gfbm562cb21a1b"].message}</p>
            )}
          </div>

          {allergies === "Ja" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Welche? *
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                placeholder="Bitte angeben"
                {...register("adn0pf8f99e9700", { required: "Diese Angabe ist erforderlich" })}
              />
              {errors["adn0pf8f99e9700"] && (
                <p className="text-red-500 text-sm mt-1">{errors["adn0pf8f99e9700"].message}</p>
              )}
            </div>
          )}
        </div>

        {/* Eye Pressure */}
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
                    {...register("t8i7s4d662c002d", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors["t8i7s4d662c002d"] && (
              <p className="text-red-500 text-sm mt-1">{errors["t8i7s4d662c002d"].message}</p>
            )}
          </div>
        </div>

        {/* Previous Examinations */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Gibt es Voruntersuchungen des heute zu untersuchenden Körperteils? (z. B. Röntgen, CT, MR, Nuklearmedizin) *
            </label>
            <div className="mt-2 space-x-4">
              {["Ja", "Nein"].map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={option}
                    {...register("ywatf9112555d21", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors["ywatf9112555d21"] && (
              <p className="text-red-500 text-sm mt-1">{errors["ywatf9112555d21"].message}</p>
            )}
          </div>

          {prelimExam === "Ja" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Welche? *
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  placeholder="Bitte angeben"
                  {...register("jimlsb40fb1e0d0", { required: "Diese Angabe ist erforderlich" })}
                />
                {errors["jimlsb40fb1e0d0"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["jimlsb40fb1e0d0"].message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Wann war die Voruntersuchung? *
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  {...register("ocv5me999447d23", { required: "Diese Angabe ist erforderlich" })}
                />
                {errors["ocv5me999447d23"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["ocv5me999447d23"].message}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Infectious Diseases */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Ist bei Ihnen eine Infektionskrankheit bekannt? (z. B. Hepatitis, HIV, etc.) *
            </label>
            <div className="mt-2 space-x-4">
              {["Ja", "Nein"].map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={option}
                    {...register("xxn2scd3eefcdb4", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors["xxn2scd3eefcdb4"] && (
              <p className="text-red-500 text-sm mt-1">{errors["xxn2scd3eefcdb4"].message}</p>
            )}
          </div>

          {infectious === "Ja" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Welche? *
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                placeholder="Bitte angeben"
                {...register("khizk9c401418b3", { required: "Diese Angabe ist erforderlich" })}
              />
              {errors["khizk9c401418b3"] && (
                <p className="text-red-500 text-sm mt-1">{errors["khizk9c401418b3"].message}</p>
              )}
            </div>
          )}
        </div>

        {/* Blood Thinners */}
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
                    {...register("3sqmweae690741c", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors["3sqmweae690741c"] && (
              <p className="text-red-500 text-sm mt-1">{errors["3sqmweae690741c"].message}</p>
            )}
          </div>

          {bloodThinners === "Ja" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Welche? (z. B. ASS/Aspirin, Plavix, Xarelto) *
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  placeholder="Bitte angeben"
                  {...register("qhdn3a2f63d9c45", { required: "Diese Angabe ist erforderlich" })}
                />
                {errors["qhdn3a2f63d9c45"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["qhdn3a2f63d9c45"].message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Seit wann nehmen Sie Blutverdünner? *
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  {...register("dcrqt8d83adf6c7", { required: "Diese Angabe ist erforderlich" })}
                />
                {errors["dcrqt8d83adf6c7"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["dcrqt8d83adf6c7"].message}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Other Medications */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nehmen Sie regelmäßig sonstige Medikamente ein? *
            </label>
            <div className="mt-2 space-x-4">
              {["Ja", "Nein"].map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={option}
                    {...register("yvzvp0e8978675b", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors["yvzvp0e8978675b"] && (
              <p className="text-red-500 text-sm mt-1">{errors["yvzvp0e8978675b"].message}</p>
            )}
          </div>

          {otherMeds === "Ja" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Welche sonstigen Medikamente nehmen Sie regelmäßig ein? *
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                placeholder="Bitte angeben"
                {...register("r7umdd3682523e0", { required: "Diese Angabe ist erforderlich" })}
              />
              {errors["r7umdd3682523e0"] && (
                <p className="text-red-500 text-sm mt-1">{errors["r7umdd3682523e0"].message}</p>
              )}
            </div>
          )}
        </div>

        {/* Claustrophobia */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Leiden Sie an Klaustrophobie (Angst in engen Räumen, Platzangst)? *
            </label>
            <div className="mt-2 space-x-4">
              {["Ja", "Nein"].map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={option}
                    {...register("cg7qwecdaa14d90", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors["cg7qwecdaa14d90"] && (
              <p className="text-red-500 text-sm mt-1">{errors["cg7qwecdaa14d90"].message}</p>
            )}
          </div>
        </div>

        {/* Pregnancy and Breastfeeding (only for female patients) */}
        {gender === "weiblich" && (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Besteht eine Schwangerschaft? *
                </label>
                <div className="mt-2 space-x-4">
                  {["Ja", "Nein"].map((option) => (
                    <label key={option} className="inline-flex items-center">
                      <input
                        type="radio"
                        value={option}
                        {...register("1c2i68c7be79dbd", { required: "Diese Angabe ist erforderlich" })}
                        className="form-radio h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                {errors["1c2i68c7be79dbd"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["1c2i68c7be79dbd"].message}</p>
                )}
              </div>

              {pregnancy === "Ja" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Wann war die letzte Regelblutung? *
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    {...register("so7xq3d7dfb4b25", { required: "Diese Angabe ist erforderlich" })}
                  />
                  {errors["so7xq3d7dfb4b25"] && (
                    <p className="text-red-500 text-sm mt-1">{errors["so7xq3d7dfb4b25"].message}</p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Stillen Sie zurzeit? *
                </label>
                <div className="mt-2 space-x-4">
                  {["Ja", "Nein"].map((option) => (
                    <label key={option} className="inline-flex items-center">
                      <input
                        type="radio"
                        value={option}
                        {...register("bgaij42c5508c80", { required: "Diese Angabe ist erforderlich" })}
                        className="form-radio h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                {errors["bgaij42c5508c80"] && (
                  <p className="text-red-500 text-sm mt-1">{errors["bgaij42c5508c80"].message}</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Confirmation */}
      <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              {...register("fgmo", { required: "Bitte bestätigen Sie, dass Sie den Aufklärungsbogen gelesen und verstanden haben" })}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="text-sm text-gray-700">Den Aufklärungsbogen habe ich gelesen und verstanden.</span>
          </label>
          {errors["fgmo"] && (
            <p className="text-red-500 text-sm">{errors["fgmo"].message}</p>
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

export default CompleteForm;