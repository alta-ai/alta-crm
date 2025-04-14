import React from 'react';
import { useForm } from 'react-hook-form';

type FormData = {
  [key: string]: string | boolean;
};

const PrivacyForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log("Form data:", data);
    // Here you would handle the final form submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
        <h2 className="text-2xl font-bold">Datenschutzerklärung</h2>
        
        <div className="prose max-w-none space-y-4">
          <p className="text-gray-700">
            Ich willige ein, dass die ALTA Klinik, als verantwortliche Stelle, die in der Anmeldung erhobenen personenbezogenen Daten zum 
            Zwecke der Patientenaufnahme, Terminvergabe und Abrechnung verarbeitet und nutzt.
          </p>
          
          <p className="text-gray-700">
            Ich willige ein, dass die ALTA Klinik im Rahmen der Behandlung erforderliche Befunde bei anderen Ärzten/Therapeuten anfordern 
            kann und ausschließlich im Rahmen des therapeutisch Erforderlichen Befunde an mit- bzw. weiterbehandelnde Ärzte übermitteln darf.
          </p>

          <p className="text-gray-700">
            Die Einwilligung zur Datenspeicherung und Datenübermittlung kann jederzeit mit Wirkung für die Zukunft widerrufen werden.
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <p className="text-sm text-blue-700">
              Ausführliche Informationen zum Datenschutz finden Sie in unserer Datenschutzerklärung, die Sie jederzeit auf unserer 
              Website einsehen können.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              {...register("privacy_consent", { 
                required: "Bitte bestätigen Sie die Datenschutzerklärung" 
              })}
              className="form-checkbox h-5 w-5 text-blue-600 rounded"
            />
            <span className="text-sm text-gray-700">
              Ich habe die Datenschutzerklärung gelesen und bin mit der Verarbeitung meiner Daten einverstanden.
            </span>
          </label>
          {errors.privacy_consent && (
            <p className="text-red-500 text-sm">{errors.privacy_consent.message}</p>
          )}

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              {...register("email_consent")}
              className="form-checkbox h-5 w-5 text-blue-600 rounded"
            />
            <span className="text-sm text-gray-700">
              Ich bin damit einverstanden, dass die ALTA Klinik mich per E-Mail über neue Behandlungsmöglichkeiten, 
              Gesundheitstipps und Veranstaltungen informiert (optional).
            </span>
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Anmeldung abschließen
        </button>
      </div>
    </form>
  );
};

export default PrivacyForm;