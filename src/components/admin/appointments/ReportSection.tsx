import React, { useState, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { X, Save, FileText, Check, AlertCircle, File } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import ReportPDFModal from './ReportPDFModal';

interface ReportSectionProps {
  appointmentId: string;
  patientId: string;
}

const ReportSection = ({ appointmentId, patientId }: ReportSectionProps) => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [indication, setIndication] = useState('');
  const [report, setReport] = useState('');
  const [assessment, setAssessment] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Lade den Befund
  const { data: reportData, isLoading: isLoadingReport } = useQuery({
    queryKey: ['report', appointmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('appointment_id', appointmentId)
        .maybeSingle();

      if (error) throw error;
      return data;
    }
  });

  // Lade Patientendaten
  const { data: patient, isLoading: isLoadingPatient } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (error) throw error;
      return data;
    }
  });

  // Lade Termindaten mit Untersuchung und Standort
  const { data: appointment, isLoading: isLoadingAppointment } = useQuery({
    queryKey: ['appointment-details', appointmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          examination:examinations(
            name,
            category
          ),
          location:locations(
            id,
            name,
            letterhead_url,
            use_default_letterhead
          )
        `)
        .eq('id', appointmentId)
        .single();

      if (error) throw error;
      return data;
    }
  });

  // Lade den aktuellen Benutzer
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (profileError) throw profileError;
        return profile;
      }
      return null;
    }
  });

  // Lade das Standardbriefpapier
  const { data: defaultLetterhead } = useQuery({
    queryKey: ['default-letterhead'],
    queryFn: async () => {
      // Hier könnte in Zukunft eine Abfrage nach dem globalen Standardbriefpapier erfolgen
      // Für jetzt verwenden wir den URL zum Beispielbriefpapier
      return '/default-letterhead.png';
    }
  });

  // Initialisiere Formularfelder mit geladenen Daten
  useEffect(() => {
    if (reportData) {
      setTitle(reportData.title || '');
      setIndication(reportData.indication || '');
      setReport(reportData.report || '');
      setAssessment(reportData.assessment || '');
      setIsComplete(reportData.is_complete || false);
    } else if (appointment && !title) {
      // Automatische Titel-Generierung
      setTitle(`${appointment.examination?.name || 'Befund'}`);
    }
  }, [reportData, appointment]);

  // Mutation zum Speichern des Befunds
  const saveMutation = useMutation({
    mutationFn: async () => {
      const reportExists = !!reportData;
      
      if (reportExists) {
        // Update
        const { error } = await supabase
          .from('reports')
          .update({
            title,
            indication,
            report,
            assessment,
            is_complete: isComplete,
            updated_at: new Date().toISOString()
          })
          .eq('appointment_id', appointmentId);

        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('reports')
          .insert({
            appointment_id: appointmentId,
            title,
            indication,
            report,
            assessment,
            is_complete: isComplete
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['report', appointmentId]);
      setError(null);
    },
    onError: (err: any) => {
      console.error('Fehler beim Speichern des Befunds:', err);
      setError('Der Befund konnte nicht gespeichert werden. Bitte versuchen Sie es später erneut.');
    }
  });

  const toggleCompletion = () => {
    setIsComplete(!isComplete);
  };

  const generateReport = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // Hier würde die KI-basierte Befundgenerierung implementiert werden
      // Für dieses Beispiel generieren wir einen einfachen Beispielbefund
      
      const newBefund = `Normalbefund.
      
      Regelrechte anatomische Verhältnisse.
      Keine pathologischen Veränderungen nachweisbar.
      Altersentsprechender Normalbefund.`;
      
      const newAssessment = `Kein Hinweis auf pathologische Veränderungen.
      Altersentsprechender Normalbefund.`;
      
      setReport(newBefund);
      setAssessment(newAssessment);
      
    } catch (err: any) {
      console.error('Fehler bei der Befundgenerierung:', err);
      setError(`Fehler bei der Befundgenerierung: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const isLoading = isLoadingReport || isLoadingPatient || isLoadingAppointment;

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-64">Befunddaten werden geladen...</div>;
  }

  if (!patient || !appointment) {
    return <div className="text-red-600">Fehler: Patient oder Termin nicht gefunden</div>;
  }

  // Daten für das PDF
  const pdfData = {
    title,
    patientName: `${patient.first_name} ${patient.last_name}`,
    patientGender: patient.gender === 'M' ? 'männlich' : patient.gender === 'F' ? 'weiblich' : 'divers',
    patientBirthDate: format(new Date(patient.birth_date), 'dd.MM.yyyy', { locale: de }),
    examinationName: appointment.examination?.name || '',
    examinationDate: format(new Date(appointment.start_time), 'dd.MM.yyyy', { locale: de }),
    indication,
    report,
    assessment,
    doctorName: currentUser ? `${currentUser.title || ''} ${currentUser.first_name} ${currentUser.last_name}`.trim() : '',
    isComplete,
    location: appointment.location
  };

  return (
    <div className="space-y-6">
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

      <div className="bg-white rounded-lg shadow p-6" ref={scrollRef}>
        <div className="space-y-6">
          {/* Patienteninformationen */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Patient</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Name: </span>
                {patient.title && <span className="text-gray-500">{patient.title} </span>}
                {patient.first_name} {patient.last_name}
              </div>
              <div>
                <span className="font-medium">Geburtsdatum: </span>
                {format(new Date(patient.birth_date), 'dd.MM.yyyy', { locale: de })}
              </div>
              <div>
                <span className="font-medium">Untersuchung: </span>
                {appointment.examination?.name}
              </div>
              <div>
                <span className="font-medium">Datum: </span>
                {format(new Date(appointment.start_time), 'dd.MM.yyyy', { locale: de })}
              </div>
              <div>
                <span className="font-medium">Standort: </span>
                {appointment.location?.name || 'Unbekannt'}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titel
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Befundtitel"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Indikation
            </label>
            <ReactQuill
              value={indication}
              onChange={setIndication}
              modules={{
                toolbar: [
                  ['bold', 'italic', 'underline'],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                  ['clean']
                ]
              }}
              className="min-h-[100px] bg-white rounded"
              placeholder="Indikation eingeben..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Befund
            </label>
            <ReactQuill
              value={report}
              onChange={setReport}
              modules={{
                toolbar: [
                  ['bold', 'italic', 'underline'],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                  ['clean']
                ]
              }}
              className="min-h-[200px] bg-white rounded"
              placeholder="Befundtext eingeben..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Beurteilung
            </label>
            <ReactQuill
              value={assessment}
              onChange={setAssessment}
              modules={{
                toolbar: [
                  ['bold', 'italic', 'underline'],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                  ['clean']
                ]
              }}
              className="min-h-[120px] bg-white rounded"
              placeholder="Beurteilung eingeben..."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t">
        <div className="flex space-x-3">
          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2 inline" />
            {saveMutation.isLoading ? 'Wird gespeichert...' : 'Speichern'}
          </button>
          
          <button
            onClick={generateReport}
            disabled={isGenerating}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            <FileText className="h-4 w-4 mr-2 inline" />
            {isGenerating ? 'Generiere Befund...' : 'Befund generieren'}
          </button>

          <button
            onClick={() => setShowPDFModal(true)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <File className="h-4 w-4 mr-2 inline" />
            Befund als PDF anzeigen
          </button>
        </div>

        <div>
          <button
            onClick={toggleCompletion}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2",
              isComplete 
                ? "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 focus:ring-gray-500"
                : "bg-blue-600 text-white border border-transparent hover:bg-blue-700 focus:ring-blue-500"
            )}
          >
            <Check className="h-4 w-4 mr-2 inline" />
            {isComplete ? 'Als unvollständig markieren' : 'Als vollständig markieren'}
          </button>
        </div>
      </div>

      {/* PDF Modal */}
      {showPDFModal && (
        <ReportPDFModal
          data={pdfData}
          defaultLetterheadUrl={defaultLetterhead || '/default-letterhead.png'}
          onClose={() => setShowPDFModal(false)}
        />
      )}
    </div>
  );
};

export default ReportSection;