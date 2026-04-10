import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home, LayoutDashboard, FilePlus2, ListFilter, Users, CalendarDays, BarChartBig } from 'lucide-react';

const SalesModuleLayout = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const isUUID = (str) => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
  };

  const getBreadcrumbLabel = (path) => {
    if (isUUID(path)) {
      return 'Details';
    }
    const labels = {
      'sales': 'Sales Module',
      'dashboard': 'Dashboard',
      'data-entry': 'Data Entry',
      'projects': 'Project Lists',
      'calendar': 'Calendar',
      'reports': 'Reports',
      'companies': 'Customers',
      'full-preview': 'Full Preview'
    };
    return labels[path] || path;
  };

  const navLinks = [
    { name: 'Dashboard', path: '/sales/dashboard', icon: LayoutDashboard },
    { name: 'Data Entry', path: '/sales/data-entry', icon: FilePlus2 },
    { name: 'Projects', path: '/sales/projects', icon: ListFilter },
    { name: 'Customers', path: '/sales/companies', icon: Users },
    { name: 'Calendar', path: '/sales/calendar', icon: CalendarDays },
    { name: 'Reports', path: '/sales/reports', icon: BarChartBig },
  ];

  return (
    <div className="flex flex-col h-full w-full">
      {/* Sub-navigation bar for Sales Module */}
      <div className="print:hidden bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        {/* Breadcrumbs */}
        <div className="px-4 sm:px-6 lg:px-8 py-2 border-b border-gray-100 bg-gray-50/50">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <div>
                  <Link to="/" className="text-gray-400 hover:text-primary transition-colors">
                    <Home className="flex-shrink-0 h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">Home</span>
                  </Link>
                </div>
              </li>
              {pathnames.map((value, index) => {
                const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
                const isLast = index === pathnames.length - 1;
                return (
                  <li key={value}>
                    <div className="flex items-center">
                      <ChevronRight className="flex-shrink-0 h-4 w-4 text-gray-400" aria-hidden="true" />
                      <Link
                        to={routeTo}
                        className={`ml-2 text-xs font-medium uppercase tracking-wider ${isLast ? 'text-primary' : 'text-gray-500 hover:text-gray-900 transition-colors'}`}
                        aria-current={isLast ? 'page' : undefined}
                      >
                        {getBreadcrumbLabel(value)}
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>
        
        {/* Module Local Navigation */}
        <div className="px-4 sm:px-6 lg:px-8 py-3 overflow-x-auto no-scrollbar">
          <div className="flex space-x-1 min-w-max">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-semibold transition-all ${
                    isActive 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-[1600px] mx-auto print:max-w-none print:w-full mt-6">
        <Outlet />
      </div>
    </div>
  );
};

export default SalesModuleLayout;