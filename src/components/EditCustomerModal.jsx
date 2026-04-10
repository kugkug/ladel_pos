import React, { useContext, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { CustomerContext } from '@/contexts/CustomerContext';
import CustomerForm from './CustomerForm';
import { format } from 'date-fns';

const EditCustomerModal = ({ isOpen, onClose, initialData, onSaveSuccess }) => {
  const { addCustomer, editCustomer } = useContext(CustomerContext);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    setError('');
    try {
      let result;
      if (initialData?.id) {
        result = await editCustomer(initialData.id, data);
        toast({ title: "Success", description: "Customer updated successfully" });
      } else {
        result = await addCustomer(data);
        toast({ title: "Success", description: "Customer saved successfully" });
      }
      if (onSaveSuccess) onSaveSuccess(result);
      onClose();
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-white border-none shadow-2xl p-0 overflow-y-auto max-h-[90vh]">
        <DialogHeader className="border-b border-gray-100 p-6 bg-gray-50/50 sticky top-0 z-10 backdrop-blur-md">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {initialData ? 'Edit Customer' : 'Add New Customer'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6">
          <CustomerForm 
            initialData={initialData} 
            onSubmit={handleSubmit} 
            onCancel={onClose} 
            isSubmitting={isSubmitting} 
            externalError={error} 
          />
          
          {initialData?.updated_at && (
            <p className="text-xs text-center text-gray-400 mt-6 pt-4 border-t border-gray-100">
              Last updated: {format(new Date(initialData.updated_at), 'PPP p')}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditCustomerModal;