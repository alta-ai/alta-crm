import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface Form {
  id: string;
  name: string;
  description: string;
  form_type: string;
  order: number;
}

const ExaminationFormViewer = ({ examinationId }: { examinationId: string }) => {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const { data, error } = await supabase
          .from('examination_forms')
          .select(`
            form_id,
            order,
            form:forms(
              id,
              name,
              description,
              form_type
            )
          `)
          .eq('examination_id', examinationId)
          .order('order');

        if (error) throw error;

        const formattedForms = data.map(item => ({
          ...item.form,
          order: item.order
        }));

        setForms(formattedForms);
        setError(null);
      } catch (error: any) {
        console.error('Error fetching forms:', error);
        setError(error.message || 'Failed to load forms');
      } finally {
        setLoading(false);
      }
    };

    if (examinationId) {
      fetchForms();
    }
  }, [examinationId]);

  if (loading) {
    return <div className="text-gray-600">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  if (forms.length === 0) {
    return <div className="text-gray-600">Keine Formulare zugeordnet</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Zugeordnete Formulare</h3>
      <div className="space-y-2">
        {forms.map((form) => (
          <div key={form.id} className="bg-white p-4 rounded-lg border">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900">{form.name}</h4>
                {form.description && (
                  <p className="text-sm text-gray-500 mt-1">{form.description}</p>
                )}
              </div>
              <span className="text-sm text-gray-500">Reihenfolge: {form.order}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExaminationFormViewer;