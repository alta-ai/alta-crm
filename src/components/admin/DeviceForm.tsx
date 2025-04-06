import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import { AlertCircle, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface DeviceFormData {
  name: string;
  type: string;
}

interface WorkingHours {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface WorkingHoursException {
  id?: string;
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
  reason: string;
}

const DAYS_OF_WEEK = [
  { value: 1, label: 'Montag' },
  { value: 2, label: 'Dienstag' },
  { value: 3, label: 'Mittwoch' },
  { value: 4, label: 'Donnerstag' },
  { value: 5, label: 'Freitag' },
  { value: 6, label: 'Samstag' },
  { value: 7, label: 'Sonntag' }
];

const DeviceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
  const [exceptions, setExceptions] = useState<WorkingHoursException[]>([]);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<DeviceFormData>();

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        setLoading(true);
        try {
          // Fetch device data
          const { data: device, error: deviceError } = await supabase
            .from('devices')
            .select('*')
            .eq('id', id)
            .single();

          if (deviceError) throw deviceError;
          if (device) {
            reset(device);
          }

          // Fetch working hours
          const { data: hours, error: hoursError } = await supabase
            .from('device_working_hours')
            .select('*')
            .eq('device_id', id)
            .order('day_of_week');

          if (hoursError) throw hoursError;
          setWorkingHours(hours || []);

          // Fetch exceptions
          const { data: exceptionData, error: exceptionsError } = await supabase
            .from('device_working_hours_exceptions')
            .select('*')
            .eq('device_id', id)
            .order('start_date');

          if (exceptionsError) throw exceptionsError;
          setExceptions(exceptionData || []);

        } catch (error) {
          console.error('Error fetching device:', error);
          setError('Failed to load device data. Please try again later.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [id, reset]);

  const onSubmit = async (data: DeviceFormData) => {
    setError(null);
    setLoading(true);
    try {
      if (id) {
        // Update existing device
        const { error: deviceError } = await supabase
          .from('devices')
          .update(data)
          .eq('id', id);

        if (deviceError) throw deviceError;

        // Update working hours
        await supabase
          .from('device_working_hours')
          .delete()
          .eq('device_id', id);

        if (workingHours.length > 0) {
          const { error: hoursError } = await supabase
            .from('device_working_hours')
            .insert(workingHours.map(hours => ({
              ...hours,
              device_id: id
            })));

          if (hoursError) throw hoursError;
        }

        // Update exceptions
        await supabase
          .from('device_working_hours_exceptions')
          .delete()
          .eq('device_id', id);

        if (exceptions.length > 0) {
          const { error: exceptionsError } = await supabase
            .from('device_working_hours_exceptions')
            .insert(exceptions.map(exception => ({
              ...exception,
              device_id: id
            })));

          if (exceptionsError) throw exceptionsError;
        }
      } else {
        // Create new device
        const { data: device, error: deviceError } = await supabase
          .from('devices')
          .insert([data])
          .select()
          .single();

        if (deviceError) throw deviceError;

        // Create working hours
        if (workingHours.length > 0 && device) {
          const { error: hoursError } = await supabase
            .from('device_working_hours')
            .insert(workingHours.map(hours => ({
              ...hours,
              device_id: device.id
            })));

          if (hoursError) throw hoursError;
        }

        // Create exceptions
        if (exceptions.length > 0 && device) {
          const { error: exceptionsError } = await supabase
            .from('device_working_hours_exceptions')
            .insert(exceptions.map(exception => ({
              ...exception,
              device_id: device.id
            })));

          if (exceptionsError) throw exceptionsError;
        }
      }

      navigate('/admin/devices');
    } catch (error: any) {
      console.error('Error saving device:', error);
      setError(error.message || 'Failed to save device. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const addWorkingHours = (dayOfWeek: number) => {
    setWorkingHours([
      ...workingHours,
      {
        id: crypto.randomUUID(), // Generate UUID for new working hours
        day_of_week: dayOfWeek,
        start_time: '08:00',
        end_time: '18:00'
      }
    ]);
  };

  const updateWorkingHours = (index: number, field: keyof WorkingHours, value: string | number) => {
    const updatedHours = [...workingHours];
    updatedHours[index] = {
      ...updatedHours[index],
      [field]: value
    };
    setWorkingHours(updatedHours);
  };

  const removeWorkingHours = (index: number) => {
    setWorkingHours(workingHours.filter((_, i) => i !== index));
  };

  const addException = () => {
    const today = new Date();
    setExceptions([
      ...exceptions,
      {
        id: crypto.randomUUID(), // Generate UUID for new exception
        start_date: format(today, 'yyyy-MM-dd'),
        end_date: format(today, 'yyyy-MM-dd'),
        start_time: null,
        end_time: null,
        reason: ''
      }
    ]);
  };

  const updateException = (index: number, field: keyof WorkingHoursException, value: string | null) => {
    const updatedExceptions = [...exceptions];
    updatedExceptions[index] = {
      ...updatedExceptions[index],
      [field]: value
    };
    setExceptions(updatedExceptions);
  };

  const removeException = (index: number) => {
    setExceptions(exceptions.filter((_, i) => i !== index));
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
        {id ? 'Gerät bearbeiten' : 'Neues Gerät'}
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
        {/* Basic Device Information */}
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
                Typ *
              </label>
              <select
                {...register('type', { required: 'Typ ist erforderlich' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              >
                <option value="">Bitte wählen</option>
                <option value="MRT">MRT</option>
                <option value="CT">CT</option>
                <option value="Röntgen">Röntgen</option>
                <option value="Ultraschall">Ultraschall</option>
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Working Hours */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Arbeitszeiten</h2>
          
          <div className="space-y-6">
            {/* Regular Working Hours */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-700">Reguläre Arbeitszeiten</h3>
                <div className="flex items-center space-x-2">
                  <select
                    className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    onChange={(e) => addWorkingHours(parseInt(e.target.value))}
                    value=""
                  >
                    <option value="">Tag hinzufügen...</option>
                    {DAYS_OF_WEEK.filter(
                      day => !workingHours.some(wh => wh.day_of_week === day.value)
                    ).map(day => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {workingHours
                  .sort((a, b) => a.day_of_week - b.day_of_week)
                  .map((hours, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-32">
                        <span className="text-sm font-medium text-gray-900">
                          {DAYS_OF_WEEK.find(day => day.value === hours.day_of_week)?.label}
                        </span>
                      </div>
                      <input
                        type="time"
                        value={hours.start_time}
                        onChange={(e) => updateWorkingHours(index, 'start_time', e.target.value)}
                        className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                      />
                      <span className="text-gray-500">bis</span>
                      <input
                        type="time"
                        value={hours.end_time}
                        onChange={(e) => updateWorkingHours(index, 'end_time', e.target.value)}
                        className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeWorkingHours(index)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            {/* Exceptions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-700">Ausnahmen</h3>
                <button
                  type="button"
                  onClick={addException}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Ausnahme hinzufügen
                </button>
              </div>

              <div className="space-y-4">
                {exceptions.map((exception, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Von *
                        </label>
                        <input
                          type="date"
                          value={exception.start_date}
                          onChange={(e) => updateException(index, 'start_date', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Bis *
                        </label>
                        <input
                          type="date"
                          value={exception.end_date}
                          onChange={(e) => updateException(index, 'end_date', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Startzeit (optional)
                        </label>
                        <input
                          type="time"
                          value={exception.start_time || ''}
                          onChange={(e) => updateException(index, 'start_time', e.target.value || null)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Endzeit (optional)
                        </label>
                        <input
                          type="time"
                          value={exception.end_time || ''}
                          onChange={(e) => updateException(index, 'end_time', e.target.value || null)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Grund *
                      </label>
                      <input
                        type="text"
                        value={exception.reason}
                        onChange={(e) => updateException(index, 'reason', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                        placeholder="z.B. Wartung, Feiertag"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeException(index)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Entfernen
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/admin/devices')}
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

export default DeviceForm;