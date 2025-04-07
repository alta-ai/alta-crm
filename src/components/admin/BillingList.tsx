import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useQuery } from '@tanstack/react-query';

interface BillingCode {
  id: string;
  code: string;
  description: string;
  price: number;
  category: {
    id: string;
    name: string;
  };
}

// Interface für die Daten, die von Supabase zurückgegeben werden
interface RawBillingCode {
  id: string;
  code: string;
  description: string;
  price: number;
  category: {
    id: string;
    name: string;
  }[];
}

const BillingList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCodes, setFilteredCodes] = useState<BillingCode[]>([]);

  const { data: billingCodes, isLoading, error, refetch } = useQuery({
    queryKey: ['billing-codes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('billing_codes')
        .select(`
          id,
          code,
          description,
          price,
          category_id,
          category:billing_categories!billing_codes_category_id_fkey(id, name)
        `)
        .order('code');

      if (error) throw error;
      
      // Für Debugging-Zwecke
      console.log('Empfangene Daten von Supabase:', data);
      
      // Transformiere die Daten in das richtige Format
      return (data || []).map(item => {
        let categoryData = { id: '', name: 'Keine Kategorie' };
        
        // Prüfe, ob category ein Array ist und ob es Elemente enthält
        if (Array.isArray(item.category) && item.category.length > 0) {
          categoryData = item.category[0];
        } 
        // Prüfe, ob category ein einzelnes Objekt ist
        else if (item.category && typeof item.category === 'object' && !Array.isArray(item.category)) {
          categoryData = item.category;
        }
        
        return {
          ...item,
          category: categoryData
        };
      }) as BillingCode[];
    }
  });

  useEffect(() => {
    if (billingCodes) {
      if (!searchQuery) {
        setFilteredCodes(billingCodes);
      } else {
        const query = searchQuery.toLowerCase();
        setFilteredCodes(
          billingCodes.filter(
            (code) =>
              code.code.toLowerCase().includes(query) ||
              code.description.toLowerCase().includes(query) ||
              (code.category && code.category.name ? code.category.name.toLowerCase().includes(query) : false)
          )
        );
      }
    }
  }, [searchQuery, billingCodes]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Fehler beim Laden der Abrechnungsdaten. Bitte versuchen Sie es später erneut.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Abrechnung</h1>
          <p className="mt-2 text-sm text-gray-700">
            Verwalten Sie Ihre Abrechnungsziffern und Preise.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            to="/admin/billing/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Neue Ziffer
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="mt-4 flex relative rounded-md shadow-sm">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Suchen nach Ziffer, Beschreibung oder Kategorie..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Ziffer
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Beschreibung
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Preis
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Kategorie
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Bearbeiten</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredCodes.length > 0 ? (
                    filteredCodes.map((code) => (
                      <tr key={code.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {code.code}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500 max-w-md truncate">
                          {code.description}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {code.price.toFixed(2)} €
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {code.category && code.category.name ? code.category.name : 'Keine Kategorie'}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <Link
                            to={`/admin/billing/${code.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Bearbeiten</span>
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-4 px-6 text-center text-sm text-gray-500">
                        {searchQuery
                          ? 'Keine Abrechnungsziffern gefunden, die Ihren Suchkriterien entsprechen.'
                          : 'Keine Abrechnungsziffern vorhanden.'}
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

export default BillingList; 