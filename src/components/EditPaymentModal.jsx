import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import PaymentPreviewModal from './PaymentPreviewModal';
import { Trash2, Eye } from 'lucide-react';
import { calculatePaymentStatus } from '@/lib/documentFlowUtils';

const EditPaymentModal = ({ isOpen, onClose, data, project, invoices, onSaveSuccess }) => {
  const { toast } = useToast();
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({ invoice_id: '', payment_date: '', amount_paid: '', payment_method: '', reference_no: '', notes: '' });
  const unpaidInvoices = invoices.filter(inv => inv.invoice_issue_status !== 'Canceled');

  useEffect(() => {
    if (data && isOpen) setFormData({ invoice_id: data.invoice_id || '', payment_date: data.payment_date, amount_paid: data.amount_paid, payment_method: data.payment_method, reference_no: data.reference_no || '', notes: data.notes || '' });
  }, [data, isOpen]);

  const updateProjectPaymentStatus = async () => {
    const { data: allPayments } = await supabase.from('payments').select('amount_paid').eq('project_id', project.id);
    const totalPaid = allPayments.reduce((sum, p) => sum + Number(p.amount_paid), 0);
    const totalInvoiced = invoices.reduce((sum, inv) => sum + Number(inv.total_amount), 0);
    const newStatus = calculatePaymentStatus(totalInvoiced, totalPaid);
    await supabase.from('projects').update({ payment_status: newStatus }).eq('id', project.id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const paidAmt = parseFloat(formData.amount_paid);
    
    if (formData.invoice_id) {
      const inv = invoices.find(i => i.id === formData.invoice_id);
      if (inv && paidAmt > Number(inv.total_amount)) {
        toast({ title: 'Validation Error', description: `Amount exceeds the invoice total`, variant: 'destructive' });
        return;
      }
    }

    try {
      const { error } = await supabase.from('payments').update({...formData, amount_paid: paidAmt, invoice_id: formData.invoice_id || null}).eq('id', data.id);
      if (error) throw error;
      await updateProjectPaymentStatus();
      toast({ title: 'Success', description: 'Payment updated successfully' });
      onSaveSuccess();
      onClose();
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this Payment?')) {
      try {
        const { error } = await supabase.from('payments').delete().eq('id', data.id);
        if (error) throw error;
        await updateProjectPaymentStatus();
        toast({ title: 'Success', description: 'Payment deleted successfully' });
        onSaveSuccess();
        onClose();
      } catch (err) {
        toast({ title: 'Error', description: err.message, variant: 'destructive' });
      }
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-md bg-white p-6">
          <DialogHeader><DialogTitle>Edit Payment</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div>
              <Label>Invoice Link (Optional)</Label>
              <select value={formData.invoice_id} onChange={e => setFormData({...formData, invoice_id: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1">
                <option value="">General Project Payment</option>
                {unpaidInvoices.map(inv => (<option key={inv.id} value={inv.id}>{inv.invoice_number} (Total: {Number(inv.total_amount).toFixed(2)})</option>))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Payment Date <span className="text-red-500">*</span></Label><Input type="date" required value={formData.payment_date} onChange={e => setFormData({...formData, payment_date: e.target.value})} className="mt-1" /></div>
              <div><Label>Amount Paid <span className="text-red-500">*</span></Label><Input type="number" step="0.01" required value={formData.amount_paid} onChange={e => setFormData({...formData, amount_paid: e.target.value})} className="mt-1" /></div>
            </div>
            <div>
              <Label>Payment Method</Label>
              <select required value={formData.payment_method} onChange={e => setFormData({...formData, payment_method: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1">
                <option value="Cash">Cash</option><option value="Check">Check</option><option value="Bank Transfer">Bank Transfer</option><option value="Credit Card">Credit Card</option><option value="Other">Other</option>
              </select>
            </div>
            <div><Label>Reference No.</Label><Input value={formData.reference_no} onChange={e => setFormData({...formData, reference_no: e.target.value})} className="mt-1" /></div>
            <div><Label>Notes</Label><Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="mt-1" /></div>
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <Button type="button" variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={handleDelete}><Trash2 className="w-4 h-4 mr-2"/> Delete</Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setShowPreview(true)}><Eye className="w-4 h-4 mr-2"/> Preview</Button>
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" className="bg-blue-600 text-white">Save</Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <PaymentPreviewModal isOpen={showPreview} onClose={() => setShowPreview(false)} data={{...data, ...formData}} />
    </>
  );
};
export default EditPaymentModal;