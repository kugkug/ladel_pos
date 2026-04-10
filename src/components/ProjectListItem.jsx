import React from 'react';
import { Building2, User, ChevronRight } from 'lucide-react';

const ProjectListItem = ({ project, collections }) => {
  const { getProjectDocuments, formatCurrency } = collections;
  const docs = getProjectDocuments(project.id);
  
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between md:items-center gap-4 group cursor-pointer">
      <div className="flex items-start gap-4">
        <div className="bg-blue-50 p-3 rounded-xl text-blue-600 mt-1">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{project.projectNumber}</h3>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${project.status === 'Active' ? 'bg-green-100 text-green-700' : project.status === 'Canceled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
              {project.status}
            </span>
          </div>
          <p className="text-gray-800 font-medium mb-1">{project.projectTitle || 'Untitled Project'}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5"/> {project.company_name || project.companyName || 'Unknown'}</span>
            <span className="flex items-center gap-1"><User className="w-3.5 h-3.5"/> {project.contact_name || project.contactPerson || 'No contact'}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-6 md:ml-auto">
        <div className="text-right">
          <p className="text-xs text-gray-500 font-medium mb-0.5">Project Value</p>
          <p className="font-bold text-gray-900">{formatCurrency(docs.quotation?.grossAmount || 0)}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
      </div>
    </div>
  );
};

export default ProjectListItem;