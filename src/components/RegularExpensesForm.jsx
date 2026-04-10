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
const EXPENSE_TYPES = ['Pay Slip', 'Rent', 'Utilities', 'Repairs', 'Apps/Subscription', 'Office Supplies', 'Car Gasoline', 'RFID/Parking', 'Marketing', 'Legal & Accounting', 'Government benefits', 'Other'];
const PAYMENT_SOURCES = ['Rome', 'Alex', 'CBC - China Bank Corporation', 'SB - Security Bank', 'LBP - Landbank of the Philippines'];

const RegularExpensesForm = ({ onCancel, onSuccess, initialData = null }) => {
  const { suppliers, getNextInternalCode, addExpense, updateExpense, calculateVat, addReminder } = useContext(ExpensesContext);
  const { toast } = useToast();

  const getCurrentMonth = () => MONTHS[new Date().getMonth()];

  const initialForm = {
    dateOfReceipt: new Date().toISOString().split('T')[0],
    month: getCurrentMonth(),
    supplierMode: 'select',
    supplierId: '',
    tempSupplierName: '',
    supplierTin: '',
    supplierAddress: '',
    amount: '',
    vatOption: 'NON VAT',
    typeOfExpense: '',
    typeOfExpenseOther: '',
    description: '',
    financialImpact: 'P&L',
    natureOfExpense: 'Expense',
    validITR: false,
    validVAT: false,
    paymentSource: PAYMENT_SOURCES[0],
    receiptType: 'Digital',
    file: null,
    classification: 'Regular Expense'
  };

  const [formData, setFormData] = useState({ ...initialForm, internalCode: getNextInternalCode() });

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  useEffect(() => {
    if (formData.supplierMode === 'select' && formData.supplierId) {
      const selected = suppliers.find(s => s.id === formData.supplierId);
      if (selected) {
        setFormData(prev => ({ ...prev, supplierTin: selected.tin || '', supplierAddress: selected.address || '' }));
      }
    } else if (formData.supplierMode === 'temp') {
      setFormData(prev => ({ ...prev, supplierTin: '', supplierAddress: '' }));
    }
  }, [formData.supplierId, formData.supplierMode, suppliers]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'description' && value.length > 500) return;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const { base, vat, total } = calculateVat(formData.amount, formData.vatOption);

  const calculateDueDate = (receiptDate, termsStr) => {
    if (!receiptDate) return null;
    const date = new Date(receiptDate);
    if (termsStr === 'Net 15') date.setDate(date.getDate() + 15);
    else if (termsStr === 'Net 30') date.setDate(date.getDate() + 30);
    else if (termsStr === 'Net 45') date.setDate(date.getDate() + 45);
    else if (termsStr === 'Net 60') date.setDate(date.getDate() + 60);
    else if (termsStr === 'Net 90') date.setDate(date.getDate() + 90);
    else return null; // COD or Custom without standard parsing
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount) return toast({ title: "Error", description: "Amount is required.", variant: "destructive" });
    if (formData.supplierMode === 'select' && !formData.supplierId) return toast({ title: "Error", description: "Please select a supplier.", variant: "destructive" });
    if (formData.supplierMode === 'temp' && !formData.tempSupplierName) return toast({ title: "Error", description: "Temporary supplier name is required.", variant: "destructive" });
    if (formData.typeOfExpense === 'Other' && !formData.typeOfExpenseOther) return toast({ title: "Error", description: "Please specify the other expense type.", variant: "destructive" });

    const selectedSupplier = formData.supplierMode === 'select' ? suppliers.find(s => s.id === formData.supplierId) : null;
    const finalSupplierName = selectedSupplier ? selectedSupplier.name : formData.tempSupplierName;
    const expenseRecord = { ...formData, amount: total, baseAmount: base, vatAmount: vat, supplierName: finalSupplierName, status: 'Completed' };
    
    if (initialData) {
      updateExpense(initialData.id, expenseRecord);
      toast({ title: "Success", description: "Expense updated successfully!" });
    } else {
      addExpense(expenseRecord);
      toast({ title: "Success", description: "Regular expense recorded successfully!" });

      // Handle Automatic Reminder based on Payment Terms
      if (selectedSupplier && selectedSupplier.paymentTerms && selectedSupplier.paymentTerms !== 'Cash on Delivery (COD)' && selectedSupplier.paymentTerms !== 'Custom') {
        const dueDate = calculateDueDate(formData.dateOfReceipt, selectedSupplier.paymentTerms);
        if (dueDate) {
          addReminder({
            type: 'Custom Reminder',
            customType: `Supplier Payment - ${finalSupplierName}`,
            date: dueDate,
            time: '09:00',
            frequency: 'One-time',
            status: 'Pending',
            notes: `Payment due for Expense ${expenseRecord.internalCode}. Terms: ${selectedSupplier.paymentTerms}. Amount: ₱${total.toLocaleString()}`
          });
          toast({ title: "Reminder Set", description: `Auto reminder set for ${dueDate} based on ${selectedSupplier.paymentTerms} terms.` });
        }
      }
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
              <Label className="text-accent font-semibold">Date of Receipt <span className="text-primary">*</span></Label>
              <Input required type="date" name="dateOfReceipt" value={formData.dateOfReceipt} onChange={handleChange} className="focus-visible:ring-primary bg-muted/30" />
            </div>
            <div className="space-y-1">
              <Label className="text-accent font-semibold">Month <span className="text-primary">*</span></Label>
              <select required name="month" value={formData.month} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-foreground">
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="md:col-span-2 border border-muted rounded-xl p-4 bg-muted/10">
              <Label className="mb-3 block text-accent font-semibold">Supplier Details <span className="text-primary">*</span></Label>
              <div className="flex gap-4 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="supplierMode" value="select" checked={formData.supplierMode === 'select'} onChange={handleChange} className="text-primary focus:ring-primary w-4 h-4" />
                  <span className="text-sm font-medium text-foreground">Select from List</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="supplierMode" value="temp" checked={formData.supplierMode === 'temp'} onChange={handleChange} className="text-primary focus:ring-primary w-4 h-4" />
                  <span className="text-sm font-medium text-foreground">Temporary Supplier</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.supplierMode === 'select' ? (
                  <div className="md:col-span-2">
                    <select name="supplierId" value={formData.supplierId} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-foreground shadow-sm">
                      <option value="">-- Search and select supplier --</option>
                      {suppliers.filter(s => !s.isDeleted).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                ) : (
                  <div className="md:col-span-2">
                    <Input type="text" name="tempSupplierName" value={formData.tempSupplierName} onChange={handleChange} placeholder="Enter supplier name" className="focus-visible:ring-primary" />
                  </div>
                )}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground font-medium">Supplier TIN</Label>
                  <Input type="text" name="supplierTin" value={formData.supplierTin} onChange={handleChange} readOnly={formData.supplierMode === 'select'} placeholder="000-000-000-000" className={formData.supplierMode === 'select' ? 'bg-muted/50 text-muted-foreground' : 'focus-visible:ring-primary'} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground font-medium">Supplier Address</Label>
                  <Input type="text" name="supplierAddress" value={formData.supplierAddress} onChange={handleChange} readOnly={formData.supplierMode === 'select'} placeholder="Full address" className={formData.supplierMode === 'select' ? 'bg-muted/50 text-muted-foreground' : 'focus-visible:ring-primary'} />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-accent font-semibold">Amount <span className="text-primary">*</span></Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground font-medium text-sm">₱</span>
                <Input required type="number" step="0.01" name="amount" value={formData.amount} onChange={handleChange} className="pl-8 focus-visible:ring-primary font-bold text-foreground bg-white shadow-inner" placeholder="0.00" />
              </div>
            </div>
            
            <div className="space-y-1">
              <Label className="text-accent font-semibold">VAT Options <span className="text-primary">*</span></Label>
              <div className="flex flex-wrap items-center gap-4 mt-2 bg-muted/20 p-2.5 rounded-lg border border-muted">
                {['NON VAT', 'VAT', 'Not Official'].map(opt => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <input required type="radio" name="vatOption" value={opt} checked={formData.vatOption === opt} onChange={handleChange} className="text-primary focus:ring-primary w-4 h-4" />
                    <span className="text-sm font-medium text-foreground">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {formData.vatOption === 'VAT' && formData.amount && (
              <div className="md:col-span-2 bg-secondary/20 text-accent p-3 rounded-lg text-sm flex flex-wrap gap-4 justify-between border border-secondary">
                <span>Base Amount: <strong>₱{base.toFixed(2)}</strong></span>
                <span>VAT (12%): <strong>₱{vat.toFixed(2)}</strong></span>
                <span className="font-bold text-lg">Total: ₱{total.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-muted shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg font-bold text-accent border-b border-muted pb-2 mb-4">2. ACCOUNTING & TAX</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1">
              <Label className="text-accent font-semibold">Type of Expenses <span className="text-primary">*</span></Label>
              <select required name="typeOfExpense" value={formData.typeOfExpense} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-foreground">
                <option value="">-- Select type --</option>
                {EXPENSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {formData.typeOfExpense === 'Other' && (
                <Input required type="text" name="typeOfExpenseOther" value={formData.typeOfExpenseOther} onChange={handleChange} placeholder="Specify other expense" className="mt-2 focus-visible:ring-primary" />
              )}
            </div>

            <div className="space-y-1">
              <Label className="text-accent font-semibold">Internal Code</Label>
              <Input type="text" readOnly value={formData.internalCode} className="bg-muted/50 text-muted-foreground font-mono font-medium border-muted" />
            </div>

            <div className="space-y-1">
              <Label className="text-accent font-semibold">Financial Impact <span className="text-primary">*</span></Label>
              <select required name="financialImpact" value={formData.financialImpact} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-foreground">
                <option value="P&L">P&L (Profit & Loss)</option>
                <option value="Not Company">Not Company</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-accent font-semibold">Compliance (Optional)</Label>
              <div className="flex flex-wrap items-center gap-6 p-2.5 h-10 bg-muted/20 rounded-lg border border-muted">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="validITR" checked={formData.validITR} onChange={handleChange} className="w-4 h-4 text-primary rounded focus:ring-primary border-muted" />
                  <span className="text-sm font-medium text-foreground">Valid for ITR</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="validVAT" checked={formData.validVAT} onChange={handleChange} className="w-4 h-4 text-primary rounded focus:ring-primary border-muted" />
                  <span className="text-sm font-medium text-foreground">Valid for VAT</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-muted shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg font-bold text-accent border-b border-muted pb-2 mb-4">3. FUNDING & DOCUMENTATION</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1">
              <Label className="text-accent font-semibold">Payment Source</Label>
              <select name="paymentSource" value={formData.paymentSource} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-foreground">
                {PAYMENT_SOURCES.map(src => <option key={src} value={src}>{src}</option>)}
              </select>
            </div>
            
            <div className="space-y-1">
              <Label className="text-accent font-semibold">Type of Receipt</Label>
              <select name="receiptType" value={formData.receiptType} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-foreground">
                <option value="Digital">Digital</option>
                <option value="Hard Copy">Hard Copy</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label className="text-accent font-semibold">Description (Optional)</Label>
              <Textarea name="description" value={formData.description} onChange={handleChange} placeholder="Add specific details about this expense..." className="h-24 resize-none focus-visible:ring-primary bg-muted/10" />
              <div className="text-right text-xs text-muted-foreground font-medium">{formData.description?.length || 0}/500</div>
            </div>
            
            <div className="md:col-span-2 pt-2 border-t border-muted">
              <Label className="mb-2 block text-accent font-semibold">Upload Receipt (Optional, Max 10MB)</Label>
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
            <Save className="w-4 h-4 mr-2" /> {initialData ? 'Update Expense' : 'Save Expense'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RegularExpensesForm;