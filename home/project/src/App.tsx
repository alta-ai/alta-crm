import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import RegistrationForm from './components/RegistrationForm';
import CostReimbursementForm from './components/CostReimbursementForm';
import PrivacyForm from './components/PrivacyForm';
import AdminLayout from './components/admin/AdminLayout';
import ExaminationList from './components/admin/ExaminationList';
import ExaminationForm from './components/admin/ExaminationForm';
import DeviceList from './components/admin/DeviceList';
import DeviceForm from './components/admin/DeviceForm';
import FormList from './components/admin/FormList';
import FormEditor from './components/admin/FormEditor';
import LocationList from './components/admin/LocationList';
import LocationForm from './components/admin/LocationForm';
import TodoDashboard from './components/admin/todos/TodoDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Patient Routes */}
        <Route path="/" element={
          <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                  <div className="flex">
                    <div className="flex-shrink-0 flex items-center">
                      <h1 className="text-xl font-bold">ALTA Klinik</h1>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Link
                      to="/admin"
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none transition"
                    >
                      <Settings className="h-5 w-5 mr-1" />
                      Admin
                    </Link>
                  </div>
                </div>
              </div>
            </nav>
            
            <main className="py-12">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <RegistrationForm onComplete={() => {}} />
              </div>
            </main>
          </div>
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<ExaminationList />} />
          <Route path="examinations/new" element={<ExaminationForm />} />
          <Route path="examinations/:id" element={<ExaminationForm />} />
          <Route path="devices" element={<DeviceList />} />
          <Route path="devices/new" element={<DeviceForm />} />
          <Route path="devices/:id" element={<DeviceForm />} />
          <Route path="forms" element={<FormList />} />
          <Route path="forms/new" element={<FormEditor />} />
          <Route path="forms/:id" element={<FormEditor />} />
          <Route path="locations" element={<LocationList />} />
          <Route path="locations/new" element={<LocationForm />} />
          <Route path="locations/:id" element={<LocationForm />} />
          <Route path="/admin/todos" element={<TodoDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}