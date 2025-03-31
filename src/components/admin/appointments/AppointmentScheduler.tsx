import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { format, addDays, addWeeks, subWeeks, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { de } from 'date-fns/locale';
import { Calendar as CalendarIcon, List, Grid, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import DeviceSelector from './DeviceSelector';
import CalendarView from './CalendarView';
import { cn } from '../../../lib/utils';
import MinimizedRescheduleModal from './MinimizedRescheduleModal';

type ViewMode = 'day' | 'week' | 'workweek' | 'month';

const AppointmentScheduler = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [isDeviceSidebarCollapsed, setIsDeviceSidebarCollapsed] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [appointmentToReschedule, setAppointmentToReschedule] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [selectedDeviceForReschedule, setSelectedDeviceForReschedule] = useState<string | null>(null);
  
  // Zentrale Datumssteuerung für alle Kalender
  const [currentDate, setCurrentDate] = useState(new Date());
  const [miniCalendarDate, setMiniCalendarDate] = useState(new Date());
  
  // Zentrale Zoom-Steuerung für alle Kalender
  const [zoomLevel, setZoomLevel] = useState(80);
  
  // Referenzen zu allen Scroll-Containern
  const scrollRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  const isManuallyScrolling = useRef(false);
  
  // Initialzustand setzen für Scrollen
  useEffect(() => {
    // Setze initiales Scrollen auf 7:30 Uhr
    if (Object.keys(scrollRefs.current).length > 0 && !isManuallyScrolling.current) {
      const hourHeight = zoomLevel;
      const initialPosition = 7.5 * hourHeight;
      
      isManuallyScrolling.current = true;
      
      Object.values(scrollRefs.current).forEach(ref => {
        if (ref) {
          ref.scrollTop = initialPosition;
        }
      });
      
      setTimeout(() => {
        isManuallyScrolling.current = false;
      }, 100);
    }
  }, [viewMode, zoomLevel, selectedDevices]);

  // Scroll-Synchronisierung Handler
  const handleScroll = (event: React.UIEvent<HTMLDivElement>, deviceId: string) => {
    if (isManuallyScrolling.current) return;
    
    const scrollTop = event.currentTarget.scrollTop;
    
    isManuallyScrolling.current = true;
    
    // Synchronisiere alle anderen Scroll-Container
    Object.entries(scrollRefs.current).forEach(([id, ref]) => {
      if (id !== deviceId && ref) {
        ref.scrollTop = scrollTop;
      }
    });
    
    // Reset-Flag nach kurzem Delay
    setTimeout(() => {
      isManuallyScrolling.current = false;
    }, 50);
  };

  // Registriere Scroll-Referenz
  const registerScrollRef = (deviceId: string, ref: HTMLDivElement | null) => {
    if (ref) {
      scrollRefs.current[deviceId] = ref;
    }
  };

  const { data: devices, isLoading: isLoadingDevices } = useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('devices')
        .select(`
          id,
          name,
          type,
          location_devices(
            location:locations(
              id,
              name
            )
          )
        `)
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Zentrale Navigationsfunktion für alle Kalender
  const navigateDate = (direction: 'prev' | 'next') => {
    switch (viewMode) {
      case 'day':
        setCurrentDate(date => direction === 'next' ? addDays(date, 1) : addDays(date, -1));
        break;
      case 'week':
      case 'workweek':
        setCurrentDate(date => direction === 'next' ? addWeeks(date, 1) : subWeeks(date, 1));
        break;
      case 'month':
        setCurrentDate(date => direction === 'next' ? addMonths(date, 1) : subMonths(date, 1));
        break;
    }
  };

  // Funktion zum Zurücksetzen des Datums auf heute
  const goToToday = () => {
    setCurrentDate(new Date());
    setMiniCalendarDate(new Date());
  };

  // Zoom-Funktionen
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 20, 160));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 20, 40));
  };

  const viewOptions: { value: ViewMode; label: string; icon: React.ComponentType }[] = [
    { value: 'day', label: 'Tag', icon: List },
    { value: 'workweek', label: 'Arbeitswoche', icon: Grid },
    { value: 'week', label: 'Woche', icon: Grid },
    { value: 'month', label: 'Monat', icon: CalendarIcon }
  ];

  const handleRescheduleStart = (appointment: any) => {
    setIsRescheduling(true);
    setAppointmentToReschedule(appointment);
  };

  const handleRescheduleComplete = () => {
    setIsRescheduling(false);
    setAppointmentToReschedule(null);
    setSelectedSlot(null);
    setSelectedDeviceForReschedule(null);
  };

  const handleSlotSelect = (slot: Date, deviceId: string) => {
    setSelectedSlot(slot);
    setSelectedDeviceForReschedule(deviceId);
  };

  // Mini-Kalender Rendering
  const renderMiniCalendar = () => {
    if (!miniCalendarDate) return null;
    
    const start = new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth(), 1);
    const end = new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth() + 1, 0);
    const firstWeek = startOfWeek(start, { weekStartsOn: 1 });
    const lastWeek = endOfWeek(end, { weekStartsOn: 1 });
    const days = [];
    
    for (let day = new Date(firstWeek); day <= lastWeek; day.setDate(day.getDate() + 1)) {
      days.push(new Date(day));
    }

    return (
      <div className="bg-white p-4 rounded-lg shadow-sm">
        {/* Mini Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900">
            {format(miniCalendarDate, 'MMMM yyyy', { locale: de })}
          </h3>
          <div className="flex space-x-1">
            <button
              onClick={() => setMiniCalendarDate(date => new Date(date.getFullYear(), date.getMonth() - 1, 1))}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </button>
            <button
              onClick={() => setMiniCalendarDate(date => new Date(date.getFullYear(), date.getMonth() + 1, 1))}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 mb-2">
          {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
            <div
              key={day}
              className="text-xs font-medium text-gray-500 text-center"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map(day => {
            const isToday = new Date().toDateString() === day.toDateString();
            const isSameDay = currentDate.toDateString() === day.toDateString();
            const isSameMonth = day.getMonth() === miniCalendarDate.getMonth();
            
            return (
              <button
                key={day.toString()}
                onClick={() => {
                  setCurrentDate(new Date(day));
                  setMiniCalendarDate(new Date(day));
                }}
                className={cn(
                  'text-sm p-2 text-center rounded hover:bg-gray-50 transition-colors',
                  isToday && 'bg-blue-50 text-blue-600 font-medium',
                  isSameDay && 'bg-blue-100 text-blue-700 font-medium',
                  !isSameMonth && 'text-gray-400'
                )}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen">
      {/* Device Sidebar */}
      <div 
        className={cn(
          "h-full bg-white border-r border-gray-200 transition-all duration-300 ease-in-out relative flex-shrink-0",
          isDeviceSidebarCollapsed ? "w-12" : "w-80"
        )}
      >
        {/* Collapse Button */}
        <button
          onClick={() => setIsDeviceSidebarCollapsed(!isDeviceSidebarCollapsed)}
          className={cn(
            "absolute top-4 -right-3 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 z-10",
            isDeviceSidebarCollapsed && "rotate-180"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="p-4">
          {!isDeviceSidebarCollapsed && (
            <div className="mt-4">
              <DeviceSelector
                devices={devices || []}
                selectedDevices={selectedDevices}
                onDeviceSelect={setSelectedDevices}
                isLoading={isLoadingDevices}
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-30">
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Terminkalender</h1>
            
            {/* Heute-Button */}
            <button
              onClick={goToToday}
              className="ml-4 px-3 py-1.5 bg-white text-sm font-medium text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
            >
              Heute
            </button>
            
            {/* Navigationspfeile */}
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => navigateDate('prev')}
                className="p-1.5 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              </button>
              <button
                onClick={() => navigateDate('next')}
                className="p-1.5 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
              >
                <ChevronRight className="h-4 w-4 text-gray-600" />
              </button>
              
              <div className="ml-4 font-medium">
                {viewMode === 'month' && format(currentDate, 'MMMM yyyy', { locale: de })}
                {viewMode === 'week' && `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'd.M.')} - ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'd.M.yyyy')}`}
                {viewMode === 'workweek' && `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'd.M.')} - ${format(addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), 4), 'd.M.yyyy')} (Mo-Fr)`}
                {viewMode === 'day' && format(currentDate, "EEEE, d. MMMM yyyy", { locale: de })}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Zoom-Steuerung */}
            <div className="flex items-center space-x-2 bg-white rounded-lg shadow-sm border border-gray-200 p-1">
              <button
                onClick={handleZoomOut}
                className="p-1 hover:bg-gray-100 rounded"
                title="Verkleinern"
              >
                <ZoomOut className="h-4 w-4 text-gray-600" />
              </button>
              <button
                onClick={handleZoomIn}
                className="p-1 hover:bg-gray-100 rounded"
                title="Vergrößern"
              >
                <ZoomIn className="h-4 w-4 text-gray-600" />
              </button>
            </div>
            
            {/* View Mode Selector */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1">
              <div className="flex space-x-1">
                {viewOptions.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setViewMode(value)}
                    className={cn(
                      'flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                      viewMode === value
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    )}
                  >
                    <Icon className="h-4 w-4 mr-1.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Kalenderbereich */}
        <div className="flex-1 overflow-hidden">
          <div className="flex h-full">
            {/* Calendar Grid */}
            <div className="flex-1">
              {selectedDevices.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500">
                  Bitte wählen Sie mindestens ein Gerät aus
                </div>
              ) : (
                <div className="h-full flex gap-4 p-4 bg-gray-100 overflow-auto">
                  {selectedDevices.map((deviceId) => {
                    const device = devices?.find(d => d.id === deviceId);
                    if (!device) return null;
                    
                    return (
                      <div key={device.id} className="flex-1 min-w-[600px] bg-white rounded-lg shadow overflow-hidden">
                        <CalendarView
                          viewMode={viewMode}
                          onViewModeChange={setViewMode}
                          selectedDevices={[device.id]}
                          devices={[device]}
                          isRescheduling={isRescheduling}
                          appointmentToReschedule={appointmentToReschedule}
                          onRescheduleStart={handleRescheduleStart}
                          onRescheduleComplete={handleRescheduleComplete}
                          onSlotSelect={handleSlotSelect}
                          selectedSlot={selectedSlot}
                          selectedDeviceForReschedule={selectedDeviceForReschedule}
                          currentDate={currentDate}
                          onDateChange={setCurrentDate}
                          hideNavigation={true}
                          zoomLevel={zoomLevel}
                          onScrollRef={(ref) => registerScrollRef(deviceId, ref)}
                          onScroll={(e) => handleScroll(e, deviceId)}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Minimized Reschedule Modal */}
        {isRescheduling && appointmentToReschedule && !selectedSlot && (
          <MinimizedRescheduleModal
            appointment={appointmentToReschedule}
            onMaximize={() => {
              if (selectedSlot && selectedDeviceForReschedule) {
                handleSlotSelect(selectedSlot, selectedDeviceForReschedule);
              }
            }}
            onCancel={() => {
              setIsRescheduling(false);
              setAppointmentToReschedule(null);
              setSelectedSlot(null);
              setSelectedDeviceForReschedule(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AppointmentScheduler;