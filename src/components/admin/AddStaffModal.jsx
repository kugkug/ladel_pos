import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { UserPlus, Mail, Shield, Loader2 } from 'lucide-react';
import { DEFAULT_MODULE_PERMISSIONS } from '@/lib/permissionUtils';

const AddStaffModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ name: '', email: '', uiRole: 'Staff' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const getValidDbRole = (uiRole) => {
    if (uiRole === 'Viewer') return 'VIEWER';
    return 'STAFF'; 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast({ title: 'Validation Error', description: 'Name and email are required.', variant: 'destructive' });
      return;
    }
    
    if (!['Admin', 'Manager', 'Staff', 'Viewer'].includes(formData.uiRole)) {
      toast({ title: 'Validation Error', description: 'Invalid role selection.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const dbRole = getValidDbRole(formData.uiRole);

      // 1. Invoke Edge Function to send invitation
      const { data: fnData, error: fnError } = await supabase.functions.invoke('send-staff-invitation', {
        body: { email: formData.email, name: formData.name, role: formData.uiRole, invitationLink: window.location.origin }
      });

      if (fnError) throw fnError;

      // 2. Insert into public.users with valid DB role
      const fakeId = crypto.randomUUID(); 
      const { error: dbError } = await supabase.from('users').insert([{
        id: fakeId,
        email: formData.email,
        full_name: formData.name,
        role: dbRole,
        status: 'invited'
      }]);
      
      if (dbError && dbError.code !== '23505') {
        throw new Error(`Database user creation failed: ${dbError.message}`);
      }

      // 3. Create default staff_access_control record with specific UI role and default module permissions
      const { error: accessError } = await supabase.from('staff_access_control').insert([{
        staff_user_id: fakeId,
        role: formData.uiRole,
        module_permissions: DEFAULT_MODULE_PERMISSIONS,
        module_access: {},
        permission_levels: {},
        company_access: [],
        project_access: [],
        customer_access: [],
        feature_restrictions: {}
      }]);

      if (accessError) throw new Error(`Access control configuration failed: ${accessError.message}`);

      toast({ title: 'Success', description: `Invitation sent to ${formData.email} as ${formData.uiRole}` });
      if (onSuccess) onSuccess();
      onClose();
      setFormData({ name: '', email: '', uiRole: 'Staff' });
    } catch (error) {
      console.error('Error adding staff:', error);
      toast({ title: 'Error', description: error.message || 'Failed to add staff member.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              Add New Staff Member
            </DialogTitle>
            <DialogDescription>
              Invite a new team member. They will receive an email to set up their account with default permissions.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Jane Doe" 
                className="text-gray-900"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="flex items-center gap-1"><Mail className="w-4 h-4"/> Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                value={formData.email} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="jane.doe@example.com" 
                className="text-gray-900"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role" className="flex items-center gap-1"><Shield className="w-4 h-4"/> Base Role</Label>
              <select
                id="role"
                value={formData.uiRole}
                onChange={(e) => setFormData({ ...formData, uiRole: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-gray-900 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="Admin">Administrator (Full Access)</option>
                <option value="Manager">Manager (Department Access)</option>
                <option value="Staff">Staff (Standard Access)</option>
                <option value="Viewer">Viewer (Read-Only)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">This sets their baseline access level. Granular module permissions can be configured later.</p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</> : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddStaffModal;