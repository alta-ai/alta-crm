import React from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { X } from 'lucide-react';
import ReportPDF from './ReportPDF';

interface ReportPDFModalProps {
  data: {
    title: string;
    patientName: string;
    patientGender: string;
    patientBirthDate: string;
    examinationName: string;
    examinationDate: string;
    indication: string;
    report: string;
    assessment: string;
    doctorName: string;
    isComplete: boolean;
    location?: {
      id: string;
      name: string;
      letterhead_url: string | null;
      use_default_letterhead: boolean;
    };
  };
  defaultLetterheadUrl?: string;
  onClose: () => void;
}

const ReportPDFModal = ({ data, defaultLetterheadUrl, onClose }: ReportPDFModalProps) => {
  return (    
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white rounded-md shadow-xl flex flex-col" style={{ width: '95vw', height: '95vh' }}>
        <div className="flex items-center justify-between px-2 py-1 border-b bg-gray-50">
          <h2 className="text-sm font-medium text-gray-800">
            Befund als PDF
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1" style={{ height: 'calc(95vh - 32px)' }}>
          <PDFViewer style={{ width: '100%', height: '100%' }} showToolbar={false}>
            <ReportPDF 
              data={data}
              defaultLetterheadUrl={defaultLetterheadUrl}
            />
          </PDFViewer>
        </div>
      </div>
    </div>
  );
};

export default ReportPDFModal;