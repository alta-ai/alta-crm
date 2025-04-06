import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { format, addDays, startOfWeek, eachDayOfInterval, setHours, setMinutes, addMinutes } from 'date-fns';
import { de } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface Device {
  id: string;
  name: string;
}

interface Examination {
  id: string;
  name: string;
  duration: number;
}

interface Appointment {
  id: string;
  start_time: string;
  end_time: string;
}

interface DeviceWorkingHours {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface DeviceWorkingHoursException {
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
  reason: string;
}

interface DeviceCalendarProps {
  device: Device;
  examination: Examination;
  locationId: string;
}

const WORKING_HOURS = {
  start: 8, // 8:00
  end: 18   // 18:00
};

const DeviceCalendar = ({ device, examination, locationId }: DeviceCalendarProps) => {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);

  const { data: appointments, isLoading: isLoadingAppointments } = useQuery({
    queryKey: ['appointments', device.id, weekStart],
    queryFn: async () => {
      const weekEnd = addDays(weekStart, 7);
      
      const { data, error } = await supabase
        .from('appointments')
        .select('id, start_time, end_time')
        .eq('device_id', device.id)
        .eq('location_id', locationId)
        .gte('start_time', weekStart.toISOString())
        .lt('start_time', weekEnd.toISOString())
        .order('start_time');
      
      if (error) throw error;
      return data as Appointment[];
    }
  });

  // Fetch working hours for this device
  const { data: workingHours, isLoading: isLoadingWorkingHours } = useQuery({
    queryKey: ['deviceWorkingHours', device.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('device_working_hours')
        .select('day_of_week, start_time, end_time')
        .eq('device_id', device.id)
        .order('day_of_week');
      
      if (error) throw error;
      return data as DeviceWorkingHours[];
    }
  });

  // Fetch working hours exceptions for this device
  const { data: workingHoursExceptions, isLoading: isLoadingExceptions } = useQuery({
    queryKey: ['deviceWorkingHoursExceptions', device.id, weekStart],
    queryFn: async () => {
      const weekEnd = addDays(weekStart, 7);
      
      const { data, error } = await supabase
        .from('device_working_hours_exceptions')
        .select('start_date, end_date, start_time, end_time, reason')
        .eq('device_id', device.id)
        .or(`start_date.lte.${weekEnd.toISOString()},end_date.gte.${weekStart.toISOString()}`)
        .order('start_date');
      
      if (error) throw error;
      return data as DeviceWorkingHoursException[];
    }
  });

  const days = eachDayOfInterval({
    start: weekStart,
    end: addDays(weekStart, 6)
  });

  const previousWeek = () => {
    setWeekStart(date => addDays(date, -7));
    setSelectedSlot(null);
  };

  const nextWeek = () => {
    setWeekStart(date => addDays(date, 7));
    setSelectedSlot(null);
  };

  // Function to check if a time slot is within working hours
  const isWithinWorkingHours = (date: Date): boolean => {
    if (!workingHours || workingHours.length === 0) {
      return true; // Default to true if no working hours defined
    }

    const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay(); // Convert Sunday (0) to 7 to match our schema
    const timeString = format(date, 'HH:mm:ss');
    
    // Check for exceptions first
    if (workingHoursExceptions && workingHoursExceptions.length > 0) {
      const dateString = format(date, 'yyyy-MM-dd');
      
      for (const exception of workingHoursExceptions) {
        if (dateString >= exception.start_date && dateString <= exception.end_date) {
          // If start_time and end_time are null, the device is not available all day
          if (exception.start_time === null && exception.end_time === null) {
            return false;
          }
          
          // If we have specific hours for this exception
          if (exception.start_time && exception.end_time) {
            return timeString >= exception.start_time && timeString <= exception.end_time;
          }
        }
      }
    }
    
    // Check regular working hours
    const workingHoursForDay = workingHours.find(wh => wh.day_of_week === dayOfWeek);
    if (!workingHoursForDay) {
      return false; // No working hours defined for this day
    }
    
    return timeString >= workingHoursForDay.start_time && timeString <= workingHoursForDay.end_time;
  };

  const isSlotAvailable = (slotStart: Date) => {
    if (!appointments) return true;

    const slotEnd = addMinutes(slotStart, examination.duration);
    
    // Check if slot is within working hours
    if (!isWithinWorkingHours(slotStart)) {
      return false;
    }
    
    return !appointments.some(appointment => {
      const appointmentStart = new Date(appointment.start_time);
      const appointmentEnd = new Date(appointment.end_time);
      
      // Check if there's any overlap
      return (
        (slotStart >= appointmentStart && slotStart < appointmentEnd) ||
        (slotEnd > appointmentStart && slotEnd <= appointmentEnd) ||
        (slotStart <= appointmentStart && slotEnd >= appointmentEnd)
      );
    });
  };

  const handleSlotClick = (date: Date, hour: number) => {
    const slotStart = setMinutes(setHours(date, hour), 0);
    
    if (isSlotAvailable(slotStart)) {
      setSelectedSlot(slotStart);
      // Here you would typically open a modal or navigate to a form
      // to collect patient information and confirm the appointment
      console.log('Selected slot:', slotStart);
    }
  };

  const timeSlots = [];
  for (let hour = WORKING_HOURS.start; hour < WORKING_HOURS.end; hour++) {
    timeSlots.push(hour);
  }

  if (isLoadingAppointments || isLoadingWorkingHours || isLoadingExceptions) {
    return (
      <div className="animate-pulse">
        <div className="h-96 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-medium text-gray-900">{device.name}</h3>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              {examination.duration} Minuten pro Termin
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={previousWeek}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <ChevronLeft className="h-5 w-5 text-gray-500" />
            </button>
            <button
              onClick={nextWeek}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <ChevronRight className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-full divide-y divide-gray-200">
          {/* Calendar header */}
          <div className="grid grid-cols-8 bg-gray-50">
            <div className="py-2 px-4 text-sm font-medium text-gray-500">
              Zeit
            </div>
            {days.map(day => (
              <div
                key={day.toString()}
                className="py-2 px-4 text-sm font-medium text-gray-500 text-center"
              >
                <div>{format(day, 'EEE', { locale: de })}</div>
                <div>{format(day, 'd.M.')}</div>
              </div>
            ))}
          </div>

          {/* Time slots */}
          <div className="divide-y divide-gray-200">
            {timeSlots.map(hour => (
              <div key={hour} className="grid grid-cols-8">
                <div className="py-2 px-4 text-sm text-gray-500">
                  {hour}:00
                </div>
                
                {days.map(day => {
                  const slotStart = setMinutes(setHours(day, hour), 0);
                  const available = isSlotAvailable(slotStart);
                  const isSelected = selectedSlot?.getTime() === slotStart.getTime();
                  const withinWorkingHours = isWithinWorkingHours(slotStart);

                  return (
                    <div
                      key={day.toString()}
                      onClick={() => available && handleSlotClick(day, hour)}
                      className={cn(
                        'py-2 px-4 text-sm transition-colors',
                        {
                          'bg-gray-100 cursor-not-allowed': !available || !withinWorkingHours,
                          'hover:bg-blue-50 cursor-pointer': available && withinWorkingHours && !isSelected,
                          'bg-blue-100 hover:bg-blue-200': isSelected
                        }
                      )}
                    >
                      {isSelected && (
                        <div className="text-xs text-blue-700 font-medium">
                          Ausgewählt
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceCalendar;