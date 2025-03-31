import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Pencil, Mail, ChevronDown, ChevronUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  trigger_form: string;
  trigger_type: string;
  recipient_field: string;
  sender_email: string;
  subject: string;
}

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

const FORM_TYPE_LABELS: Record<string, string> = {
  appointment: 'Terminbuchung',
  registration: 'Anmeldeformular',
  cost_reimbursement: 'Kostenerstattung',
  privacy: 'Datenschutz',
  examination: 'Untersuchung',
  custom: 'Benutzerdefiniert'
};

const TRIGGER_TYPE_LABELS: Record<string, string> = {
  form_submission: 'Bei Formular-Einreichung',
  appointment_created: 'Bei Terminbuchung',
  appointment_updated: 'Bei Terminänderung',
  appointment_cancelled: 'Bei Terminabsage'
};

const EmailTemplateList = () => {
  const [showLogs, setShowLogs] = useState(false);

  const { data: templates, isLoading: templatesLoading, error: templatesError } = useQuery({
    queryKey: ['emailTemplates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as EmailTemplate[];
    }
  });

  const { data: logs, isLoading: logsLoading, error: logsError } = useQuery({
    queryKey: ['emailLogs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_logs')
        .select(`
          *,
          template:template_id (name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      return data.map(log => ({
        ...log,
        template_name: log.template?.name || 'Unbekannte Vorlage'
      })) as EmailLog[];
    },
    enabled: showLogs // Lade Logs nur, wenn sie angezeigt werden sollen
  });

  if (templatesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (templatesError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error loading templates</div>
      </div>
    );
  }

  return (
    <div>
      {/* E-Mail-Vorlagen Überschrift und Button */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">E-Mail-Vorlagen</h1>
          <p className="mt-2 text-sm text-gray-700">
            Verwalten Sie E-Mail-Vorlagen für automatische Benachrichtigungen.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            to="/admin/emails/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Neue Vorlage
          </Link>
        </div>
      </div>

      {/* E-Mail-Vorlagen Liste */}
      <div className="mt-8 flex flex-col">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle">
            <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 p-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {template.name}
                        </h3>
                      </div>
                      <Link
                        to={`/admin/emails/${template.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Bearbeiten</span>
                      </Link>
                    </div>
                    
                    <div className="mt-4 space-y-3">
                      {template.description && (
                        <p className="text-sm text-gray-500">{template.description}</p>
                      )}
                      
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="font-medium text-gray-500">Trigger: </span>
                          <span className="text-gray-900">
                            {TRIGGER_TYPE_LABELS[template.trigger_type] || 'Unbekannt'}
                          </span>
                        </div>
                        {template.trigger_type === 'form_submission' && (
                          <div className="text-sm">
                            <span className="font-medium text-gray-500">Formular: </span>
                            <span className="text-gray-900">
                              {FORM_TYPE_LABELS[template.trigger_form] || 'Unbekannt'}
                            </span>
                          </div>
                        )}
                        <div className="text-sm">
                          <span className="font-medium text-gray-500">Absender: </span>
                          <span className="text-gray-900">{template.sender_email}</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium text-gray-500">Betreff: </span>
                          <span className="text-gray-900">{template.subject}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trenner */}
      <div className="mt-12 mb-6 border-t border-gray-200"></div>

      {/* E-Mail-Protokolle Überschrift und Toggle-Button */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <button 
            onClick={() => setShowLogs(!showLogs)}
            className="flex items-center text-left focus:outline-none"
          >
            <h1 className="text-2xl font-semibold text-gray-900">E-Mail-Protokolle</h1>
            {showLogs ? (
              <ChevronUp className="ml-2 h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="ml-2 h-5 w-5 text-gray-500" />
            )}
          </button>
          <p className="mt-2 text-sm text-gray-700">
            Übersicht aller gesendeten E-Mails und deren Status.
          </p>
        </div>
      </div>

      {/* E-Mail-Protokolle (nur anzeigen, wenn showLogs true ist) */}
      {showLogs && (
        <div className="mt-6">
          {logsLoading ? (
            <div className="text-gray-500 text-center py-4">Lade E-Mail-Protokoll...</div>
          ) : logsError ? (
            <div className="text-red-500 text-center py-4">Fehler beim Laden des E-Mail-Protokolls</div>
          ) : logs && logs.length > 0 ? (
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
                        {log.scheduled_for ? format(new Date(log.scheduled_for), 'dd.MM.yyyy HH:mm', { locale: de }) : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {log.sent_at ? format(new Date(log.sent_at), 'dd.MM.yyyy HH:mm', { locale: de }) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              <Mail className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>Keine E-Mail-Protokolle vorhanden.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmailTemplateList;