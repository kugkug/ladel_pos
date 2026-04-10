import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { calculateDeliveryStatus } from '@/lib/documentFlowUtils';
import { logCreate, logUpdate, logStatusChange } from '@/lib/ActivityLogger';
import { useAuth } from '@/contexts/AuthContext';

const DeliveryReceiptForm = ({ isOpen, onClose, project, initialData, onSaveSuccess, onPromptInvoice }) => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInvoicePrompt, setShowInvoicePrompt] = useState(false);
  
  const [formData, setFormData] = useState({
    dr_number: '',
    dr_date: new Date().toISOString().split('T')[0],
    dr_status: 'Partial',
    notes: ''
  });

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        dr_number: initialData.dr_number || '',
        dr_date: initialData.dr_date || initialData.date_delivered || new Date().toISOString().split('T')[0],
        dr_status: initialData.dr_status || 'Partial',
        notes: initialData.notes || ''
      });
    } else if (isOpen) {
      setFormData({
        dr_number: '',
        dr_date: new Date().toISOString().split('T')[0],
        dr_status: 'Partial',
        notes: ''
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        project_id: project.id,
        dr_number: formData.dr_number,
        date_delivered: formData.dr_date,
        dr_status: formData.dr_status,
      };

      if (initialData) {
        const { error } = await supabase.from('delivery_receipts').update(payload).eq('id', initialData.id);
        if (error) throw error;
        if (currentUser) logUpdate(currentUser, 'SALES', 'DR', formData.dr_number, initialData, payload);
      } else {
        const { error } = await supabase.from('delivery_receipts').insert([payload]);
        if (error) throw error;
        if (currentUser) logCreate(currentUser, 'SALES', 'DR', formData.dr_number, payload);
      }

      // Re-calculate and update project delivery_status
      const { data: drs } = await supabase.from('delivery_receipts').select('dr_status').eq('project_id', project.id);
      const newStatus = calculateDeliveryStatus(drs);
      
      if (newStatus !== project.delivery_status) {
        await supabase.from('projects').update({ delivery_status: newStatus }).eq('id', project.id);
        if (currentUser) logStatusChange(currentUser, 'SALES', 'PROJECT_DELIVERY_STATUS', project.project_number, project.delivery_status, newStatus);
      }

      toast({ title: 'Success', description: `DR ${initialData ? 'updated' : 'created'} successfully.` });
      
      if (formData.dr_status === 'Completed') {
        setShowInvoicePrompt(true);
      } else {
        onSaveSuccess();
        onClose();
      }
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePromptAction = (createInvoice) => {
    setShowInvoicePrompt(false);
    onSaveSuccess();
    onClose();
    if (createInvoice && onPromptInvoice) {
      onPromptInvoice();
    }
  };

  if (showInvoicePrompt) {
    return (
      <Dialog open={true}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delivery Completed</DialogTitle>
            <DialogDescription>
              Delivery is marked as completed. Would you like to create an Invoice now?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => handlePromptAction(false)}>Later</Button>
            <Button onClick={() => handlePromptAction(true)} className="bg-blue-600 text-white">Create Invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-white p-6">
        <DialogHeader><DialogTitle>{initialData ? 'Edit DR' : 'Add DR'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label>DR Number</Label>
            <Input required value={formData.dr_number} onChange={e => setFormData({...formData, dr_number: e.target.value})} className="mt-1" />
          </div>
          <div>
            <Label>Date Delivered</Label>
            <Input type="date" required value={formData.dr_date} onChange={e => setFormData({...formData, dr_date: e.target.value})} className="mt-1" />
          </div>
          <div>
            <Label>Delivery Status</Label>
            <select required value={formData.dr_status} onChange={e => setFormData({...formData, dr_status: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1">
              <option value="Partial">Partial</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="mt-1" />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white">
              {isSubmitting && <Loader2 className="animate-spin w-4 h-4 mr-2"/>} Save DR
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DeliveryReceiptForm;