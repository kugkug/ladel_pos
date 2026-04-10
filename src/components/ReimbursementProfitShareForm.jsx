import React, { useState, useContext, useEffect } from 'react';
import { ExpensesContext } from '@/contexts/ExpensesContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, X, RefreshCcw } from 'lucide-react';
import FileUploadComponent from './FileUploadComponent';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const BANK_SOURCES = ['CBC - China Bank Corporation', 'SB - Security Bank', 'LBP - Landbank of the Philippines'];

const ReimbursementProfitShareForm = ({ onCancel, onSuccess, initialData = null }) => {
  const { getNextInternalCode, addExpense, updateExpense } = useContext(ExpensesContext);
  const { toast } = useToast();

  const initialForm = {
    dateOfReimbursement: new Date().toISOString().split('T')[0],
    month: MONTHS[new Date().getMonth()],
    reimbursementType: 'Reimbursement',
    reimbursedBy: 'Alex',
    bankSource: BANK_SOURCES[0],
    amount: '',
    notes: '',
    receiptType: 'Digital',
    file: null,
    classification: 'Reimbursement/Profit Share'
  };

  const [formData, setFormData] = useState({ ...initialForm, internalCode: getNextInternalCode() });

  useEffect(() => { if (initialData) setFormData(initialData); }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'notes' && value.length > 500) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount) return toast({ title: "Error", description: "Amount is required.", variant: "destructive" });
    
    const record = { ...formData, amount: parseFloat(formData.amount), status: 'Completed' };
    
    if (initialData) {
      updateExpense(initialData.id, record);
      toast({ title: "Success", description: "Record updated successfully!" });
    } else {
      addExpense(record);
      toast({ title: "Success", description: "Record saved successfully!" });
    }
    if (onSuccess) onSuccess();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-muted shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg font-bold text-accent border-b border-muted pb-2 mb-4">1. BASIC INFO</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1">
              <Label className="text-accent font-semibold">Date of Transaction <span className="text-primary">*</span></Label>
              <Input required type="date" name="dateOfReimbursement" value={formData.dateOfReimbursement} onChange={handleChange} className="focus-visible:ring-primary bg-muted/30" />
            </div>
            
            <div className="space-y-1">
              <Label className="text-accent font-semibold">Month <span className="text-primary">*</span></Label>
              <select required name="month" value={formData.month} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-foreground">
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-accent font-semibold">Reimbursement Type <span className="text-primary">*</span></Label>
              <select required name="reimbursementType" value={formData.reimbursementType} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-foreground">
                <option value="Reimbursement">Reimbursement</option>
                <option value="Profit Share">Profit Share</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <Label className="text-accent font-semibold">Reimbursed / Shared by <span className="text-primary">*</span></Label>
              <select required name="reimbursedBy" value={formData.reimbursedBy} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-foreground">
                <option value="Alex">Alex</option>
                <option value="Rome">Rome</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-accent font-semibold">Bank Source <span className="text-primary">*</span></Label>
              <select required name="bankSource" value={formData.bankSource} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-foreground">
                {BANK_SOURCES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-accent font-semibold">Amount <span className="text-primary">*</span></Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground font-medium text-sm">₱</span>
                <Input required type="number" step="0.01" name="amount" value={formData.amount} onChange={handleChange} className="pl-8 focus-visible:ring-primary font-bold text-foreground bg-white shadow-inner" placeholder="0.00" />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-accent font-semibold">Internal Code</Label>
              <Input type="text" readOnly value={formData.internalCode} className="bg-muted/50 text-muted-foreground font-mono font-medium border-muted" />
            </div>
            
            <div className="space-y-1">
              <Label className="text-accent font-semibold">Type of Receipt</Label>
              <select name="receiptType" value={formData.receiptType} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-foreground">
                <option value="Digital">Digital</option>
                <option value="Hard Copy">Hard Copy</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label className="text-accent font-semibold">Notes / Remarks (Optional)</Label>
              <Textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Additional context..." className="h-24 resize-none focus-visible:ring-primary bg-muted/10" />
              <div className="text-right text-xs text-muted-foreground font-medium">{formData.notes?.length || 0}/500</div>
            </div>
            
            <div className="md:col-span-2 pt-2 border-t border-muted">
              <Label className="mb-2 block text-accent font-semibold">Upload Documentation (Optional, Max 10MB)</Label>
              <FileUploadComponent onFileSelect={(f) => setFormData(prev => ({ ...prev, file: f }))} existingFile={formData.file} />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-muted">
          <Button type="button" variant="outline" onClick={onCancel} className="bg-secondary text-accent hover:bg-secondary/80 border-none">
            <X className="w-4 h-4 mr-2" /> Cancel
          </Button>
          {!initialData && (
            <Button type="button" variant="outline" onClick={() => setFormData({ ...initialForm, internalCode: getNextInternalCode() })} className="border-muted hover:bg-muted">
              <RefreshCcw className="w-4 h-4 mr-2" /> Clear Form
            </Button>
          )}
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm px-6">
            <Save className="w-4 h-4 mr-2" /> {initialData ? 'Update Record' : 'Save Record'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ReimbursementProfitShareForm;