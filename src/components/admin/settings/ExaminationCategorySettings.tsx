import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { Plus, Pencil, AlertCircle } from 'lucide-react';

interface ExaminationCategory {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

const ExaminationCategorySettings = () => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingDescription, setEditingDescription] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: categories, refetch } = useQuery({
    queryKey: ['examinationCategories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('examination_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as ExaminationCategory[];
    }
  });

  const handleAdd = async () => {
    try {
      const { error } = await supabase
        .from('examination_categories')
        .insert([{ name: newName, description: newDescription }]);

      if (error) throw error;

      setNewName('');
      setNewDescription('');
      setIsAdding(false);
      refetch();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleEdit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('examination_categories')
        .update({ name: editingName, description: editingDescription })
        .eq('id', id);

      if (error) throw error;

      setEditingId(null);
      setEditingName('');
      setEditingDescription('');
      refetch();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('examination_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      refetch();
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="p-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h2 className="text-lg font-semibold text-gray-900">Untersuchungskategorien</h2>
          <p className="mt-2 text-sm text-gray-700">
            Verwalten Sie die verfügbaren Kategorien für Untersuchungen.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Neue Kategorie
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

      <div className="mt-6">
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  Name
                </th>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                  Beschreibung
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
                      placeholder="Name der Kategorie"
                    />
                  </td>
                  <td className="py-4 pl-4 pr-3 text-sm">
                    <input
                      type="text"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="Beschreibung"
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
                        setNewDescription('');
                      }}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Abbrechen
                    </button>
                  </td>
                </tr>
              )}
              {categories?.map((category) => (
                <tr key={category.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {editingId === category.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    ) : (
                      category.name
                    )}
                  </td>
                  <td className="py-4 pl-4 pr-3 text-sm text-gray-500">
                    {editingId === category.id ? (
                      <input
                        type="text"
                        value={editingDescription}
                        onChange={(e) => setEditingDescription(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    ) : (
                      category.description
                    )}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    {editingId === category.id ? (
                      <>
                        <button
                          onClick={() => handleEdit(category.id)}
                          disabled={!editingName.trim()}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Speichern
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditingName('');
                            setEditingDescription('');
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
                            setEditingId(category.id);
                            setEditingName(category.name);
                            setEditingDescription(category.description || '');
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Bearbeiten</span>
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
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
  );
};

export default ExaminationCategorySettings; 