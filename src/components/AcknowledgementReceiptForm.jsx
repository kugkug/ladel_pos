import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Save, X } from 'lucide-react';
import FileUploadComponent from '@/components/FileUploadComponent';
import { useToast } from '@/components/ui/use-toast';

const AcknowledgementReceiptForm = ({ projectId, existingAR, onCancel, onSuccess, invoiceData }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({ 
    arNumber: '', date: '', amount: '', arStatus: 'Completed', file: null 
  });

  useEffect(() => {
    if (existingAR) {
      setFormData(existingAR);
    } else if (invoiceData && !existingAR) {
      setFormData(prev => ({ ...prev, amount: invoiceData.grossAmount || '' }));
    }
  }, [existingAR, invoiceData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSuccess({ ...formData, projectId });
    toast({ 
      title: "Status Updated", 
      description: `AR status updated to ${formData.arStatus}`,
      variant: formData.arStatus === 'Deleted' ? 'destructive' : 'default'
    });
  };

  const handleARChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    setFormData({...formData, arNumber: val});
  };

  const statusOptions = [
    { value: 'Completed', label: 'Completed (Full Payment)' },
    { value: 'Partial', label: 'Partial (Partial Payment)' },
    { value: 'Pending', label: 'Pending (Awaiting Payment)' },
    { value: 'Deleted', label: 'Deleted (Removed)' }
  ];

  return (
    <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl border border-muted shadow-sm space-y-5 transition-all">
      <h3 className="text-lg font-bold text-accent mb-2 border-b border-muted pb-2">{existingAR ? 'Edit Acknowledgement Receipt' : 'Add Acknowledgement Receipt'}</h3>
      
      <div className="space-y-1.5">
        <Label className="text-accent font-semibold">AR Status</Label>
        <select 
          name="arStatus" 
          value={formData.arStatus} 
          onChange={(e) => setFormData({...formData, arStatus: e.target.value})} 
          className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary font-medium"
        >
          {statusOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground mt-1">This status directly controls the Project's payment badge.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="space-y-1.5">
          <Label className="text-accent font-semibold">AR Number</Label>
          <div className="flex items-center mt-1 shadow-sm rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-primary border border-input">
            <span className="px-3 py-2 bg-muted/50 border-r border-input text-muted-foreground font-bold">AR</span>
            <input required value={formData.arNumber} onChange={handleARChange} className="w-full px-3 py-2 bg-white outline-none text-foreground font-medium" placeholder="2024001" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-accent font-semibold">Date Received</Label>
          <input type="date" required value={formData.date || ''} onChange={e=>setFormData({...formData, date: e.target.value})} className="w-full mt-1 px-3 py-2 border border-input rounded-md text-foreground bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-accent font-semibold">Amount Received (₱)</Label>
          <input type="number" step="0.01" required value={formData.amount || ''} onChange={e=>setFormData({...formData, amount: e.target.value})} className="w-full mt-1 px-3 py-2 border border-input rounded-md text-foreground bg-white font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm" placeholder="0.00" />
        </div>
      </div>

      <div className="pt-2">
        <Label className="mb-2 block text-accent font-semibold">Upload AR Document</Label>
        <FileUploadComponent existingFile={formData.file} onFileSelect={(file) => setFormData({...formData, file})} />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-muted mt-6">
        <Button type="button" variant="outline" onClick={onCancel} className="border-muted hover:bg-muted text-foreground"><X className="w-4 h-4 mr-2"/> Cancel</Button>
        <Button type="submit" className="bg-primary hover:bg-primary/90 text-white shadow-sm px-6"><Save className="w-4 h-4 mr-2"/> {existingAR ? 'Update AR' : 'Save AR'}</Button>
      </div>
    </form>
  );
};

export default AcknowledgementReceiptForm;