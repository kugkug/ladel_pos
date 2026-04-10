import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lock, Check, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const FEATURES = [
  { id: 'createProjects', label: 'Create Projects', desc: 'Allow user to create new projects' },
  { id: 'editProjects', label: 'Edit Projects', desc: 'Allow user to modify existing projects' },
  { id: 'deleteProjects', label: 'Delete Projects', desc: 'Allow user to delete projects' },
  { id: 'createInvoices', label: 'Create Invoices', desc: 'Allow user to generate invoices' },
  { id: 'editInvoices', label: 'Edit Invoices', desc: 'Allow user to modify invoices' },
  { id: 'deleteInvoices', label: 'Delete Invoices', desc: 'Allow user to void/delete invoices' },
  { id: 'downloadReports', label: 'Download Reports', desc: 'Allow user to download PDF/CSV reports' },
  { id: 'exportData', label: 'Export Data', desc: 'Allow user to export full data tables' },
  { id: 'manageCustomers', label: 'Manage Customers', desc: 'Allow user to add/edit customers' },
  { id: 'manageStaff', label: 'Manage Staff', desc: 'Allow user to view/edit other staff (Admin only)' },
];

const FeatureRestrictionsForm = ({ featureRestrictions, setFeatureRestrictions }) => {
  const handleToggle = (featureId) => {
    setFeatureRestrictions(prev => ({
      ...prev,
      [featureId]: !prev[featureId]
    }));
  };

  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="bg-gray-50/50 border-b border-gray-100">
        <CardTitle className="text-lg flex items-center gap-2">
          <Lock className="w-5 h-5 text-red-600" />
          Feature Restrictions
        </CardTitle>
        <CardDescription>Enable or disable specific actionable features across the application.</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map(feature => {
            const isEnabled = featureRestrictions[feature.id] !== false; // Default to true if undefined
            return (
              <div key={feature.id} className="flex items-start justify-between space-x-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex flex-col gap-1">
                  <Label htmlFor={`feat-${feature.id}`} className="text-sm font-bold text-gray-900 cursor-pointer">
                    {feature.label}
                  </Label>
                  <p className="text-xs text-gray-500">{feature.desc}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium ${isEnabled ? 'text-green-600' : 'text-red-500'}`}>
                    {isEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <Switch 
                    id={`feat-${feature.id}`} 
                    checked={isEnabled} 
                    onCheckedChange={() => handleToggle(feature.id)} 
                    className="data-[state=checked]:bg-green-500"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default FeatureRestrictionsForm;