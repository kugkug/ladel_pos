import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';

const InvoicePreviewModal = ({ isOpen, onClose, data }) => {
  if (!data) return null;
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg bg-white p-6">
        <DialogHeader><DialogTitle>Invoice Preview</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4">
            <div><p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Invoice Number</p><p className="font-bold text-gray-900">{data.invoice_number}</p></div>
            <div><p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Invoice Date</p><p className="font-bold text-gray-900">{data.invoice_date}</p></div>
            <div><p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Due Date</p><p className="font-bold text-red-600">{data.due_date}</p></div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Issue Status</p>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${data.invoice_issue_status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{data.invoice_issue_status || 'Pending'}</span>
            </div>
            <div><p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Terms</p><p className="font-bold text-gray-900">{data.payment_terms}</p></div>
            <div><p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Tax Type</p><p className="font-bold text-gray-900">{data.tax_type}</p></div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-xl text-sm space-y-2 border border-blue-100 shadow-sm mt-4">
            <div className="flex justify-between text-gray-600"><span>Base Amount:</span> <span>{formatCurrency(data.base_amount)}</span></div>
            <div className="flex justify-between text-gray-600"><span>VAT Amount:</span> <span>{formatCurrency(data.vat_amount)}</span></div>
            <div className="flex justify-between font-bold text-lg text-blue-800 pt-2 border-t border-blue-200"><span>Total Amount:</span> <span>{formatCurrency(data.total_amount)}</span></div>
          </div>

          {data.file_url && (
             <div>
               <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Attached File</p>
               <a href={data.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-blue-600 hover:underline"><ExternalLink className="w-4 h-4"/> View Attachment</a>
             </div>
          )}

          <div><p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Notes</p><p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100">{data.notes || 'N/A'}</p></div>
          <div className="flex justify-end pt-2"><Button onClick={onClose}>Close</Button></div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default InvoicePreviewModal;