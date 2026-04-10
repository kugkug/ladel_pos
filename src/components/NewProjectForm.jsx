import React, { useState, useContext, useEffect } from 'react';
import { ProjectContext } from '@/contexts/ProjectContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const NewProjectForm = () => {
  const { createProject, formatCurrency } = useContext(ProjectContext);
  const [formData, setFormData] = useState({
    projectNumber: '',
    companyName: '',
    quotationNumber: '',
    dateIssued: new Date().toISOString().split('T')[0],
    netAmount: '',
    file: null
  });

  const [calculated, setCalculated] = useState({ vat: 0, gross: 0 });

  useEffect(() => {
    const net = parseFloat(formData.netAmount) || 0;
    const vat = net * 0.12;
    const gross = net + vat;
    setCalculated({ vat, gross });
  }, [formData.netAmount]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createProject(
      { projectNumber: formData.projectNumber, companyName: formData.companyName },
      { 
        quotationNumber: formData.quotationNumber, 
        dateIssued: formData.dateIssued,
        netAmount: formData.netAmount,
        vatAmount: calculated.vat,
        grossAmount: calculated.gross
      }
    );
    setFormData({
      projectNumber: '', companyName: '', quotationNumber: '', 
      dateIssued: new Date().toISOString().split('T')[0], netAmount: '', file: null
    });
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">Create New Project</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-gray-700">Project Number *</Label>
            <input required name="projectNumber" value={formData.projectNumber} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
          </div>
          <div>
            <Label className="text-gray-700">Company Name *</Label>
            <input required name="companyName" value={formData.companyName} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
          </div>
          <div>
            <Label className="text-gray-700">Quotation Number</Label>
            <input name="quotationNumber" value={formData.quotationNumber} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
          </div>
          <div>
            <Label className="text-gray-700">Date Issued</Label>
            <input type="date" name="dateIssued" value={formData.dateIssued} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
          </div>
          <div className="md:col-span-2">
            <Label className="text-gray-700">Net Amount (₱)</Label>
            <input type="number" step="0.01" name="netAmount" value={formData.netAmount} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm border border-gray-100">
          <div className="flex justify-between text-gray-600">
            <span>VAT (12%):</span>
            <span className="font-medium">{formatCurrency(calculated.vat)}</span>
          </div>
          <div className="flex justify-between text-gray-900 font-bold border-t border-gray-200 pt-2">
            <span>VAT Inclusive Amount:</span>
            <span className="text-blue-600">{formatCurrency(calculated.gross)}</span>
          </div>
        </div>

        <div>
          <Label className="text-gray-700">Upload Quotation (Soft Copy)</Label>
          <input type="file" name="file" onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded-lg text-gray-900" />
        </div>

        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg rounded-xl">
          Create Project
        </Button>
      </form>
    </div>
  );
};

export default NewProjectForm;