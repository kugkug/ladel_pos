import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X, Save } from 'lucide-react';

const EditProjectModal = ({ isOpen, onClose, project, onSave, customers }) => {
  const [formData, setFormData] = useState({
    projectNumber: '',
    projectTitle: '',
    projectDescription: '',
    customerId: '',
  });

  useEffect(() => {
    if (project) {
      setFormData({
        projectNumber: project.projectNumber || '',
        projectTitle: project.projectTitle || '',
        projectDescription: project.projectDescription || '',
        customerId: project.customerId || '',
      });
    }
  }, [project]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const customer = customers.find(c => c.id === formData.customerId);
    onSave({
      ...formData,
      companyName: customer ? customer.companyName : project.companyName
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">Edit Project Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label>Project Number</Label>
            <input required value={formData.projectNumber} onChange={e => setFormData({...formData, projectNumber: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-md text-gray-900 bg-white" />
          </div>
          <div>
            <Label>Project Title</Label>
            <input value={formData.projectTitle} onChange={e => setFormData({...formData, projectTitle: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-md text-gray-900 bg-white" />
          </div>
          <div>
            <Label>Project Description</Label>
            <textarea value={formData.projectDescription} onChange={e => setFormData({...formData, projectDescription: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-md text-gray-900 bg-white" rows="3" />
          </div>
          <div>
            <Label>Company</Label>
            <select required value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-md bg-white text-gray-900">
              <option value="">Select Company</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700"><Save className="w-4 h-4 mr-2"/> Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectModal;