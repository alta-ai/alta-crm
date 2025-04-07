import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface Category {
  id: string;
  name: string;
}

const BillingCategories = () => {
  const queryClient = useQueryClient();
  const [newCategory, setNewCategory] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const { data: categories, isLoading, refetch } = useQuery({
    queryKey: ['billing-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('billing_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Category[];
    }
  });

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      setError('Bitte geben Sie einen Namen für die Kategorie ein.');
      return;
    }

    try {
      setIsAdding(true);
      setError(null);

      const { error } = await supabase
        .from('billing_categories')
        .insert({ name: newCategory.trim() });

      if (error) throw error;

      setNewCategory('');
      queryClient.invalidateQueries({ queryKey: ['billing-categories'] });
      await refetch();
    } catch (err: any) {
      console.error('Error adding category:', err);
      setError(err.message || 'Fehler beim Hinzufügen der Kategorie.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleStartEdit = (category: Category) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleSaveEdit = async (id: string) => {
    if (!editingName.trim()) {
      setError('Der Kategorienname darf nicht leer sein.');
      return;
    }

    try {
      setError(null);

      const { error } = await supabase
        .from('billing_categories')
        .update({ name: editingName.trim() })
        .eq('id', id);

      if (error) throw error;

      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ['billing-categories'] });
    } catch (err: any) {
      console.error('Error updating category:', err);
      setError(err.message || 'Fehler beim Aktualisieren der Kategorie.');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    // Prüfe zunächst, ob die Kategorie verwendet wird
    try {
      const { count, error: countError } = await supabase
        .from('billing_codes')
        .select('id', { count: 'exact', head: true })
        .eq('category_id', id);

      if (countError) throw countError;

      if (count && count > 0) {
        setError(`Die Kategorie wird von ${count} Abrechnungsziffern verwendet und kann nicht gelöscht werden.`);
        return;
      }

      if (window.confirm('Sind Sie sicher, dass Sie diese Kategorie löschen möchten?')) {
        const { error } = await supabase
          .from('billing_categories')
          .delete()
          .eq('id', id);

        if (error) throw error;

        queryClient.invalidateQueries({ queryKey: ['billing-categories'] });
      }
    } catch (err: any) {
      console.error('Error deleting category:', err);
      setError(err.message || 'Fehler beim Löschen der Kategorie.');
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center text-gray-500">Lade Kategorien...</div>;
  }

  return (
    <div className="p-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h2 className="text-xl font-semibold text-gray-900">Abrechnungskategorien</h2>
          <p className="mt-2 text-sm text-gray-700">
            Verwalten Sie die Kategorien für Ihre Abrechnungsziffern.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 mb-4 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <div className="mb-5 flex">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Neue Kategorie"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          <button
            type="button"
            onClick={handleAddCategory}
            disabled={isAdding || !newCategory.trim()}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <Plus className="h-4 w-4 mr-1" />
            Hinzufügen
          </button>
        </div>

        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  Name
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right">
                  <span className="sr-only">Aktionen</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {categories && categories.length > 0 ? (
                categories.map((category) => (
                  <tr key={category.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                      {editingId === category.id ? (
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      ) : (
                        <span className="font-medium text-gray-900">{category.name}</span>
                      )}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      {editingId === category.id ? (
                        <div className="flex justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(category.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Check className="h-5 w-5" />
                            <span className="sr-only">Speichern</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <X className="h-5 w-5" />
                            <span className="sr-only">Abbrechen</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(category)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Pencil className="h-5 w-5" />
                            <span className="sr-only">Bearbeiten</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-5 w-5" />
                            <span className="sr-only">Löschen</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="py-4 text-center text-sm text-gray-500">
                    Keine Kategorien vorhanden. Fügen Sie eine neue Kategorie hinzu.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BillingCategories; 