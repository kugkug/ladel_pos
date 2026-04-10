import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Shield, Info } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const MODULES = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'data_entry', label: 'Data Entry' },
  { id: 'projects', label: 'Projects' },
  { id: 'customers', label: 'Customers' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'reports', label: 'Reports' }
];

const PERMISSION_LEVELS = ['None', 'View', 'Edit', 'Full'];

const StaffPermissionsForm = ({ moduleAccess, setModuleAccess, permissionLevels, setPermissionLevels }) => {
  const handleModuleToggle = (moduleId) => {
    setModuleAccess(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
    // Default to 'View' if turning on, 'None' if turning off
    if (!moduleAccess[moduleId]) {
      setPermissionLevels(prev => ({ ...prev, [moduleId]: 'View' }));
    } else {
      setPermissionLevels(prev => ({ ...prev, [moduleId]: 'None' }));
    }
  };

  const handleLevelChange = (moduleId, level) => {
    setPermissionLevels(prev => ({
      ...prev,
      [moduleId]: level
    }));
    // Auto-enable module if level is > None
    if (level !== 'None' && !moduleAccess[moduleId]) {
      setModuleAccess(prev => ({ ...prev, [moduleId]: true }));
    } else if (level === 'None') {
      setModuleAccess(prev => ({ ...prev, [moduleId]: false }));
    }
  };

  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="bg-gray-50/50 border-b border-gray-100">
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          Module Access & Permissions
        </CardTitle>
        <CardDescription>Configure which modules the user can access and their permission level.</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {MODULES.map(mod => (
            <div key={mod.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <Checkbox 
                  id={`mod-${mod.id}`} 
                  checked={!!moduleAccess[mod.id]} 
                  onCheckedChange={() => handleModuleToggle(mod.id)} 
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor={`mod-${mod.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-900 cursor-pointer"
                  >
                    {mod.label} Access
                  </label>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Info className="w-3 h-3" /> Enable or disable access to the {mod.label} module.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200">
                {PERMISSION_LEVELS.map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => handleLevelChange(mod.id, level)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      (permissionLevels[mod.id] || 'None') === level
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StaffPermissionsForm;