import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import InvoicePreviewModal from './InvoicePreviewModal';
import { Trash2, Eye } from 'lucide-react';
import { calculateInvoiceStatus, calculateInvoiceDueDate } from '@/lib/documentFlowUtils';

const InvoiceEditModal = ({ isOpen, onClose, data, project, onSaveSuccess }) => {
  const { toast } = useToast();
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({ invoice_number: '', invoice_date: '', base_amount: '', tax_type: '', invoice_issue_status: '', payment_terms: '', notes: '' });

  useEffect(() => {
    if (data && isOpen) {
      setFormData({
        invoice_number: data.invoice_number, invoice_date: data.invoice_date, base_amount: data.base_amount, 
        tax_type: data.tax_type, invoice_issue_status: data.invoice_issue_status, payment_terms: data.payment_terms || project?.payment_terms || 'COD', notes: data.notes || ''
      });
    }
  }, [data, isOpen, project]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const baseAmt = parseFloat(formData.base_amount) || 0;
      const dueDate = calculateInvoiceDueDate(formData.invoice_date, formData.payment_terms);
      
      const payload = {
        invoice_number: formData.invoice_number, 
        invoice_date: formData.invoice_date, 
        base_amount: baseAmt,
        tax_type: formData.tax_type, 
        invoice_issue_status: formData.invoice_issue_status, 
        due_date: dueDate, 
        payment_terms: formData.payment_terms, 
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
        <DialogContent className="max-w-md bg-white p-6">
          <DialogHeader><DialogTitle>Edit Invoice</DialogTitle></DialogHeader>
          <div className="bg-yellow-50 text-yellow-800 text-sm p-2 rounded mb-4">Values will be auto-calculated. Payment terms follow project.</div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Invoice Number</Label><Input required value={formData.invoice_number} onChange={e => setFormData({...formData, invoice_number: e.target.value})} className="mt-1" /></div>
              <div><Label>Invoice Date</Label><Input type="date" required value={formData.invoice_date} onChange={e => setFormData({...formData, invoice_date: e.target.value})} className="mt-1" /></div>
              <div><Label>Base Amount</Label><Input type="number" step="0.01" required value={formData.base_amount} onChange={e => setFormData({...formData, base_amount: e.target.value})} className="mt-1" /></div>
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
            </div>
            <div><Label>Notes</Label><Input value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="mt-1" /></div>
            <div className="flex justify-between items-center pt-4 border-t">
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
      <InvoicePreviewModal isOpen={showPreview} onClose={() => setShowPreview(false)} data={data} />
    </>
  );
};
export default InvoiceEditModal;