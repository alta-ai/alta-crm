import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { X, Download, ExternalLink, AlertCircle, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    id: string;
    name: string;
    file_type: string;
    file_size: number;
    storage_path: string;
    created_at: string;
    comment: string | null;
    category?: {
      id: string;
      name: string;
    };
  };
}

const DocumentPreviewModal = ({ isOpen, onClose, document: documentData }: DocumentPreviewModalProps) => {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (isOpen && documentData) {
      loadDocument();
    }
    
    return () => {
      // Beim Schließen URL freigeben
      if (url) URL.revokeObjectURL(url);
    };
  }, [isOpen, documentData]);
  
  const loadDocument = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Direkt aus dem Speicher laden für bessere Kompatibilität
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('documents')
        .download(documentData.storage_path);
        
      if (downloadError) {
        // Fallback auf signierte URL, wenn direkter Download fehlschlägt
        const { data: urlData, error: urlError } = await supabase.storage
          .from('documents')
          .createSignedUrl(documentData.storage_path, 3600); // Längere Gültigkeit (1 Stunde)
          
        if (urlError) throw urlError;
        
        if (urlData?.signedUrl) {
          setUrl(urlData.signedUrl);
        } else {
          throw new Error('Keine URL erhalten');
        }
      } else {
        // Bei direktem Download: Blob-URL erstellen
        const localUrl = URL.createObjectURL(fileData);
        setUrl(localUrl);
      }
    } catch (err: any) {
      console.error('Error loading document:', err);
      setError(err.message || 'Fehler beim Laden des Dokuments');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDownload = async () => {
    try {
      setError(null);
      
      // Wenn URL bereits vorhanden, diese verwenden
      if (url && url.startsWith('blob:')) {
        const link = document.createElement('a');
        link.href = url;
        link.download = documentData.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
      
      // Sonst neu herunterladen
      const { data, error } = await supabase.storage
        .from('documents')
        .download(documentData.storage_path);
        
      if (error) throw error;
      
      const downloadUrl = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = documentData.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (err: any) {
      console.error('Error downloading document:', err);
      setError(err.message || 'Fehler beim Herunterladen des Dokuments');
    }
  };
  
  // Prüfe, ob der Dateityp angezeigt werden kann
  const isPreviewable = (fileType: string): boolean => {
    const previewableTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/svg+xml',
      'text/plain',
      'text/html'
    ];
    
    return previewableTypes.includes(fileType);
  };
  
  // Öffne Datei in neuem Tab
  const openInNewTab = () => {
    if (url) window.open(url, '_blank');
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-gray-500" />
              {documentData.name}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {documentData.category?.name} • {(documentData.file_size / 1024).toFixed(1)} KB • 
              {format(new Date(documentData.created_at), ' dd.MM.yyyy HH:mm', { locale: de })}
            </p>
            {documentData.comment && (
              <p className="text-sm text-gray-600 mt-1 italic">
                "{documentData.comment}"
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
              title="Herunterladen"
            >
              <Download className="h-5 w-5" />
            </button>
            {isPreviewable(documentData.file_type) && (
              <button
                onClick={openInNewTab}
                className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                title="In neuem Tab öffnen"
              >
                <ExternalLink className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Hauptcontainer mit fester Höhe */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-gray-600">Dokument wird geladen...</div>
            </div>
          ) : error ? (
            <div className="h-full flex items-center justify-center">
              <div className="bg-red-50 border-l-4 border-red-400 p-4 max-w-lg">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                    <p className="text-sm text-red-700 mt-2">
                      Bitte verwenden Sie die Schaltfläche zum Herunterladen, um das Dokument zu öffnen.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full">
              {isPreviewable(documentData.file_type) ? (
                documentData.file_type.startsWith('image/') ? (
                  // Bild-Vorschau
                  <div className="h-full flex items-center justify-center overflow-auto p-4">
                    <img 
                      src={url || ''} 
                      alt={documentData.name}
                      className="max-w-full max-h-full object-contain" 
                    />
                  </div>
                ) : documentData.file_type === 'application/pdf' ? (
                  // PDF-Vorschau mit object statt iframe - volle Höhe!
                  <object 
                    data={url || ''} 
                    type="application/pdf"
                    className="w-full h-full" 
                  >
                    <div className="text-center p-4">
                      <p className="text-gray-600 mb-4">
                        Der PDF-Viewer konnte nicht geladen werden. 
                      </p>
                      <button
                        onClick={openInNewTab}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <ExternalLink className="h-4 w-4 inline mr-2" />
                        PDF in neuem Tab öffnen
                      </button>
                    </div>
                  </object>
                ) : (
                  // Andere vorschaubare Dateien
                  <iframe 
                    src={url || ''} 
                    className="w-full h-full border-0" 
                    title={documentData.name}
                  />
                )
              ) : (
                // Nicht-vorschaubare Dateien
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      Dieser Dateityp ({documentData.file_type}) kann nicht direkt angezeigt werden.
                    </p>
                    <button
                      onClick={handleDownload}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <Download className="h-4 w-4 inline mr-2" />
                      Dokument herunterladen
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;