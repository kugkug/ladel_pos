import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, Lock } from 'lucide-react';
import Modal from './Modal';

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { updatePassword, currentUser } = useAuth();
  const { toast } = useToast();

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentPassword) {
      toast({ title: "Error", description: "Current password is required.", variant: "destructive" });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "New password and confirm password do not match.", variant: "destructive" });
      return;
    }

    if (newPassword.length < 8) {
      toast({ title: "Error", description: "New password must be at least 8 characters.", variant: "destructive" });
      return;
    }

    if (currentPassword === newPassword) {
      toast({ title: "Error", description: "New password must be different from current password.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate current password by attempting to re-authenticate
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: currentUser.email,
        password: currentPassword
      });

      if (authError) {
        toast({ title: "Error", description: "Incorrect current password.", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }

      // If current password is correct, update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (!updateError) {
        toast({ title: "Success", description: "Password changed successfully." });
        handleClose();
      } else {
        toast({ title: "Error", description: updateError.message, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to update password.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={
        <div className="flex items-center gap-2 text-gray-900">
          <Lock className="w-5 h-5 text-[#1B4D5C]" />
          <span>Change Password</span>
        </div>
      } 
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Current Password</Label>
          <Input 
            type="password" 
            required 
            value={currentPassword} 
            onChange={e => setCurrentPassword(e.target.value)} 
            className="focus-visible:ring-[#1B4D5C]" 
          />
        </div>
        <div className="space-y-2">
          <Label>New Password</Label>
          <Input 
            type="password" 
            required 
            value={newPassword} 
            onChange={e => setNewPassword(e.target.value)} 
            className="focus-visible:ring-[#1B4D5C]" 
          />
          <p className="text-xs text-gray-500">Must be at least 8 characters long.</p>
        </div>
        <div className="space-y-2">
          <Label>Confirm New Password</Label>
          <Input 
            type="password" 
            required 
            value={confirmPassword} 
            onChange={e => setConfirmPassword(e.target.value)} 
            className="focus-visible:ring-[#1B4D5C]" 
          />
        </div>
        
        <div className="form-actions flex justify-end gap-3 pt-6 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" className="bg-[#1B4D5C] hover:bg-[#1B4D5C]/90 text-white" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Update Password
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ChangePasswordModal;