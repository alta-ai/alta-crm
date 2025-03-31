import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import { AlertCircle } from 'lucide-react';

interface Device {
  id: string;
  name: string;
}

interface LocationFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
  directions: string;
  devices: string[];
}

const LocationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [devices, setDevices] = useState<Device[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<LocationFormData>();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch devices
        const { data: devicesData, error: devicesError } = await supabase
          .from('devices')
          .select('id, name')
          .order('name');

        if (devicesError) throw devicesError;
        setDevices(devicesData || []);

        // If editing, fetch location data
        if (id) {
          const { data: location, error: locationError } = await supabase
            .from('locations')
            .select(`
              *,
              location_devices!inner(device_id)
            `)
            .eq('id', id)
            .single();

          if (locationError) throw locationError;
          if (location) {
            reset({
              ...location,
              devices: location.location_devices.map((ld: any) => ld.device_id)
            });
          }
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, reset]);

  const onSubmit = async (data: LocationFormData) => {
    setError(null);
    setLoading(true);
    try {
      if (id) {
        // Update existing location
        const { error: locationError } = await supabase
          .from('locations')
          .update({
            name: data.name,
            address: data.address,
            phone: data.phone,
            email: data.email,
            directions: data.directions
          })
          .eq('id', id);

        if (locationError) throw locationError;

        // Update device associations
        await supabase
          .from('location_devices')
          .delete()
          .eq('location_id', id);

        if (data.devices.length > 0) {
          const deviceAssociations = data.devices.map(deviceId => ({
            location_id: id,
            device_id: deviceId
          }));

          const { error: devicesError } = await supabase
            .from('location_devices')
            .insert(deviceAssociations);

          if (devicesError) throw devicesError;
        }
      } else {
        // Create new location
        const { data: location, error: locationError } = await supabase
          .from('locations')
          .insert({
            name: data.name,
            address: data.address,
            phone: data.phone,
            email: data.email,
            directions: data.directions
          })
          .select()
          .single();

        if (locationError) throw locationError;

        // Create device associations
        if (data.devices.length > 0) {
          const deviceAssociations = data.devices.map(deviceId => ({
            location_id: location.id,
            device_id: deviceId
          }));

          const { error: devicesError } = await supabase
            .from('location_devices')
            .insert(deviceAssociations);

          if (devicesError) throw devicesError;
        }
      }

      navigate('/admin/locations');
    } catch (error: any) {
      console.error('Error saving location:', error);
      setError(error.message || 'Failed to save location. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">
        {id ? 'Standort bearbeiten' : 'Neuer Standort'}
      </h1>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name *
              </label>
              <input
                type="text"
                {...register('name', { required: 'Name ist erforderlich' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Adresse *
              </label>
              <textarea
                {...register('address', { required: 'Adresse ist erforderlich' })}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Telefonnummer *
              </label>
              <input
                type="tel"
                {...register('phone', { required: 'Telefonnummer ist erforderlich' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                E-Mail *
              </label>
              <input
                type="email"
                {...register('email', { 
                  required: 'E-Mail ist erforderlich',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Ungültige E-Mail-Adresse'
                  }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Anfahrt
              </label>
              <textarea
                {...register('directions')}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Verfügbare Geräte
              </label>
              <div className="mt-2 space-y-2">
                {devices.map((device) => (
                  <label key={device.id} className="flex items-center">
                    <input
                      type="checkbox"
                      value={device.id}
                      {...register('devices')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{device.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/admin/locations')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading}
          >
            Abbrechen
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Speichern...' : 'Speichern'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LocationForm;