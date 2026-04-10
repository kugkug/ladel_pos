import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, Building2, User, Settings } from 'lucide-react';

const CustomerForm = ({ initialData, onSubmit, onCancel, isSubmitting, externalError }) => {
  const [formData, setFormData] = useState({
    company_name: '',
    company_tin: '',
    company_address: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    status: 'Active',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        company_name: initialData.company_name || initialData.companyName || '',
        company_tin: initialData.company_tin || '',
        company_address: initialData.company_address || initialData.address || '',
        contact_name: initialData.contact_name || initialData.contactPerson || '',
        contact_email: initialData.contact_email || initialData.email || '',
        contact_phone: initialData.contact_phone || initialData.phone || '',
        status: initialData.status || 'Active',
        notes: initialData.notes || ''
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors = {};
    if (!formData.company_name.trim()) newErrors.company_name = 'Company Name is required';
    else if (formData.company_name.length > 255) newErrors.company_name = 'Must be under 255 characters';
    
    if (!formData.contact_name.trim()) newErrors.contact_name = 'Contact Name is required';
    else if (formData.contact_name.length > 255) newErrors.contact_name = 'Must be under 255 characters';
    
    if (formData.contact_email) {
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(formData.contact_email)) newErrors.contact_email = 'Invalid email format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {externalError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" /> {externalError}
        </div>
      )}

      {/* Section 1 */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
          <Building2 className="w-4 h-4 text-blue-600" /> Company Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-gray-700 font-semibold">Company Name <span className="text-red-500">*</span></Label>
            <Input 
              value={formData.company_name} 
              onChange={e => setFormData({...formData, company_name: e.target.value})} 
              maxLength={255}
              className={errors.company_name ? 'border-red-500 focus-visible:ring-red-500' : ''}
              placeholder="Full registered company name"
            />
            {errors.company_name && <p className="text-red-500 text-xs">{errors.company_name}</p>}
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-gray-700 font-semibold">TIN</Label>
            <Input 
              value={formData.company_tin} 
              onChange={e => setFormData({...formData, company_tin: e.target.value})} 
              maxLength={50}
              placeholder="000-000-000-000"
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-gray-700 font-semibold">Company Address</Label>
            <Textarea 
              value={formData.company_address} 
              onChange={e => setFormData({...formData, company_address: e.target.value})} 
              maxLength={500}
              className="resize-none h-20"
              placeholder="Complete office address"
            />
          </div>
        </div>
      </div>

      {/* Section 2 */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
          <User className="w-4 h-4 text-blue-600" /> Contact Person
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-gray-700 font-semibold">Contact Name <span className="text-red-500">*</span></Label>
            <Input 
              value={formData.contact_name} 
              onChange={e => setFormData({...formData, contact_name: e.target.value})} 
              maxLength={255}
              className={errors.contact_name ? 'border-red-500 focus-visible:ring-red-500' : ''}
              placeholder="Primary contact person"
            />
            {errors.contact_name && <p className="text-red-500 text-xs">{errors.contact_name}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-gray-700 font-semibold">Email Address</Label>
            <Input 
              type="email"
              value={formData.contact_email} 
              onChange={e => setFormData({...formData, contact_email: e.target.value})} 
              className={errors.contact_email ? 'border-red-500 focus-visible:ring-red-500' : ''}
              placeholder="email@company.com"
            />
            {errors.contact_email && <p className="text-red-500 text-xs">{errors.contact_email}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-gray-700 font-semibold">Phone Number</Label>
            <Input 
              value={formData.contact_phone} 
              onChange={e => setFormData({...formData, contact_phone: e.target.value})} 
              maxLength={20}
              placeholder="+63 900 000 0000"
            />
          </div>
        </div>
      </div>

      {/* Section 3 */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
          <Settings className="w-4 h-4 text-blue-600" /> Additional Info
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-gray-700 font-semibold">Status</Label>
            <select 
              value={formData.status} 
              onChange={e => setFormData({...formData, status: e.target.value})} 
              className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-gray-700 font-semibold">Notes</Label>
            <Textarea 
              value={formData.notes} 
              onChange={e => setFormData({...formData, notes: e.target.value})} 
              maxLength={1000}
              className="resize-none h-20"
              placeholder="Any additional information..."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]">
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {initialData ? 'Update Customer' : 'Save Customer'}
        </Button>
      </div>
    </form>
  );
};

export default CustomerForm;