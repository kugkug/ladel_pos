import React, { useState, useEffect, useContext } from 'react';
import { ProjectContext } from '@/contexts/ProjectContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X, Save } from 'lucide-react';
import FileUploadComponent from '@/components/FileUploadComponent';
import { useDashboardRefresh } from '@/contexts/DashboardRefreshContext';

const calculateTaxAmount = (amount, taxType) => {
  if (!amount) return 0;
  return taxType === 'VAT (12%)' ? amount * 0.12 : 0;
};

const calculateGrossAmount = (amount, taxType) => {
  if (!amount) return 0;
  return amount + calculateTaxAmount(amount, taxType);
};

const EditQuotationModal = ({ isOpen, onClose, quotation, onSave }) => {
  const { formatCurrency } = useContext(ProjectContext);
  const { triggerRefresh } = useDashboardRefresh();
  const [formData, setFormData] = useState({
    quotationNumber: '',
    dateIssued: '',
    net_amount: '',
    file: null
  });

  useEffect(() => {
    if (quotation) {
      setFormData({
        quotationNumber: quotation.quotationNumber?.replace('QT', '') || '',
        dateIssued: quotation.dateIssued || '',
        net_amount: quotation.net_amount || quotation.netAmount || '',
        file: quotation.file || null
      });
    }
  }, [quotation]);

  if (!isOpen) return null;

  const amount = parseFloat(formData.net_amount) || 0;
  const vat = calculateTaxAmount(amount, 'VAT (12%)');
  const gross = calculateGrossAmount(amount, 'VAT (12%)');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      net_amount: amount,
      vat_amount: vat,
      gross_amount: gross,
      quotationNumber: `QT${formData.quotationNumber.replace(/\D/g, '')}`
    };
    
    onSave(payload);
    triggerRefresh('quotation-changed'); 
    onClose();
  };

  const handleQTChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    setFormData({...formData, quotationNumber: val});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">Edit Quotation Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label>QT Number</Label>
            <div className="flex items-center mt-1">
              <span className="px-3 py-2 bg-gray-100 border border-r-0 rounded-l-md text-gray-600 font-medium">QT</span>
              <input required value={formData.quotationNumber} onChange={handleQTChange} className="w-full px-3 py-2 border rounded-r-md text-gray-900 bg-white focus:ring-blue-500 focus:border-blue-500" placeholder="12345" />
            </div>
          </div>
          <div>
            <Label>Date Issued</Label>
            <input type="date" required value={formData.dateIssued} onChange={e => setFormData({...formData, dateIssued: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-md text-gray-900 bg-white" />
          </div>
          <div>
            <Label>Amount (before tax) (₱)</Label>
            <input type="number" step="0.01" required value={formData.net_amount} onChange={e => setFormData({...formData, net_amount: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-md text-gray-900 bg-white" />
          </div>
          <div className="bg-gray-50 p-3 rounded-md border text-sm space-y-1">
            <div className="flex justify-between text-gray-600"><span>VAT (12%):</span> <span>{formatCurrency(vat)}</span></div>
            <div className="flex justify-between font-bold text-blue-600"><span>VAT Inclusive:</span> <span>{formatCurrency(gross)}</span></div>
          </div>
          <div>
            <Label className="mb-2 block">Upload Quotation Document</Label>
            <FileUploadComponent existingFile={formData.file} onFileSelect={(file) => setFormData({...formData, file})} />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700"><Save className="w-4 h-4 mr-2"/> Save Quotation</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditQuotationModal;