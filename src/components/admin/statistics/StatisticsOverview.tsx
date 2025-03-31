import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { de } from 'date-fns/locale';
import { BarChart, ChevronLeft, ChevronRight, Euro } from 'lucide-react';

const StatisticsOverview = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const { data: stats, isLoading } = useQuery({
    queryKey: ['statistics', selectedMonth],
    queryFn: async () => {
      const startDate = startOfMonth(selectedMonth);
      const endDate = endOfMonth(selectedMonth);

      // Get appointments with examination details
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          id,
          patient_id,
          examination_id,
          billing_type,
          patient_data,
          device:devices(id, name),
          patient:patients(id, created_at),
          examination:examinations(
            id,
            name,
            category,
            self_payer_without_contrast,
            self_payer_with_contrast,
            private_patient_without_contrast,
            private_patient_with_contrast,
            foreign_patient_without_contrast,
            foreign_patient_with_contrast
          )
        `)
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString());

      if (appointmentsError) throw appointmentsError;

      // Calculate statistics
      const totalAppointments = appointments?.length || 0;
      
      // Count unique patients
      const uniquePatients = new Set(appointments?.map(a => a.patient_id));
      const totalPatients = uniquePatients.size;

      // Count new patients (created in this month)
      const newPatients = appointments?.filter(a => {
        const patientCreatedAt = new Date(a.patient.created_at);
        return patientCreatedAt >= startDate && patientCreatedAt <= endDate;
      }).length || 0;

      // Count appointments by billing type
      const billingTypes = appointments?.reduce((acc: Record<string, number>, curr) => {
        acc[curr.billing_type] = (acc[curr.billing_type] || 0) + 1;
        return acc;
      }, {}) || {};

      // Count appointments by device
      const deviceStats = appointments?.reduce((acc: Record<string, number>, curr) => {
        const deviceName = curr.device?.name || 'Unbekannt';
        acc[deviceName] = (acc[deviceName] || 0) + 1;
        return acc;
      }, {}) || {};

      // Count appointments by examination category
      const examinationStats = appointments?.reduce((acc: Record<string, number>, curr) => {
        const category = curr.examination?.category || 'Unbekannt';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {}) || {};

      // Count appointments by examination name
      const examinationNameStats = appointments?.reduce((acc: Record<string, number>, curr) => {
        const name = curr.examination?.name || 'Unbekannt';
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {}) || {};

      // Calculate revenue
      const revenue = appointments?.reduce((total, appointment) => {
        const examination = appointment.examination;
        const withContrast = appointment.patient_data?.with_contrast_medium || false;
        
        if (!examination) return total;

        let price = 0;
        switch (appointment.billing_type) {
          case 'self_payer':
            price = withContrast ? 
              examination.self_payer_with_contrast : 
              examination.self_payer_without_contrast;
            break;
          case 'private_patient':
            price = withContrast ? 
              examination.private_patient_with_contrast : 
              examination.private_patient_without_contrast;
            break;
          case 'foreign_patient':
            price = withContrast ? 
              examination.foreign_patient_with_contrast : 
              examination.foreign_patient_without_contrast;
            break;
          // Work accidents are handled differently, not included in revenue calculation
        }

        return total + (price || 0);
      }, 0) || 0;

      return {
        totalAppointments,
        totalPatients,
        newPatients,
        billingTypes,
        deviceStats,
        examinationStats,
        examinationNameStats,
        revenue
      };
    }
  });

  const navigateMonth = (direction: 'prev' | 'next') => {
    setSelectedMonth(current => {
      if (direction === 'prev') {
        return subMonths(current, 1);
      } else {
        return subMonths(current, -1);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Statistiken</h1>
          <p className="mt-2 text-sm text-gray-700">
            Übersicht über Untersuchungen, Patienten und Geräteauslastung.
          </p>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="mt-6 bg-white shadow-sm rounded-lg p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-medium text-gray-900">
            {format(selectedMonth, 'MMMM yyyy', { locale: de })}
          </h2>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Appointments */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-md bg-blue-500 bg-opacity-10">
              <BarChart className="h-6 w-6 text-blue-500" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">
                Untersuchungen gesamt
              </h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {stats?.totalAppointments || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-md bg-green-500 bg-opacity-10">
              <Euro className="h-6 w-6 text-green-500" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">
                Umsatz
              </h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {new Intl.NumberFormat('de-DE', { 
                  style: 'currency', 
                  currency: 'EUR' 
                }).format(stats?.revenue || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Patient Statistics */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-900">Patienten</h3>
          <dl className="mt-4 space-y-4">
            <div>
              <dt className="text-sm text-gray-500">Gesamt</dt>
              <dd className="text-xl font-semibold text-gray-900">
                {stats?.totalPatients || 0}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Neue Patienten</dt>
              <dd className="text-xl font-semibold text-green-600">
                {stats?.newPatients || 0}
              </dd>
            </div>
          </dl>
        </div>

        {/* Billing Types */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-900">Abrechnungsarten</h3>
          <dl className="mt-4 space-y-4">
            <div>
              <dt className="text-sm text-gray-500">Selbstzahler</dt>
              <dd className="text-xl font-semibold text-gray-900">
                {stats?.billingTypes?.self_payer || 0}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Privatpatienten</dt>
              <dd className="text-xl font-semibold text-gray-900">
                {stats?.billingTypes?.private_patient || 0}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Ausländische Patienten</dt>
              <dd className="text-xl font-semibold text-gray-900">
                {stats?.billingTypes?.foreign_patient || 0}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Arbeitsunfälle</dt>
              <dd className="text-xl font-semibold text-gray-900">
                {stats?.billingTypes?.work_accident || 0}
              </dd>
            </div>
          </dl>
        </div>

        {/* Examination Categories */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-900">Untersuchungskategorien</h3>
          <dl className="mt-4 space-y-4">
            {Object.entries(stats?.examinationStats || {}).map(([category, count]) => (
              <div key={category}>
                <dt className="text-sm text-gray-500">{category}</dt>
                <dd className="text-xl font-semibold text-gray-900">{count}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Examination Names */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-900">Untersuchungen im Detail</h3>
          <dl className="mt-4 space-y-4">
            {Object.entries(stats?.examinationNameStats || {})
              .sort(([, a], [, b]) => b - a) // Sort by count descending
              .map(([name, count]) => (
                <div key={name}>
                  <dt className="text-sm text-gray-500">{name}</dt>
                  <dd className="text-xl font-semibold text-gray-900">{count}</dd>
                </div>
              ))}
          </dl>
        </div>

        {/* Device Statistics */}
        <div className="bg-white shadow-sm rounded-lg p-6 sm:col-span-2 lg:col-span-3">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Untersuchungen pro Gerät</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(stats?.deviceStats || {}).map(([device, count]) => (
              <div key={device} className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900">{device}</h4>
                <p className="mt-2 text-2xl font-semibold text-gray-900">{count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsOverview;