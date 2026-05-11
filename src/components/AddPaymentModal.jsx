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

const AddPaymentModal = ({ isOpen, onClose, project, invoices, onSaveSuccess }) => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const unpaidInvoices = invoices.filter(inv => inv.invoice_issue_status !== 'Canceled');
  
  const [formData, setFormData] = useState({
    invoice_id: '', 
    payment_date: new Date().toISOString().split('T')[0], 
    amount_paid: '', 
    payment_method: 'Bank Transfer', 
    arNumber: '', 
    notes: '',
    markProjectFullyPaid: false
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData({ 
        invoice_id: '', 
        payment_date: new Date().toISOString().split('T')[0], 
        amount_paid: '', 
        payment_method: 'Bank Transfer', 
        arNumber: '', 
        notes: '',
        markProjectFullyPaid: false
      });
      setErrors({});
    }
  }, [isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!formData.payment_date) newErrors.payment_date = "Payment Date is required";
    if (!formData.amount_paid || isNaN(formData.amount_paid) || Number(formData.amount_paid) <= 0) {
      newErrors.amount_paid = "Amount Paid must be greater than 0";
    }
    if (!formData.arNumber || !formData.arNumber.trim()) {
      newErrors.arNumber = "AR Number is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for the field being typed in
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    const paidAmt = parseFloat(formData.amount_paid);
    
    // Validation: prevent paying more than invoice total (if linked)
    if (formData.invoice_id) {
      const inv = invoices.find(i => i.id === formData.invoice_id);
      if (inv && paidAmt > Number(inv.total_amount)) {
        toast({ title: 'Validation Error', description: `Amount exceeds the invoice total of ${Number(inv.total_amount).toFixed(2)}`, variant: 'destructive' });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        project_id: project.id, 
        invoice_id: formData.invoice_id || null, 
        payment_date: formData.payment_date,
        amount_paid: paidAmt, 
        payment_method: formData.payment_method, 
        reference_no: formData.arNumber.trim(), // Storing AR Number in the reference_no column
        notes: formData.notes
      };

      const { error } = await supabase.from('payments').insert([payload]);
      if (error) throw error;
      if (currentUser) logCreate(currentUser, 'SALES', 'PAYMENT', `Payment for ${project.project_number}`, payload);

      const { data: allPayments } = await supabase.from('payments').select('amount_paid').eq('project_id', project.id);
      const totalPaid = allPayments.reduce((sum, p) => sum + Number(p.amount_paid), 0);
      const totalInvoiced = invoices.reduce((sum, inv) => sum + Number(inv.total_amount), 0);
      const newStatus = calculatePaymentStatus(totalInvoiced, totalPaid);
      const finalPaymentStatus = formData.markProjectFullyPaid ? 'Paid' : newStatus;

      if (finalPaymentStatus !== project.payment_status) {
        await supabase.from('projects').update({ payment_status: finalPaymentStatus }).eq('id', project.id);
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

  const isSaveDisabled = isSubmitting || !formData.arNumber?.trim() || !formData.amount_paid;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-white p-6">
        <DialogHeader><DialogTitle>Add Payment</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          
          {/* Invoice Link */}
          <div>
            <Label>Invoice Link (Optional)</Label>
            <select 
              value={formData.invoice_id} 
              onChange={e => handleInputChange('invoice_id', e.target.value)} 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              <option value="">General Project Payment</option>
              {unpaidInvoices.map(inv => (<option key={inv.id} value={inv.id}>{inv.invoice_number} (Total: {Number(inv.total_amount).toFixed(2)})</option>))}
            </select>
          </div>
          
          {/* Payment Date & Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Payment Date <span className="text-red-500">*</span></Label>
              <Input 
                type="date" 
                value={formData.payment_date} 
                onChange={e => handleInputChange('payment_date', e.target.value)} 
                className={`mt-1 ${errors.payment_date ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-300 focus-visible:ring-blue-500'}`} 
              />
              {errors.payment_date && <p className="text-red-500 text-xs mt-1">{errors.payment_date}</p>}
            </div>
            <div>
              <Label>Amount Paid <span className="text-red-500">*</span></Label>
              <Input 
                type="number" 
                step="0.01" 
                min="0.01" 
                value={formData.amount_paid} 
                onChange={e => handleInputChange('amount_paid', e.target.value)} 
                className={`mt-1 ${errors.amount_paid ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-300 focus-visible:ring-blue-500'}`} 
              />
              {errors.amount_paid && <p className="text-red-500 text-xs mt-1">{errors.amount_paid}</p>}
            </div>
          </div>
          
          {/* Payment Method */}
          <div>
            <Label>Payment Method</Label>
            <select 
              value={formData.payment_method} 
              onChange={e => handleInputChange('payment_method', e.target.value)} 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              <option value="Cash">Cash</option>
              <option value="Check">Check</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          {/* AR Number */}
          <div>
            <Label>AR Number <span className="text-red-500">*</span></Label>
            <Input 
              value={formData.arNumber} 
              onChange={e => handleInputChange('arNumber', e.target.value)} 
              className={`mt-1 ${errors.arNumber ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-300 focus-visible:ring-blue-500'}`} 
              placeholder="Enter AR Number" 
            />
            {errors.arNumber && <p className="text-red-500 text-xs mt-1">{errors.arNumber}</p>}
          </div>
          
          {/* Notes */}
          <div>
            <Label>Notes</Label>
            <Textarea 
              value={formData.notes} 
              onChange={e => handleInputChange('notes', e.target.value)} 
              className="mt-1 border-gray-300 focus-visible:ring-blue-500" 
            />
          </div>

          {/* Mark Project Paid */}
          <div className="flex items-center gap-2">
            <input
              id="mark-project-fully-paid"
              type="checkbox"
              checked={formData.markProjectFullyPaid}
              onChange={e => handleInputChange('markProjectFullyPaid', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="mark-project-fully-paid" className="mb-0 cursor-pointer">
              Mark project as fully paid
            </Label>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button 
              type="submit" 
              disabled={isSaveDisabled} 
              className={`bg-blue-600 text-white ${isSaveDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
            >
              {isSubmitting && <Loader2 className="animate-spin w-4 h-4 mr-2"/>} 
              Save Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPaymentModal;