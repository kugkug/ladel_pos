import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Modal from './Modal';

const MyProfileModal = ({ isOpen, onClose }) => {
  const { currentUser, userRole } = useAuth();

  if (!currentUser) return null;

  // Derive full name based on the specific allowed accounts or fallback
  let defaultFullName = 'Staff Account';
  if (currentUser.email === 'delgobbo.alessandro@apexph.com') {
    defaultFullName = 'Alessandro Del Gobbo';
  } else if (currentUser.email === 'laceda.romelen@apexph.com') {
    defaultFullName = 'Romelen Laceda';
  }

  const fullName = currentUser.user_metadata?.full_name || defaultFullName;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Profile update logic would go here
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="My Profile" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right font-bold text-gray-600">Name</Label>
          <Input 
            value={fullName} 
            readOnly 
            className="col-span-3 bg-gray-50 border-transparent focus-visible:ring-0 text-gray-900 font-medium" 
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right font-bold text-gray-600">Email</Label>
          <Input 
            value={currentUser.email} 
            readOnly 
            className="col-span-3 bg-gray-50 border-transparent focus-visible:ring-0 text-gray-900 font-medium" 
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right font-bold text-gray-600">Role</Label>
          <div className="col-span-3">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${userRole === 'OWNER' ? 'bg-[#FF6B35]/10 text-[#FF6B35]' : 'bg-[#5DADE2]/10 text-[#1B4D5C]'}`}>
              {userRole || 'STAFF'}
            </span>
          </div>
        </div>

        <div className="form-actions flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button type="submit" className="bg-[#1B4D5C] hover:bg-[#1B4D5C]/90 text-white">
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default MyProfileModal;