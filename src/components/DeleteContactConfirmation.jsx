import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, AlertTriangle } from 'lucide-react';

const DeleteContactConfirmation = ({ contact, companyId, isOpen, onClose, onConfirm }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!contact) return;
    setIsDeleting(true);
    try {
      await onConfirm(contact.id);
      toast({ title: "Success", description: "Contact deleted successfully." });
      onClose();
    } catch (error) {
      toast({ title: "Error", description: error.message || "Failed to delete contact.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!contact) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm bg-white p-0 overflow-hidden">
        <DialogHeader className="p-6 bg-red-50 border-b border-red-100">
          <DialogTitle className="text-xl font-bold text-red-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" /> Delete Contact?
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6 space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete <span className="font-bold text-gray-900">{contact.contact_name}</span>?
          </p>
          
          {contact.is_primary && (
            <div className="p-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-sm font-medium">
              This is the primary contact. Another contact will be set as primary.
            </div>
          )}
        </div>

        <DialogFooter className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={isDeleting}>Cancel</Button>
          <Button type="button" onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 text-white min-w-[100px]">
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteContactConfirmation;