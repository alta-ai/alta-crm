import React from 'react';
import { X } from 'lucide-react';

interface PatientPhotoModalProps {
  photoUrl: string;
  onClose: () => void;
}

const PatientPhotoModal = ({ photoUrl, onClose }: PatientPhotoModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="relative max-w-3xl max-h-screen p-4">
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 bg-white rounded-full p-1 text-gray-800 hover:bg-gray-200"
        >
          <X className="h-6 w-6" />
        </button>
        <img 
          src={photoUrl} 
          alt="Patientenfoto" 
          className="max-h-[90vh] max-w-full rounded-lg shadow-lg"
        />
      </div>
    </div>
  );
};

export default PatientPhotoModal;