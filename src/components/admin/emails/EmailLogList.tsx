import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { CheckCircle, XCircle, Clock, Mail, CalendarClock } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface EmailLog {
  id: string;
  template_id: string;
  appointment_id: string | null;
  patient_id: string | null;
  recipient_email: string;
  subject: string;
  status: 'sent' | 'failed' | 'queued';
  error_message: string | null;
  scheduled_for: string;
  sent_at: string | null;
  created_at: string;
  template_name?: string;
  patient_name?: string;
}

const EmailLogList: React.FC<{ appointmentId?: string; patientId?: string }> = ({
  appointmentId,
  patientId
}) => {
  const { data: logs, isLoading, error } = useQuery({
    queryKey: ['emailLogs', appointmentId, patientId],
    queryFn: async () => {
      let query = supabase
        .from('email_logs')
        .select(`
          *,
          template:template_id (name)
        `)
        .order('created_at', { ascending: false });
      
      if (appointmentId) {
        query = query.eq('appointment_id', appointmentId);
      }
      
      if (patientId) {
        query = query.eq('patient_id', patientId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Format data for display
      return data.map(log => ({
        ...log,
        template_name: log.template?.name || 'Unbekannte Vorlage'
      }));
    }
  });

  if (isLoading) {
    return <div className="text-gray-500 text-center py-4">Lade E-Mail-Protokoll...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">Fehler beim Laden des E-Mail-Protokolls</div>;
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        <Mail className="h-12 w-12 mx-auto mb-2 text-gray-400" />
        <p>Keine E-Mails für diesen {appointmentId ? 'Termin' : 'Patienten'} gefunden.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              E-Mail
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vorlage
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Geplant für
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Gesendet am
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                {log.status === 'sent' ? (
                  <span className="inline-flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Gesendet
                  </span>
                ) : log.status === 'queued' ? (
                  <span className="inline-flex items-center text-yellow-600">
                    <Clock className="h-4 w-4 mr-1" />
                    Geplant
                  </span>
                ) : (
                  <span className="inline-flex items-center text-red-600" title={log.error_message || ''}>
                    <XCircle className="h-4 w-4 mr-1" />
                    Fehler
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{log.recipient_email}</div>
                <div className="text-sm text-gray-500">{log.subject}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {log.template_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {log.scheduled_for ? (
                  <span className="inline-flex items-center">
                    <CalendarClock className="h-4 w-4 mr-1 text-gray-400" />
                    {format(new Date(log.scheduled_for), 'dd.MM.yyyy HH:mm', { locale: de })}
                  </span>
                ) : '—'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {log.sent_at ? format(new Date(log.sent_at), 'dd.MM.yyyy HH:mm', { locale: de }) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmailLogList;