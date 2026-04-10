import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Shield, User as UserIcon, RefreshCw, AlertTriangle } from 'lucide-react';
import { logActivity } from '@/lib/ActivityLogger';
import { Helmet } from 'react-helmet';
import ClearAllDataModal from '@/components/ClearAllDataModal';

const AccessControlSettings = () => {
  const [staffUsers, setStaffUsers] = useState([]);
  const [accessControls, setAccessControls] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isClearDataModalOpen, setIsClearDataModalOpen] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  const isOwner = currentUser?.role === 'OWNER';

  useEffect(() => {
    fetchStaffAndControls();
  }, []);

  const fetchStaffAndControls = async () => {
    setLoading(true);
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, email, full_name, role, status')
        .eq('role', 'STAFF')
        .eq('status', 'active');

      if (usersError) throw usersError;

      const { data: accessData, error: accessError } = await supabase
        .from('staff_access_control')
        .select('*');

      if (accessError) throw accessError;

      setStaffUsers(usersData || []);
      
      const controlsMap = {};
      (usersData || []).forEach(user => {
        const userControl = accessData?.find(c => c.staff_user_id === user.id);
        controlsMap[user.id] = userControl || {
          staff_user_id: user.id,
          sales_module: false,
          sales_data_entry: false,
          sales_project_lists: false,
          sales_customer_lists: false,
          expenses_module: false,
          expenses_data_entry: false,
          expenses_lists: false,
          expenses_suppliers: false,
          accounts_receivable: false,
          ar_data_entry: false,
          ar_lists: false,
          reports: false,
          analytics: false,
          isNew: true
        };
      });
      setAccessControls(controlsMap);
    } catch (error) {
      console.error("Error fetching access controls:", error);
      toast({ title: 'Error fetching data', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (userId, field) => {
    setAccessControls(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [field]: !prev[userId][field]
      }
    }));
  };

  const handleSave = async (userId) => {
    setSaving(userId);
    try {
      const control = accessControls[userId];
      const payload = {
        staff_user_id: userId,
        owner_user_id: currentUser?.id,
        sales_module: control.sales_module,
        sales_data_entry: control.sales_data_entry,
        sales_project_lists: control.sales_project_lists,
        sales_customer_lists: control.sales_customer_lists,
        expenses_module: control.expenses_module,
        expenses_data_entry: control.expenses_data_entry,
        expenses_lists: control.expenses_lists,
        expenses_suppliers: control.expenses_suppliers,
        accounts_receivable: control.accounts_receivable,
        ar_data_entry: control.ar_data_entry,
        ar_lists: control.ar_lists,
        reports: control.reports,
        analytics: control.analytics,
        updated_at: new Date().toISOString()
      };

      let error;
      if (control.isNew) {
        const { error: insertError } = await supabase.from('staff_access_control').insert([payload]);
        error = insertError;
      } else {
        const { error: updateError } = await supabase.from('staff_access_control')
          .update(payload)
          .eq('staff_user_id', userId);
        error = updateError;
      }

      if (error) throw error;

      setAccessControls(prev => ({
        ...prev,
        [userId]: { ...prev[userId], isNew: false, updated_at: payload.updated_at }
      }));

      const staffMember = staffUsers.find(u => u.id === userId);
      
      await logActivity({
        userId: currentUser.id,
        userEmail: currentUser.email,
        userName: currentUser.full_name,
        action: 'UPDATE',
        module: 'SETTINGS',
        entityType: 'ACCESS_CONTROL',
        entityId: userId,
        entityName: staffMember?.full_name || staffMember?.email,
        newValues: payload,
        description: `Updated access control for ${staffMember?.full_name || staffMember?.email}`
      });

      toast({ 
        title: 'Success', 
        description: `Access control updated for ${staffMember?.full_name || staffMember?.email}` 
      });
    } catch (error) {
      console.error("Error saving access control:", error);
      toast({ title: 'Save Failed', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const renderModuleToggles = (userId, title, prefix, fields) => (
    <div className="mb-6">
      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{title}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map(field => {
          const key = `${prefix}_${field.key}`;
          return (
            <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
              <Label htmlFor={`${userId}-${key}`} className="cursor-pointer text-gray-700">{field.label}</Label>
              <Switch 
                id={`${userId}-${key}`}
                checked={accessControls[userId]?.[key] || false}
                onCheckedChange={() => handleToggle(userId, key)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <Helmet><title>Settings - Admin - APEX Hub</title></Helmet>
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-[#1B4D5C] p-3 rounded-xl shadow-md">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
            <p className="text-gray-500">Manage permissions and system data</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={fetchStaffAndControls} 
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Staff Access Control</h2>
        {loading ? (
          <div className="p-12 flex justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#1B4D5C]" />
          </div>
        ) : staffUsers.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-gray-500">
              <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No STAFF Accounts Found</h3>
              <p className="max-w-md mx-auto">There are currently no active staff accounts in the system. When staff accounts are created, they will appear here for access configuration.</p>
            </CardContent>
          </Card>
        ) : (
          staffUsers.map(user => (
            <Card key={user.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-[#1B4D5C]/5 border-b border-gray-100 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-full shadow-sm">
                      <UserIcon className="w-5 h-5 text-[#1B4D5C]" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-gray-900">{user.full_name || 'Unnamed Staff'}</CardTitle>
                      <CardDescription>{user.email}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {accessControls[user.id]?.updated_at && (
                      <span className="text-xs text-gray-400 hidden sm:inline-block">
                        Updated: {new Date(accessControls[user.id].updated_at).toLocaleDateString()}
                      </span>
                    )}
                    <Button 
                      onClick={() => handleSave(user.id)}
                      disabled={saving === user.id}
                      className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white"
                    >
                      {saving === user.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      Save Changes
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                
                <div className="mb-6 flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div>
                    <h4 className="font-semibold text-blue-900">Sales Module Access</h4>
                    <p className="text-sm text-blue-700/80">Grant master access to Sales module</p>
                  </div>
                  <Switch 
                    checked={accessControls[user.id]?.sales_module || false}
                    onCheckedChange={() => handleToggle(user.id, 'sales_module')}
                  />
                </div>

                {renderModuleToggles(user.id, 'Sales Granular Permissions', 'sales', [
                  { key: 'data_entry', label: 'Data Entry' },
                  { key: 'project_lists', label: 'Project Lists' },
                  { key: 'customer_lists', label: 'Customer Lists' },
                ])}

                <div className="mb-6 flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
                  <div>
                    <h4 className="font-semibold text-green-900">Expenses Module Access</h4>
                    <p className="text-sm text-green-700/80">Grant master access to Expenses module</p>
                  </div>
                  <Switch 
                    checked={accessControls[user.id]?.expenses_module || false}
                    onCheckedChange={() => handleToggle(user.id, 'expenses_module')}
                  />
                </div>

                {renderModuleToggles(user.id, 'Expenses Granular Permissions', 'expenses', [
                  { key: 'data_entry', label: 'Data Entry' },
                  { key: 'lists', label: 'Expenses List' },
                  { key: 'suppliers', label: 'Suppliers' },
                ])}

                {renderModuleToggles(user.id, 'Other Permissions', '', [
                  { key: 'reports', label: 'Reports Generation' },
                  { key: 'analytics', label: 'Analytics View' },
                ])}

              </CardContent>
            </Card>
          ))
        )}
      </div>

      {isOwner && (
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-xl font-bold text-red-600 flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5" /> Danger Zone
          </h2>
          <Card className="border-red-200 shadow-sm">
            <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-red-50/50">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Clear All System Data</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Permanently delete all test data from the system. This includes all records, expenses, projects, and transactions.
                </p>
              </div>
              <Button 
                variant="destructive" 
                onClick={() => setIsClearDataModalOpen(true)}
                className="bg-red-600 hover:bg-red-700 shrink-0"
              >
                Clear All Data
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <ClearAllDataModal 
        isOpen={isClearDataModalOpen} 
        onClose={() => setIsClearDataModalOpen(false)} 
        onSuccess={() => {
          // Additional success logic if necessary, e.g. reload the app or redirect
          window.location.reload();
        }}
      />
    </div>
  );
};

export default AccessControlSettings;