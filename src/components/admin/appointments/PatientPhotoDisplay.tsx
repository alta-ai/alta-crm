import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { User } from 'lucide-react';

interface PatientPhotoDisplayProps {
  patientId: string;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
}

const PatientPhotoDisplay: React.FC<PatientPhotoDisplayProps> = ({ 
  patientId, 
  size = 'medium',
  onClick
}) => {
  const { data: photo, isLoading } = useQuery({
    queryKey: ['patient-photo', patientId],
    queryFn: async () => {
      try {
        console.log('Lade Foto für Patient:', patientId);
        const { data, error } = await supabase
          .from('patient_photos')
          .select('photo_data') // Wir laden jetzt photo_data statt photo_url
          .eq('patient_id', patientId)
          .eq('active', true)
          .maybeSingle();
        
        if (error) {
          console.error('Fehler beim Laden des Patientenfotos:', error);
          return null;
        }
        
        console.log('Foto gefunden:', !!data);
        return data?.photo_data || null; // Gib das Base64-Foto zurück
      } catch (err) {
        console.error('Fehler bei der Foto-Abfrage:', err);
        return null;
      }
    },
    retry: false,
    staleTime: 60000
  });

  const sizeClasses = {
    small: 'h-8 w-8',
    medium: 'h-12 w-12',
    large: 'h-24 w-24' // Ich habe hier die Größe "large" erhöht
  };

  if (isLoading) {
    return (
      <div className={`rounded-full bg-gray-200 ${sizeClasses[size]} flex items-center justify-center`}>
        <span className="text-gray-400 animate-pulse">...</span>
      </div>
    );
  }

  if (!photo) {
    return (
      <div className={`rounded-full bg-gray-100 ${sizeClasses[size]} flex items-center justify-center`}>
        <User className="text-gray-400 h-1/2 w-1/2" />
      </div>
    );
  }

  return (
    <img 
      src={photo} // Das Base64-Foto kann direkt als Quelle verwendet werden
      alt="Patientenfoto" 
      className={`rounded-full object-cover ${sizeClasses[size]} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    />
  );
};

export default PatientPhotoDisplay;