import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { Plus, Pencil, Trash2, AlertCircle, Info, ChevronDown, ChevronRight, Save, X } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface InsuranceProvider {
  id: string;
  name: string;
  type: 'private' | 'statutory' | 'Berufsgenossenschft' | 'Foreigners';
  created_at: string;
}

interface BillingCategory {
  id: string;
  name: string;
}

// Interface für die Rohdaten aus der Datenbank
interface SupabaseBillingFactor {
  id: string;
  insurance_provider_id: string;
  billing_category_id: string;
  factor: number;
  category: BillingCategory | BillingCategory[] | null;
}

// Interface für die transformierten Daten
interface BillingFactor {
  id: string;
  insurance_provider_id: string;
  billing_category_id: string;
  factor: number;
  category?: BillingCategory;
}

// Mapping für Anzeigetext der Versicherungstypen
const typeLabels: Record<string, string> = {
  'private': 'Private Krankenversicherungen',
  'statutory': 'Gesetzliche Krankenversicherungen',
  'Berufsgenossenschft': 'Berufsgenossenschaft',
  'Foreigners': 'Ausländer'
};

const InsuranceSettings = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'private' | 'statutory' | 'Berufsgenossenschft' | 'Foreigners'>('private');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [expandedProviders, setExpandedProviders] = useState<string[]>([]);
  const [editingFactors, setEditingFactors] = useState<Record<string, Record<string, number>>>({});

  // Abrufen der Versicherungen
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

  // Abrufen der Abrechnungskategorien
  const { data: categories } = useQuery({
    queryKey: ['billing-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('billing_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as BillingCategory[];
    }
  });

  // Abrufen der Abrechnungsfaktoren
  const { data: billingFactors } = useQuery({
    queryKey: ['billing-factors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('insurance_billing_factors')
        .select(`
          id,
          insurance_provider_id,
          billing_category_id,
          factor,
          category:billing_categories(id, name)
        `);

      if (error) throw error;
      
      // Transformiere die Daten in das richtige Format
      return (data || []).map((item: SupabaseBillingFactor) => {
        let categoryData: BillingCategory | undefined = undefined;
        
        // Prüfe, ob category ein Array ist und ob es Elemente enthält
        if (Array.isArray(item.category) && item.category.length > 0) {
          categoryData = item.category[0];
        } 
        // Prüfe, ob category ein einzelnes Objekt ist
        else if (item.category && typeof item.category === 'object' && !Array.isArray(item.category)) {
          categoryData = item.category;
        }
        
        const result: BillingFactor = {
          id: item.id,
          insurance_provider_id: item.insurance_provider_id,
          billing_category_id: item.billing_category_id,
          factor: item.factor
        };
        
        if (categoryData) {
          result.category = categoryData;
        }
        
        return result;
      });
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

  const toggleExpand = (providerId: string) => {
    setExpandedProviders(prev => 
      prev.includes(providerId) 
        ? prev.filter(id => id !== providerId)
        : [...prev, providerId]
    );
    
    // Wenn wir expandieren und noch keine Faktoren für diese Versicherung haben, erstellen wir sie
    if (!expandedProviders.includes(providerId) && !editingFactors[providerId]) {
      initializeFactors(providerId);
    }
  };

  const initializeFactors = (providerId: string) => {
    if (!categories) return;
    
    const providerFactors: Record<string, number> = {};
    
    // Initiale Faktoren aus der Datenbank laden
    categories.forEach(category => {
      // Für alle Versicherungen den existierenden Faktor oder 1.0 verwenden
      const existingFactor = billingFactors?.find(
        f => f.insurance_provider_id === providerId && f.billing_category_id === category.id
      );
      
      providerFactors[category.id] = existingFactor?.factor || 1.0;
    });
    
    setEditingFactors(prev => ({
      ...prev,
      [providerId]: providerFactors
    }));
  };

  const handleFactorChange = (providerId: string, categoryId: string, value: string) => {
    // Numerischen Wert sicherstellen
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    
    setEditingFactors(prev => ({
      ...prev,
      [providerId]: {
        ...prev[providerId],
        [categoryId]: numValue
      }
    }));
  };

  const saveFactors = async (providerId: string) => {
    if (!editingFactors[providerId] || !categories) return;
    
    try {
      setError(null);
      const factors = editingFactors[providerId];
      
      // Für jede Kategorie: Faktor erstellen oder aktualisieren
      for (const categoryId of Object.keys(factors)) {
        const factor = factors[categoryId];
        const existingFactor = billingFactors?.find(
          f => f.insurance_provider_id === providerId && f.billing_category_id === categoryId
        );
        
        if (existingFactor) {
          // Aktualisieren, wenn der Faktor sich geändert hat
          if (existingFactor.factor !== factor) {
            await supabase
              .from('insurance_billing_factors')
              .update({ factor })
              .eq('id', existingFactor.id);
          }
        } else {
          // Neuen Faktor erstellen
          await supabase
            .from('insurance_billing_factors')
            .insert({
              insurance_provider_id: providerId,
              billing_category_id: categoryId,
              factor
            });
        }
      }
      
      // Daten neu laden
      queryClient.invalidateQueries({ queryKey: ['billing-factors'] });
      
    } catch (error: any) {
      console.error('Fehler beim Speichern der Faktoren:', error);
      setError(error.message || 'Fehler beim Speichern der Abrechnungsfaktoren.');
    }
  };

  // Helfer-Funktion, um den aktuellen Faktor für eine Versicherung und Kategorie zu finden
  const getCurrentFactor = (providerId: string, categoryId: string) => {
    // Zuerst aus editingFactors nehmen, falls vorhanden
    if (editingFactors[providerId]?.[categoryId] !== undefined) {
      return editingFactors[providerId][categoryId];
    }
    
    // Sonst aus den geladenen Faktoren
    const existingFactor = billingFactors?.find(
      f => f.insurance_provider_id === providerId && f.billing_category_id === categoryId
    );
    
    return existingFactor?.factor || 1.0;
  };

  // Hilfsfunktion, um Informationstext für verschiedene Versicherungstypen zu erhalten
  const getInfoText = () => {
    switch(activeTab) {
      case 'statutory':
        return 'Gesetzliche Krankenversicherungen werden hauptsächlich für die Dokumentation verwendet. Die Abrechnung erfolgt über die kassenärztliche Vereinigung.';
      case 'Berufsgenossenschft':
        return 'Berufsgenossenschaften sind Träger der gesetzlichen Unfallversicherung. Die Abrechnungsfaktoren können spezifisch angepasst werden.';
      case 'Foreigners':
        return 'Für ausländische Patienten können spezielle Abrechnungsfaktoren festgelegt werden.';
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-4 overflow-x-auto">
          {(['private', 'statutory', 'Berufsgenossenschft', 'Foreigners'] as const).map(type => (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={cn(
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === type
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {typeLabels[type]}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h2 className="text-lg font-semibold text-gray-900">
            {typeLabels[activeTab]}
          </h2>
          <p className="mt-2 text-sm text-gray-700">
            Liste aller {activeTab === 'private' ? 'privaten Krankenversicherungen' : 
                        activeTab === 'statutory' ? 'gesetzlichen Krankenversicherungen' :
                        activeTab === 'Berufsgenossenschft' ? 'Berufsgenossenschaften' : 
                        'Versicherungen für Ausländer'}.
            {' Klicken Sie auf eine Versicherung, um Abrechnungsfaktoren zu bearbeiten.'}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Neue {activeTab === 'private' ? 'Versicherung' : 
                 activeTab === 'statutory' ? 'Versicherung' : 
                 activeTab === 'Berufsgenossenschft' ? 'Berufsgenossenschaft' : 
                 'Versicherung'}
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

      {getInfoText() && (
        <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <Info className="h-5 w-5 text-blue-400" />
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                {getInfoText()}
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
                <th scope="col" className="px-3 w-10 py-3.5 text-center text-sm font-semibold text-gray-900">
                  <span className="sr-only">Expandieren</span>
                </th>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  Name
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right">
                  <span className="sr-only">Aktionen</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {isAdding && (
                <tr>
                  <td></td>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder={`Name der ${activeTab === 'Berufsgenossenschft' ? 'Berufsgenossenschaft' : 'Versicherung'}`}
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
                  <React.Fragment key={provider.id}>
                    <tr>
                      <td className="px-3 py-4 text-center">
                        <button
                          onClick={() => toggleExpand(provider.id)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          {expandedProviders.includes(provider.id) ? (
                            <ChevronDown className="h-5 w-5" />
                          ) : (
                            <ChevronRight className="h-5 w-5" />
                          )}
                        </button>
                      </td>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {editingId === provider.id ? (
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                        ) : (
                          <div className="flex items-center">
                            <span>{provider.name}</span>
                          </div>
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
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Löschen</span>
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                    {expandedProviders.includes(provider.id) && (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 bg-gray-50">
                          <div className="border rounded-lg overflow-hidden shadow-sm">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th scope="col" className="py-3 pl-4 pr-3 text-left text-xs font-semibold text-gray-700">
                                    Abrechnungskategorie
                                  </th>
                                  <th scope="col" className="py-3 px-3 text-left text-xs font-semibold text-gray-700 w-1/4">
                                    Faktor
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {categories && categories.map(category => (
                                  <tr key={category.id}>
                                    <td className="py-2 pl-4 pr-3 text-sm text-gray-900">
                                      {category.name}
                                    </td>
                                    <td className="py-2 px-3">
                                      <div className="flex items-center space-x-2">
                                        <input
                                          type="number"
                                          min="0.1"
                                          step="0.1"
                                          value={getCurrentFactor(provider.id, category.id)}
                                          onChange={(e) => handleFactorChange(provider.id, category.id, e.target.value)}
                                          className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        />
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                                <tr>
                                  <td colSpan={2} className="py-3 pl-4 pr-3 text-right">
                                    <button
                                      onClick={() => saveFactors(provider.id)}
                                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                      <Save className="h-3.5 w-3.5 mr-1" />
                                      Faktoren speichern
                                    </button>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InsuranceSettings;