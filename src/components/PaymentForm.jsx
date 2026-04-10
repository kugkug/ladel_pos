import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { calculatePaymentStatus } from '@/lib/documentFlowUtils';
import { logCreate } from '@/lib/ActivityLogger';
import { useAuth } from '@/contexts/AuthContext';

const PaymentForm = ({ isOpen, onClose, project, invoices, onSaveSuccess }) => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    invoice_id: '',
    payment_date: new Date().toISOString().split('T')[0],
    amount_paid: '',
    payment_method: 'Bank Transfer',
    reference_no: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        invoice_id: '',
        payment_date: new Date().toISOString().split('T')[0],
        amount_paid: '',
        payment_method: 'Bank Transfer',
        reference_no: '',
        notes: ''
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        project_id: project.id,
        invoice_id: formData.invoice_id || null,
        payment_date: formData.payment_date,
        amount_paid: parseFloat(formData.amount_paid),
        payment_method: formData.payment_method,
        reference_no: formData.reference_no,
        notes: formData.notes
      };

      const { error } = await supabase.from('payments').insert([payload]);
      if (error) throw error;
      if (currentUser) logCreate(currentUser, 'SALES', 'PAYMENT', `Payment for ${project.project_number}`, payload);

      // Recalculate project payment_status
      const { data: allPayments } = await supabase.from('payments').select('amount_paid').eq('project_id', project.id);
      const totalPaid = allPayments.reduce((sum, p) => sum + Number(p.amount_paid), 0);
      const totalInvoiced = invoices.reduce((sum, inv) => sum + Number(inv.total_amount), 0);
      const newStatus = calculatePaymentStatus(totalInvoiced, totalPaid);

      if (newStatus !== project.payment_status) {
        await supabase.from('projects').update({ payment_status: newStatus }).eq('id', project.id);
      }

      toast({ title: 'Success', description: 'Payment recorded successfully.' });
      onSaveSuccess();
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
        <DialogHeader><DialogTitle>Add Payment</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label>Invoice (Optional)</Label>
            <select value={formData.invoice_id} onChange={e => setFormData({...formData, invoice_id: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1">
              <option value="">General Project Payment</option>
              {invoices.map(inv => (
                <option key={inv.id} value={inv.id}>{inv.invoice_number} ({Number(inv.total_amount).toFixed(2)})</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Payment Date</Label>
            <Input type="date" required value={formData.payment_date} onChange={e => setFormData({...formData, payment_date: e.target.value})} className="mt-1" />
          </div>
          <div>
            <Label>Amount Paid</Label>
            <Input type="number" step="0.01" min="0.01" required value={formData.amount_paid} onChange={e => setFormData({...formData, amount_paid: e.target.value})} className="mt-1" />
          </div>
          <div>
            <Label>Payment Method</Label>
            <select value={formData.payment_method} onChange={e => setFormData({...formData, payment_method: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1">
              <option value="Cash">Cash</option>
              <option value="Check">Check</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <Label>Reference No.</Label>
            <Input value={formData.reference_no} onChange={e => setFormData({...formData, reference_no: e.target.value})} className="mt-1" placeholder="Transaction ID, Check No." />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="mt-1" />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white">
              {isSubmitting && <Loader2 className="animate-spin w-4 h-4 mr-2"/>} Save Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentForm;