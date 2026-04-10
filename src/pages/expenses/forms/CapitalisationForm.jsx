import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { generateNextInternalCode } from '@/lib/internalCodeService';
import { saveExpense } from '@/lib/expenseService';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Save } from 'lucide-react';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const PEOPLE = ['Rome', 'Alex'];
const BANKS = ['CBC', 'SB', 'LBP'];

const CapitalisationForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [internalCode, setInternalCode] = useState('');
  
  const [formData, setFormData] = useState({
    date_of_receipt: new Date().toISOString().split('T')[0],
    month: MONTHS[new Date().getMonth()],
    fund_by: 'Rome',
    bank_funded: 'CBC',
    amount_php: '',
    notes: ''
  });

  useEffect(() => {
    const fetchPreviewCode = async () => {
      try {
        const { data, error } = await supabase.rpc('get_next_internal_code_preview');
        if (!error && data) {
          setInternalCode(data);
        }
      } catch (err) {
        console.error('Failed to fetch preview code:', err);
      }
    };
    fetchPreviewCode();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (!formData.date_of_receipt) throw new Error("Date is required");
      if (!formData.amount_php) throw new Error("Amount is required");
      if (!formData.fund_by) throw new Error("Fund By is required");
      if (!formData.bank_funded) throw new Error("Bank Funded is required");

      const generatedCode = await generateNextInternalCode();
      const finalData = { ...formData, internal_code: generatedCode };

      await saveExpense('capitalisation', finalData);
      setInternalCode(generatedCode);
      setIsSaved(true);
      toast({ 
        title: "Success", 
        description: `Record saved with Internal Code: ${generatedCode}` 
      });
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-in fade-in duration-300">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate('/expenses/data-entry')} className="text-gray-500 hover:text-gray-900 -ml-2">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-blue-600">Capitalisation / Funding Entry</h1>
          <p className="text-sm text-gray-500">Record capital injections or funding into the company</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Internal Code</label>
            <input 
              type="text" 
              value={internalCode || 'Loading...'} 
              readOnly 
              disabled 
              className={`w-full px-3 py-2 border rounded-lg font-mono cursor-not-allowed transition-colors ${isSaved ? 'internal-code-assigned text-lg text-center tracking-wider' : 'bg-gray-100 text-gray-700 font-bold border-gray-300'}`} 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Date of Receipt</label>
              <input type="date" name="date_of_receipt" required value={formData.date_of_receipt} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Month</label>
              <select name="month" required value={formData.month} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Fund By</label>
            <select name="fund_by" required value={formData.fund_by} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              {PEOPLE.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Bank Funded To</label>
            <select name="bank_funded" required value={formData.bank_funded} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Amount (PHP)</label>
            <input type="number" step="0.01" name="amount_php" required value={formData.amount_php} onChange={handleChange} placeholder="0.00" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-600" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Notes</label>
            <textarea name="notes" rows={3} value={formData.notes} onChange={handleChange} placeholder="Details about this funding..." className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={() => navigate('/expenses/data-entry')} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting || isSaved} className="bg-blue-600 hover:bg-blue-700 text-white">
            {isSubmitting ? 'Saving...' : isSaved ? 'Saved' : <><Save className="w-4 h-4 mr-2" /> Save Capitalisation</>}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CapitalisationForm;