import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { FileText, Monitor, FormInput, MapPin, Calendar, Settings, Mail, ChevronLeft, ChevronRight, Users, BarChart, ClipboardList, UserPlus, Receipt } from 'lucide-react';
import { cn } from '../../lib/utils';

const AdminLayout = () => {
  const location = useLocation();
  const [isMainSidebarCollapsed, setIsMainSidebarCollapsed] = useState(false);

  const navigation = [
    { name: 'Untersuchungen', href: '/admin', icon: FileText },
    { name: 'Patienten', href: '/admin/patients', icon: Users },
    { name: 'Überweiser', href: '/admin/referring-doctors', icon: UserPlus },
    { name: 'To-Dos', href: '/admin/todos', icon: ClipboardList },
    { name: 'Geräte', href: '/admin/devices', icon: Monitor },
    { name: 'Formulare', href: '/admin/forms', icon: FormInput },
    { name: 'Abrechnung', href: '/admin/billing', icon: Receipt },
    { name: 'Standorte', href: '/admin/locations', icon: MapPin },
    { name: 'Termine', href: '/admin/appointments', icon: Calendar },
    { name: 'Statistiken', href: '/admin/statistics', icon: BarChart },
    { name: 'E-Mails', href: '/admin/emails', icon: Mail },
    { name: 'Einstellungen', href: '/admin/settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const isAppointmentsPage = location.pathname === '/admin/appointments';

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Main Sidebar */}
      <div 
        className={cn(
          "flex flex-col fixed inset-y-0 z-50 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
          isMainSidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex-1 flex flex-col pt-5 pb-4">
          <div className="flex items-center justify-between px-4">
            {!isMainSidebarCollapsed && (
              <h1 className="text-xl font-bold">ALTA Admin</h1>
            )}
            <button
              onClick={() => setIsMainSidebarCollapsed(!isMainSidebarCollapsed)}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
            >
              {isMainSidebarCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </button>
          </div>
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                    active
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  title={isMainSidebarCollapsed ? item.name : undefined}
                >
                  <Icon
                    className={cn(
                      "flex-shrink-0 h-6 w-6",
                      active ? "text-gray-500" : "text-gray-400 group-hover:text-gray-500"
                    )}
                  />
                  {!isMainSidebarCollapsed && (
                    <span className="ml-3">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div 
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          isMainSidebarCollapsed ? "ml-16" : "ml-64"
        )}
      >
        <main className={cn(
          "h-screen overflow-auto",
          isAppointmentsPage ? "" : "max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6"
        )}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;