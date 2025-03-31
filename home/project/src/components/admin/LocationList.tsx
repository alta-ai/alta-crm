import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, MapPin, Phone, Mail } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Location {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  devices: { name: string }[];
}

const LocationList = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('locations')
        .select(`
          *,
          devices:location_devices(device:devices(name))
        `)
        .order('name');

      if (error) throw error;
      setLocations(data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setError('Failed to load locations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Standorte</h1>
          <p className="mt-2 text-sm text-gray-700">
            Liste aller Standorte und deren Details.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            to="/admin/locations/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Neuer Standort
          </Link>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle">
            <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 p-4">
                {locations.map((location) => (
                  <div
                    key={location.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {location.name}
                      </h3>
                      <Link
                        to={`/admin/locations/${location.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Bearbeiten</span>
                      </Link>
                    </div>
                    
                    <div className="mt-4 space-y-3">
                      <div className="flex items-start text-sm text-gray-500">
                        <MapPin className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                        <div dangerouslySetInnerHTML={{ __html: location.address }} />
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <Phone className="h-5 w-5 text-gray-400 mr-2" />
                        {location.phone}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail className="h-5 w-5 text-gray-400 mr-2" />
                        {location.email}
                      </div>
                    </div>

                    {location.devices && location.devices.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900">Geräte:</h4>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {location.devices.map((device, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {device.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationList;