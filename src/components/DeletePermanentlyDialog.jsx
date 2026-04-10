import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Loader2, AlertTriangle } from 'lucide-react';

const DeletePermanentlyDialog = ({ isOpen, onClose, onConfirm, documentType, documentDetails, isDeleting }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm border-red-200">
        <DialogHeader>
          <DialogTitle className="text-red-600 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Delete Permanently?
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-2 text-sm text-gray-600">
          <p className="font-medium text-red-600">This action cannot be undone.</p>
          <p>Permanently delete this {documentType} from the database?</p>
          {documentDetails && (
            <div className="bg-red-50 p-3 rounded-lg border border-red-100 mt-2">
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-gray-900">{documentDetails.number}</span>
                <span>{documentDetails.date}</span>
              </div>
              <div className="text-red-700 font-bold">
                {formatCurrency(documentDetails.amount)}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>Cancel</Button>
          <Button onClick={onConfirm} variant="destructive" disabled={isDeleting}>
            {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Delete Permanently
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeletePermanentlyDialog;