import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import POPreviewModal from './POPreviewModal';
import { Trash2, Eye } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { generateTemporaryPOCode } from '@/lib/documentFlowUtils';
import { triggerDashboardRefresh } from '@/lib/dashboardDataUtils';

const POEditModal = ({ isOpen, onClose, data, onSaveSuccess }) => {
  const { toast } = useToast();
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({ 
    po_type: 'Customer PO', po_number: '', po_date: '', amount_net: '', tax_type: 'VAT (12%)', 
    payment_terms: '', customer_po_number: '', temporary_po_code: '', notes: '' 
  });

  useEffect(() => {
    if (data && isOpen) {
      setFormData({
        po_type: data.po_type || 'Customer PO',
        po_number: data.po_number || data.customer_po_number || data.temporary_po_code || '',
        po_date: data.po_date || new Date(data.po_created_at || Date.now()).toISOString().split('T')[0],
        amount_net: data.po_amount_net || data.temporary_po_amount || '',
        tax_type: data.po_tax_type || 'VAT (12%)',
        payment_terms: data.payment_terms || 'COD',
        customer_po_number: data.customer_po_number || '',
        temporary_po_code: data.temporary_po_code || '',
        notes: data.po_notes || ''
      });
    }
  }, [data, isOpen]);

  const net = parseFloat(formData.amount_net) || 0;
  const vat = formData.tax_type === 'VAT (12%)' ? net * 0.12 : 0;
  const inclusive = net + vat;

  const handlePoTypeChange = async (type) => {
    setFormData(prev => ({...prev, po_type: type}));
    if (type === 'Temporary PO' && !formData.temporary_po_code) {
      const code = await generateTemporaryPOCode(supabase);
      setFormData(prev => ({...prev, temporary_po_code: code, po_number: code}));
    } else if (type === 'Customer PO') {
      setFormData(prev => ({...prev, po_number: prev.customer_po_number}));
    } else if (type === 'Temporary PO') {
      setFormData(prev => ({...prev, po_number: prev.temporary_po_code}));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
        po_type: formData.po_type, 
        po_number: formData.po_number || (formData.po_type === 'Temporary PO' ? formData.temporary_po_code : formData.customer_po_number),
        po_date: formData.po_date,
        po_amount_net: net,
        po_tax_type: formData.tax_type,
        po_vat_amount: vat,
        po_amount_inclusive: inclusive,
        temporary_po_amount: inclusive,
        payment_terms: formData.payment_terms, 
        po_notes: formData.notes
      };
      
      if (formData.po_type === 'Temporary PO') {
        payload.temporary_po_code = formData.temporary_po_code || formData.po_number;
        payload.customer_po_number = null;
      } else {
        payload.customer_po_number = formData.customer_po_number || formData.po_number;
        payload.temporary_po_code = null;
      }

      const { error } = await supabase.from('projects').update(payload).eq('id', data.id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Purchase Order updated successfully' });
      triggerDashboardRefresh(); // Recalculate real-time dashboard metrics
      onSaveSuccess();
      onClose();
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this Purchase Order?')) {
      try {
        const { error } = await supabase.from('projects').update({
          po_type: null, po_number: null, po_date: null, po_amount_net: null, po_tax_type: null, 
          po_vat_amount: null, po_amount_inclusive: null, po_notes: null,
          payment_terms: null, customer_po_number: null, temporary_po_code: null, temporary_po_amount: null, po_created_at: null
        }).eq('id', data.id);
        if (error) throw error;
        toast({ title: 'Success', description: 'Purchase Order deleted successfully' });
        triggerDashboardRefresh(); // Recalculate real-time dashboard metrics
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
        <DialogContent className="max-w-xl bg-white p-6">
          <DialogHeader><DialogTitle>Edit Purchase Order</DialogTitle></DialogHeader>
          <div className="flex gap-6 mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-sm">
              <input type="radio" checked={formData.po_type === 'Customer PO'} onChange={() => handlePoTypeChange('Customer PO')} className="w-4 h-4 text-blue-600" /> Customer PO
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-medium text-sm">
              <input type="radio" checked={formData.po_type === 'Temporary PO'} onChange={() => handlePoTypeChange('Temporary PO')} className="w-4 h-4 text-blue-600" /> Temporary PO
            </label>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              {formData.po_type === 'Temporary PO' ? (
                <div><Label>PO Number (Temp Code)</Label><Input required value={formData.po_number} onChange={e => setFormData({...formData, po_number: e.target.value, temporary_po_code: e.target.value})} className="mt-1 font-mono" /></div>
              ) : (
                <div><Label>PO Number <span className="text-red-500">*</span></Label><Input required value={formData.po_number} onChange={e => setFormData({...formData, po_number: e.target.value, customer_po_number: e.target.value})} className="mt-1" /></div>
              )}
              <div><Label>PO Date <span className="text-red-500">*</span></Label><Input type="date" required value={formData.po_date} onChange={e => setFormData({...formData, po_date: e.target.value})} className="mt-1" /></div>
              
              <div><Label>Net Amount <span className="text-red-500">*</span></Label><Input type="number" step="0.01" min="0" required value={formData.amount_net} onChange={e => setFormData({...formData, amount_net: e.target.value})} className="mt-1" /></div>
              <div>
                <Label>Tax Type</Label>
                <select value={formData.tax_type} onChange={e => setFormData({...formData, tax_type: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1">
                  <option value="VAT (12%)">VAT (12%)</option><option value="VAT Exempt">VAT Exempt</option>
                </select>
              </div>
              
              <div className="col-span-2">
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

            <div><Label>Notes</Label><Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="mt-1" /></div>
            
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
      <POPreviewModal isOpen={showPreview} onClose={() => setShowPreview(false)} data={{...data, ...formData, po_amount_net: net, po_vat_amount: vat, po_amount_inclusive: inclusive}} />
    </>
  );
};
export default POEditModal;