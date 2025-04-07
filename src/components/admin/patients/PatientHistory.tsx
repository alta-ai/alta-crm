import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { supabase } from '../../../lib/supabase';
import { ArrowLeft, Send, FileUp, Download, Trash2, MessageSquare, FileText, Check, Filter, Eye, X, Maximize, Info, Phone, Flag } from 'lucide-react';
import { cn } from '../../../lib/utils';
import DocumentPreviewModal from '../appointments/DocumentPreviewModal';
import { toast } from 'react-hot-toast';

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

interface Comment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  completed: boolean;
  comment_type: 'info' | 'anruf';
  is_todo: boolean;
  priority: boolean;
  user_profile?: {
    title: string | null;
    first_name: string;
    last_name: string;
  };
}

// Komponente für das große Foto-Modal
const PhotoModal = ({ photoUrl, onClose }: { photoUrl: string; onClose: () => void }) => {
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

const PatientHistory = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  
  // Neues State-Objekt für Kommentarformulare, die für jeden Termin separat gespeichert werden
  const [commentForms, setCommentForms] = useState<{
    [appointmentId: string]: {
      text: string;
      type: 'info' | 'anruf';
      isTodo: boolean;
      priority: boolean;
    }
  }>({});
  
  // Hilfsfunktion, um leere Formulardaten zu erstellen
  const getEmptyCommentForm = () => ({
    text: '',
    type: 'info' as const,
    isTodo: false,
    priority: false
  });
  
  // Hilfsfunktion, um Formulardaten für einen bestimmten Termin zu erhalten oder zu initialisieren
  const getCommentForm = (appointmentId: string) => {
    if (!commentForms[appointmentId]) {
      // Initialisiere das Formular für diesen Termin, falls es noch nicht existiert
      setCommentForms(prev => ({
        ...prev,
        [appointmentId]: getEmptyCommentForm()
      }));
      return getEmptyCommentForm();
    }
    return commentForms[appointmentId];
  };
  
  // Hilfsfunktion zum Aktualisieren der Formulardaten für einen bestimmten Termin
  const updateCommentForm = (appointmentId: string, updates: Partial<{
    text: string;
    type: 'info' | 'anruf';
    isTodo: boolean;
    priority: boolean;
  }>) => {
    setCommentForms(prev => ({
      ...prev,
      [appointmentId]: {
        ...getCommentForm(appointmentId),
        ...updates
      }
    }));
  };
  
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [documentComment, setDocumentComment] = useState('');
  const [editingDocumentComment, setEditingDocumentComment] = useState<string | null>(null);
  const [editingDocumentId, setEditingDocumentId] = useState<string | null>(null);
  const [commentFilter, setCommentFilter] = useState<'all' | 'completed' | 'pending' | 'info' | 'anruf' | 'priority'>('all');
  
  // States für das Dokument-Preview
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [isDocumentPreviewOpen, setIsDocumentPreviewOpen] = useState(false);
  
  // States für das Patientenfoto
  const [patientPhoto, setPatientPhoto] = useState<string | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Lade das Patientenfoto aus dem localStorage
  useEffect(() => {
    if (id) {
      const photoData = localStorage.getItem(`patient_photo_${id}`);
      setPatientPhoto(photoData);
    }
  }, [id]);

  const { data: patient, isLoading: isLoadingPatient } = useQuery({
    queryKey: ['patient', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const { data: appointments, isLoading: isLoadingAppointments } = useQuery({
    queryKey: ['patient-appointments', id],
    queryFn: async () => {
      try {
        // First get appointments with basic info
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select(`
            id,
            start_time,
            end_time,
            status,
            billing_type,
            patient_data,
            examination:examinations(
              id,
              name,
              category
            ),
            device:devices(
              id,
              name,
              type
            ),
            location:locations(
              id,
              name
            )
          `)
          .eq('patient_id', id)
          .order('start_time', { ascending: false });

        if (appointmentsError) throw appointmentsError;

        // Then get comments for each appointment with new fields
        const appointmentsWithComments = await Promise.all(
          appointmentsData.map(async (appointment) => {
            const { data: comments, error: commentsError } = await supabase
              .from('appointment_comments')
              .select(`
                id,
                content,
                created_at,
                updated_at,
                user_id,
                completed,
                comment_type,
                is_todo,
                priority,
                user_profile:user_profile_view!user_id(
                  title,
                  first_name,
                  last_name
                )
              `)
              .eq('appointment_id', appointment.id)
              .order('created_at', { ascending: false });

            if (commentsError) throw commentsError;

            return {
              ...appointment,
              comments: comments || []
            };
          })
        );

        return appointmentsWithComments;
      } catch (err) {
        console.error("Error fetching appointments:", err);
        throw err;
      }
    },
    enabled: !!id
  });

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

  const { data: documents, refetch: refetchDocuments } = useQuery({
    queryKey: ['patientDocuments', id],
    queryFn: async () => {
      if (!appointments) return [];

      const appointmentIds = appointments.map(apt => apt.id);
      
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
        .in('appointment_id', appointmentIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Document[];
    },
    enabled: !!appointments
  });

  // Funktion zum Anzeigen von Dokumenten im Vorschaumodal
  const handlePreviewDocument = (document: Document) => {
    setPreviewDocument(document);
    setIsDocumentPreviewOpen(true);
  };

  // Funktion zum Markieren eines Kommentars als erledigt
  const handleMarkCommentAsCompleted = async (commentId: string) => {
    try {
      setError(null);

      const { error } = await supabase
        .from('appointment_comments')
        .update({ completed: true })
        .eq('id', commentId);

      if (error) throw error;

      // Daten aktualisieren
      queryClient.invalidateQueries(['patient-appointments', id]);
    } catch (err: any) {
      console.error('Error marking comment as completed:', err);
      setError(err.message || 'Fehler beim Markieren des Kommentars als erledigt');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, appointmentId: string) => {
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
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
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

  // Aktualisierte Funktion zum Hinzufügen von Kommentaren
  const handleAddComment = async (
    appointmentId: string,
    comment: string,
    type: 'info' | 'anruf',
    isTaskTodo: boolean,
    isPriority: boolean
  ) => {
    try {
      setError(null);

      if (!comment.trim()) {
        setError('Bitte geben Sie einen Kommentar ein');
        return;
      }

      const { error: commentError } = await supabase
        .from('appointment_comments')
        .insert({
          appointment_id: appointmentId,
          content: comment.trim(),
          comment_type: type,
          is_todo: isTaskTodo,
          priority: isTaskTodo && isPriority, // Priorität nur setzen, wenn es ein To-Do ist
          completed: false // Standardmäßig nicht erledigt
        });

      if (commentError) throw commentError;
      
      // Daten aktualisieren
      queryClient.invalidateQueries(['patient-appointments', id]);
    } catch (err: any) {
      console.error('Error adding comment:', err);
      setError(err.message || 'Fehler beim Speichern des Kommentars');
    }
  };

  // Filtert Kommentare basierend auf dem ausgewählten Filter
  const filterComments = (comments: Comment[]) => {
    switch (commentFilter) {
      case 'completed':
        return comments.filter(comment => comment.is_todo && comment.completed);
      case 'pending':
        return comments.filter(comment => comment.is_todo && !comment.completed);
      case 'info':
        return comments.filter(comment => comment.comment_type === 'info');
      case 'anruf':
        return comments.filter(comment => comment.comment_type === 'anruf');
      case 'priority':
        return comments.filter(comment => comment.priority);
      default:
        return comments;
    }
  };

  if (isLoadingPatient || isLoadingAppointments) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-red-700">Patient nicht gefunden</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">
            Patientenhistorie
          </h1>
          <Link
            to="/admin/patients"
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zur Übersicht
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
        <div className="flex">
          {/* Patientenfoto links */}
          {patientPhoto && (
            <div className="mr-6">
              <div className="relative">
                <img 
                  src={patientPhoto} 
                  alt="Patientenfoto" 
                  className="h-24 w-24 rounded-full object-cover cursor-pointer border-2 border-gray-200"
                  onClick={() => setShowPhotoModal(true)}
                />
                <button 
                  className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1 shadow-md hover:bg-blue-600"
                  onClick={() => setShowPhotoModal(true)}
                >
                  <Maximize className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
          
          {/* Patientendaten rechts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-grow">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Patient</h3>
              <p className="mt-1 text-sm text-gray-900">
                {patient.title && (
                  <span className="text-gray-500">{patient.title} </span>
                )}
                {patient.first_name} {patient.last_name}
              </p>
              <p className="text-sm text-gray-500">
                Patienten-Nr. {patient.patient_number}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Geburtsdatum</h3>
              <p className="mt-1 text-sm text-gray-900">
                {format(new Date(patient.birth_date), 'dd.MM.yyyy', { locale: de })}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Kontakt</h3>
              <p className="mt-1 text-sm text-gray-900">{patient.phone}</p>
              <p className="text-sm text-gray-900">{patient.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Untersuchungen
          </h2>
        </div>

        {appointments && appointments.length > 0 ? (
          <div className="bg-gray-50 space-y-6 p-6">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-base font-medium text-gray-900">
                      {appointment.examination?.name || "Keine Bezeichnung"}
                    </h3>
                    <div className="mt-1 text-sm text-gray-500 space-y-1">
                      <p>
                        {format(parseISO(appointment.start_time), "EEEE, d. MMMM yyyy 'um' HH:mm 'Uhr'", { locale: de })}
                      </p>
                      <p>
                        {appointment.device?.name || "Kein Gerät"} • {appointment.location?.name || "Kein Standort"}
                      </p>
                      <p>
                        Abrechnungsart: {
                          appointment.billing_type === 'self_payer' ? 'Selbstzahler' :
                          appointment.billing_type === 'private_patient' ? 'Privatpatient' :
                          appointment.billing_type === 'foreign_patient' ? 'Ausländischer Patient' :
                          'Arbeitsunfall (BG)'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className={cn(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    )}>
                      {
                        appointment.status === 'completed' ? 'Abgeschlossen' :
                        appointment.status === 'cancelled' ? 'Storniert' :
                        'Geplant'
                      }
                    </span>
                  </div>
                </div>

                {appointment.patient_data && Object.keys(appointment.patient_data).length > 0 && (
                  <div className="mt-4 bg-gray-50 rounded-md p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Details
                    </h4>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                      {appointment.patient_data.with_contrast_medium && (
                        <div>
                          <dt className="text-sm text-gray-500">Kontrastmittel</dt>
                          <dd className="text-sm text-gray-900">Ja</dd>
                        </div>
                      )}
                      {appointment.patient_data.has_transfer && (
                        <div>
                          <dt className="text-sm text-gray-500">Überweisung von</dt>
                          <dd className="text-sm text-gray-900">
                            {appointment.patient_data.referring_doctor}
                          </dd>
                        </div>
                      )}
                      {appointment.patient_data.has_beihilfe && (
                        <div>
                          <dt className="text-sm text-gray-500">Beihilfe</dt>
                          <dd className="text-sm text-gray-900">Ja</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}

                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">Dokumente</h4>
                    <div className="flex items-center space-x-4">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                      >
                        <option value="">Kategorie wählen...</option>
                        {categories?.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      <div className="relative">
                        <input
                          type="text"
                          value={documentComment}
                          onChange={(e) => setDocumentComment(e.target.value)}
                          placeholder="Kommentar zum Dokument"
                          className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                        />
                      </div>
                      <label className="relative cursor-pointer">
                        <input
                          type="file"
                          className="sr-only"
                          onChange={(e) => handleFileUpload(e, appointment.id)}
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          disabled={uploading || !selectedCategory}
                        />
                        <div className={cn(
                          "inline-flex items-center px-3 py-1.5 border text-sm font-medium rounded-md",
                          uploading || !selectedCategory
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                        )}>
                          <FileUp className="h-4 w-4 mr-1.5" />
                          {uploading ? "Wird hochgeladen..." : "Dokument hochladen"}
                        </div>
                      </label>
                    </div>
                  </div>

                  {documents?.filter(doc => doc.appointment_id === appointment.id).map((document) => (
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

                {/* Kommentare-Abschnitt */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-gray-900">Kommentare</h4>
                    
                    {/* Kommentar-Filter */}
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-500 mr-2">Filter:</label>
                      <select
                        value={commentFilter}
                        onChange={(e) => setCommentFilter(e.target.value as any)}
                        className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                      >
                        <option value="all">Alle</option>
                        <option value="completed">Erledigte ToDos</option>
                        <option value="pending">Unerledigte ToDos</option>
                        <option value="priority">Priorisierte ToDos</option>
                        <option value="info">Info-Kommentare</option>
                        <option value="anruf">Anruf-Kommentare</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Vorhandene Kommentare */}
                  {appointment.comments && appointment.comments.length > 0 ? (
                    <div className="space-y-3 mb-4">
                      {filterComments(appointment.comments).map((comment: Comment) => (
                        <div 
                          key={comment.id} 
                          className={cn(
                            "bg-gray-50 rounded-lg p-3",
                            comment.is_todo && comment.completed ? "border border-green-300" : "",
                            comment.is_todo && !comment.completed ? "border border-blue-300" : "",
                            comment.priority ? "border-l-4 border-l-orange-400" : ""
                          )}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center mb-1">
                                {comment.comment_type === 'info' ? (
                                  <Info className="h-4 w-4 text-blue-500 mr-2" />
                                ) : (
                                  <Phone className="h-4 w-4 text-green-500 mr-2" />
                                )}
                                <span className="text-xs font-medium text-gray-500 mr-2">
                                  {comment.comment_type === 'info' ? 'Info' : 'Anruf'}
                                </span>
                                {comment.is_todo && (
                                  <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded mr-2">
                                    ToDo
                                  </span>
                                )}
                                {comment.priority && (
                                  <Flag className="h-4 w-4 text-orange-500" title="Priorität" />
                                )}
                              </div>
                              <p className="text-sm text-gray-900">{comment.content}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {comment.user_profile?.title && (
                                  <span>{comment.user_profile.title} </span>
                                )}
                                {comment.user_profile?.first_name || "Unbekannt"} {comment.user_profile?.last_name || ""}
                                {' • '}
                                {format(parseISO(comment.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                              </p>
                            </div>
                            {comment.is_todo && !comment.completed && (
                              <button
                                onClick={() => handleMarkCommentAsCompleted(comment.id)}
                                className="ml-2 p-1 rounded-full hover:bg-green-100 text-gray-400 hover:text-green-600"
                                title="Als erledigt markieren"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 mb-4">Keine Kommentare vorhanden</div>
                  )}

                  {/* Neues Kommentar-Formular - jetzt mit terminspezifschen Formulardaten */}
                  <div className="space-y-4">
                    {/* Eingabefeld für den Kommentar */}
                    <textarea
                      value={getCommentForm(appointment.id).text}
                      onChange={(e) => updateCommentForm(appointment.id, { text: e.target.value })}
                      placeholder="Neuer Kommentar..."
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
                      rows={2}
                    />
                    
                    {/* Kommentar-Typ und ToDo Auswahl */}
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <input
                            id={`info-type-${appointment.id}`} // Eindeutige ID pro Termin
                            type="radio"
                            name={`comment-type-${appointment.id}`} // Eindeutiger Name pro Termin
                            checked={getCommentForm(appointment.id).type === 'info'}
                            onChange={() => updateCommentForm(appointment.id, { type: 'info' })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor={`info-type-${appointment.id}`} className="ml-2 text-sm text-gray-700 flex items-center">
                            <Info className="h-4 w-4 text-blue-500 mr-1" />
                            Info
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            id={`anruf-type-${appointment.id}`} // Eindeutige ID pro Termin
                            type="radio"
                            name={`comment-type-${appointment.id}`} // Eindeutiger Name pro Termin
                            checked={getCommentForm(appointment.id).type === 'anruf'}
                            onChange={() => updateCommentForm(appointment.id, { type: 'anruf' })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor={`anruf-type-${appointment.id}`} className="ml-2 text-sm text-gray-700 flex items-center">
                            <Phone className="h-4 w-4 text-green-500 mr-1" />
                            Anruf
                          </label>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <input
                            id={`todo-checkbox-${appointment.id}`} // Eindeutige ID pro Termin
                            type="checkbox"
                            checked={getCommentForm(appointment.id).isTodo}
                            onChange={() => {
                              const currentIsTodo = getCommentForm(appointment.id).isTodo;
                              updateCommentForm(appointment.id, { 
                                isTodo: !currentIsTodo,
                                // Reset priority when ToDo is unchecked
                                priority: !currentIsTodo ? false : getCommentForm(appointment.id).priority
                              });
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor={`todo-checkbox-${appointment.id}`} className="ml-2 text-sm text-gray-700">
                            ToDo
                          </label>
                        </div>
                        
                        {getCommentForm(appointment.id).isTodo && (
                          <div className="flex items-center">
                            <input
                              id={`priority-checkbox-${appointment.id}`} // Eindeutige ID pro Termin
                              type="checkbox"
                              checked={getCommentForm(appointment.id).priority}
                              onChange={() => updateCommentForm(appointment.id, { 
                                priority: !getCommentForm(appointment.id).priority 
                              })}
                              className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                            />
                            <label htmlFor={`priority-checkbox-${appointment.id}`} className="ml-2 text-sm text-gray-700 flex items-center">
                              <Flag className={`h-4 w-4 ${getCommentForm(appointment.id).priority ? 'text-orange-500' : 'text-gray-400'} mr-1`} />
                              Priorität
                            </label>
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={() => {
                          const form = getCommentForm(appointment.id);
                          handleAddComment(appointment.id, form.text, form.type, form.isTodo, form.priority);
                          // Zurücksetzen des Formulars nach dem Speichern
                          updateCommentForm(appointment.id, getEmptyCommentForm());
                        }}
                        disabled={!getCommentForm(appointment.id).text.trim()}
                        className="ml-auto inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Speichern
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            Keine Untersuchungen gefunden
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
      
      {/* Großes Foto-Modal */}
      {showPhotoModal && patientPhoto && (
        <PhotoModal photoUrl={patientPhoto} onClose={() => setShowPhotoModal(false)} />
      )}
    </div>
  );
};

export default PatientHistory;