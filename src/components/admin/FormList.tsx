import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Pencil, FileText, AlertCircle, ChevronDown, ChevronUp, ExternalLink, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import FormViewerModal from './FormViewerModal';

interface Form {
  id: string;
  name: string;
  description: string;
  form_type: string;
  form_fields: {
    fields: Array<{
      id: string;
      label: string;
      type: string;
      required?: boolean;
      options?: string[];
    }>;
  };
  created_at: string;
}

const FORM_TYPE_LABELS: Record<string, string> = {
  registration: 'Anmeldeformular',
  cost_reimbursement: 'Kostenerstattung',
  privacy: 'Datenschutz',
  examination: 'Untersuchung',
  ct_consent: 'CT Aufklärungsbogen',
  ct_therapy: 'CT-Therapie Aufklärungsbogen',
  mrt_ct_consent: 'MRT/CT Einwilligungserklärung',
  prostate_questionnaire: 'Prostata-Fragebogen',
  custom: 'Benutzerdefiniert'
};

const FormList = () => {
  const [expandedFormId, setExpandedFormId] = useState<string | null>(null);
  const [viewingFormId, setViewingFormId] = useState<string | null>(null);

  const { data: forms, isLoading, error } = useQuery({
    queryKey: ['forms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Form[];
    }
  });

  const toggleFormExpansion = (formId: string) => {
    setExpandedFormId(expandedFormId === formId ? null : formId);
  };

  const openFormViewer = (formId: string) => {
    setViewingFormId(formId);
  };

  const closeFormViewer = () => {
    setViewingFormId(null);
  };

  const renderFormFields = (form: Form) => {
    if (!form.form_fields?.fields) return null;

    return (
      <div className="mt-4 space-y-4">
        <h4 className="text-sm font-medium text-gray-900">Formularfelder</h4>
        <div className="space-y-2">
          {form.form_fields.fields.map((field, index) => (
            <div
              key={field.id || index}
              className="bg-gray-50 rounded-lg p-3 border border-gray-200"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{field.label}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Typ: {field.type}
                    {field.required && ' • Pflichtfeld'}
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  ID: {field.id}
                </div>
              </div>
              
              {field.options && field.options.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500">Optionen:</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {field.options.map((option, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {option}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error loading forms</div>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Formulare</h1>
          <p className="mt-2 text-sm text-gray-700">
            Liste aller verfügbaren Formulare für Untersuchungen.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            to="/admin/forms/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Neues Formular
          </Link>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <div className="min-w-full divide-y divide-gray-200 bg-white">
                {forms?.map((form) => (
                  <div key={form.id} className="group">
                    <div className="flex items-center px-6 py-4 hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">
                              {form.name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {form.description}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {FORM_TYPE_LABELS[form.form_type] || form.form_type}
                        </span>
                        
                        {/* View Form Button */}
                        <button
                          onClick={() => openFormViewer(form.id)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Formular anzeigen"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Anzeigen</span>
                        </button>

                        <Link
                          to={`/admin/forms/${form.id}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="Formular bearbeiten"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Bearbeiten</span>
                        </Link>

                        <button
                          onClick={() => toggleFormExpansion(form.id)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          {expandedFormId === form.id ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Form Details */}
                    {expandedFormId === form.id && (
                      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                        {/* Form Preview Link */}
                        <div className="flex justify-end mb-4">
                          <Link
                            to={`/forms/preview/${form.id}`}
                            target="_blank"
                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Formular-Vorschau öffnen
                          </Link>
                        </div>

                        {/* Form Fields */}
                        {renderFormFields(form)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Viewer Modal */}
      {viewingFormId && (
        <FormViewerModal 
          formId={viewingFormId} 
          onClose={closeFormViewer} 
        />
      )}
    </div>
  );
};

export default FormList;