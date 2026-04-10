import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

const PaymentPreviewModal = ({ isOpen, onClose, data }) => {
  if (!data) return null;
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-white p-6">
        <DialogHeader><DialogTitle>Payment Preview</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-y-4">
            <div><p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Payment Date</p><p className="font-bold text-gray-900">{data.payment_date}</p></div>
            <div><p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Amount Paid</p><p className="font-bold text-xl text-green-600">{formatCurrency(data.amount_paid)}</p></div>
            <div><p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Method</p><p className="font-bold text-gray-900">{data.payment_method}</p></div>
            <div><p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Reference No.</p><p className="font-bold text-gray-900">{data.reference_no || 'N/A'}</p></div>
          </div>
          <div><p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Notes</p><p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100">{data.notes || 'N/A'}</p></div>
          <div className="flex justify-end pt-4"><Button onClick={onClose}>Close</Button></div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default PaymentPreviewModal;