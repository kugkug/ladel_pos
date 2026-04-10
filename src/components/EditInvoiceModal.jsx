import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import InvoicePreviewModal from './InvoicePreviewModal';
import { Trash2, Eye, Loader2 } from 'lucide-react';
import { calculateInvoiceStatus, calculateInvoiceDueDate } from '@/lib/documentFlowUtils';
import { formatCurrency } from '@/lib/utils';
import FileUploadComponent from '@/components/FileUploadComponent';

const EditInvoiceModal = ({ isOpen, onClose, data, project, onSaveSuccess }) => {
  const { toast } = useToast();
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ invoice_number: '', invoice_date: '', base_amount: '', tax_type: '', invoice_issue_status: '', notes: '', file: null });

  useEffect(() => {
    if (data && isOpen) {
      setFormData({
        invoice_number: data.invoice_number, invoice_date: data.invoice_date, base_amount: data.base_amount, 
        tax_type: data.tax_type, invoice_issue_status: data.invoice_issue_status, notes: data.notes || '', file: null
      });
    }
  }, [data, isOpen, project]);

  const baseAmt = parseFloat(formData.base_amount) || 0;
  const vatAmt = formData.tax_type === 'VAT (12%)' ? baseAmt * 0.12 : 0;
  const totalAmt = baseAmt + vatAmt;
  const paymentTerms = data?.payment_terms || project?.payment_terms || 'COD';
  const dueDate = calculateInvoiceDueDate(formData.invoice_date, paymentTerms);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (baseAmt <= 0) {
      toast({title: "Validation Error", description: "Amount must be greater than zero.", variant: "destructive"});
      return;
    }
    
    setIsSubmitting(true);
    try {
      const payload = {
        invoice_number: formData.invoice_number, 
        invoice_date: formData.invoice_date, 
        base_amount: baseAmt,
        tax_type: formData.tax_type, 
        invoice_issue_status: formData.invoice_issue_status, 
        due_date: dueDate, 
        payment_terms: paymentTerms, 
        notes: formData.notes
      };

      // Explicitly remove generated columns
      delete payload.vat_amount;
      delete payload.total_amount;

      const { error } = await supabase.from('invoices').update(payload).eq('id', data.id);
      if (error) throw error;
      
      const { data: invs } = await supabase.from('invoices').select('invoice_issue_status').eq('project_id', project.id);
      const newStatus = calculateInvoiceStatus(invs);
      await supabase.from('projects').update({ invoice_status: newStatus }).eq('id', project.id);

      toast({ title: 'Success', description: 'Invoice updated successfully' });
      onSaveSuccess();
      onClose();
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this Invoice?')) {
      try {
        const { error } = await supabase.from('invoices').delete().eq('id', data.id);
        if (error) throw error;
        
        const { data: invs } = await supabase.from('invoices').select('invoice_issue_status').eq('project_id', project.id);
        const newStatus = calculateInvoiceStatus(invs);
        await supabase.from('projects').update({ invoice_status: newStatus }).eq('id', project.id);

        toast({ title: 'Success', description: 'Invoice deleted successfully' });
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
        <DialogContent className="w-[min(900px,96vw)] max-w-none h-[90vh] flex flex-col bg-white p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b sticky top-0 bg-white z-10">
            <DialogTitle>Edit Invoice</DialogTitle>
          </DialogHeader>
          
          <div className="p-6 overflow-y-auto flex-1">
            <form id="editInvoiceForm" onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><Label>Invoice Number <span className="text-red-500">*</span></Label><Input required value={formData.invoice_number} onChange={e => setFormData({...formData, invoice_number: e.target.value})} className="mt-1" /></div>
                <div><Label>Invoice Date <span className="text-red-500">*</span></Label><Input type="date" required value={formData.invoice_date} onChange={e => setFormData({...formData, invoice_date: e.target.value})} className="mt-1" /></div>
                <div><Label>Base Amount <span className="text-red-500">*</span></Label><Input type="number" step="0.01" min="0" required value={formData.base_amount} onChange={e => setFormData({...formData, base_amount: e.target.value})} className="mt-1" /></div>
                <div>
                  <Label>Tax Type</Label>
                  <select value={formData.tax_type} onChange={e => setFormData({...formData, tax_type: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1">
                    <option value="VAT (12%)">VAT (12%)</option><option value="VAT Exempt">VAT Exempt</option>
                  </select>
                </div>
                <div>
                  <Label>Issue Status</Label>
                  <select required value={formData.invoice_issue_status} onChange={e => setFormData({...formData, invoice_issue_status: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1">
                    <option value="Partial Issued">Partial Issued</option><option value="Completed Issued">Completed Issued</option>
                  </select>
                </div>
                <div><Label>Payment Terms (From Project)</Label><Input readOnly value={paymentTerms} className="mt-1 bg-gray-50 text-gray-500" /></div>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm space-y-2">
                <div className="flex justify-between text-gray-600"><span>Base Amount:</span> <span>{formatCurrency(baseAmt)}</span></div>
                <div className="flex justify-between text-gray-600"><span>VAT Amount (Calculated):</span> <span>{formatCurrency(vatAmt)}</span></div>
                <div className="flex justify-between font-bold text-base text-blue-800 border-t border-blue-200 pt-2 mt-1"><span>Total Amount (Calculated):</span> <span>{formatCurrency(totalAmt)}</span></div>
                <div className="flex justify-between text-gray-700 pt-1"><span>Computed Due Date:</span> <span className="font-semibold">{dueDate || 'N/A'}</span></div>
              </div>

              <div><Label>File Upload (Optional)</Label><div className="mt-1"><FileUploadComponent onFileSelect={(f) => setFormData({...formData, file: f})} /></div></div>
              <div><Label>Notes</Label><Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="mt-1 min-h-[100px]" /></div>
            </form>
          </div>

          <div className="px-6 py-4 border-t sticky bottom-0 bg-white z-10 flex justify-between items-center">
            <Button type="button" variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700 min-h-[44px]" onClick={handleDelete}><Trash2 className="w-4 h-4 mr-2"/> Delete</Button>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setShowPreview(true)} className="min-h-[44px]"><Eye className="w-4 h-4 mr-2"/> Preview</Button>
              <Button type="button" variant="outline" onClick={onClose} className="min-h-[44px] px-6">Cancel</Button>
              <Button type="submit" form="editInvoiceForm" disabled={isSubmitting} className="bg-blue-600 text-white min-h-[44px] px-6">
                {isSubmitting ? <Loader2 className="animate-spin w-4 h-4 mr-2"/> : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <InvoicePreviewModal isOpen={showPreview} onClose={() => setShowPreview(false)} data={{...data, ...formData, base_amount: baseAmt, vat_amount: vatAmt, total_amount: totalAmt, due_date: dueDate, payment_terms: paymentTerms}} />
    </>
  );
};
export default EditInvoiceModal;