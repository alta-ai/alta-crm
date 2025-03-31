import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import { AlertCircle, Upload, Trash2, Image } from 'lucide-react';

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
  letterhead_url: string | null;
  use_default_letterhead: boolean;
}

const LocationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [devices, setDevices] = useState<Device[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [useDefaultLetterhead, setUseDefaultLetterhead] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<LocationFormData>({
    defaultValues: {
      devices: [], // Initialize devices as empty array
      letterhead_url: null,
      use_default_letterhead: false
    }
  });

  // Watch the letterhead_url value to sync with preview
  const letterheadUrl = watch('letterhead_url');

  // Hilfsfunktion zum Generieren eines eindeutigen Dateinamens
  const generateUniqueFileName = () => {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 10000);
    return `letterhead_${timestamp}_${random}.png`;
  };

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
              location_devices(device_id)
            `)
            .eq('id', id)
            .single();

          if (locationError) throw locationError;
          if (location) {
            // Set form values
            reset({
              ...location,
              devices: location.location_devices?.map((ld: any) => ld.device_id) || [],
              use_default_letterhead: location.use_default_letterhead || false
            });
            
            // Set preview URL if letterhead exists
            if (location.letterhead_url) {
              setPreviewUrl(location.letterhead_url);
            }
            
            // Set default letterhead flag
            setUseDefaultLetterhead(location.use_default_letterhead || false);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is PNG
    if (file.type !== 'image/png') {
      setError('Nur PNG-Dateien sind erlaubt.');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Die Datei darf maximal 5MB groß sein.');
      return;
    }

    try {
      setUploadingFile(true);
      setError(null);
      
      // Generate a unique file name
      const fileName = generateUniqueFileName();
      
      // Upload to Supabase Storage - Annahme: 'letterheads' Bucket existiert bereits
      const { data, error: uploadError } = await supabase.storage
        .from('letterheads')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('letterheads')
        .getPublicUrl(fileName);
        
      const publicUrl = publicUrlData.publicUrl;
      
      // Update form and preview
      setValue('letterhead_url', publicUrl);
      setPreviewUrl(publicUrl);
      
      // If default was checked, uncheck it
      if (useDefaultLetterhead) {
        setUseDefaultLetterhead(false);
        setValue('use_default_letterhead', false);
      }
      
    } catch (error: any) {
      console.error('Error uploading file:', error);
      setError(error.message || 'Failed to upload file. Please try again later.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDeleteLetterhead = async () => {
    if (!letterheadUrl) return;
    
    try {
      setUploadingFile(true);
      
      // Extract file name from URL
      const fileName = letterheadUrl.split('/').pop();
      
      if (fileName) {
        // Delete from Supabase Storage
        const { error: deleteError } = await supabase.storage
          .from('letterheads')
          .remove([fileName]);
          
        if (deleteError) throw deleteError;
      }
      
      // Clear form and preview
      setValue('letterhead_url', null);
      setPreviewUrl(null);
      
    } catch (error: any) {
      console.error('Error deleting file:', error);
      setError(error.message || 'Failed to delete file. Please try again later.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleToggleDefaultLetterhead = (checked: boolean) => {
    setUseDefaultLetterhead(checked);
    setValue('use_default_letterhead', checked);
  };

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
            directions: data.directions,
            letterhead_url: data.letterhead_url,
            use_default_letterhead: data.use_default_letterhead
          })
          .eq('id', id);

        if (locationError) throw locationError;

        // Update device associations
        await supabase
          .from('location_devices')
          .delete()
          .eq('location_id', id);

        if (data.devices && data.devices.length > 0) {
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
            directions: data.directions,
            letterhead_url: data.letterhead_url,
            use_default_letterhead: data.use_default_letterhead
          })
          .select()
          .single();

        if (locationError) throw locationError;

        // Create device associations if any devices are selected
        if (data.devices && data.devices.length > 0 && location) {
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

            {/* Briefpapier-Upload-Bereich */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Briefpapier</h3>
              
              <div className="space-y-4">
                {/* Standardbriefpapier Option */}
                <div className="flex items-center">
                  <input
                    id="default-letterhead"
                    type="checkbox"
                    checked={useDefaultLetterhead}
                    onChange={(e) => handleToggleDefaultLetterhead(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="default-letterhead" className="ml-2 block text-sm text-gray-700">
                    Standardbriefpapier verwenden
                  </label>
                </div>
                
                {/* Upload-Bereich */}
                <div className={`mt-4 ${useDefaultLetterhead ? 'opacity-50 pointer-events-none' : ''}`}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Benutzerdefiniertes Briefpapier
                  </label>
                  
                  {!previewUrl ? (
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <Image className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                            <span>Briefpapier hochladen</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              accept="image/png"
                              className="sr-only"
                              onChange={handleFileUpload}
                              disabled={uploadingFile}
                            />
                          </label>
                          <p className="pl-1">oder hierher ziehen</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG bis zu 5MB (Idealerweise 2280 x 3360 px)
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1 relative border border-gray-300 rounded-md overflow-hidden">
                      <img 
                        src={previewUrl} 
                        alt="Briefpapier Vorschau" 
                        className="w-full h-auto max-h-96 object-contain"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 hover:opacity-100">
                        <div className="flex space-x-4">
                          <button
                            type="button"
                            onClick={handleDeleteLetterhead}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            disabled={uploadingFile}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Löschen
                          </button>
                          <label
                            htmlFor="file-replace"
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Ersetzen
                            <input
                              id="file-replace"
                              type="file"
                              accept="image/png"
                              className="sr-only"
                              onChange={handleFileUpload}
                              disabled={uploadingFile}
                            />
                          </label>
                        </div>
                      </div>
                      {uploadingFile && (
                        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center">
                          <div className="text-blue-600 font-medium flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Wird bearbeitet...
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <p className="mt-2 text-sm text-gray-500">
                    Das Briefpapier wird als Hintergrund für deine PDF-Befunde verwendet.
                  </p>
                </div>
              </div>
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