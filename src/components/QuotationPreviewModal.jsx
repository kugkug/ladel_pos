import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Info } from 'lucide-react';

const QuotationPreviewModal = ({ isOpen, onClose, data }) => {
  if (!data) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl bg-white p-6">
        <DialogHeader><DialogTitle>Quotation Preview</DialogTitle></DialogHeader>
        <div className="space-y-6 mt-2">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
            <div><p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Quotation Number</p><p className="font-bold text-gray-900">{data.quotation_number}</p></div>
            <div><p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Date Issued</p><p className="font-medium text-gray-900">{data.date_issued}</p></div>
            <div><p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Status</p>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${data.quotation_status === 'Confirmed' ? 'bg-green-100 text-green-700' : data.quotation_status === 'Canceled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {data.quotation_status}
              </span>
            </div>
          </div>
          
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Order Description</p>
            <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-wrap">{data.order_description || 'N/A'}</p>
          </div>

          <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 text-sm space-y-3 relative">
            <div className="flex justify-between text-gray-600">
              <span>Amount (Before Tax):</span> 
              <span className="font-medium">{formatCurrency(data.net_amount)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax Type:</span> 
              <span>{data.tax_type || 'VAT (12%)'}</span>
            </div>
            
            <div className="pt-3 border-t border-blue-100 space-y-2">
              <div className="flex justify-between text-gray-700 items-center">
                <span className="flex items-center gap-1.5">
                  VAT Amount <Info className="w-3.5 h-3.5 text-blue-400" />
                </span> 
                <span className="font-medium">{formatCurrency(data.vat_amount)}</span>
              </div>
              <div className="flex justify-between font-bold text-xl text-blue-900 items-center">
                <span className="flex flex-col">
                  Total Amount
                  <span className="text-[10px] font-normal text-blue-500 uppercase tracking-wider mt-0.5">Auto-calculated</span>
                </span> 
                <span>{formatCurrency(data.gross_amount)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2"><Button onClick={onClose}>Close</Button></div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuotationPreviewModal;