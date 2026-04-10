import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export const AddQuotationModal = ({ isOpen, onClose, onSave, projectId, initialData }) => {
  const [formData, setFormData] = useState({ quotation_number: '', date_issued: new Date().toISOString().split('T')[0], net_amount: '', status: 'Draft' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) setFormData({ ...initialData, date_issued: initialData.date_issued || new Date().toISOString().split('T')[0] });
    else setFormData({ quotation_number: '', date_issued: new Date().toISOString().split('T')[0], net_amount: '', status: 'Draft' });
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(initialData ? initialData.id : { ...formData, project_id: projectId }, initialData ? formData : null);
      onClose();
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const net = parseFloat(formData.net_amount) || 0;
  const vat = net * 0.12;
  const gross = net + vat;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-white p-6">
        <DialogHeader><DialogTitle>{initialData ? 'Edit Quotation' : 'Add Quotation'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div><Label>QT Number</Label><Input required value={formData.quotation_number} onChange={e => setFormData({...formData, quotation_number: e.target.value})} placeholder="QT-123" /></div>
          <div><Label>Date Issued</Label><Input type="date" required value={formData.date_issued} onChange={e => setFormData({...formData, date_issued: e.target.value})} /></div>
          <div><Label>Net Amount (₱)</Label><Input type="number" step="0.01" required value={formData.net_amount} onChange={e => setFormData({...formData, net_amount: e.target.value})} placeholder="0.00" /></div>
          
          <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
            <div className="flex justify-between"><span>VAT (12%):</span> <span>₱{vat.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-blue-700"><span>Gross Amount:</span> <span>₱{gross.toFixed(2)}</span></div>
          </div>

          <div>
            <Label>Status</Label>
            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full mt-1 border border-gray-200 rounded-md p-2 text-sm bg-white">
              <option value="Draft">Draft</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white">{isSubmitting ? <Loader2 className="animate-spin w-4 h-4 mr-2"/> : null} Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
export const EditQuotationModal = AddQuotationModal;

// Generic Builder for other documents
const createDocumentModal = (title, fields, defaultStatusOpts) => {
  return ({ isOpen, onClose, onSave, projectId, initialData }) => {
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
      const initial = {};
      fields.forEach(f => initial[f.key] = f.default || '');
      initial.status = defaultStatusOpts[0];
      if (initialData) setFormData({ ...initialData });
      else setFormData(initial);
    }, [initialData, isOpen]);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        await onSave(initialData ? initialData.id : { ...formData, project_id: projectId }, initialData ? formData : null);
        onClose();
      } catch (err) {
        toast({ title: 'Error', description: err.message, variant: 'destructive' });
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-md bg-white p-6">
          <DialogHeader><DialogTitle>{initialData ? `Edit ${title}` : `Add ${title}`}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {fields.map(f => (
              <div key={f.key}>
                <Label>{f.label}</Label>
                <Input type={f.type || 'text'} step={f.step} required value={formData[f.key] || ''} onChange={e => setFormData({...formData, [f.key]: e.target.value})} />
              </div>
            ))}
            <div>
              <Label>Status</Label>
              <select value={formData.status || defaultStatusOpts[0]} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full mt-1 border border-gray-200 rounded-md p-2 text-sm bg-white">
                {defaultStatusOpts.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white">{isSubmitting ? <Loader2 className="animate-spin w-4 h-4 mr-2"/> : null} Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  };
};

export const AddPurchaseOrderModal = createDocumentModal('Purchase Order', [
  { key: 'po_number', label: 'PO Number' }, { key: 'date_issued', label: 'Date Issued', type: 'date', default: new Date().toISOString().split('T')[0] }, { key: 'amount', label: 'Amount (₱)', type: 'number', step: '0.01' }
], ['Pending', 'Confirmed']);
export const EditPurchaseOrderModal = AddPurchaseOrderModal;

export const AddDeliveryReceiptModal = createDocumentModal('Delivery Receipt', [
  { key: 'dr_number', label: 'DR Number' }, { key: 'date_delivered', label: 'Date Delivered', type: 'date', default: new Date().toISOString().split('T')[0] }
], ['Pending', 'Completed DR']);
export const EditDeliveryReceiptModal = AddDeliveryReceiptModal;

export const AddInvoiceModal = createDocumentModal('Invoice', [
  { key: 'invoice_number', label: 'Invoice Number' }, { key: 'date_issued', label: 'Date Issued', type: 'date', default: new Date().toISOString().split('T')[0] }
], ['Pending', 'Sent', 'Paid']);
export const EditInvoiceModal = AddInvoiceModal;

export const AddAcknowledgementReceiptModal = createDocumentModal('Acknowledgement Receipt', [
  { key: 'ar_number', label: 'AR Number' }, { key: 'date_issued', label: 'Date Issued', type: 'date', default: new Date().toISOString().split('T')[0] }
], ['Pending', 'Completed AR']);
export const EditAcknowledgementReceiptModal = AddAcknowledgementReceiptModal;