import React, { useState, useContext } from 'react';
import { ProjectContext } from '@/contexts/ProjectContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const ProjectInformationForm = () => {
  const { createProject } = useContext(ProjectContext);
  const [formData, setFormData] = useState({ projectNumber: '', companyName: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.projectNumber || !formData.companyName) return;
    createProject(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Project Information</h3>
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
      <div className="flex justify-end pt-4">
        <Button type="submit">Proceed to Quotation</Button>
      </div>
    </form>
  );
};

export default ProjectInformationForm;