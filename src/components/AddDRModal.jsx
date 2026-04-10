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
import { logCreate, logStatusChange } from '@/lib/ActivityLogger';
import { useAuth } from '@/contexts/AuthContext';
import FileUploadComponent from '@/components/FileUploadComponent';
import { triggerDashboardRefresh } from '@/lib/dashboardDataUtils';

const AddDRModal = ({ isOpen, onClose, project, onSaveSuccess, onPromptInvoice }) => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInvoicePrompt, setShowInvoicePrompt] = useState(false);
  
  const [formData, setFormData] = useState({
    dr_number: '',
    dr_date: new Date().toISOString().split('T')[0],
    dr_status: 'Partial',
    notes: '',
    file: null
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        dr_number: '', dr_date: new Date().toISOString().split('T')[0],
        dr_status: 'Partial', notes: '', file: null
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        project_id: project.id,
        dr_number: formData.dr_number,
        date_delivered: formData.dr_date,
        dr_status: formData.dr_status,
        notes: formData.notes
      };

      const { error } = await supabase.from('delivery_receipts').insert([payload]);
      if (error) throw error;
      if (currentUser) logCreate(currentUser, 'SALES', 'DR', formData.dr_number, payload);

      const { data: drs } = await supabase.from('delivery_receipts').select('dr_status').eq('project_id', project.id);
      const newStatus = calculateDeliveryStatus(drs);
      
      if (newStatus !== project.delivery_status) {
        await supabase.from('projects').update({ delivery_status: newStatus }).eq('id', project.id);
        if (currentUser) logStatusChange(currentUser, 'SALES', 'PROJECT_DELIVERY_STATUS', project.project_number, project.delivery_status, newStatus);
      }

      toast({ title: 'Success', description: 'DR created successfully.' });
      
      triggerDashboardRefresh(); // Recalculate real-time dashboard metrics

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
    if (createInvoice && onPromptInvoice) onPromptInvoice();
  };

  if (showInvoicePrompt) {
    return (
      <Dialog open={true}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delivery Completed</DialogTitle>
            <DialogDescription>Delivery is marked as completed. Would you like to create an Invoice now?</DialogDescription>
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
      <DialogContent className="w-[min(900px,96vw)] max-w-none h-[90vh] flex flex-col bg-white p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b sticky top-0 bg-white z-10">
          <DialogTitle>Add Delivery Receipt</DialogTitle>
        </DialogHeader>
        
        <div className="p-6 overflow-y-auto flex-1">
          <form id="addDRForm" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><Label>DR Number <span className="text-red-500">*</span></Label><Input required value={formData.dr_number} onChange={e => setFormData({...formData, dr_number: e.target.value})} className="mt-1" /></div>
              <div><Label>Date Delivered <span className="text-red-500">*</span></Label><Input type="date" required value={formData.dr_date} onChange={e => setFormData({...formData, dr_date: e.target.value})} className="mt-1" /></div>
              <div className="md:col-span-2">
                <Label>Delivery Status <span className="text-red-500">*</span></Label>
                <select required value={formData.dr_status} onChange={e => setFormData({...formData, dr_status: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1">
                  <option value="Partial">Partial</option><option value="Completed">Completed</option>
                </select>
              </div>
            </div>
            
            <div><Label>File Upload (Optional)</Label><div className="mt-1"><FileUploadComponent onFileSelect={(f) => setFormData({...formData, file: f})} /></div></div>
            <div><Label>Notes</Label><Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="mt-1 min-h-[100px]" /></div>
          </form>
        </div>

        <div className="px-6 py-4 border-t sticky bottom-0 bg-white z-10 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="min-h-[44px] px-6">Cancel</Button>
          <Button type="submit" form="addDRForm" disabled={isSubmitting} className="bg-blue-600 text-white min-h-[44px] px-6">
            {isSubmitting && <Loader2 className="animate-spin w-4 h-4 mr-2"/>} Save DR
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddDRModal;