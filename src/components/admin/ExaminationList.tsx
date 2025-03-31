import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ExaminationFormViewer from './ExaminationFormViewer';

interface Examination {
  id: string;
  name: string;
  description: string;
  self_payer_without_contrast: number;
  self_payer_with_contrast: number;
  private_patient_without_contrast: number;
  private_patient_with_contrast: number;
  foreign_patient_without_contrast: number;
  foreign_patient_with_contrast: number;
  duration: number;
  device: {
    name: string;
  };
}

const ExaminationList = () => {
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExamination, setSelectedExamination] = useState<string | null>(null);

  useEffect(() => {
    fetchExaminations();
  }, []);

  const fetchExaminations = async () => {
    try {
      const { data, error } = await supabase
        .from('examinations')
        .select(`
          id,
          name,
          description,
          self_payer_without_contrast,
          self_payer_with_contrast,
          private_patient_without_contrast,
          private_patient_with_contrast,
          foreign_patient_without_contrast,
          foreign_patient_with_contrast,
          duration,
          device:devices(name)
        `)
        .order('name');

      if (error) throw error;
      setExaminations(data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching examinations:', error);
      setError('Failed to load examinations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Untersuchungen</h1>
          <p className="mt-2 text-sm text-gray-700">
            Liste aller verfügbaren Untersuchungen und deren Details.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            to="/admin/examinations/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Neue Untersuchung
          </Link>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Gerät
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Dauer
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Selbstzahler ohne KM
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Selbstzahler mit KM
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Aktionen</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {examinations.map((examination) => (
                    <React.Fragment key={examination.id}>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          <button
                            onClick={() => setSelectedExamination(
                              selectedExamination === examination.id ? null : examination.id
                            )}
                            className="text-left hover:text-blue-600 focus:outline-none"
                          >
                            {examination.name}
                          </button>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {examination.device?.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {examination.duration} Minuten
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(examination.self_payer_without_contrast)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(examination.self_payer_with_contrast)}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <Link
                            to={`/admin/examinations/${examination.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Bearbeiten</span>
                          </Link>
                        </td>
                      </tr>
                      {selectedExamination === examination.id && (
                        <tr>
                          <td colSpan={6} className="px-4 py-4 sm:px-6">
                            <ExaminationFormViewer examinationId={examination.id} />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExaminationList;