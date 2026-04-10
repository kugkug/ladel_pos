import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { generateTemporaryPOCode } from '@/lib/documentFlowUtils';
import { formatCurrency } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { triggerDashboardRefresh } from '@/lib/dashboardDataUtils';

const AddPOModal = ({ isOpen, onClose, project, prefillData, onSaveSuccess }) => {
  const { toast } = useToast();
  const [poType, setPoType] = useState('Customer PO');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    po_number: '',
    po_date: new Date().toISOString().split('T')[0],
    amount_net: '',
    tax_type: 'VAT (12%)',
    payment_terms: 'COD',
    customer_po_number: '',
    temporary_po_code: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (prefillData) {
        const isVatExempt = prefillData.tax_type === 'VAT Exempt';
        setPoType('Temporary PO');
        setFormData(prev => ({ 
          ...prev, 
          amount_net: prefillData.amount, 
          tax_type: isVatExempt ? 'VAT Exempt' : 'VAT (12%)'
        }));
        generateTemporaryPOCode(supabase).then(code => setFormData(p => ({...p, temporary_po_code: code, po_number: code})));
      } else {
        setPoType('Customer PO');
        setFormData({ 
          po_number: '', po_date: new Date().toISOString().split('T')[0], amount_net: '', tax_type: 'VAT (12%)', 
          payment_terms: 'COD', customer_po_number: '', temporary_po_code: '', notes: '' 
        });
      }
    }
  }, [isOpen, prefillData]);

  const net = parseFloat(formData.amount_net) || 0;
  const vat = formData.tax_type === 'VAT (12%)' ? net * 0.12 : 0;
  const inclusive = net + vat;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { 
        po_type: poType, 
        po_number: formData.po_number || (poType === 'Temporary PO' ? formData.temporary_po_code : formData.customer_po_number),
        po_date: formData.po_date,
        po_amount_net: net,
        po_tax_type: formData.tax_type,
        po_vat_amount: vat,
        po_amount_inclusive: inclusive,
        temporary_po_amount: inclusive, 
        payment_terms: formData.payment_terms, 
        po_notes: formData.notes,
        po_created_at: new Date().toISOString() 
      };
      
      if (poType === 'Temporary PO') {
        payload.temporary_po_code = formData.temporary_po_code;
        payload.customer_po_number = null;
      } else {
        payload.customer_po_number = formData.customer_po_number || formData.po_number;
        payload.temporary_po_code = null;
      }
      
      const { error } = await supabase.from('projects').update(payload).eq('id', project.id);
      if (error) throw error;
      
      toast({ title: 'Success', description: 'Purchase Order generated successfully' });
      triggerDashboardRefresh(); // Recalculate real-time dashboard metrics
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
      <DialogContent className="w-[min(900px,96vw)] max-w-none h-[90vh] flex flex-col bg-white p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b sticky top-0 bg-white z-10">
          <DialogTitle>{prefillData ? 'Generate PO from Quotation' : 'Add Purchase Order'}</DialogTitle>
        </DialogHeader>
        
        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex gap-6 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-sm">
              <input type="radio" checked={poType === 'Customer PO'} onChange={() => {setPoType('Customer PO'); setFormData(p => ({...p, po_number: p.customer_po_number}));}} className="w-5 h-5 text-blue-600" /> Customer PO
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-medium text-sm">
              <input type="radio" checked={poType === 'Temporary PO'} onChange={() => {setPoType('Temporary PO'); generateTemporaryPOCode(supabase).then(c => setFormData(p => ({...p, temporary_po_code: c, po_number: c})));}} className="w-5 h-5 text-blue-600" /> Temporary PO
            </label>
          </div>
          
          <form id="addPOForm" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {poType === 'Temporary PO' ? (
                <div><Label>PO Number (Temp Code)</Label><Input value={formData.temporary_po_code} readOnly className="bg-gray-50 mt-1 font-mono" /></div>
              ) : (
                <div><Label>PO Number <span className="text-red-500">*</span></Label><Input required value={formData.po_number} onChange={e => setFormData({...formData, po_number: e.target.value, customer_po_number: e.target.value})} placeholder="e.g., PO-2024-001" className="mt-1" /></div>
              )}
              <div><Label>PO Date <span className="text-red-500">*</span></Label><Input type="date" required value={formData.po_date} onChange={e => setFormData({...formData, po_date: e.target.value})} className="mt-1" /></div>
              
              <div><Label>Net Amount <span className="text-red-500">*</span></Label><Input type="number" step="0.01" min="0" required value={formData.amount_net} onChange={e => setFormData({...formData, amount_net: e.target.value})} placeholder="Enter PO amount (before tax)" className="mt-1" /></div>
              <div>
                <Label>Tax Type</Label>
                <select value={formData.tax_type} onChange={e => setFormData({...formData, tax_type: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1">
                  <option value="VAT (12%)">VAT (12%)</option><option value="VAT Exempt">VAT Exempt</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <Label>Payment Terms <span className="text-red-500">*</span></Label>
                <select required value={formData.payment_terms} onChange={e => setFormData({...formData, payment_terms: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1">
                  <option value="COD">COD</option><option value="15 days">15 days</option><option value="30 days">30 days</option><option value="60 days">60 days</option><option value="50% DP & 50% upon completion">50% DP & 50% upon completion</option>
                </select>
              </div>
            </div>

            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 shadow-sm text-sm">
              <div className="flex justify-between text-gray-600 mb-1"><span>Net Amount:</span> <span>{formatCurrency(net)}</span></div>
              <div className="flex justify-between text-gray-600 mb-2"><span>VAT Amount:</span> <span>{formatCurrency(vat)}</span></div>
              <div className="flex justify-between font-bold text-base text-blue-800 pt-2 border-t border-blue-200"><span>Inclusive Amount:</span> <span>{formatCurrency(inclusive)}</span></div>
            </div>

            <div><Label>Notes</Label><Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="mt-1 min-h-[100px]" placeholder="Optional notes" /></div>
          </form>
        </div>
        
        <div className="px-6 py-4 border-t sticky bottom-0 bg-white z-10 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="min-h-[44px] px-6">Cancel</Button>
          <Button type="submit" form="addPOForm" disabled={isSubmitting} className="bg-blue-600 text-white min-h-[44px] px-6">
            {isSubmitting ? <Loader2 className="animate-spin w-4 h-4 mr-2"/> : "Save Purchase Order"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default AddPOModal;