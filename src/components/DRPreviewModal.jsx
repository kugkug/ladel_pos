import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

const DRPreviewModal = ({ isOpen, onClose, data }) => {
  if (!data) return null;
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-white p-6">
        <DialogHeader><DialogTitle>Delivery Receipt Preview</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-y-4">
            <div><p className="text-xs text-gray-500 uppercase tracking-wider mb-1">DR Number</p><p className="font-bold text-gray-900">{data.dr_number}</p></div>
            <div><p className="text-xs text-gray-500 uppercase tracking-wider mb-1">DR Date</p><p className="font-bold text-gray-900">{data.date_delivered}</p></div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Status</p>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${data.dr_status === 'Partial' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{data.dr_status || 'Completed'}</span>
            </div>
          </div>
          
          {data.file_url && (
             <div>
               <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Attached File</p>
               <a href={data.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-blue-600 hover:underline"><ExternalLink className="w-4 h-4"/> View Attachment</a>
             </div>
          )}

          <div><p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Notes</p><p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100">{data.notes || 'N/A'}</p></div>
          <div className="flex justify-end pt-4"><Button onClick={onClose}>Close</Button></div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default DRPreviewModal;