import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';

interface ExaminationSelectorProps {
  selectedExamination: string | null;
  onExaminationSelect: (examinationId: string) => void;
  isLoading: boolean;
}

const ExaminationSelector = ({
  selectedExamination,
  onExaminationSelect,
  isLoading
}: ExaminationSelectorProps) => {
  const { data: examinations } = useQuery({
    queryKey: ['examinations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('examinations')
        .select('id, name, category')
        .order('category, name');
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading || !examinations) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }

  // Group examinations by category
  const groupedExaminations = examinations.reduce((acc, examination) => {
    if (!acc[examination.category]) {
      acc[examination.category] = [];
    }
    acc[examination.category].push(examination);
    return acc;
  }, {} as Record<string, typeof examinations>);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Untersuchung auswählen
      </label>
      <div className="grid grid-cols-1 gap-6">
        {Object.entries(groupedExaminations).map(([category, exams]) => (
          <div key={category} className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">{category}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {exams.map((examination) => (
                <button
                  key={examination.id}
                  onClick={() => onExaminationSelect(examination.id)}
                  className={`
                    px-4 py-3 rounded-lg border-2 text-left transition-colors
                    ${selectedExamination === examination.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }
                  `}
                >
                  {examination.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExaminationSelector;