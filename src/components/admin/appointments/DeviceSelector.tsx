import React from 'react';
import { Monitor } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface Location {
  id: string;
  name: string;
}

interface Device {
  id: string;
  name: string;
  type: string;
  location_devices: Array<{
    location: Location;
  }>;
}

interface DeviceSelectorProps {
  devices: Device[];
  selectedDevices: string[];
  onDeviceSelect: (deviceIds: string[]) => void;
  isLoading: boolean;
}

const DeviceSelector = ({
  devices,
  selectedDevices,
  onDeviceSelect,
  isLoading
}: DeviceSelectorProps) => {
  const toggleDevice = (deviceId: string) => {
    if (selectedDevices.includes(deviceId)) {
      onDeviceSelect(selectedDevices.filter(id => id !== deviceId));
    } else {
      onDeviceSelect([...selectedDevices, deviceId]);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  // Group devices by location
  const devicesByLocation = devices.reduce((acc, device) => {
    device.location_devices.forEach(({ location }) => {
      if (!acc[location.id]) {
        acc[location.id] = {
          location,
          devices: []
        };
      }
      acc[location.id].devices.push(device);
    });
    return acc;
  }, {} as Record<string, { location: Location; devices: Device[] }>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Geräte</h2>
        <button
          onClick={() => onDeviceSelect([])}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Zurücksetzen
        </button>
      </div>

      <div className="space-y-4">
        {Object.values(devicesByLocation).map(({ location, devices }) => (
          <div key={location.id} className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">{location.name}</h3>
            <div className="space-y-2">
              {devices.map((device) => (
                <button
                  key={device.id}
                  onClick={() => toggleDevice(device.id)}
                  className={cn(
                    'w-full flex items-center px-4 py-3 rounded-lg border-2 transition-colors',
                    selectedDevices.includes(device.id)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  )}
                >
                  <Monitor className={cn(
                    'h-5 w-5 mr-3',
                    selectedDevices.includes(device.id)
                      ? 'text-blue-500'
                      : 'text-gray-400'
                  )} />
                  <div className="text-left">
                    <div className="font-medium">{device.name}</div>
                    <div className="text-sm text-gray-500">{device.type}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeviceSelector;