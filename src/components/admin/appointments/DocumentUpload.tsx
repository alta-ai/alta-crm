import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { FileUp, Download, Trash2, MessageSquare, Eye, FileText, AlertCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import DocumentPreviewModal from './DocumentPreviewModal';

interface Document {
  id: string;
  name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  created_at: string;
  comment: string | null;
  category: {
    id: string;
    name: string;
  };
  appointment_id: string;
}

const DocumentUpload = ({ appointmentId }: { appointmentId: string }) => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [documentComment, setDocumentComment] = useState('');
  const [editingDocumentComment, setEditingDocumentComment] = useState<string | null>(null);
  const [editingDocumentId, setEditingDocumentId] = useState<string | null>(null);
  
  // Neue States für die Dokument-Vorschau
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [isDocumentPreviewOpen, setIsDocumentPreviewOpen] = useState(false);

  // Kategorien laden
  const { data: categories } = useQuery({
    queryKey: ['documentCategories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('document_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    }
  });

  // Dokumente für diesen Termin laden
  const { data: documents, refetch: refetchDocuments } = useQuery({
    queryKey: ['appointmentDocuments', appointmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointment_documents')
        .select(`
          id,
          name,
          file_type,
          file_size,
          storage_path,
          created_at,
          comment,
          appointment_id,
          category:document_categories(
            id,
            name
          )
        `)
        .eq('appointment_id', appointmentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Document[];
    },
    enabled: !!appointmentId
  });

  // Neue Funktion zum Anzeigen von Dokumenten im Vorschaumodal
  const handlePreviewDocument = (document: Document) => {
    setPreviewDocument(document);
    setIsDocumentPreviewOpen(true);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setError(null);
      const file = event.target.files?.[0];
      
      if (!file) {
        throw new Error('Keine Datei ausgewählt');
      }

      if (!selectedCategory) {
        throw new Error('Bitte wählen Sie eine Kategorie aus');
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Die Datei darf nicht größer als 10MB sein');
      }

      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Dieser Dateityp wird nicht unterstützt');
      }

      setUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${appointmentId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('appointment_documents')
        .insert({
          appointment_id: appointmentId,
          category_id: selectedCategory,
          name: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: filePath,
          comment: documentComment.trim() || null
        });

      if (dbError) throw dbError;

      event.target.value = '';
      setSelectedCategory('');
      setDocumentComment('');
      refetchDocuments();

    } catch (err: any) {
      console.error('Error uploading document:', err);
      setError(err.message || 'Fehler beim Hochladen des Dokuments');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateDocumentComment = async (documentId: string) => {
    try {
      setError(null);

      const { error: dbError } = await supabase
        .from('appointment_documents')
        .update({ comment: editingDocumentComment?.trim() || null })
        .eq('id', documentId);

      if (dbError) throw dbError;

      setEditingDocumentId(null);
      setEditingDocumentComment(null);
      refetchDocuments();

    } catch (err: any) {
      console.error('Error updating document comment:', err);
      setError(err.message || 'Fehler beim Aktualisieren des Kommentars');
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      setError(null);
      
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.storage_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = document.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (err: any) {
      console.error('Error downloading document:', err);
      setError(err.message || 'Fehler beim Herunterladen des Dokuments');
    }
  };

  const handleDelete = async (document: Document) => {
    try {
      setError(null);

      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.storage_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('appointment_documents')
        .delete()
        .eq('id', document.id);

      if (dbError) throw dbError;

      refetchDocuments();

    } catch (err: any) {
      console.error('Error deleting document:', err);
      setError(err.message || 'Fehler beim Löschen des Dokuments');
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Dokument-Upload-Bereich */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-4">
          Neues Dokument hochladen
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategorie
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
            >
              <option value="">Bitte wählen</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kommentar (optional)
            </label>
            <input
              type="text"
              value={documentComment}
              onChange={(e) => setDocumentComment(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
              placeholder="Kommentar zum Dokument"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dokument
          </label>
          <label className="relative cursor-pointer">
            <input
              type="file"
              className="sr-only"
              onChange={handleFileUpload}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              disabled={uploading || !selectedCategory}
            />
            <div className={cn(
              "inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md",
              uploading || !selectedCategory
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
            )}>
              <FileUp className="h-4 w-4 mr-2" />
              {uploading ? "Wird hochgeladen..." : "Dokument hochladen"}
            </div>
          </label>
        </div>
      </div>

      {/* Dokument-Liste */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900">
          Vorhandene Dokumente
        </h3>
        {documents && documents.length > 0 ? (
          <div className="space-y-3">
            {documents.map((document) => (
              <div key={document.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{document.name}</p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{document.category.name}</span>
                      <span>•</span>
                      <span>{(document.file_size / 1024).toFixed(1)} KB</span>
                      <span>•</span>
                      <span>{format(new Date(document.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}</span>
                    </div>
                    <div className="mt-2">
                      {editingDocumentId === document.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editingDocumentComment ?? ''}
                            onChange={(e) => setEditingDocumentComment(e.target.value)}
                            rows={2}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
                            placeholder="Kommentar zum Dokument"
                          />
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => {
                                setEditingDocumentId(null);
                                setEditingDocumentComment(null);
                              }}
                              className="px-2 py-1 text-sm text-gray-600 hover:text-gray-800"
                            >
                              Abbrechen
                            </button>
                            <button
                              onClick={() => handleUpdateDocumentComment(document.id)}
                              className="px-2 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                            >
                              Speichern
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="group flex items-start space-x-2 cursor-pointer"
                          onClick={() => {
                            setEditingDocumentId(document.id);
                            setEditingDocumentComment(document.comment || '');
                          }}
                        >
                          <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5" />
                          <div className="flex-1">
                            {document.comment ? (
                              <p className="text-sm text-gray-600">{document.comment}</p>
                            ) : (
                              <p className="text-sm text-gray-400 italic group-hover:text-gray-600">
                                Kommentar hinzufügen...
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePreviewDocument(document)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="Dokument öffnen"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDownload(document)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="Herunterladen"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(document)}
                    className="p-1 text-gray-400 hover:text-red-500"
                    title="Löschen"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Keine Dokumente vorhanden</p>
          </div>
        )}
      </div>

      {/* Dokument-Vorschau-Modal */}
      {previewDocument && (
        <DocumentPreviewModal
          isOpen={isDocumentPreviewOpen}
          onClose={() => setIsDocumentPreviewOpen(false)}
          document={previewDocument}
        />
      )}
    </div>
  );
};

export default DocumentUpload;