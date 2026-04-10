import React, { useState, useContext, useEffect } from 'react';
import { ProjectContext } from '@/contexts/ProjectContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Save, X, Sparkles } from 'lucide-react';
import FileUploadComponent from '@/components/FileUploadComponent';

const GeneratePOForm = ({ projectId, onCancel, onSuccess }) => {
  const { formatCurrency, generatePONumber, getProjectDocuments } = useContext(ProjectContext);
  const quotationData = getProjectDocuments(projectId)?.quotation;
  
  const [formData, setFormData] = useState({ 
    poNumber: '', date: new Date().toISOString().split('T')[0], netAmount: '', paymentTerms: '30 Days', file: null 
  });

  useEffect(() => {
    if (quotationData) {
      setFormData(prev => ({
        ...prev,
        poNumber: generatePONumber(),
        netAmount: quotationData.netAmount
      }));
    }
  }, [quotationData]); // eslint-disable-line

  const net = parseFloat(formData.netAmount) || 0;
  const vat = net * 0.12;
  const gross = net + vat;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSuccess({ ...formData, vatAmount: vat, grossAmount: gross });
  };

  const handlePONumberChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    setFormData({ ...formData, poNumber: val });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-center gap-2 text-amber-800 text-sm mb-4">
        <Sparkles className="w-4 h-4" /> Auto-populated from Quotation Details
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>PO Number (Auto-Generated)</Label>
          <div className="flex items-center mt-1">
            <span className="px-3 py-2 bg-gray-100 border border-r-0 rounded-l-md text-gray-600 font-medium">PO</span>
            <input value={formData.poNumber} onChange={handlePONumberChange} className="w-full px-3 py-2 border rounded-r-md text-gray-900 bg-white focus:ring-blue-500 focus:border-blue-500" placeholder="12345" />
          </div>
        </div>
        <div>
          <Label>PO Date</Label>
          <input type="date" required value={formData.date} onChange={e=>setFormData({...formData, date: e.target.value})} className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white mt-1" />
        </div>
        <div>
          <Label>Net Amount (₱)</Label>
          <input readOnly value={formData.netAmount} className="w-full px-3 py-2 border rounded-md text-gray-600 bg-gray-100 mt-1 cursor-not-allowed" />
        </div>
        <div>
          <Label>Payment Terms</Label>
          <select value={formData.paymentTerms} onChange={e=>setFormData({...formData, paymentTerms: e.target.value})} className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white mt-1">
            <option value="COD">COD</option>
            <option value="15 Days">15 Days</option>
            <option value="30 Days">30 Days</option>
            <option value="60 Days">60 Days</option>
            <option value="50% DP + 50% Completion">50% DP + 50% Completion</option>
            <option value="Partial Payment">Partial Payment</option>
          </select>
        </div>
      </div>
      <div className="flex items-center gap-4 bg-white p-3 rounded-md border">
        <div className="text-sm text-gray-600">VAT (12%): <span className="font-medium text-gray-900">{formatCurrency(vat)}</span></div>
        <div className="text-sm text-gray-600">VAT Inclusive Amount: <span className="font-bold text-blue-600">{formatCurrency(gross)}</span></div>
      </div>
      <div>
        <Label className="mb-2 block text-gray-700">Upload Generated Document (Optional)</Label>
        <FileUploadComponent existingFile={formData.file} onFileSelect={(file) => setFormData({...formData, file})} />
      </div>
      <div className="flex justify-end gap-2 pt-2 border-t mt-4">
        <Button type="button" variant="outline" onClick={onCancel}><X className="w-4 h-4 mr-1"/> Cancel</Button>
        <Button type="submit" className="bg-blue-600 text-white"><Save className="w-4 h-4 mr-1"/> Create PO</Button>
      </div>
    </form>
  );
};

export default GeneratePOForm;