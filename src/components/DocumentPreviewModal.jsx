import React, { useContext } from 'react';
import { ProjectContext } from '@/contexts/ProjectContext';
import { X, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DocumentPreviewModal = () => {
  const { previewDocument, setPreviewDocument, formatCurrency } = useContext(ProjectContext);

  if (!previewDocument) return null;

  const { data, isFullProject } = previewDocument;

  const renderDocSection = (title, doc) => {
    if (!doc) return null;
    return (
      <div className="mb-6 p-4 border rounded-xl bg-gray-50">
        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><FileText className="w-4 h-4"/> {title}</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
          {Object.entries(doc).filter(([k]) => !['id', 'projectId', 'file', 'description'].includes(k)).map(([k, v]) => (
            <div key={k}>
              <span className="text-gray-500 block text-xs capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
              <span className="font-medium text-gray-900">{k.toLowerCase().includes('amount') ? formatCurrency(v) : v}</span>
            </div>
          ))}
        </div>
        {doc.description && <div className="text-sm mb-3"><span className="text-gray-500 block text-xs">Description</span>{doc.description}</div>}
        {doc.file && (
          <div className="flex items-center gap-2 mt-2 pt-3 border-t">
            <span className="text-sm text-blue-600 truncate">📎 {doc.file.name}</span>
            <Button variant="outline" size="sm" className="ml-auto" onClick={() => alert("Download placeholder")}><Download className="w-3 h-3 mr-1"/> Download</Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-900 text-white">
          <h2 className="text-lg font-bold">Project Documents Overview</h2>
          <button onClick={() => setPreviewDocument(null)} className="text-gray-400 hover:text-white"><X className="w-6 h-6"/></button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          {isFullProject && data ? (
            <>
              {renderDocSection('Quotation', data.quotation)}
              {renderDocSection('Purchase Order', data.purchaseOrder)}
              {data.deliveryReceipts?.length > 0 && data.deliveryReceipts.map((dr, i) => renderDocSection(`Delivery Receipt ${i+1}`, dr))}
              {renderDocSection('Invoice', data.invoice)}
              {renderDocSection('Acknowledgement Receipt', data.acknowledgementReceipt)}
              
              {!data.quotation && !data.purchaseOrder && data.deliveryReceipts?.length===0 && !data.invoice && !data.acknowledgementReceipt && (
                <div className="text-center py-12 text-gray-500">No documents available for this project.</div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">Document preview not available.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;