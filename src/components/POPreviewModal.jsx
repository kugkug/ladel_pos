import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

const POPreviewModal = ({ isOpen, onClose, data }) => {
  if (!data) return null;
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-white p-6">
        <DialogHeader><DialogTitle>Purchase Order Preview</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-y-4">
            <div><p className="text-xs text-gray-500">PO Number</p><p className="font-bold">{data.po_number || data.customer_po_number || data.temporary_po_code}</p></div>
            <div><p className="text-xs text-gray-500">PO Date</p><p className="font-bold">{data.po_date || new Date(data.po_created_at || Date.now()).toLocaleDateString()}</p></div>
            <div><p className="text-xs text-gray-500">PO Type</p><p className="font-bold">{data.po_type}</p></div>
            <div><p className="text-xs text-gray-500">Payment Terms</p><p className="font-bold">{data.payment_terms}</p></div>
            <div><p className="text-xs text-gray-500">Tax Type</p><p className="font-bold">{data.po_tax_type || 'VAT (12%)'}</p></div>
          </div>
          
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 shadow-sm text-sm space-y-2">
            <div className="flex justify-between text-gray-600"><span>Net Amount:</span> <span>{formatCurrency(data.po_amount_net || data.amount_net)}</span></div>
            <div className="flex justify-between text-gray-600"><span>VAT Amount:</span> <span>{formatCurrency(data.po_vat_amount || data.vat_amount)}</span></div>
            <div className="flex justify-between font-bold text-base text-blue-800 pt-2 border-t border-blue-200"><span>Inclusive Amount:</span> <span>{formatCurrency(data.po_amount_inclusive || data.amount_inclusive || data.temporary_po_amount)}</span></div>
          </div>

          <div><p className="text-xs text-gray-500">Notes</p><p className="text-sm bg-gray-50 p-2 rounded border border-gray-100">{data.po_notes || data.notes || 'No notes provided.'}</p></div>
          
          <div className="flex justify-end pt-2"><Button onClick={onClose}>Close</Button></div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default POPreviewModal;