import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Info, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

type FormData = {
  [key: string]: string | string[] | boolean;
};

const MRTCTConsentForm = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<FormData>();

  // State for collapsible sections
  const [openSections, setOpenSections] = useState({
    whatIsMRT: true,
    duration: false,
    contrastMedium: false,
    complications: false,
    forbiddenItems: false
  });

  // Toggle section visibility
  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Watch fields for conditional rendering
  const gender = watch("gender");
  const heartDevice = watch("heartDevice");
  const operatedBefore = watch("operatedBefore");
  const organRemoved = watch("organRemoved");
  const kidneyDisease = watch("kidneyDisease");
  const implants = watch("implants");
  const injuries = watch("injuries");
  const allergies = watch("allergies");
  const previousContrastMedia = watch("previousContrastMedia");
  const thyroidMedication = watch("thyroidMedication");
  const prelimExams = watch("prelimExams");
  const infectiousDisease = watch("infectiousDisease");
  const bloodThinners = watch("bloodThinners");
  const otherMeds = watch("otherMeds");
  
  const onSubmit = (data: FormData) => {
    console.log("Form data:", data);
    // Here you would make your API call
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* MRT Information */}
      <div className="prose max-w-none bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold mb-4">Aufklärungsbogen für MRT und CT</h3>

        {/* MRT Description Section */}
        <div className="mb-4 border rounded-lg">
          <button 
            type="button"
            className="flex justify-between items-center w-full p-4 text-left font-medium focus:outline-none"
            onClick={() => toggleSection('whatIsMRT')}
          >
            <span>Was ist MRT (Magnet-Resonanz-Tomograph)?</span>
            {openSections.whatIsMRT ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
          
          {openSections.whatIsMRT && (
            <div className="p-4 pt-0 border-t">
              <p className="text-gray-700">
                Das MRT oder auch der Kernspintomograph ist ein Untersuchungsgerät, mit dem über ein Magnetfeld die bildliche Darstellung des Körpers bzw. eines Körperteils ohne Röntgenstrahlung funktioniert. Innerhalb einer Magnetröhre werden Radiowellen erzeugt, die im Körper zu Reaktionen führen, aus denen mit Hilfe eines Computers Schnittbilder der zu untersuchenden Körperregion erstellt werden können.
              </p>
              <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
                <div className="flex">
                  <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
                  <p className="text-sm text-red-700">
                    <strong>Sollten Sie Träger eines Herzschrittmachers, eines Defibrillators, einer künstlichen Herzklappe, einer Insulinpumpe oder sonstiger elektrischer Implantate sein, bitten wir Sie, um sofortige Mitteilung, da Sie in diesen Fällen NICHT im MRT-Gerät untersucht werden dürfen!</strong>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Duration Section */}
        <div className="mb-4 border rounded-lg">
          <button 
            type="button"
            className="flex justify-between items-center w-full p-4 text-left font-medium focus:outline-none"
            onClick={() => toggleSection('duration')}
          >
            <span>Wie lange dauert eine MRT-Untersuchung?</span>
            {openSections.duration ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
          
          {openSections.duration && (
            <div className="p-4 pt-0 border-t">
              <p className="text-gray-700">
                Die Dauer kann je nach zu untersuchendem Körperteil zwischen 20 und 60 Minuten betragen.
              </p>
            </div>
          )}
        </div>

        {/* Contrast Medium Section */}
        <div className="mb-4 border rounded-lg">
          <button 
            type="button"
            className="flex justify-between items-center w-full p-4 text-left font-medium focus:outline-none"
            onClick={() => toggleSection('contrastMedium')}
          >
            <span>Ist eine Kontrastmittelgabe erforderlich?</span>
            {openSections.contrastMedium ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
          
          {openSections.contrastMedium && (
            <div className="p-4 pt-0 border-t">
              <p className="text-gray-700">
                Bei einigen Fragestellungen ist für die MRT-Untersuchung die Gabe eines Kontrastmittels notwendig. Dieses wird über eine Armvene injiziert. Die Kontrastmittel für MRT-Untersuchungen sind in der Regel gut verträglich und können auch bei bestehender Jodallergie (Allergie gegen Röntgen-Kontrastmittel) eingesetzt werden. Das MRT-Kontrastmittel wird über die Nieren innerhalb von 24 Stunden vollständig ausgeschieden. Die Entscheidung über eine möglich notwendige Kontrastmittelgabe wird der Arzt mit Ihnen besprechen.
              </p>
            </div>
          )}
        </div>

        {/* Complications Section */}
        <div className="mb-4 border rounded-lg">
          <button 
            type="button"
            className="flex justify-between items-center w-full p-4 text-left font-medium focus:outline-none"
            onClick={() => toggleSection('complications')}
          >
            <span>Können bei einer MRT-Untersuchung Komplikationen auftreten?</span>
            {openSections.complications ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
          
          {openSections.complications && (
            <div className="p-4 pt-0 border-t">
              <p className="text-gray-700">
                In sehr seltenen Fällen kann es bei der Verwendung von Kontrastmittel zu leichten Allergie-ähnlichen Hautreaktionen mit Unwohlsein kommen. In extrem seltenen Fällen (ca. 1:8.000.000) können ernstere allergische Reaktionen auftreten. Melden Sie uns sofort plötzliches Unwohlsein während oder nach der Untersuchung (z. B. Juckreiz, Niesreiz, Schwindel, Kopfschmerzen, Übelkeit, Atembeschwerden, Durchfall, Schmerzen)!
              </p>
            </div>
          )}
        </div>

        {/* Forbidden Items Section */}
        <div className="mb-4 border rounded-lg">
          <button 
            type="button"
            className="flex justify-between items-center w-full p-4 text-left font-medium focus:outline-none"
            onClick={() => toggleSection('forbiddenItems')}
          >
            <span>Welche Gegenstände dürfen nicht in den MRT-Untersuchungsraum?</span>
            {openSections.forbiddenItems ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
          
          {openSections.forbiddenItems && (
            <div className="p-4 pt-0 border-t">
              <p className="text-gray-700">
                Gegenstände aus Eisen und anderen magnetischen Metallen <strong>(Hörgeräte, Uhren, Schlüssel, Modeschmuck, loses Kleingeld, Kreditkarten, Kugelschreiber, Haarspangen und Handy usw.)</strong> stören das Magnetfeld. Diese Gegenstände und andere Wertgegenstände dürfen nicht in den MRT-Untersuchungsraum. Ein(e) Mitarbeiter(-in) wird Ihnen in dem Umkleideraum noch genaue Anweisungen geben. Während der gesamten Untersuchungszeit bleibt Ihr Umkleideraum verschlossen.<br />
                Materialien aus Edelstahl, wie künstliche Hüftgelenksprothesen, Zahnersatz oder Metallplatten nach Knochenbrüchen beeinträchtigen die Untersuchung im Allgemeinen nicht und werden durch das Magnetfeld nicht gefährdet. Das gilt auch für Spiralen zur Empfängnisverhütung. Sicherheitshalber empfiehlt es sich, den Sitz der Spirale nach der Untersuchung durch den Frauenarzt überprüfen zu lassen. Sehr selten gibt es magnetisch befestigten Zahnersatz. In so einem Fall dürfen Sie nicht in den MRT-Untersuchungsraum. Falls Sie an <strong>Klaustrophobie</strong> leiden, können wir Ihnen vorab ein Beruhigungsmittel geben. In diesem Fall dürfen Sie in den nächsten 24 Stunden nicht mehr aktiv am Straßenverkehr teilnehmen, d. h. <strong>kein Auto selber fahren</strong> oder aktiv Maschinen bedienen. Entweder lassen Sie sich abholen, fahren mit einem Taxi nach Hause oder übernachten in einem Hotel.
              </p>
            </div>
          )}
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
                    {...register("heartDevice", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.heartDevice && (
              <p className="text-red-500 text-sm mt-1">{errors.heartDevice.message}</p>
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
                {...register("heartDeviceDescription", { required: "Diese Angabe ist erforderlich" })}
              />
              {errors.heartDeviceDescription && (
                <p className="text-red-500 text-sm mt-1">{errors.heartDeviceDescription.message}</p>
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
                    {...register("operatedBefore", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.operatedBefore && (
              <p className="text-red-500 text-sm mt-1">{errors.operatedBefore.message}</p>
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
                  {...register("operatedDescription", { required: "Diese Angabe ist erforderlich" })}
                />
                {errors.operatedDescription && (
                  <p className="text-red-500 text-sm mt-1">{errors.operatedDescription.message}</p>
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
                  {...register("operatedDate", { required: "Diese Angabe ist erforderlich" })}
                />
                {errors.operatedDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.operatedDate.message}</p>
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
                    {...register("organRemoved", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.organRemoved && (
              <p className="text-red-500 text-sm mt-1">{errors.organRemoved.message}</p>
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
                  {...register("organRemovedDescription", { required: "Diese Angabe ist erforderlich" })}
                />
                {errors.organRemovedDescription && (
                  <p className="text-red-500 text-sm mt-1">{errors.organRemovedDescription.message}</p>
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
                  {...register("organRemovedDate", { required: "Diese Angabe ist erforderlich" })}
                />
                {errors.organRemovedDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.organRemovedDate.message}</p>
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
                    {...register("kidneyDisease", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.kidneyDisease && (
              <p className="text-red-500 text-sm mt-1">{errors.kidneyDisease.message}</p>
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
                {...register("kidneyDiseaseDescription", { required: "Diese Angabe ist erforderlich" })}
              />
              {errors.kidneyDiseaseDescription && (
                <p className="text-red-500 text-sm mt-1">{errors.kidneyDiseaseDescription.message}</p>
              )}
            </div>
          )}
        </div>

        {/* Implants and Metal Parts */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tragen Sie Implantate und/oder Metallteile (gilt nicht für Zahnersatz) in/an Ihrem Körper? *
            </label>
            <div className="mt-2 space-x-4">
              {["Ja", "Nein"].map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={option}
                    {...register("implants", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.implants && (
              <p className="text-red-500 text-sm mt-1">{errors.implants.message}</p>
            )}
          </div>

          {implants === "Ja" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-1 lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Welche? (z. B. Hörimplantat, Gelenkprothesen, Operationsnägel, Gefäßclips, Stents, Metallclips, Metallplatten, Medikamentenpumpen, Piercings, Tätowierungen, Permanent-Make-up, Kupferspirale) *
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  placeholder="Bitte angeben"
                  {...register("implantsDescription", { required: "Diese Angabe ist erforderlich" })}
                />
                {errors.implantsDescription && (
                  <p className="text-red-500 text-sm mt-1">{errors.implantsDescription.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Wann?
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  {...register("implantsDate")}
                />
              </div>
            </div>
          )}
        </div>

        {/* Metal Injuries */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Haben Sie Verletzungen durch metallische Objekte erlitten? *
            </label>
            <div className="mt-2 space-x-4">
              {["Ja", "Nein"].map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={option}
                    {...register("injuries", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.injuries && (
              <p className="text-red-500 text-sm mt-1">{errors.injuries.message}</p>
            )}
          </div>

          {injuries === "Ja" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Welche? (z. B. Granatsplitter, Verletzungen im Auge) *
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                placeholder="Bitte angeben"
                {...register("injuriesDescription", { required: "Diese Angabe ist erforderlich" })}
              />
              {errors.injuriesDescription && (
                <p className="text-red-500 text-sm mt-1">{errors.injuriesDescription.message}</p>
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
                Welche? (z. B. Kontrastmittel, Medikamente, Histamin) *
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

        {/* Previous Contrast Media */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Sind Sie früher schon einmal mit Röntgen-Kontrastmittel untersucht worden? *
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
                Haben Sie nach Röntgen-Kontrastmittelgabe Nebenwirkungen verspürt? Übelkeit, Hautrötung, Jucken, Niesreiz, Luftnot, Kreislaufbeschwerden, Bewusstlosigkeit *
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

        {/* Eye pressure */}
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
                    {...register("glaucoma", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.glaucoma && (
              <p className="text-red-500 text-sm mt-1">{errors.glaucoma.message}</p>
            )}
          </div>
        </div>

        {/* Previous Examinations */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Gibt es Voruntersuchungen des heute zu untersuchenden Körperteils? *
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
                  Welche? (z. B. Röntgen, CT, MR, Nuklearmedizin) *
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
                  Wann war die Voruntersuchung? *
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  placeholder="Datum oder Zeitraum"
                  {...register("prelimExamsDate", { required: "Diese Angabe ist erforderlich" })}
                />
                {errors.prelimExamsDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.prelimExamsDate.message}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Infectious Diseases */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Ist bei Ihnen eine Infektionskrankheit bekannt? *
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
                Welche? (z. B. Hepatitis, HIV, etc.) *
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
                  Seit wann nehmen Sie Blutverdünner? *
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  placeholder="Datum oder Zeitraum"
                  {...register("bloodThinnersDate", { required: "Diese Angabe ist erforderlich" })}
                />
                {errors.bloodThinnersDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.bloodThinnersDate.message}</p>
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
                    {...register("otherMeds", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.otherMeds && (
              <p className="text-red-500 text-sm mt-1">{errors.otherMeds.message}</p>
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
                {...register("otherMedsDescription", { required: "Diese Angabe ist erforderlich" })}
              />
              {errors.otherMedsDescription && (
                <p className="text-red-500 text-sm mt-1">{errors.otherMedsDescription.message}</p>
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
                    {...register("claustrophobia", { required: "Diese Angabe ist erforderlich" })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.claustrophobia && (
              <p className="text-red-500 text-sm mt-1">{errors.claustrophobia.message}</p>
            )}
          </div>
        </div>

        {/* Height and Weight */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Wie groß sind Sie? (in cm) *
            </label>
            <input
              type="number"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              placeholder="Ihre Größe in cm"
              {...register("height", {
                required: "Bitte geben Sie Ihre Größe an",
                min: { value: 100, message: "Bitte geben Sie eine gültige Größe ein" },
                max: { value: 220, message: "Bitte geben Sie eine gültige Größe ein" }
              })}
            />
            {errors.height && (
              <p className="text-red-500 text-sm mt-1">{errors.height.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Wie viel wiegen Sie? (in kg) *
            </label>
            <input
              type="number"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              placeholder="In kg und ohne Nachkommastelle angeben"
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

      {/* Confirmation */}
      <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              {...register("confirmRead", { required: "Bitte bestätigen Sie, dass Sie den Aufklärungsbogen gelesen und verstanden haben" })}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="text-sm font-bold text-gray-700">Den Aufklärungsbogen habe ich gelesen und verstanden.</span>
          </label>
          {errors.confirmRead && (
            <p className="text-red-500 text-sm">{errors.confirmRead.message}</p>
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

export default MRTCTConsentForm;
