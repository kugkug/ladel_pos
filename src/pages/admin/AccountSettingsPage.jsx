import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Settings, ShieldAlert, Key, Activity, Mail, BadgeCheck, KeyRound as UsersRound } from 'lucide-react';
import ClearAllDataModal from '@/components/ClearAllDataModal';

const AccountSettingsPage = () => {
  const { currentUser, userRole, isOwner } = useAuth();
  const [isClearDataModalOpen, setIsClearDataModalOpen] = useState(false);

  let defaultFullName = 'Staff Account';
  if (currentUser?.email === 'delgobbo.alessandro@apexph.com') {
    defaultFullName = 'Alessandro Del Gobbo';
  } else if (currentUser?.email === 'laceda.romelen@apexph.com') {
    defaultFullName = 'Romelen Laceda';
  }

  const fullName = currentUser?.user_metadata?.full_name || defaultFullName;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in duration-300">
      <Helmet><title>Account Settings - APEX Hub</title></Helmet>

      <div className="mb-8 flex items-center gap-3">
        <div className="bg-[#1B4D5C] p-3 rounded-xl shadow-sm">
          <Settings className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-500 mt-1">Manage your profile, security, and data preferences.</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Profile Information Section */}
        <Card className="border-gray-200 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100">
            <CardTitle className="text-xl flex items-center gap-2">
              <User className="w-5 h-5 text-gray-500" />
              Profile Information
            </CardTitle>
            <CardDescription>Your personal account details</CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
              <div className="w-24 h-24 bg-gradient-to-tr from-[#1B4D5C] to-[#2A758C] rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-md flex-shrink-0">
                {fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <div className="space-y-4 flex-1 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-1.5">
                      <User className="w-4 h-4" /> Full Name
                    </label>
                    <p className="text-lg font-semibold text-gray-900 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                      {fullName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-1.5">
                      <Mail className="w-4 h-4" /> Email Address
                    </label>
                    <p className="text-lg font-semibold text-gray-900 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                      {currentUser?.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-1.5">
                      <BadgeCheck className="w-4 h-4" /> Role
                    </label>
                    <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-semibold border border-blue-100 mt-0.5">
                      {userRole}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link to="/change-password" className="block">
            <Card className="hover:border-[#1B4D5C] transition-colors cursor-pointer group shadow-sm h-full">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="bg-gray-100 p-3 rounded-full group-hover:bg-[#1B4D5C]/10 transition-colors">
                  <Key className="w-6 h-6 text-gray-600 group-hover:text-[#1B4D5C]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-[#1B4D5C] transition-colors">Change Password</h3>
                  <p className="text-sm text-gray-500">Update your login credentials securely.</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/activity-logs" className="block">
            <Card className="hover:border-[#1B4D5C] transition-colors cursor-pointer group shadow-sm h-full">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="bg-gray-100 p-3 rounded-full group-hover:bg-[#1B4D5C]/10 transition-colors">
                  <Activity className="w-6 h-6 text-gray-600 group-hover:text-[#1B4D5C]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-[#1B4D5C] transition-colors">Activity Logs</h3>
                  <p className="text-sm text-gray-500">View recent actions and system events.</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          {isOwner() && (
            <Link to="/account-settings/staff-restrictions" className="block">
              <Card className="hover:border-[#1B4D5C] transition-colors cursor-pointer group shadow-sm h-full">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="bg-blue-50 p-3 rounded-full group-hover:bg-[#1B4D5C]/10 transition-colors">
                    <UsersRound className="w-6 h-6 text-blue-600 group-hover:text-[#1B4D5C]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-[#1B4D5C] transition-colors">Staff Restrictions</h3>
                    <p className="text-sm text-gray-500">Manage access and permissions.</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}
        </div>

        {/* Danger Zone */}
        {isOwner() && (
          <Card className="border-red-200 shadow-sm rounded-2xl overflow-hidden mt-8">
            <CardHeader className="bg-red-50/50 border-b border-red-100">
              <CardTitle className="text-xl flex items-center gap-2 text-red-600">
                <ShieldAlert className="w-5 h-5" />
                Danger Zone
              </CardTitle>
              <CardDescription className="text-red-800/70">Irreversible destructive actions.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-white">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Clear All System Data</h3>
                <p className="text-sm text-gray-600 mt-1 max-w-xl">
                  Permanently delete all transactional test data from the application including projects, companies, expenses, and receipts. Your account and schema will remain intact.
                </p>
              </div>
              <Button 
                variant="destructive" 
                size="lg"
                onClick={() => setIsClearDataModalOpen(true)}
                className="bg-red-600 hover:bg-red-700 whitespace-nowrap shadow-sm font-semibold px-8"
              >
                Clear All Data
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <ClearAllDataModal 
        isOpen={isClearDataModalOpen} 
        onClose={() => setIsClearDataModalOpen(false)} 
        onSuccess={() => {
          window.location.reload();
        }}
      />
    </div>
  );
};

export default AccountSettingsPage;