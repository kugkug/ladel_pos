import React, { useState, useContext } from 'react';
import { ProjectContext } from '@/contexts/ProjectContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const CombinedProjectQuotationForm = () => {
  const { createProject, formatCurrency } = useContext(ProjectContext);
  const [formData, setFormData] = useState({ 
    projectNumber: '', 
    companyName: '',
    quotationNumber: '', 
    dateIssued: '', 
    netAmount: '' 
  });

  const netAmt = parseFloat(formData.netAmount) || 0;
  const vat = netAmt * 0.12;
  const gross = netAmt + vat;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.projectNumber || !formData.companyName || !formData.quotationNumber || !formData.dateIssued || !formData.netAmount) return;
    
    const projectData = {
      projectNumber: formData.projectNumber,
      clientName: formData.companyName, // mapping to clientName for consistency
      companyName: formData.companyName
    };
    
    const quotationData = {
      quotationNumber: formData.quotationNumber,
      dateIssued: formData.dateIssued,
      netAmount: netAmt,
      vatAmount: vat,
      grossAmount: gross
    };

    createProject(projectData, quotationData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Project Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Project Number</Label>
            <input required type="text" value={formData.projectNumber} onChange={e => setFormData({...formData, projectNumber: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-black" />
          </div>
          <div>
            <Label>Company Name</Label>
            <input required type="text" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-black" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Quotation Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Quotation Number</Label>
            <input required type="text" value={formData.quotationNumber} onChange={e => setFormData({...formData, quotationNumber: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-black" />
          </div>
          <div>
            <Label>Date Issued</Label>
            <input required type="date" value={formData.dateIssued} onChange={e => setFormData({...formData, dateIssued: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-black" />
          </div>
          <div className="md:col-span-2">
            <Label>Net Amount</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
              <input required type="number" step="0.01" value={formData.netAmount} onChange={e => setFormData({...formData, netAmount: e.target.value})} className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-black" placeholder="0.00" />
            </div>
          </div>
          <div className="md:col-span-2">
            <Label>Quotation Document Upload (Soft Copy)</Label>
            <input type="file" accept=".pdf,.doc,.docx,.png,.jpg" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md space-y-2 text-sm mt-4">
          <div className="flex justify-between text-gray-600"><span>Net Amount:</span> <span>{formatCurrency(netAmt)}</span></div>
          <div className="flex justify-between text-gray-600"><span>VAT (12%):</span> <span>{formatCurrency(vat)}</span></div>
          <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t border-gray-200"><span>VAT Inclusive Amount:</span> <span>{formatCurrency(gross)}</span></div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Create Project & Quotation</Button>
      </div>
    </form>
  );
};

export default CombinedProjectQuotationForm;