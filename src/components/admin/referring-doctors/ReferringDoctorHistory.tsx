import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { ArrowLeft, AlertCircle } from 'lucide-react';

interface ReferringDoctor {
  id: string;
  title: string | null;
  first_name: string;
  last_name: string;
  specialty: {
    name: string;
  };
}

interface Appointment {
  id: string;
  start_time: string;
  patient: {
    id: string;
    first_name: string;
    last_name: string;
  };
  examination: {
    name: string;
  };
  status: string;
}

const ReferringDoctorHistory = () => {
  const { id } = useParams();

  // Lade Arztdaten
  const { data: doctor, isLoading: isLoadingDoctor } = useQuery({
    queryKey: ['referringDoctor', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('referring_doctors')
        .select(`
          *,
          specialty:medical_specialties(name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as ReferringDoctor;
    }
  });

  // Lade zugehörige Termine
  const { data: appointments, isLoading: isLoadingAppointments } = useQuery({
    queryKey: ['referringDoctorAppointments', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointment_referring_doctors')
        .select(`
          appointment:appointments!inner(
            id,
            start_time,
            status,
            patient:patients(
              id,
              first_name,
              last_name
            ),
            examination:examinations(
              name
            )
          )
        `)
        .eq('referring_doctor_id', id)
        .order('appointment(start_time)', { ascending: false });

      if (error) throw error;
      return data.map(item => item.appointment) as Appointment[];
    },
    enabled: !!id
  });

  // Lade Statistiken
  const { data: stats } = useQuery({
    queryKey: ['referringDoctorStats', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointment_referring_doctors')
        .select(`
          appointment:appointments!inner(
            examination:examinations(
              name,
              category
            )
          )
        `)
        .eq('referring_doctor_id', id);

      if (error) throw error;

      // Zähle Untersuchungen nach Kategorie
      const examsByCategory = data.reduce((acc: Record<string, number>, curr) => {
        const category = curr.appointment.examination.category;
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      return {
        totalAppointments: data.length,
        examsByCategory
      };
    },
    enabled: !!id
  });

  if (isLoadingDoctor || isLoadingAppointments) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <p className="text-sm text-red-700">Überweiser nicht gefunden</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">
            Überweiser Historie
          </h1>
          <Link
            to="/admin/referring-doctors"
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zur Übersicht
          </Link>
        </div>
      </div>

      {/* Arztdetails */}
      <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Überweiser</h3>
            <p className="mt-1 text-sm text-gray-900">
              {doctor.title && (
                <span className="text-gray-500">{doctor.title} </span>
              )}
              {doctor.first_name} {doctor.last_name}
            </p>
            <p className="text-sm text-gray-500">
              {doctor.specialty.name}
            </p>
          </div>
        </div>
      </div>

      {/* Statistiken */}
      {stats && (
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Statistiken</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Überweisungen gesamt</h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {stats.totalAppointments}
              </p>
            </div>
            
            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Nach Kategorie</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(stats.examsByCategory).map(([category, count]) => (
                  <div key={category} className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm font-medium text-gray-900">{category}</div>
                    <div className="text-2xl font-semibold text-gray-900">{count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Terminliste */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Überweisungen
          </h2>
        </div>

        {appointments && appointments.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-medium text-gray-900">
                      {appointment.examination.name}
                    </h3>
                    <div className="mt-1 text-sm text-gray-500">
                      <p>
                        {format(parseISO(appointment.start_time), "EEEE, d. MMMM yyyy 'um' HH:mm 'Uhr'", { locale: de })}
                      </p>
                      <p className="mt-1">
                        Patient: {appointment.patient.first_name} {appointment.patient.last_name}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/admin/patients/${appointment.patient.id}/history`}
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                  >
                    Patientenakte
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            Keine Überweisungen gefunden
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferringDoctorHistory;