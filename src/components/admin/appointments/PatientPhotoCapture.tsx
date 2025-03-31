import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { supabase } from '../../../lib/supabase';
import { X, Camera, RefreshCw, Check, AlertCircle } from 'lucide-react';

interface PatientPhotoCaptureProps {
  patientId: string;
  onPhotoUpdated?: () => void;
  onBack?: () => void;
}

const PatientPhotoCapture: React.FC<PatientPhotoCaptureProps> = ({ 
  patientId, 
  onPhotoUpdated,
  onBack
}) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    setCapturedImage(imageSrc);
  }, [webcamRef]);

  const retakePhoto = () => {
    setCapturedImage(null);
    setError(null);
    setSuccess(null);
  };

  const savePhoto = async () => {
    if (!capturedImage) return;
    
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      
      // 1. Setze alle vorherigen Fotos des Patienten auf inaktiv
      console.log('Deaktiviere alte Fotos für Patient:', patientId);
      const { error: updateError } = await supabase
        .from('patient_photos')
        .update({ active: false })
        .eq('patient_id', patientId);
        
      if (updateError) {
        console.warn('Warnung beim Deaktivieren alter Fotos:', updateError);
        // Wir setzen fort, auch wenn hier ein Fehler auftritt
      }
      
      // 2. Speichere das neue Foto direkt in der Datenbank
      console.log('Speichere neues Foto für Patient:', patientId);
      const { error: insertError } = await supabase
        .from('patient_photos')
        .insert({
          patient_id: patientId,
          photo_data: capturedImage, // Speichere Base64-String direkt
          active: true
        });
        
      if (insertError) {
        throw insertError;
      }
      
      console.log('Foto erfolgreich gespeichert');
      setSuccess('Foto wurde erfolgreich gespeichert!');
      
      // 3. Benachrichtige den Elternkomponenten
      if (onPhotoUpdated) {
        setTimeout(() => {
          onPhotoUpdated();
        }, 1500); // Kurze Verzögerung, damit der Benutzer die Erfolgsmeldung sehen kann
      }
      
    } catch (err: any) {
      console.error('Fehler beim Speichern des Fotos:', err);
      setError(err.message || 'Das Foto konnte nicht gespeichert werden.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700">Patientenfoto aufnehmen</h3>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <Check className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        {!capturedImage ? (
          <div className="space-y-4">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full rounded-md"
              videoConstraints={{
                width: 500,
                height: 375,
                facingMode: "user"
              }}
            />
            <button
              onClick={capturePhoto}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center"
            >
              <Camera className="h-4 w-4 mr-2" />
              Foto aufnehmen
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <img 
                src={capturedImage} 
                alt="Aufgenommenes Foto" 
                className="w-full rounded-md" 
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={retakePhoto}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center"
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Neu aufnehmen
              </button>
              <button
                onClick={savePhoto}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center justify-center"
                disabled={isLoading}
              >
                <Check className="h-4 w-4 mr-2" />
                {isLoading ? 'Wird gespeichert...' : 'Foto speichern'}
              </button>
            </div>
          </div>
        )}
      </div>
      
      {onBack && (
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Zurück zu Formularen
        </button>
      )}
    </div>
  );
};

export default PatientPhotoCapture;