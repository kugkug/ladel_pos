import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import DRPreviewModal from './DRPreviewModal';
import { Trash2, Eye } from 'lucide-react';
import { calculateDeliveryStatus } from '@/lib/documentFlowUtils';
import FileUploadComponent from '@/components/FileUploadComponent';
import { triggerDashboardRefresh } from '@/lib/dashboardDataUtils';

const EditDRModal = ({ isOpen, onClose, data, project, onSaveSuccess }) => {
  const { toast } = useToast();
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({ dr_number: '', date_delivered: '', dr_status: 'Partial', notes: '', file: null });

  useEffect(() => {
    if (data && isOpen) setFormData({ dr_number: data.dr_number || '', date_delivered: data.date_delivered || '', dr_status: data.dr_status || 'Partial', notes: data.notes || '', file: null });
  }, [data, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('delivery_receipts').update({
        dr_number: formData.dr_number, date_delivered: formData.date_delivered, dr_status: formData.dr_status, notes: formData.notes
      }).eq('id', data.id);
      if (error) throw error;
      
      const { data: drs } = await supabase.from('delivery_receipts').select('dr_status').eq('project_id', project.id);
      const newStatus = calculateDeliveryStatus(drs);
      await supabase.from('projects').update({ delivery_status: newStatus }).eq('id', project.id);

      toast({ title: 'Success', description: 'Delivery Receipt updated successfully' });
      triggerDashboardRefresh(); // Recalculate real-time dashboard metrics
      onSaveSuccess();
      onClose();
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this Delivery Receipt?')) {
      try {
        const { error } = await supabase.from('delivery_receipts').delete().eq('id', data.id);
        if (error) throw error;
        
        const { data: drs } = await supabase.from('delivery_receipts').select('dr_status').eq('project_id', project.id);
        const newStatus = calculateDeliveryStatus(drs);
        await supabase.from('projects').update({ delivery_status: newStatus }).eq('id', project.id);

        toast({ title: 'Success', description: 'Delivery Receipt deleted successfully' });
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
        <DialogContent className="max-w-md bg-white p-6">
          <DialogHeader><DialogTitle>Edit Delivery Receipt</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>DR Number <span className="text-red-500">*</span></Label><Input required value={formData.dr_number} onChange={e => setFormData({...formData, dr_number: e.target.value})} className="mt-1" /></div>
            <div><Label>Date Delivered <span className="text-red-500">*</span></Label><Input type="date" required value={formData.date_delivered} onChange={e => setFormData({...formData, date_delivered: e.target.value})} className="mt-1" /></div>
            <div>
              <Label>Delivery Status</Label>
              <select required value={formData.dr_status} onChange={e => setFormData({...formData, dr_status: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1">
                <option value="Partial">Partial</option><option value="Completed">Completed</option>
              </select>
            </div>
            <div><Label>File Upload</Label><div className="mt-1"><FileUploadComponent onFileSelect={(f) => setFormData({...formData, file: f})} /></div></div>
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
      <DRPreviewModal isOpen={showPreview} onClose={() => setShowPreview(false)} data={data} />
    </>
  );
};
export default EditDRModal;