import React from 'react';
import { X } from 'lucide-react';
import FormViewer from './FormViewer';

interface FormViewerModalProps {
  formId: string;
  onClose: () => void;
}

const FormViewerModal = ({ formId, onClose }: FormViewerModalProps) => {
  if (!formId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="absolute top-0 right-0 p-4 z-10">
          <button
            onClick={onClose}
            className="rounded-full p-1 bg-white bg-opacity-80 text-gray-600 hover:bg-gray-200 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <FormViewer formId={formId} onClose={onClose} isModal={true} />
        </div>
      </div>
    </div>
  );
};

export default FormViewerModal;