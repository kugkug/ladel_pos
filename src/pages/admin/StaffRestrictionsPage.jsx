import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { Search, UserPlus, ShieldAlert, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AddStaffModal from '@/components/admin/AddStaffModal';
import { useToast } from '@/components/ui/use-toast';
import { hasModuleAccess } from '@/lib/permissionUtils';

const StaffRestrictionsPage = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          staff_access_control (*)
        `)
        .neq('role', 'OWNER')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const mappedStaff = (data || []).map(user => {
        const accessControl = user.staff_access_control?.[0] || {};
        const specificRole = accessControl.role || user.role;
        const perms = accessControl.module_permissions || {};
        
        const assignedModules = [];
        if (hasModuleAccess(perms, 'sales')) assignedModules.push('Sales');
        if (hasModuleAccess(perms, 'expenses')) assignedModules.push('Expenses');

        return {
          ...user,
          displayRole: specificRole,
          assignedModules: assignedModules.join(', ') || 'None',
          accessLevel: 'Custom'
        };
      });
      
      setStaff(mappedStaff);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast({ title: 'Error', description: 'Failed to load staff members.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this staff member? This will disable their access.')) {
      try {
        await supabase.from('users').update({ status: 'inactive' }).eq('id', id);
        toast({ title: 'Staff Removed', description: 'Staff member has been deactivated.' });
        fetchStaff();
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to remove staff.', variant: 'destructive' });
      }
    }
  };

  const filteredStaff = staff.filter(s => 
    (s.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (s.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      <Helmet><title>Staff Restrictions - APEX Hub</title></Helmet>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#1B4D5C] p-2.5 rounded-xl shadow-md"><ShieldAlert className="w-6 h-6 text-white"/></div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
            <p className="text-gray-500 mt-1">Manage staff roles and granular module permissions.</p>
          </div>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md font-bold">
          <UserPlus className="w-5 h-5 mr-2" /> Add New Staff
        </Button>
      </div>

      {/* Controls */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="text-sm text-gray-500 font-medium">
            Total Staff: {staff.length}
          </div>
        </CardContent>
      </Card>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Staff Member</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned Role</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned Modules</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Access Level</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-12 text-gray-500">Loading staff directory...</td></tr>
              ) : filteredStaff.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-12 text-gray-500">No staff members found.</td></tr>
              ) : (
                filteredStaff.map(member => (
                  <tr 
                    key={member.id} 
                    className="hover:bg-blue-50/30 transition-colors cursor-pointer"
                    onClick={(e) => {
                      if (!e.target.closest('button')) {
                        navigate(`/account-settings/staff-restrictions/${member.id}`);
                      }
                    }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                          {(member.full_name || 'S')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{member.full_name || 'Unnamed Staff'}</p>
                          <p className="text-sm text-gray-500">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        member.displayRole === 'Admin' ? 'bg-purple-100 text-purple-800' :
                        member.displayRole === 'Manager' ? 'bg-blue-100 text-blue-800' :
                        member.displayRole === 'Viewer' ? 'bg-gray-100 text-gray-800' :
                        'bg-indigo-100 text-indigo-800'
                      }`}>
                        {member.displayRole || 'Staff'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700 font-medium">
                        {member.assignedModules}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {member.accessLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={(e) => { e.stopPropagation(); navigate(`/account-settings/staff-restrictions/${member.id}`); }}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4 mr-1" /> Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={(e) => { e.stopPropagation(); handleDelete(member.id); }}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Remove Staff"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddStaffModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={fetchStaff}
      />
    </div>
  );
};

export default StaffRestrictionsPage;