import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileEdit, 
  List, 
  Users, 
  Calendar, 
  BarChart3, 
  Trash2, 
  Settings, 
  Activity, 
  Lock, 
  Menu, 
  X, 
  LogOut 
} from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';
import { useAuth } from '@/contexts/AuthContext';

const ExpensesNavigation = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const isOwner = user?.role === 'OWNER';

  const navItems = [
    { label: 'Dashboard', path: '/expenses', icon: LayoutDashboard },
    { label: 'Data Entry', path: '/expenses/data-entry', icon: FileEdit },
    { label: 'Expenses List', path: '/expenses/expenses-list', icon: List },
    { label: 'Suppliers', path: '/expenses/suppliers', icon: Users },
    { label: 'Calendar', path: '/expenses/calendar', icon: Calendar },
    { label: 'Reports', path: '/expenses/reports', icon: BarChart3 },
    { label: 'Trash Bin', path: '/expenses/trash-bin', icon: Trash2 },
  ];

  const adminItems = [
    { label: 'Settings', path: '/admin/settings', icon: Settings },
    { label: 'Activity Logs', path: '/admin/activity-log', icon: Activity },
  ];

  const closeMenu = () => setIsOpen(false);

  const renderLink = (item) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path || 
      (item.path === '/expenses' && location.pathname === '/expenses/dashboard');
      
    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={closeMenu}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
          isActive 
            ? 'bg-red-600 text-white font-semibold shadow-sm' 
            : 'text-white/80 hover:bg-red-700 hover:text-white'
        }`}
      >
        <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-white/80 group-hover:text-white'}`} />
        {item.label}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-[60px] bg-red-800 text-white flex items-center justify-between px-4 z-50 shadow-md">
        <div className="font-bold text-lg tracking-wide">Expenses OS</div>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 -mr-2 hover:bg-white/10 rounded-lg transition-colors">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={closeMenu}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 w-72 bg-red-800 text-white transition-transform duration-300 ease-in-out z-50 flex flex-col h-screen shadow-2xl lg:shadow-none`}>
        <div className="p-6 flex-shrink-0">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold tracking-wider">Expenses OS</h1>
            <button onClick={closeMenu} className="lg:hidden p-2 -mr-2 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar pb-6">
          <div className="space-y-1 mb-4">
            {navItems.map(renderLink)}
          </div>
          
          {isOwner && (
            <div className="pt-4 mt-4 border-t border-red-700/50 space-y-1">
              <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-red-300 mb-2">Administration</p>
              {adminItems.map(renderLink)}
            </div>
          )}
        </nav>

        <div className="p-4 flex-shrink-0 border-t border-red-700/50 space-y-1 bg-red-900">
          <button 
            onClick={() => { closeMenu(); setIsPasswordModalOpen(true); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:bg-red-700 hover:text-white transition-colors group"
          >
            <Lock className="w-5 h-5 transition-colors text-white/80 group-hover:text-white" /> 
            Change Password
          </button>
          <button 
            onClick={() => { closeMenu(); logout(); }} 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:bg-red-700 hover:text-white transition-colors group"
          >
            <LogOut className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" /> 
            Logout
          </button>
        </div>
      </div>

      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />
    </>
  );
};

export default ExpensesNavigation;