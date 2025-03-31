import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { Plus, Pencil, AlertCircle } from 'lucide-react';

interface AppointmentStatus {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

const PREDEFINED_COLORS = [
  { name: 'Blau', value: '#3b82f6' },
  { name: 'Grün', value: '#059669' },
  { name: 'Rot', value: '#dc2626' },
  { name: 'Orange', value: '#ea580c' },
  { name: 'Violett', value: '#7c3aed' },
  { name: 'Lila', value: '#9333ea' },     // Helleres Lila
  { name: 'Pink', value: '#db2777' },
  { name: 'Türkis', value: '#06b6d4' },   // Türkis
  { name: 'Hellblau', value: '#0ea5e9' }, // Optional: Hellblau
  { name: 'Gelb', value: '#ca8a04' },
  { name: 'Grau', value: '#4b5563' }
];

const AppointmentStatusSettings = () => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingColor, setEditingColor] = useState(PREDEFINED_COLORS[0].value);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PREDEFINED_COLORS[0].value);
  const [error, setError] = useState<string | null>(null);

  const { data: statuses, refetch } = useQuery({
    queryKey: ['appointmentStatuses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointment_statuses')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as AppointmentStatus[];
    }
  });

  const handleAdd = async () => {
    try {
      const { error } = await supabase
        .from('appointment_statuses')
        .insert([{ 
          name: newName,
          color: newColor
        }]);

      if (error) throw error;

      setNewName('');
      setNewColor(PREDEFINED_COLORS[0].value);
      setIsAdding(false);
      refetch();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleEdit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointment_statuses')
        .update({ 
          name: editingName,
          color: editingColor
        })
        .eq('id', id);

      if (error) throw error;

      setEditingId(null);
      setEditingName('');
      setEditingColor(PREDEFINED_COLORS[0].value);
      refetch();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointment_statuses')
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
          <h2 className="text-lg font-semibold text-gray-900">Terminstatus</h2>
          <p className="mt-2 text-sm text-gray-700">
            Verwalten Sie die verschiedenen Status für Termine und deren Farben im Kalender.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Neuer Status
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
                  Status
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Farbe
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
                      placeholder="Name des Status"
                    />
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <select
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      {PREDEFINED_COLORS.map((color) => (
                        <option key={color.value} value={color.value}>
                          {color.name}
                        </option>
                      ))}
                    </select>
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
                        setNewColor(PREDEFINED_COLORS[0].value);
                      }}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Abbrechen
                    </button>
                  </td>
                </tr>
              )}
              {statuses?.map((status) => (
                <tr key={status.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {editingId === status.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    ) : (
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: status.color }}
                        />
                        {status.name}
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    {editingId === status.id ? (
                      <select
                        value={editingColor}
                        onChange={(e) => setEditingColor(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        {PREDEFINED_COLORS.map((color) => (
                          <option key={color.value} value={color.value}>
                            {color.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-6 h-6 rounded border border-gray-200"
                          style={{ backgroundColor: status.color }}
                        />
                      </div>
                    )}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    {editingId === status.id ? (
                      <>
                        <button
                          onClick={() => handleEdit(status.id)}
                          disabled={!editingName.trim()}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Speichern
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditingName('');
                            setEditingColor(PREDEFINED_COLORS[0].value);
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
                            setEditingId(status.id);
                            setEditingName(status.name);
                            setEditingColor(status.color);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Bearbeiten</span>
                        </button>
                        <button
                          onClick={() => handleDelete(status.id)}
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

export default AppointmentStatusSettings;