import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Pencil, AlertCircle, Search, X, AlertTriangle, FileText } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { format, parse, isValid } from 'date-fns';
import { de } from 'date-fns/locale';

interface Patient {
  id: string;
  patient_number: number;
  gender: string;
  title: string | null;
  first_name: string;
  last_name: string;
  birth_date: string;
  phone: string;
  email: string;
  created_at: string;
}

const PatientList = () => {
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCriteria, setSearchCriteria] = useState('name');
  const [isSearching, setIsSearching] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Add class to HTML element to hide all scrollbars
  useEffect(() => {
    document.documentElement.classList.add('hide-all-scrollbars');
    
    // Cleanup function to remove the class when component unmounts
    return () => {
      document.documentElement.classList.remove('hide-all-scrollbars');
    };
  }, []);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      if (searchTerm) {
        setIsSearching(true);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Clear warnings when search criteria changes
  useEffect(() => {
    setWarning(null);
  }, [searchCriteria]);

  // Format date in YYYY-MM-DD for PostgreSQL
  const formatDateForPostgres = (input: string): string | null => {
    try {
      // If input looks like DD.MM.YYYY
      if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(input)) {
        const date = parse(input, 'dd.MM.yyyy', new Date());
        if (isValid(date)) {
          return format(date, 'yyyy-MM-dd');
        }
      } 
      // If input looks like DD.MM.YY
      else if (/^\d{1,2}\.\d{1,2}\.\d{2}$/.test(input)) {
        const date = parse(input, 'dd.MM.yy', new Date());
        if (isValid(date)) {
          return format(date, 'yyyy-MM-dd');
        }
      }
      // If already in YYYY-MM-DD format
      else if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
        return input;
      }
      return null;
    } catch (error) {
      console.error('Date parsing error:', error);
      return null;
    }
  };
  
  // Check if the input looks like a date format
  const isDateLike = (input: string): boolean => {
    return /^\d{1,2}\.\d{1,2}\.\d{2,4}$/.test(input) || /^\d{4}-\d{2}-\d{2}$/.test(input);
  };

  const { data: patients, isLoading, refetch } = useQuery({
    queryKey: ['patients', debouncedSearchTerm, searchCriteria],
    queryFn: async () => {
      try {
        setError(null);
        setWarning(null);
        
        // If no search term, return all patients
        if (!debouncedSearchTerm) {
          const { data, error } = await supabase
            .from('patients')
            .select('*')
            .order('last_name, first_name');
            
          if (error) throw error;
          return data as Patient[];
        }
        
        // Check for potential mismatched search criteria
        if (searchCriteria === 'patient_number' && isDateLike(debouncedSearchTerm)) {
          setWarning('Die Eingabe sieht wie ein Datum aus. Möchten Sie stattdessen nach Geburtsdatum suchen?');
          // Continue with search but handle potential errors gracefully
        } else if (searchCriteria === 'birth_date' && !isNaN(Number(debouncedSearchTerm)) && 
                  !isDateLike(debouncedSearchTerm) && debouncedSearchTerm.length > 2) {
          setWarning('Die Eingabe sieht wie eine Zahl aus. Möchten Sie stattdessen nach Patientennummer suchen?');
          // Continue with search but handle potential errors gracefully
        }
        
        // Use different search strategies based on criteria
        if (searchCriteria === 'name') {
          // Search in first_name and last_name
          const { data, error } = await supabase
            .from('patients')
            .select('*')
            .or(`first_name.ilike.%${debouncedSearchTerm}%,last_name.ilike.%${debouncedSearchTerm}%`)
            .order('last_name, first_name');
            
          if (error) throw error;
          return data as Patient[];
          
        } else if (searchCriteria === 'birth_date') {
          // First attempt: Try exact date match if we can parse it
          const formattedDate = formatDateForPostgres(debouncedSearchTerm);
          
          if (formattedDate) {
            // Attempt exact date match
            try {
              const { data } = await supabase
                .from('patients')
                .select('*')
                .eq('birth_date', formattedDate)
                .order('last_name, first_name');
                
              if (data && data.length > 0) {
                return data as Patient[];
              }
            } catch (err) {
              console.log("Exact date search failed, trying text search...");
              // Continue to next strategy if this fails
            }
          }
          
          // Second attempt: Try text-based search
          try {
            // Use text-based search with proper casting to avoid operator error
            const { data, error } = await supabase
              .from('patients')
              .select('*')
              .filter('birth_date::text', 'ilike', `%${debouncedSearchTerm}%`)
              .order('last_name, first_name');
            
            if (error) {
              console.log("Text filter failed, trying raw SQL...");
              // Continue to third attempt
            } else {
              return data as Patient[];
            }
          } catch (err) {
            console.log("Filter search failed, trying raw SQL...");
            // Continue to third attempt
          }
          
          // Third attempt: Use raw SQL query as last resort
          try {
            const { data, error } = await supabase
              .rpc('search_patients_by_birthdate', { 
                search_term: debouncedSearchTerm 
              });
              
            if (error) throw error;
            return data as Patient[];
          } catch (sqlErr) {
            // Return empty array if all strategies fail without throwing error
            // We'll handle the "no results" display in the UI
            console.error("All date search strategies failed:", sqlErr);
            return [];
          }
          
        } else if (searchCriteria === 'patient_number') {
          try {
            // Try to convert to number for exact match
            if (isDateLike(debouncedSearchTerm)) {
              // If input looks like a date, handle gracefully without throwing error
              return [];
            }
            
            const numberTerm = Number(debouncedSearchTerm);
            
            if (isNaN(numberTerm)) {
              // Return empty result instead of error for non-numeric input
              return [];
            }
            
            const { data, error } = await supabase
              .from('patients')
              .select('*')
              .eq('patient_number', numberTerm)
              .order('last_name, first_name');
              
            if (error) throw error;
            return data as Patient[];
          } catch (err) {
            // Return empty array for invalid inputs instead of throwing error
            console.error('Patient number search error:', err);
            return [];
          }
        }
        
        // Default fallback
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .order('last_name, first_name');
          
        if (error) throw error;
        return data as Patient[];
        
      } catch (err: any) {
        console.error('Query error:', err);
        
        // Friendly error messages instead of technical errors
        if (err.message?.includes('operator does not exist')) {
          setError('Ein Fehler ist bei der Datumssuche aufgetreten. Bitte versuchen Sie ein anderes Format.');
        } else if (err.message?.includes('invalid input syntax for type integer')) {
          setError('Bitte geben Sie nur Zahlen für die Patientennummer ein.');
        } else {
          setError('Ein Fehler ist bei der Suche aufgetreten. Bitte versuchen Sie es erneut.');
        }
        
        return [];
      }
    },
    keepPreviousData: true,
    // Clear errors when results are found
    onSuccess: (data) => {
      if (data && data.length > 0) {
        setError(null);
      } else if (isSearching && debouncedSearchTerm) {
        if (searchCriteria === 'patient_number' && isDateLike(debouncedSearchTerm)) {
          // Don't show error, the warning is enough
        } else {
          setError(`Keine Patienten gefunden für: ${debouncedSearchTerm}`);
        }
      }
    }
  });

  const resetSearch = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setIsSearching(false);
    setError(null);
    setWarning(null);
    refetch();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setWarning(null);
    setDebouncedSearchTerm(searchTerm);
    if (searchTerm) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  };
  
  // Switch search criteria and retry search
  const switchSearchCriteria = (newCriteria: string) => {
    setSearchCriteria(newCriteria);
    setWarning(null);
    // Trigger search again
    handleSearchSubmit(new Event('submit') as unknown as React.FormEvent);
  };

  if (isLoading && !isSearching) {
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
          <h1 className="text-2xl font-semibold text-gray-900">Patienten</h1>
          <p className="mt-2 text-sm text-gray-700">
            Liste aller Patienten und deren Details.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            to="/admin/patients/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Neuer Patient
          </Link>
        </div>
      </div>

      {/* Search Form */}
      <div className="mt-6 bg-white shadow-sm rounded-lg p-4">
        <form onSubmit={handleSearchSubmit} className="space-y-4 sm:flex sm:items-end sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Suche
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-12 py-2 sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder={
                  searchCriteria === 'name' ? 'Nach Namen suchen...' :
                  searchCriteria === 'birth_date' ? 'Nach Geburtsdatum suchen (TT.MM.JJJJ)...' :
                  'Nach Patientennummer suchen...'
                }
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-500" />
                </button>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Suchkriterium
            </label>
            <div className="flex space-x-4">
              {[
                { id: 'name', label: 'Name' },
                { id: 'birth_date', label: 'Geburtsdatum' },
                { id: 'patient_number', label: 'Patienten-Nr.' }
              ].map((criteria) => (
                <label key={criteria.id} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={criteria.id}
                    checked={searchCriteria === criteria.id}
                    onChange={() => setSearchCriteria(criteria.id)}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">{criteria.label}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="sm:flex-none">
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Suchen
            </button>
            {isSearching && (
              <button
                type="button"
                onClick={resetSearch}
                className="mt-2 sm:mt-0 sm:ml-2 w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Zurücksetzen
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Warning message with suggestion to switch search criteria */}
      {warning && (
        <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3 flex-1">
              <p className="text-sm text-yellow-700">{warning}</p>
              <div className="mt-2">
                <button
                  onClick={() => switchSearchCriteria(searchCriteria === 'patient_number' ? 'birth_date' : 'patient_number')}
                  className="text-sm font-medium text-yellow-700 underline hover:text-yellow-600"
                >
                  Klicken Sie hier, um nach {searchCriteria === 'patient_number' ? 'Geburtsdatum' : 'Patientennummer'} zu suchen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isSearching && patients && (
        <div className="mt-4 flex items-center text-sm text-gray-600">
          <span>
            Suche nach {
              searchCriteria === 'name' ? 'Namen' :
              searchCriteria === 'birth_date' ? 'Geburtsdatum' :
              'Patientennummer'
            }: <strong>{debouncedSearchTerm}</strong>
          </span>
          <span className="ml-2">
            ({patients.length} {patients.length === 1 ? 'Ergebnis' : 'Ergebnisse'})
          </span>
        </div>
      )}

      {/* Only show error when no results found and no warning is displayed */}
      {error && (!patients || patients.length === 0) && !warning && (
        <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-col">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8 hide-scrollbar">
          <div className="inline-block min-w-full py-2 align-middle hide-scrollbar md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg hide-scrollbar">
              {patients && patients.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-300 hide-scrollbar">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Patienten-Nr.
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Name
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Geburtsdatum
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Telefon
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        E-Mail
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Bearbeiten</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {patients.map((patient) => (
                      <tr key={patient.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {patient.patient_number}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                          {patient.title && (
                            <span className="text-gray-500">{patient.title} </span>
                          )}
                          {patient.first_name} {patient.last_name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {format(new Date(patient.birth_date), 'dd.MM.yyyy', { locale: de })}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {patient.phone}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {patient.email}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <div className="flex items-center justify-end space-x-3">
                            <Link
                              to={`/admin/patients/${patient.id}/history`}
                              className="text-blue-600 hover:text-blue-900"
                              title="Historie anzeigen"
                            >
                              <FileText className="h-4 w-4" />
                              <span className="sr-only">Historie</span>
                            </Link>
                            <Link
                              to={`/admin/patients/${patient.id}`}
                              className="text-blue-600 hover:text-blue-900"
                              title="Patient bearbeiten"
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
              ) : (
                <div className="py-10 px-4 text-center">
                  <p className="text-gray-500">Keine Patienten gefunden.</p>
                  {isSearching && (
                    <button
                      onClick={resetSearch}
                      className="mt-2 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Suche zurücksetzen
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientList;