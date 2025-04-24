import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface BillingForm {
  id: string;
  name: string;
  description: string;
  category_id: string;
  category: {
    name: string;
  }
  created_at: string;
  updated_at: string;
}

const BillingFormList = () => {
  const [error, setError] = useState<string | null>(null);

  const { data: billingForms, isLoading, refetch } = useQuery({
    queryKey: ['billing-forms'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('billing_forms')
          .select(`
            id,
            name,
            description,
            category_id,
            category:examination_categories(name),
            created_at,
            updated_at
          `)
          .order('name');

        if (error) throw error;
        
        // Formatiere die Daten für einfacheren Zugriff
        const formattedData = (data || []).map((form: any) => ({
          ...form,
          category: Array.isArray(form.category) && form.category.length > 0 
            ? form.category[0] 
            : (form.category || { name: 'Keine Kategorie' })
        }));
        
        return formattedData as BillingForm[];
      } catch (err: any) {
        setError(err.message || 'Fehler beim Laden der Abrechnungsbögen');
        return [];
      }
    }
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm('Sind Sie sicher, dass Sie diesen Abrechnungsbogen löschen möchten?')) {
      return;
    }

    try {
      setError(null);
      const { error } = await supabase
        .from('billing_forms')
        .delete()
        .eq('id', id);

      if (error) throw error;

      refetch();
    } catch (err: any) {
      console.error('Error deleting billing form:', err);
      setError(err.message || 'Fehler beim Löschen des Abrechnungsbogens');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Lade Abrechnungsbögen...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Abrechnungsbögen</h1>
          <p className="mt-2 text-sm text-gray-700">
            Verwalten Sie die Abrechnungsbögen für verschiedene Untersuchungskategorien.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            to="/admin/billing/forms/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Neuer Abrechnungsbogen
          </Link>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-400">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Untersuchungskategorie
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Beschreibung
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Letzte Aktualisierung
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Aktionen</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {billingForms && billingForms.length > 0 ? (
                    billingForms.map((form) => (
                      <tr key={form.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {form.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {form.category.name}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          {form.description || '—'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Date(form.updated_at).toLocaleDateString('de-DE', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <div className="flex justify-end space-x-3">
                            <Link
                              to={`/admin/billing/forms/${form.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Pencil className="h-5 w-5" />
                              <span className="sr-only">Bearbeiten</span>
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDelete(form.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-5 w-5" />
                              <span className="sr-only">Löschen</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-sm text-gray-500">
                        Keine Abrechnungsbögen vorhanden. Erstellen Sie einen neuen Abrechnungsbogen.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingFormList; 