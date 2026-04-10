import React, { useState, useEffect, useContext } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SupplierContext } from '@/contexts/SupplierContext';
import { Loader2, AlertCircle } from 'lucide-react';

const AddEditSupplierContactModal = ({ supplierId, isOpen, onClose, initialData, onSuccess }) => {
  const { addSupplierContact, editSupplierContact } = useContext(SupplierContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    status: 'Active'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        position: initialData.position || '',
        status: initialData.status || 'Active'
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        position: '',
        status: 'Active'
      });
    }
    setError('');
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Contact name is required');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    try {
      if (initialData?.id) {
        await editSupplierContact(initialData.id, formData);
      } else {
        await addSupplierContact(supplierId, formData);
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-white p-0 overflow-hidden">
        <DialogHeader className="p-6 bg-gray-50 border-b border-gray-100">
          <DialogTitle className="text-xl font-bold text-gray-900">
            {initialData ? 'Edit Contact' : 'Add New Contact'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Name <span className="text-red-500">*</span></Label>
            <Input 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. John Doe"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input 
              type="email"
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})}
              placeholder="john@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input 
              value={formData.phone} 
              onChange={e => setFormData({...formData, phone: e.target.value})}
              placeholder="+63 900 000 0000"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Position</Label>
            <Input 
              value={formData.position} 
              onChange={e => setFormData({...formData, position: e.target.value})}
              placeholder="e.g. Sales Manager"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Status</Label>
            <select 
              value={formData.status} 
              onChange={e => setFormData({...formData, status: e.target.value})} 
              className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {initialData ? 'Update' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditSupplierContactModal;