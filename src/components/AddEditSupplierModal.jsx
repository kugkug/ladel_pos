import React, { useState, useEffect, useContext } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SupplierContext } from '@/contexts/SupplierContext';
import { Loader2, AlertCircle } from 'lucide-react';

const AddEditSupplierModal = ({ isOpen, onClose, initialData, onSuccess }) => {
  const { addSupplier, editSupplier } = useContext(SupplierContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    company_name: '',
    tin_number: '',
    address: '',
    status: 'Active',
    notes: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        company_name: initialData.company_name || '',
        tin_number: initialData.tin_number || '',
        address: initialData.address || '',
        status: initialData.status || 'Active',
        notes: initialData.notes || ''
      });
    } else {
      setFormData({
        company_name: '',
        tin_number: '',
        address: '',
        status: 'Active',
        notes: ''
      });
    }
    setError('');
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company_name.trim()) {
      setError('Company name is required');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    try {
      let result;
      if (initialData?.id) {
        result = await editSupplier(initialData.id, formData);
      } else {
        result = await addSupplier(formData);
      }
      if (onSuccess) onSuccess(result);
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
            {initialData ? 'Edit Supplier' : 'Add New Supplier'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Company Name <span className="text-red-500">*</span></Label>
            <Input 
              value={formData.company_name} 
              onChange={e => setFormData({...formData, company_name: e.target.value})}
              placeholder="e.g. Supplier Corp"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label>TIN Number (Optional)</Label>
            <Input 
              value={formData.tin_number} 
              onChange={e => setFormData({...formData, tin_number: e.target.value})}
              placeholder="000-000-000-000"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Address (Optional)</Label>
            <Textarea 
              value={formData.address} 
              onChange={e => setFormData({...formData, address: e.target.value})}
              placeholder="Full office address"
              className="resize-none"
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

          <div className="space-y-1.5">
            <Label>Notes (Optional)</Label>
            <Textarea 
              value={formData.notes} 
              onChange={e => setFormData({...formData, notes: e.target.value})}
              placeholder="Any internal notes"
              className="resize-none h-20"
            />
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

export default AddEditSupplierModal;