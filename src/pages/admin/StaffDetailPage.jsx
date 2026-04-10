import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import ModulePermissionsForm from '@/components/admin/ModulePermissionsForm';
import { DEFAULT_MODULE_PERMISSIONS } from '@/lib/permissionUtils';

const StaffDetailPage = () => {
  const { staffId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [uiRole, setUiRole] = useState('Staff');
  const [modulePermissions, setModulePermissions] = useState(DEFAULT_MODULE_PERMISSIONS);

  useEffect(() => {
    const fetchStaffDetails = async () => {
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*, staff_access_control(*)')
          .eq('id', staffId)
          .single();
          
        if (userError) throw userError;
        
        setStaff(userData);

        const accessData = userData.staff_access_control?.[0];

        if (accessData) {
          // Merge with defaults to ensure all keys exist
          const mergedPerms = {
            sales: { ...DEFAULT_MODULE_PERMISSIONS.sales, ...(accessData.module_permissions?.sales || {}) },
            expenses: { ...DEFAULT_MODULE_PERMISSIONS.expenses, ...(accessData.module_permissions?.expenses || {}) },
            reports: { ...DEFAULT_MODULE_PERMISSIONS.reports, ...(accessData.module_permissions?.reports || {}) }
          };
          
          setModulePermissions(mergedPerms);
          
          const storedRole = accessData.role || userData.role;
          const normalizedUiRole = ['Admin', 'Manager', 'Staff', 'Viewer'].includes(storedRole) 
            ? storedRole 
            : (userData.role === 'VIEWER' ? 'Viewer' : 'Staff');
            
          setUiRole(normalizedUiRole);
        } else {
           setUiRole(userData.role === 'VIEWER' ? 'Viewer' : 'Staff');
        }
      } catch (error) {
        console.error("Error fetching staff details:", error);
        toast({ title: 'Error', description: 'Could not load staff details.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    if (staffId) fetchStaffDetails();
  }, [staffId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (!['Admin', 'Manager', 'Staff', 'Viewer'].includes(uiRole)) {
        throw new Error('Invalid role selected.');
      }

      const dbRole = uiRole === 'Viewer' ? 'VIEWER' : 'STAFF';

      const { error: userError } = await supabase
        .from('users')
        .update({ role: dbRole })
        .eq('id', staffId);
        
      if (userError) throw new Error(`User update failed: ${userError.message}`);

      const accessPayload = {
        staff_user_id: staffId,
        role: uiRole,
        module_permissions: modulePermissions,
        updated_at: new Date().toISOString()
      };

      const { data: existing } = await supabase.from('staff_access_control').select('id').eq('staff_user_id', staffId).maybeSingle();

      if (existing) {
        const { error: accError } = await supabase.from('staff_access_control').update(accessPayload).eq('staff_user_id', staffId);
        if (accError) throw new Error(`Access control update failed: ${accError.message}`);
      } else {
        const { error: accError } = await supabase.from('staff_access_control').insert([accessPayload]);
        if (accError) throw new Error(`Access control creation failed: ${accError.message}`);
      }

      toast({ title: 'Success', description: 'Staff permissions updated successfully.' });
      navigate('/account-settings/staff-restrictions');
    } catch (error) {
      console.error("Error saving permissions:", error);
      toast({ title: 'Error', description: error.message || 'Failed to save permissions.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  if (!staff) {
    return <div className="text-center py-12 text-gray-500">Staff member not found.</div>;
  }

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      <Helmet><title>Edit Staff Permissions - APEX Hub</title></Helmet>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/account-settings/staff-restrictions')} className="rounded-full bg-gray-50 hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold">
              {(staff.full_name || 'S')[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{staff.full_name || 'Unnamed Staff'}</h1>
              <p className="text-sm text-gray-500">{staff.email}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex-1 md:w-48">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1 block mb-1">Assigned Role</label>
            <select
              value={uiRole}
              onChange={(e) => setUiRole(e.target.value)}
              className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 hover:bg-white transition-colors"
            >
              <option value="Admin">Administrator</option>
              <option value="Manager">Manager</option>
              <option value="Staff">Staff</option>
              <option value="Viewer">Viewer</option>
            </select>
          </div>
          <Button onClick={handleSave} disabled={saving} className="bg-[#1B4D5C] hover:bg-[#2A758C] text-white shadow-md font-bold mt-5">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Module Access Control</h2>
        <p className="text-sm text-gray-500 mb-6">Configure granular access levels for each module and its sub-sections.</p>
        
        <ModulePermissionsForm 
          permissions={modulePermissions} 
          onChange={setModulePermissions} 
        />
      </div>
      
      <div className="flex justify-end pt-4 border-t border-gray-200 mt-8">
        <Button onClick={handleSave} disabled={saving} size="lg" className="bg-[#1B4D5C] hover:bg-[#2A758C] text-white shadow-lg font-bold px-8">
          {saving ? 'Saving...' : 'Save All Permissions'}
        </Button>
      </div>
    </div>
  );
};

export default StaffDetailPage;