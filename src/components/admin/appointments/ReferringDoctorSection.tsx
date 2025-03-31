import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { Link } from 'react-router-dom';
import { Search, X, AlertCircle, Pencil, Plus } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface ReferringDoctorSectionProps {
  appointmentId: string;
  onUpdateComplete?: () => void;
}

interface ReferringDoctor {
  id: string;
  title: string | null;
  gender: string;
  first_name: string;
  last_name: string;
  specialty: {
    id: string;
    name: string;
  };
  street: string;
  house_number: string;
  postal_code: string;
  city: string;
  phone: string;
  fax: string | null;
  email: string | null;
  report_preference: 'email' | 'fax' | 'both';
}

const ReferringDoctorSection = ({ appointmentId, onUpdateComplete }: ReferringDoctorSectionProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState<'name' | 'specialty' | 'city'>('name');
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();

  // Lade aktuellen Überweiser für den Termin
  const { data: currentReferringDoctor, isLoading: isLoadingCurrent } = useQuery({
    queryKey: ['appointment-referring-doctor', appointmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointment_referring_doctors')
        .select(`
          referring_doctor_id,
          referring_doctor:referring_doctors(
            id,
            title,
            gender,
            first_name,
            last_name,
            street,
            house_number,
            postal_code,
            city,
            phone,
            fax,
            email,
            report_preference,
            specialty:medical_specialties(
              id,
              name
            )
          )
        `)
        .eq('appointment_id', appointmentId)
        .maybeSingle();

      if (error) throw error;
      return data?.referring_doctor as ReferringDoctor || null;
    }
  });

  // Suche nach Überweisern
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['referring-doctors-search', searchTerm, searchField],
    queryFn: async () => {
      if (!searchTerm) return [];

      try {
        let query = supabase
          .from('referring_doctors')
          .select(`
            id,
            title,
            gender,
            first_name,
            last_name,
            street,
            house_number,
            postal_code,
            city,
            phone,
            fax,
            email,
            report_preference,
            specialty:medical_specialties(
              id,
              name
            )
          `);

        // Suche basierend auf ausgewähltem Feld
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

        query = query.order('last_name, first_name').limit(10);

        const { data, error } = await query;
        if (error) throw error;
        return data as ReferringDoctor[];
      } catch (err: any) {
        console.error('Error searching for referring doctors:', err);
        setError('Fehler bei der Suche nach Überweisern');
        return [];
      }
    },
    enabled: searchTerm.length > 2 // Nur suchen, wenn mindestens 3 Zeichen eingegeben wurden
  });

  // Überweiser für den Termin setzen
  const setReferringDoctor = async (doctorId: string) => {
    try {
      setIsUpdating(true);
      setError(null);

      // Prüfen, ob bereits ein Überweiser existiert
      if (currentReferringDoctor) {
        // Überweiser aktualisieren
        const { error: deleteError } = await supabase
          .from('appointment_referring_doctors')
          .delete()
          .eq('appointment_id', appointmentId);

        if (deleteError) throw deleteError;
      }

      // Neuen Überweiser hinzufügen
      const { error: insertError } = await supabase
        .from('appointment_referring_doctors')
        .insert({
          appointment_id: appointmentId,
          referring_doctor_id: doctorId
        });

      if (insertError) throw insertError;

      // Daten aktualisieren
      queryClient.invalidateQueries(['appointment-referring-doctor', appointmentId]);
      
      // Callback zur Aktualisierung der übergeordneten Komponente
      if (onUpdateComplete) {
        onUpdateComplete();
      }

      // Suchfeld zurücksetzen
      setSearchTerm('');
      
    } catch (err: any) {
      console.error('Error setting referring doctor:', err);
      setError(err.message || 'Fehler beim Zuweisen des Überweisers');
    } finally {
      setIsUpdating(false);
    }
  };

  // Überweiser entfernen
  const removeReferringDoctor = async () => {
    try {
      setIsUpdating(true);
      setError(null);

      const { error } = await supabase
        .from('appointment_referring_doctors')
        .delete()
        .eq('appointment_id', appointmentId);

      if (error) throw error;

      // Daten aktualisieren
      queryClient.invalidateQueries(['appointment-referring-doctor', appointmentId]);
      
      // Callback zur Aktualisierung der übergeordneten Komponente
      if (onUpdateComplete) {
        onUpdateComplete();
      }
      
    } catch (err: any) {
      console.error('Error removing referring doctor:', err);
      setError(err.message || 'Fehler beim Entfernen des Überweisers');
    } finally {
      setIsUpdating(false);
    }
  };

  const resetSearch = () => {
    setSearchTerm('');
    setSearchField('name');
  };

  if (isLoadingCurrent) {
    return <div className="text-center py-4">Daten werden geladen...</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Aktueller Überweiser */}
      {currentReferringDoctor ? (
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium">Aktueller Überweiser</h3>
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-900">
                  {currentReferringDoctor.title && (
                    <span className="text-gray-500">{currentReferringDoctor.title} </span>
                  )}
                  {currentReferringDoctor.first_name} {currentReferringDoctor.last_name}
                </p>
                <p className="text-sm text-gray-500">{currentReferringDoctor.specialty.name}</p>
                <p className="text-sm text-gray-500">
                  {currentReferringDoctor.street} {currentReferringDoctor.house_number}, {currentReferringDoctor.postal_code} {currentReferringDoctor.city}
                </p>
                <p className="text-sm text-gray-500">Tel: {currentReferringDoctor.phone}</p>
                {currentReferringDoctor.email && <p className="text-sm text-gray-500">E-Mail: {currentReferringDoctor.email}</p>}
              </div>
            </div>
            <div className="flex space-x-2">
              <Link
                to={`/admin/referring-doctors/${currentReferringDoctor.id}`}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Bearbeiten
              </Link>
              <button
                onClick={removeReferringDoctor}
                disabled={isUpdating}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <X className="h-4 w-4 mr-2" />
                Entfernen
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-gray-500">Kein Überweiser zugewiesen</p>
        </div>
      )}

      {/* Suchbereich */}
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="text-lg font-medium mb-4">
          {currentReferringDoctor ? 'Überweiser ändern' : 'Überweiser hinzufügen'}
        </h3>
        
        <div className="flex flex-wrap gap-4 items-center mb-4">
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
          
          <Link
            to="/admin/referring-doctors/new"
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Neuer Überweiser
          </Link>
        </div>

        {/* Suchergebnisse */}
        {isSearching ? (
          <div className="text-center py-4">Suche läuft...</div>
        ) : searchTerm && searchResults && searchResults.length > 0 ? (
          <div className="mt-4 border rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fachrichtung
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kontakt
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Aktionen</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {searchResults.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {doctor.title && <span className="text-gray-500">{doctor.title} </span>}
                        {doctor.first_name} {doctor.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {doctor.city}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{doctor.specialty.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{doctor.phone}</div>
                      {doctor.email && <div>{doctor.email}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setReferringDoctor(doctor.id)}
                        disabled={isUpdating}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Auswählen
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : searchTerm.length > 2 ? (
          <div className="text-center py-4 text-gray-500">Keine Ergebnisse gefunden</div>
        ) : searchTerm.length > 0 ? (
          <div className="text-center py-4 text-gray-500">Bitte gib mindestens 3 Zeichen ein</div>
        ) : null}
      </div>
    </div>
  );
};

export default ReferringDoctorSection;