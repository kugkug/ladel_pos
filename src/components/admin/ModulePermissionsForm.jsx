import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp, Lock, Shield, LayoutDashboard, Database, FolderKanban, Users, Calendar, FileText, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

const PERMISSION_LEVELS = [
  { value: 'none', label: 'No Access' },
  { value: 'view', label: 'View Only' },
  { value: 'edit', label: 'View & Edit' },
  { value: 'full', label: 'Full Access (Delete)' }
];

const PermissionSelect = ({ value, onChange, disabled = false, fixed = false }) => {
  if (fixed) {
    return (
      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-500 font-medium w-40 flex items-center justify-between">
        View Only <Lock className="w-3 h-3 text-gray-400" />
      </div>
    );
  }

  return (
    <select
      value={value || 'none'}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none w-40 disabled:bg-gray-100 disabled:text-gray-500 transition-colors"
    >
      {PERMISSION_LEVELS.map(level => (
        <option key={level.value} value={level.value}>{level.label}</option>
      ))}
    </select>
  );
};

const ModuleSection = ({ title, description, icon: Icon, children, isExpanded, onToggle, disabled = false }) => (
  <Card className={cn("overflow-hidden border-gray-200 transition-all duration-200", disabled ? "opacity-75" : "")}>
    <CardHeader 
      className="cursor-pointer bg-gray-50/50 hover:bg-gray-50 transition-colors p-4"
      onClick={onToggle}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", disabled ? "bg-gray-200 text-gray-500" : "bg-blue-100 text-blue-700")}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {title}
              {disabled && <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-medium">Coming Soon</span>}
            </CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
        </div>
        <div className="text-gray-400">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>
    </CardHeader>
    
    {isExpanded && (
      <CardContent className="p-0 border-t border-gray-100">
        <div className="divide-y divide-gray-100">
          {children}
        </div>
      </CardContent>
    )}
  </Card>
);

const PermissionRow = ({ icon: Icon, label, description, value, onChange, disabled = false, fixed = false }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-gray-50/50 transition-colors gap-4">
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-gray-400"><Icon className="w-4 h-4" /></div>
      <div>
        <Label className="text-sm font-medium text-gray-900">{label}</Label>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
    </div>
    <div className="flex-shrink-0">
      <PermissionSelect value={value} onChange={onChange} disabled={disabled} fixed={fixed} />
    </div>
  </div>
);

const ModulePermissionsForm = ({ permissions, onChange }) => {
  const [expandedSection, setExpandedSection] = useState('sales');

  const updatePermission = (module, subSection, value) => {
    onChange({
      ...permissions,
      [module]: {
        ...(permissions[module] || {}),
        [subSection]: value
      }
    });
  };

  const salesPerms = permissions?.sales || {};
  const expensesPerms = permissions?.expenses || {};

  return (
    <div className="space-y-4">
      {/* Sales Module */}
      <ModuleSection
        title="Sales Module"
        description="Manage access to sales projects, customers, and data entry."
        icon={Shield}
        isExpanded={expandedSection === 'sales'}
        onToggle={() => setExpandedSection(expandedSection === 'sales' ? null : 'sales')}
      >
        <PermissionRow 
          icon={LayoutDashboard} label="Sales Dashboard" description="Overview of sales metrics and performance."
          value="view" fixed={true}
        />
        <PermissionRow 
          icon={Database} label="Data Entry" description="Create and manage quotes, POs, invoices, etc."
          value={salesPerms.data_entry} onChange={(v) => updatePermission('sales', 'data_entry', v)}
        />
        <PermissionRow 
          icon={FolderKanban} label="Projects" description="Access to project lists and details."
          value={salesPerms.projects} onChange={(v) => updatePermission('sales', 'projects', v)}
        />
        <PermissionRow 
          icon={Users} label="Customers" description="Access to customer database and history."
          value={salesPerms.customers} onChange={(v) => updatePermission('sales', 'customers', v)}
        />
        <PermissionRow 
          icon={Calendar} label="Calendar" description="View and manage sales reminders."
          value={salesPerms.calendar} onChange={(v) => updatePermission('sales', 'calendar', v)}
        />
      </ModuleSection>

      {/* Expenses Module */}
      <ModuleSection
        title="Expenses Module"
        description="Manage access to company expenses and supplier records."
        icon={Shield}
        isExpanded={expandedSection === 'expenses'}
        onToggle={() => setExpandedSection(expandedSection === 'expenses' ? null : 'expenses')}
      >
        <PermissionRow 
          icon={LayoutDashboard} label="Expenses Dashboard" description="Overview of expense metrics."
          value="view" fixed={true}
        />
        <PermissionRow 
          icon={Database} label="Data Entry" description="Record new expenses and capitalisations."
          value={expensesPerms.data_entry} onChange={(v) => updatePermission('expenses', 'data_entry', v)}
        />
        <PermissionRow 
          icon={FileText} label="Expenses List" description="View and manage recorded expenses."
          value={expensesPerms.expenses_list} onChange={(v) => updatePermission('expenses', 'expenses_list', v)}
        />
        <PermissionRow 
          icon={Users} label="Suppliers" description="Manage supplier database."
          value={expensesPerms.suppliers} onChange={(v) => updatePermission('expenses', 'suppliers', v)}
        />
        <PermissionRow 
          icon={Calendar} label="Calendar" description="View expense reminders."
          value={expensesPerms.calendar} onChange={(v) => updatePermission('expenses', 'calendar', v)}
        />
      </ModuleSection>

      {/* Reports Module (Disabled) */}
      <ModuleSection
        title="Reports & Analytics"
        description="Generate and export comprehensive business reports."
        icon={FileText}
        isExpanded={expandedSection === 'reports'}
        onToggle={() => setExpandedSection(expandedSection === 'reports' ? null : 'reports')}
        disabled={true}
      >
        <PermissionRow 
          icon={FileText} label="Generate Reports" description="Create custom reports for various modules."
          value="none" disabled={true}
        />
        <PermissionRow 
          icon={Download} label="Export Data" description="Download reports in CSV or PDF formats."
          value="none" disabled={true}
        />
      </ModuleSection>
    </div>
  );
};

export default ModulePermissionsForm;