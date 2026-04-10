import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Settings, LogOut, Key, AlertTriangle, Activity } from 'lucide-react';

const UserProfileDropdown = () => {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();
  
  const [showLogout, setShowLogout] = useState(false);

  if (!currentUser) return null;

  let defaultFullName = 'Staff Account';
  if (currentUser.email === 'delgobbo.alessandro@apexph.com') {
    defaultFullName = 'Alessandro Del Gobbo';
  } else if (currentUser.email === 'laceda.romelen@apexph.com') {
    defaultFullName = 'Romelen Laceda';
  }

  const fullName = currentUser.user_metadata?.full_name || defaultFullName;
  const initials = fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-3 hover:bg-black/5 p-1.5 rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900 leading-tight">{fullName}</p>
              <p className="text-xs text-primary font-semibold">{userRole || 'STAFF'}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1B4D5C] to-[#2A758C] text-white flex items-center justify-center font-bold text-sm shadow-md border-2 border-white/50 hover:scale-105 transition-transform">
              {initials}
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-white shadow-lg border-gray-100 rounded-xl animate-in slide-in-from-top-2 duration-200">
          <DropdownMenuLabel className="font-normal border-b border-muted pb-3 mb-1 bg-gray-50/50 rounded-t-xl">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-semibold text-gray-900 leading-none">{fullName}</p>
              <p className="text-xs text-gray-500 leading-none">{currentUser.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuItem onClick={() => navigate('/account-settings')} className="cursor-pointer hover:bg-gray-50 py-2.5 transition-colors">
            <Settings className="mr-2 h-4 w-4 text-gray-500" /> <span className="font-medium text-gray-700">Account Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/change-password')} className="cursor-pointer hover:bg-gray-50 py-2.5 transition-colors">
            <Key className="mr-2 h-4 w-4 text-gray-500" /> <span className="font-medium text-gray-700">Change Password</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/activity-logs')} className="cursor-pointer hover:bg-gray-50 py-2.5 transition-colors">
            <Activity className="mr-2 h-4 w-4 text-gray-500" /> <span className="font-medium text-gray-700">Activity Logs</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowLogout(true)} className="cursor-pointer text-red-600 focus:text-red-700 hover:bg-red-50 focus:bg-red-50 font-semibold py-2.5 transition-colors">
            <LogOut className="mr-2 h-4 w-4" /> <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showLogout} onOpenChange={setShowLogout}>
        <DialogContent className="sm:max-w-[400px] bg-white border-red-100 shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 text-xl">
              <AlertTriangle className="h-6 w-6" /> Confirm Logout
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 text-base">Are you sure you want to end your current session?</p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0 mt-2">
            <Button variant="outline" onClick={() => setShowLogout(false)} className="rounded-xl">Cancel</Button>
            <Button variant="destructive" onClick={handleLogout} className="bg-red-600 hover:bg-red-700 rounded-xl">Logout</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserProfileDropdown;