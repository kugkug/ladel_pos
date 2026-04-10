import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { generateTemporaryPOCode } from '@/lib/documentFlowUtils';
import { logUpdate } from '@/lib/ActivityLogger';
import { useAuth } from '@/contexts/AuthContext';

const TemporaryPOModal = ({ isOpen, onClose, project, quotationTotal, onSaveSuccess }) => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [poMode, setPoMode] = useState('Temporary PO'); // 'Temporary PO' or 'Customer PO'
  
  const [formData, setFormData] = useState({
    customer_po_number: '',
    temporary_po_code: '',
    temporary_po_amount: quotationTotal || 0,
    payment_terms: 'COD'
  });

  useEffect(() => {
    if (isOpen && poMode === 'Temporary PO') {
      const fetchCode = async () => {
        try {
          const code = await generateTemporaryPOCode(supabase);
          setFormData(prev => ({ ...prev, temporary_po_code: code }));
        } catch (error) {
          toast({ title: 'Error', description: 'Failed to generate PO Code', variant: 'destructive' });
        }
      };
      fetchCode();
    }
  }, [isOpen, poMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const updatePayload = {
        po_type: poMode,
        payment_terms: formData.payment_terms,
        po_created_at: new Date().toISOString(),
      };

      if (poMode === 'Temporary PO') {
        updatePayload.temporary_po_code = formData.temporary_po_code;
        updatePayload.temporary_po_amount = formData.temporary_po_amount;
        updatePayload.customer_po_number = null;
      } else {
        if (!formData.customer_po_number) throw new Error('Customer PO Number is required');
        updatePayload.customer_po_number = formData.customer_po_number;
        updatePayload.temporary_po_code = null;
        updatePayload.temporary_po_amount = null;
      }

      const { error } = await supabase.from('projects').update(updatePayload).eq('id', project.id);
      if (error) throw error;

      if (currentUser) {
        logUpdate(currentUser, 'SALES', 'PROJECT', project.project_number, project, updatePayload, `Generated ${poMode}`);
      }

      toast({ title: 'Success', description: `${poMode} saved successfully.` });
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
        <DialogHeader><DialogTitle>Generate Purchase Order</DialogTitle></DialogHeader>
        
        <div className="flex gap-4 mb-4 mt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="poMode" checked={poMode === 'Temporary PO'} onChange={() => setPoMode('Temporary PO')} />
            <span className="text-sm font-medium">Temporary PO</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="poMode" checked={poMode === 'Customer PO'} onChange={() => setPoMode('Customer PO')} />
            <span className="text-sm font-medium">Customer PO</span>
          </label>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {poMode === 'Temporary PO' ? (
            <>
              <div>
                <Label>Temporary PO Code (Auto-generated)</Label>
                <Input readOnly value={formData.temporary_po_code} className="mt-1 bg-gray-50 text-gray-500 font-mono" />
              </div>
              <div>
                <Label>Amount</Label>
                <Input type="number" step="0.01" min="0.01" required value={formData.temporary_po_amount} onChange={e => setFormData({...formData, temporary_po_amount: e.target.value})} className="mt-1" />
              </div>
            </>
          ) : (
            <div>
              <Label>Customer PO Number</Label>
              <Input required value={formData.customer_po_number} onChange={e => setFormData({...formData, customer_po_number: e.target.value})} className="mt-1" />
            </div>
          )}

          <div>
            <Label>Payment Terms</Label>
            <select required value={formData.payment_terms} onChange={e => setFormData({...formData, payment_terms: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1">
              <option value="COD">COD</option>
              <option value="50% DP & 50% upon completion">50% DP & 50% upon completion</option>
              <option value="15 days">15 days</option>
              <option value="30 days">30 days</option>
              <option value="60 days">60 days</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || (poMode === 'Temporary PO' && !formData.temporary_po_code)} className="bg-blue-600 text-white">
              {isSubmitting && <Loader2 className="animate-spin w-4 h-4 mr-2"/>} Generate
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TemporaryPOModal;