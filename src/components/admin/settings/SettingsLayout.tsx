import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { cn } from '../../../lib/utils';

const SettingsLayout = () => {
  const location = useLocation();
  
  const navigation = [
    { name: 'Versicherungen', href: '/admin/settings/insurance' },
    { name: 'Terminstatus', href: '/admin/settings/appointment-status' },
    { name: 'Fachrichtungen', href: '/admin/settings/specialties' },
    { name: 'Untersuchungskategorien', href: '/admin/settings/examination-categories' },
    { name: 'Abrechnungskategorien', href: '/admin/settings/billing-categories' },
    { name: 'Allgemein', href: '/admin/settings/general' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Einstellungen</h1>
        <p className="mt-2 text-sm text-gray-700">
          Verwalten Sie die Systemeinstellungen und Stammdaten.
        </p>
      </div>

      <div className="flex space-x-8">
        {/* Settings Navigation */}
        <div className="w-48 flex-shrink-0">
          <nav className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "block px-3 py-2 text-sm font-medium rounded-md",
                  location.pathname === item.href
                    ? "bg-gray-50 text-blue-600"
                    : "text-gray-900 hover:bg-gray-50"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          <div className="bg-white shadow-sm rounded-lg">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;