import React from 'react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { Download, Printer } from 'lucide-react';

interface PDFPreviewProps {
  document: React.ReactElement;
  fileName?: string;
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({ 
  document,
  fileName = 'document.pdf'
}) => {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Drucken</title>
          </head>
          <body style="margin:0;padding:0;">
            <iframe 
              src="${URL.createObjectURL(new Blob([document.toString()], {type: 'application/pdf'}))}" 
              width="100%" 
              height="100%"
              style="border:none;position:absolute;top:0;left:0;right:0;bottom:0;"
              onload="window.print();window.close()"
            />
          </body>
        </html>
      `);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <h2 className="text-lg font-medium">PDF Vorschau</h2>
        <div className="flex items-center space-x-4">
          <PDFDownloadLink 
            document={document}
            fileName={fileName}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            {({ loading }) => (
              <>
                <Download className="h-4 w-4 mr-2" />
                {loading ? 'Wird geladen...' : 'Herunterladen'}
              </>
            )}
          </PDFDownloadLink>

          <button
            onClick={handlePrint}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Printer className="h-4 w-4 mr-2" />
            Drucken
          </button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 bg-gray-100">
        <PDFViewer 
          style={{ width: '100%', height: '100%' }}
          showToolbar={false}
        >
          {document}
        </PDFViewer>
      </div>
    </div>
  );
};