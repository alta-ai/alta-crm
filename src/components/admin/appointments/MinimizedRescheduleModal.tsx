import React from 'react';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { Maximize2, X } from 'lucide-react';

interface MinimizedRescheduleModalProps {
  appointment: {
    start_time: string;
    examination: {
      name: string;
    };
    patient: {
      first_name: string;
      last_name: string;
    };
  };
  onMaximize: () => void;
  onCancel: () => void;
}

const MinimizedRescheduleModal = ({
  appointment,
  onMaximize,
  onCancel
}: MinimizedRescheduleModalProps) => {
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-96">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-900">Termin verschieben</h3>
        <div className="flex space-x-2">
          <button
            onClick={onMaximize}
            className="text-gray-400 hover:text-gray-500"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="text-sm text-gray-500">
        <p>
          {appointment.patient.first_name} {appointment.patient.last_name}
        </p>
        <p>{appointment.examination.name}</p>
        <p>
          Aktueller Termin: {format(parseISO(appointment.start_time), "dd.MM.yyyy HH:mm", { locale: de })}
        </p>
      </div>
      <p className="mt-2 text-xs text-blue-600">
        Klicken Sie auf einen freien Termin im Kalender
      </p>
    </div>
  );
};

export default MinimizedRescheduleModal;