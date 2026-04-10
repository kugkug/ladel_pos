import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileEdit, List, Users, Calendar, BarChart3, Menu, X, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ModuleSwitcher from './ModuleSwitcher';
import UserProfileDropdown from './UserProfileDropdown';

const Navigation = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  const isExpenses = location.pathname.startsWith('/expenses');

  const SALES_LINKS = [
    { name: 'Dashboard', path: '/sales/dashboard', icon: LayoutDashboard },
    { name: 'Data Entry', path: '/sales/data-entry', icon: FileEdit },
    { name: 'Project Lists', path: '/sales/projects', icon: List },
    { name: 'Customer Lists', path: '/sales/companies', icon: Users },
    { name: 'Calendar', path: '/sales/calendar', icon: Calendar },
    { name: 'Reports', path: '/sales/reports', icon: BarChart3 },
    { name: 'Trash Bin', path: '/sales/trash-bin', icon: Trash2 },
  ];

  const EXPENSES_LINKS = [
    { name: 'Dashboard', path: '/expenses', icon: LayoutDashboard },
    { name: 'Data Entry', path: '/expenses/data-entry', icon: FileEdit },
    { name: 'Expenses List', path: '/expenses/expenses-list', icon: List },
    { name: 'Suppliers', path: '/expenses/suppliers', icon: Users },
    { name: 'Calendar', path: '/expenses/calendar', icon: Calendar },
    { name: 'Reports', path: '/expenses/reports', icon: BarChart3 },
  ];

  const links = isExpenses ? EXPENSES_LINKS : SALES_LINKS;

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Desktop Top Header */}
      <div className="hidden lg:flex fixed top-0 right-0 left-72 h-[70px] bg-white/80 backdrop-blur-md border-b border-gray-200 z-40 items-center justify-end px-8 shadow-sm transition-all duration-300">
        <UserProfileDropdown />
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-[60px] bg-[#1B4D5C] text-white flex items-center justify-between px-4 z-50 shadow-md">
        <div className="font-bold text-lg tracking-wide">Business OS</div>
        <div className="flex items-center gap-3">
          <div className="bg-white/10 rounded-full p-0.5">
            <UserProfileDropdown />
          </div>
          <button onClick={() => setIsOpen(!isOpen)} className="p-2 -mr-2 hover:bg-white/10 rounded-lg transition-colors">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity backdrop-blur-sm"
          onClick={closeMenu}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 w-72 bg-[#1B4D5C] text-white transition-transform duration-300 ease-in-out z-50 flex flex-col h-screen shadow-2xl lg:shadow-none`}>
        <div className="p-6 flex-shrink-0">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold tracking-wider">Business OS</h1>
            <button onClick={closeMenu} className="lg:hidden p-2 -mr-2 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          <ModuleSwitcher />
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar pb-6">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path || 
              (link.path === '/expenses' && location.pathname === '/expenses/dashboard') ||
              (link.path === '/sales' && location.pathname === '/sales/dashboard');
              
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={closeMenu}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-white/10 text-white font-semibold shadow-sm' 
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default Navigation;