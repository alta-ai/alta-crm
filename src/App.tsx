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
import FormViewer from './components/admin/FormViewer';
import LocationList from './components/admin/LocationList';
import LocationForm from './components/admin/LocationForm';
import PatientList from './components/admin/patients/PatientList';
import PatientForm from './components/admin/patients/PatientForm';
import PatientHistory from './components/admin/patients/PatientHistory';
import ReferringDoctorList from './components/admin/referring-doctors/ReferringDoctorList';
import ReferringDoctorForm from './components/admin/referring-doctors/ReferringDoctorForm';
import ReferringDoctorHistory from './components/admin/referring-doctors/ReferringDoctorHistory';
import AppointmentScheduler from './components/admin/appointments/AppointmentScheduler';
import EmailTemplateList from './components/admin/emails/EmailTemplateList';
import EmailTemplateForm from './components/admin/emails/EmailTemplateForm';
import SettingsLayout from './components/admin/settings/SettingsLayout';
import InsuranceSettings from './components/admin/settings/InsuranceSettings';
import AppointmentStatusSettings from './components/admin/settings/AppointmentStatusSettings';
import SpecialtySettings from './components/admin/settings/SpecialtySettings';
import ExaminationCategorySettings from './components/admin/settings/ExaminationCategorySettings';
import BillingCategories from './components/admin/settings/BillingCategories';
import StatisticsOverview from './components/admin/statistics/StatisticsOverview';
import TodoDashboard from './components/admin/todos/TodoDashboard';
import BillingList from './components/admin/BillingList';
import BillingForm from './components/admin/BillingForm';
import BillingFormList from './components/admin/billing/BillingFormList';
import BillingFormEditor from './components/admin/billing/BillingFormEditor';

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
          <Route path="patients" element={<PatientList />} />
          <Route path="patients/new" element={<PatientForm />} />
          <Route path="patients/:id" element={<PatientForm />} />
          <Route path="patients/:id/history" element={<PatientHistory />}/>
          <Route path="referring-doctors" element={<ReferringDoctorList />} />
          <Route path="referring-doctors/new" element={<ReferringDoctorForm />} />
          <Route path="referring-doctors/:id" element={<ReferringDoctorForm />} />
          <Route path="referring-doctors/:id/history" element={<ReferringDoctorHistory />} />
          <Route path="devices" element={<DeviceList />} />
          <Route path="devices/new" element={<DeviceForm />} />
          <Route path="devices/:id" element={<DeviceForm />} />
          <Route path="forms" element={<FormList />} />
          <Route path="forms/new" element={<FormEditor />} />
          <Route path="forms/:id" element={<FormEditor />} />
          <Route path="forms/view/:id" element={<FormViewer />} />
          <Route path="locations" element={<LocationList />} />
          <Route path="locations/new" element={<LocationForm />} />
          <Route path="locations/:id" element={<LocationForm />} />
          <Route path="billing" element={<BillingList />} />
          <Route path="billing/new" element={<BillingForm />} />
          <Route path="billing/:id" element={<BillingForm />} />
          <Route path="billing/forms" element={<BillingFormList />} />
          <Route path="billing/forms/new" element={<BillingFormEditor />} />
          <Route path="billing/forms/:id" element={<BillingFormEditor />} />
          <Route path="appointments" element={<AppointmentScheduler />} />
          <Route path="statistics" element={<StatisticsOverview />} />
          <Route path="emails" element={<EmailTemplateList />} />
          <Route path="emails/new" element={<EmailTemplateForm />} />
          <Route path="emails/:id" element={<EmailTemplateForm />} />
          <Route path="todos" element={<TodoDashboard />} />
          <Route path="settings" element={<SettingsLayout />}>
            <Route index element={<InsuranceSettings />} />
            <Route path="insurance" element={<InsuranceSettings />} />
            <Route path="appointment-status" element={<AppointmentStatusSettings />} />
            <Route path="specialties" element={<SpecialtySettings />} />
            <Route path="examination-categories" element={<ExaminationCategorySettings />} />
            <Route path="billing-categories" element={<BillingCategories />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;