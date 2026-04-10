import React, { useState, useEffect, useContext } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CompanyContext } from '@/contexts/CompanyContext';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';

const EditContactModal = ({ contact, companyId, isOpen, onClose, onSaveSuccess }) => {
  const { editContact } = useContext(CompanyContext);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    role_title: '',
    is_primary: false
  });

  useEffect(() => {
    if (contact) {
      setFormData({
        contact_name: contact.contact_name || '',
        contact_email: contact.contact_email || '',
        contact_phone: contact.contact_phone || '',
        role_title: contact.role_title || '',
        is_primary: contact.is_primary || false
      });
    }
    setError('');
  }, [contact, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.contact_name.trim()) {
      setError('Contact name is required');
      return;
    }
    if (formData.contact_email && !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(formData.contact_email)) {
      setError('Invalid email format');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    try {
      await editContact(contact.id, formData);
      toast({ title: "Success", description: "Contact updated successfully" });
      if (onSaveSuccess) onSaveSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'An error occurred while updating.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-white p-0 overflow-hidden">
        <DialogHeader className="p-6 bg-gray-50 border-b border-gray-100">
          <DialogTitle className="text-xl font-bold text-gray-900">Edit Contact</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Contact Name <span className="text-red-500">*</span></Label>
            <Input 
              value={formData.contact_name} 
              onChange={e => setFormData({...formData, contact_name: e.target.value})}
              placeholder="e.g. Jane Doe"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Email Address</Label>
            <Input 
              type="email"
              value={formData.contact_email} 
              onChange={e => setFormData({...formData, contact_email: e.target.value})}
              placeholder="jane@company.com"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Phone Number</Label>
            <Input 
              value={formData.contact_phone} 
              onChange={e => setFormData({...formData, contact_phone: e.target.value})}
              maxLength={20}
              placeholder="+63 900 000 0000"
            />
          </div>
          
          <div className="space-y-1.5">
            <Label>Role / Title</Label>
            <Input 
              value={formData.role_title} 
              onChange={e => setFormData({...formData, role_title: e.target.value})}
              maxLength={100}
              placeholder="e.g. Purchasing Manager"
            />
          </div>

          <div className="flex items-start space-x-2 pt-2 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
            <Checkbox 
              id="is_primary_edit" 
              checked={formData.is_primary}
              onCheckedChange={(checked) => setFormData({...formData, is_primary: checked})}
            />
            <div className="grid gap-1.5 leading-none">
              <label htmlFor="is_primary_edit" className="text-sm font-bold text-blue-900 cursor-pointer">
                Set as Primary Contact
              </label>
              <p className="text-xs text-blue-700">
                Only one primary contact per company. This will replace any existing primary contact.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Update Contact
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditContactModal;