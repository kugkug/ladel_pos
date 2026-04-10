import React, { useContext } from 'react';
import { ProjectContext } from '@/contexts/ProjectContext';
import { Eye, Edit2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ProjectDetailsSection = () => {
  const { selectedProject, getProjectDocuments, setPreviewDocument, formatCurrency } = useContext(ProjectContext);

  if (!selectedProject) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center text-gray-500 h-full flex flex-col justify-center items-center">
        <Lock className="w-12 h-12 mb-4 text-gray-300" />
        <p>Select a project from the search panel to view details.</p>
      </div>
    );
  }

  const docs = getProjectDocuments(selectedProject.id);

  const Section = ({ title, data, type, locked }) => {
    const isCompleted = data && (Array.isArray(data) ? data.length > 0 : true);
    
    return (
      <div className={`p-4 border rounded-xl mb-4 ${locked ? 'bg-gray-50 opacity-60' : 'bg-white'}`}>
        <div className="flex justify-between items-center">
          <div>
            <h4 className={`font-bold ${locked ? 'text-gray-500' : 'text-gray-900'}`}>{title}</h4>
            <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
              locked ? 'bg-gray-200 text-gray-600' : 
              isCompleted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {locked ? 'Locked' : isCompleted ? 'Completed' : 'Pending'}
            </span>
          </div>
          <div className="flex gap-2">
            {!locked && (
              <>
                <Button variant="outline" size="sm" onClick={() => setPreviewDocument({ type: title, data })}>
                  <Eye className="w-4 h-4 mr-1" /> View
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const hasQuote = !!docs.quotation;
  const hasPO = !!docs.purchaseOrder;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{selectedProject.projectNumber}</h3>
          <p className="text-gray-500">{selectedProject.companyName}</p>
        </div>
        <Button onClick={() => setPreviewDocument({ type: 'All Documents', data: docs, isFullProject: true })} className="bg-blue-600 text-white hover:bg-blue-700">
          Open Full Preview
        </Button>
      </div>

      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
        <Section title="Quotation" data={docs.quotation} locked={false} />
        <Section title="Purchase Order" data={docs.purchaseOrder} locked={!hasQuote} />
        <Section title="Delivery Receipts" data={docs.deliveryReceipts} locked={!hasPO} />
        <Section title="Invoice" data={docs.invoice} locked={!hasPO} />
        <Section title="Acknowledgement Receipt" data={docs.acknowledgementReceipt} locked={!hasPO} />
      </div>
    </div>
  );
};

export default ProjectDetailsSection;