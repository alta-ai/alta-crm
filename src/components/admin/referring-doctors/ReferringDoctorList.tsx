import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Pencil, Search, X, AlertCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { cn } from '../../../lib/utils';

interface ReferringDoctor {
  id: string;
  title: string | null;
  gender: string;
  first_name: string;
  last_name: string;
  street: string;
  house_number: string;
  postal_code: string;
  city: string;
  phone: string;
  fax: string | null;
  email: string | null;
  report_preference: 'email' | 'fax' | 'both';
  specialty: {
    id: string;
    name: string;
  };
}

const ReferringDoctorList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState<'name' | 'specialty' | 'city'>('name');
  const [error, setError] = useState<string | null>(null);

  const { data: doctors, isLoading } = useQuery({
    queryKey: ['referringDoctors', searchTerm, searchField],
    queryFn: async () => {
      try {
        setError(null);
        
        let query = supabase
          .from('referring_doctors')
          .select(`
            *,
            specialty:medical_specialties(
              id,
              name
            )
          `);

        // Suche basierend auf ausgewähltem Feld
        if (searchTerm) {
          switch (searchField) {
            case 'name':
              query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`);
              break;
            case 'specialty':
              query = query.eq('specialty.name', searchTerm);
              break;
            case 'city':
              query = query.ilike('city', `%${searchTerm}%`);
              break;
          }
        }

        query = query.order('last_name, first_name');

        const { data, error } = await query;
        if (error) throw error;
        return data as ReferringDoctor[];
      } catch (err: any) {
        console.error('Error fetching doctors:', err);
        setError('Fehler beim Laden der Ärzte');
        return [];
      }
    }
  });

  const resetSearch = () => {
    setSearchTerm('');
    setSearchField('name');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Überweisende Ärzte</h1>
          <p className="mt-2 text-sm text-gray-700">
            Liste aller überweisenden Ärzte und deren Details.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            to="/admin/referring-doctors/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Neuer Überweiser
          </Link>
        </div>
      </div>

      {/* Suchbereich */}
      <div className="mt-6 bg-white shadow-sm rounded-lg p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                searchField === 'name' ? 'Nach Namen suchen...' :
                searchField === 'specialty' ? 'Nach Fachrichtung suchen...' :
                'Nach Ort suchen...'
              }
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            {searchTerm && (
              <button
                onClick={resetSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-500" />
              </button>
            )}
          </div>

          <select
            value={searchField}
            onChange={(e) => setSearchField(e.target.value as 'name' | 'specialty' | 'city')}
            className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
          >
            <option value="name">Nach Namen</option>
            <option value="specialty">Nach Fachrichtung</option>
            <option value="city">Nach Ort</option>
          </select>
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

      <div className="mt-8 flex flex-col">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Fachrichtung
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Adresse
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Kontakt
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Befundübermittlung
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Aktionen</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {doctors?.map((doctor) => (
                    <tr key={doctor.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {doctor.title && (
                          <span className="text-gray-500">{doctor.title} </span>
                        )}
                        {doctor.first_name} {doctor.last_name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {doctor.specialty?.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {doctor.street} {doctor.house_number}, {doctor.postal_code} {doctor.city}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div>{doctor.phone}</div>
                        {doctor.email && <div>{doctor.email}</div>}
                        {doctor.fax && <div>Fax: {doctor.fax}</div>}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                          doctor.report_preference === 'email' ? "bg-blue-100 text-blue-800" :
                          doctor.report_preference === 'fax' ? "bg-purple-100 text-purple-800" :
                          "bg-green-100 text-green-800"
                        )}>
                          {doctor.report_preference === 'email' ? 'E-Mail' :
                           doctor.report_preference === 'fax' ? 'Fax' :
                           'E-Mail & Fax'}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex items-center justify-end space-x-3">
                          <Link
                            to={`/admin/referring-doctors/${doctor.id}/history`}
                            className="text-blue-600 hover:text-blue-900"
                            title="Historie anzeigen"
                          >
                            Historie
                          </Link>
                          <Link
                            to={`/admin/referring-doctors/${doctor.id}`}
                            className="text-blue-600 hover:text-blue-900"
                            title="Überweiser bearbeiten"
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Bearbeiten</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferringDoctorList;