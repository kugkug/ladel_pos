import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const ProjectForm = ({ initialData, onSubmit, onCancel, isLoading, mode = 'create' }) => {
  const [formData, setFormData] = useState({
    projectNumber: '',
    companyName: '',
    quotationAmount: '',
    quotationDate: '',
    file: null
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData({
        projectNumber: initialData.projectNumber || '',
        companyName: initialData.companyName || initialData.clientName || '',
        quotationAmount: initialData.quotationAmount || '',
        quotationDate: initialData.quotationDate || '',
        file: null
      });
    }
  }, [initialData, mode]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.projectNumber.trim()) newErrors.projectNumber = 'Project number is required';
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-muted transition-all">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Label htmlFor="projectNumber" className="text-accent font-semibold">Project Number <span className="text-primary">*</span></Label>
            <input
              type="text"
              id="projectNumber"
              name="projectNumber"
              value={formData.projectNumber}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-muted rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-muted/30 text-foreground transition-all"
              disabled={isLoading}
              placeholder="e.g., PRJ-2026-001"
            />
            {errors.projectNumber && <p className="mt-1 text-sm text-destructive">{errors.projectNumber}</p>}
          </div>

          <div>
            <Label htmlFor="companyName" className="text-accent font-semibold">Company Name <span className="text-primary">*</span></Label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-muted rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-muted/30 text-foreground transition-all"
              disabled={isLoading}
              placeholder="Client Company"
            />
            {errors.companyName && <p className="mt-1 text-sm text-destructive">{errors.companyName}</p>}
          </div>

          <div>
            <Label htmlFor="quotationAmount" className="text-accent font-semibold">Quotation Amount</Label>
            <input
              type="number"
              step="0.01"
              id="quotationAmount"
              name="quotationAmount"
              value={formData.quotationAmount}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-muted rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-muted/30 text-foreground transition-all"
              disabled={isLoading}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="quotationDate" className="text-accent font-semibold">Quotation Date</Label>
            <input
              type="date"
              id="quotationDate"
              name="quotationDate"
              value={formData.quotationDate}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-muted rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-muted/30 text-foreground transition-all"
              disabled={isLoading}
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="file" className="text-accent font-semibold">File Upload</Label>
            <input
              type="file"
              id="file"
              name="file"
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-muted rounded-lg shadow-sm bg-muted/30 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading} className="bg-secondary text-accent border-none hover:bg-secondary/80">
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm px-6">
          {isLoading ? 'Saving...' : mode === 'edit' ? 'Update Project' : 'Create Project'}
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;