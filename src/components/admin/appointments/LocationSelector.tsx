import React from 'react';
import { MapPin } from 'lucide-react';

interface Location {
  id: string;
  name: string;
}

interface LocationSelectorProps {
  locations: Location[];
  selectedLocation: string | null;
  onLocationSelect: (locationId: string) => void;
  isLoading: boolean;
}

const LocationSelector = ({
  locations,
  selectedLocation,
  onLocationSelect,
  isLoading
}: LocationSelectorProps) => {
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Standort auswählen
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map((location) => (
          <button
            key={location.id}
            onClick={() => onLocationSelect(location.id)}
            className={`
              flex items-center px-4 py-3 rounded-lg border-2 transition-colors
              ${selectedLocation === location.id
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }
            `}
          >
            <MapPin className={`h-5 w-5 mr-2 ${
              selectedLocation === location.id ? 'text-blue-500' : 'text-gray-400'
            }`} />
            {location.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LocationSelector;