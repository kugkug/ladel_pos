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

const FundingForm = ({ onCancel, onSuccess, initialData = null }) => {
  const { getNextInternalCode, addExpense, updateExpense } = useContext(ExpensesContext);
  const { toast } = useToast();

  const initialForm = {
    dateOfInjection: new Date().toISOString().split('T')[0],
    month: MONTHS[new Date().getMonth()],
    fundBy: 'Rome',
    fundByOther: '',
    bankFunded: BANK_SOURCES[0],
    amount: '',
    notes: '',
    receiptType: 'Digital',
    file: null,
    classification: 'Funding'
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
    if (!formData.amount || (formData.fundBy === 'Others' && !formData.fundByOther)) {
      return toast({ title: "Error", description: "Please fill in all required fields.", variant: "destructive" });
    }
    
    const record = {
      ...formData,
      amount: parseFloat(formData.amount),
      fundBy: formData.fundBy === 'Others' ? formData.fundByOther : formData.fundBy,
      status: 'Completed'
    };

    if (initialData) {
      updateExpense(initialData.id, record);
      toast({ title: "Success", description: "Funding updated successfully!" });
    } else {
      addExpense(record);
      toast({ title: "Success", description: "Funding recorded successfully!" });
    }
    onSuccess();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">1. BASIC INFO</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1">
              <Label>Date of Injection *</Label>
              <Input required type="date" name="dateOfInjection" value={formData.dateOfInjection} onChange={handleChange} />
            </div>
            
            <div className="space-y-1">
              <Label>Month *</Label>
              <select required name="month" value={formData.month} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            
            <div className="space-y-1">
              <Label>Fund by *</Label>
              <select name="fundBy" value={formData.fundBy} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <option value="Rome">Rome</option>
                <option value="Alex">Alex</option>
                <option value="Others">Others</option>
              </select>
              {formData.fundBy === 'Others' && (
                <Input required type="text" name="fundByOther" value={formData.fundByOther} onChange={handleChange} placeholder="Specify funder name" className="mt-2" />
              )}
            </div>

            <div className="space-y-1">
              <Label>Bank Funded *</Label>
              <select required name="bankFunded" value={formData.bankFunded} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                {BANK_SOURCES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <Label>Amount *</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500 font-medium text-sm">₱</span>
                <Input required type="number" step="0.01" name="amount" value={formData.amount} onChange={handleChange} className="pl-8" placeholder="0.00" />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Internal Code</Label>
              <Input type="text" readOnly value={formData.internalCode} className="bg-gray-100 text-gray-600 font-mono cursor-not-allowed" />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label>Notes/Remarks (Optional)</Label>
              <Textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Additional context..." className="h-20 resize-none" />
              <div className="text-right text-xs text-gray-400">{formData.notes?.length || 0}/500 characters</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">2. DOCUMENTATION</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1">
              <Label>Type of Receipt *</Label>
              <select required name="receiptType" value={formData.receiptType} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <option value="Digital">Digital</option>
                <option value="Hard Copy">Hard Copy</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <Label className="mb-2 block">Upload Receipt (Max 10MB)</Label>
              <FileUploadComponent onFileSelect={(f) => setFormData(prev => ({ ...prev, file: f }))} existingFile={formData.file} />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" /> Cancel
          </Button>
          {!initialData && (
            <Button type="button" variant="outline" onClick={() => setFormData({ ...initialForm, internalCode: getNextInternalCode() })}>
              <RefreshCcw className="w-4 h-4 mr-2" /> Clear Form
            </Button>
          )}
          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Save className="w-4 h-4 mr-2" /> {initialData ? 'Update Funding' : 'Save Funding'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FundingForm;