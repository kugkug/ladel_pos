import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const AddSupplierModal = ({ isOpen, onClose, onSave }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    tin: '',
    address: '',
    contactPerson: '',
    phone: ''
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.tin || !formData.address) {
      toast({ title: "Validation Error", description: "Name, TIN, and Address are required.", variant: "destructive" });
      return;
    }
    onSave(formData);
    setFormData({ name: '', tin: '', address: '', contactPerson: '', phone: '' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Add New Supplier</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name *</label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" placeholder="Company Name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">TIN *</label>
            <input required type="text" name="tin" value={formData.tin} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" placeholder="000-000-000-000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
            <textarea required name="address" value={formData.address} onChange={handleChange} rows="2" className="w-full px-3 py-2 border rounded-lg" placeholder="Full address"></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
              <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
            <button type="submit" className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" /> Save Supplier
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSupplierModal;