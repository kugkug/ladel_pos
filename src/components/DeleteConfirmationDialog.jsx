import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const DeleteConfirmationDialog = ({ isOpen, onClose, onConfirm, documentType, documentDetails, isDeleting }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete {documentType}?</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-2 text-sm text-gray-600">
          <p>Are you sure you want to move this {documentType} to the Trash Bin?</p>
          {documentDetails && (
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mt-2">
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-gray-900">{documentDetails.number}</span>
                <span>{documentDetails.date}</span>
              </div>
              <div className="text-gray-900 font-bold">
                {formatCurrency(documentDetails.amount)}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>Cancel</Button>
          <Button onClick={onConfirm} variant="destructive" disabled={isDeleting}>
            {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Move to Trash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;