import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { Plus, Pencil, AlertCircle, Info } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface InsuranceProvider {
  id: string;
  name: string;
  type: 'private' | 'statutory';
  created_at: string;
}

const InsuranceSettings = () => {
  const [activeTab, setActiveTab] = useState<'private' | 'statutory'>('private');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: insuranceProviders, refetch } = useQuery({
    queryKey: ['insuranceProviders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('insurance_providers')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as InsuranceProvider[];
    }
  });

  const handleAdd = async () => {
    try {
      const { error } = await supabase
        .from('insurance_providers')
        .insert([{ 
          name: newName,
          type: activeTab
        }]);

      if (error) throw error;

      setNewName('');
      setIsAdding(false);
      refetch();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleEdit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('insurance_providers')
        .update({ name: editingName })
        .eq('id', id);

      if (error) throw error;

      setEditingId(null);
      setEditingName('');
      refetch();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('insurance_providers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      refetch();
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div>
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('private')}
            className={cn(
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
              activeTab === 'private'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            Private Krankenversicherungen
          </button>
          <button
            onClick={() => setActiveTab('statutory')}
            className={cn(
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
              activeTab === 'statutory'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            Gesetzliche Krankenversicherungen
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="py-6">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h2 className="text-lg font-semibold text-gray-900">
              {activeTab === 'private' ? 'Private' : 'Gesetzliche'} Krankenversicherungen
            </h2>
            <p className="mt-2 text-sm text-gray-700">
              Liste aller {activeTab === 'private' ? 'privaten' : 'gesetzlichen'} Krankenversicherungen.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Neue Versicherung
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'statutory' && (
          <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex">
              <Info className="h-5 w-5 text-blue-400" />
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Gesetzliche Krankenversicherungen werden nur für die Dokumentation verwendet.
                  Die Abrechnung erfolgt über die kassenärztliche Vereinigung.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    Name
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Aktionen</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {isAdding && (
                  <tr>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="Name der Versicherung"
                      />
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button
                        onClick={handleAdd}
                        disabled={!newName.trim()}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Speichern
                      </button>
                      <button
                        onClick={() => {
                          setIsAdding(false);
                          setNewName('');
                        }}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Abbrechen
                      </button>
                    </td>
                  </tr>
                )}
                {insuranceProviders
                  ?.filter(provider => provider.type === activeTab)
                  .map((provider) => (
                    <tr key={provider.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {editingId === provider.id ? (
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                        ) : (
                          provider.name
                        )}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        {editingId === provider.id ? (
                          <>
                            <button
                              onClick={() => handleEdit(provider.id)}
                              disabled={!editingName.trim()}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              Speichern
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setEditingName('');
                              }}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              Abbrechen
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingId(provider.id);
                                setEditingName(provider.name);
                              }}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Bearbeiten</span>
                            </button>
                            <button
                              onClick={() => handleDelete(provider.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Löschen
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsuranceSettings;