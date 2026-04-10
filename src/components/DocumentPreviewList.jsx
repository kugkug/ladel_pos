import React, { useState, useContext } from 'react';
import { X, FileText, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectContext } from '@/contexts/ProjectContext';
import { downloadFile } from '@/lib/downloadFile';
import FilePreviewModal from '@/components/FilePreviewModal';

const DocumentPreviewList = ({ projectId, onClose }) => {
  const { getProjectDocuments, formatCurrency, projects } = useContext(ProjectContext);
  const [selectedFile, setSelectedFile] = useState(null);
  
  const project = projects.find(p => p.id === projectId);
  const docs = getProjectDocuments(projectId);

  if (!project) return null;

  const documents = [];
  
  if (docs.quotation) documents.push({ type: 'Quotation', title: `QT${docs.quotation.quotationNumber}`, data: docs.quotation });
  if (docs.purchaseOrder) documents.push({ type: 'Purchase Order', title: `PO${docs.purchaseOrder.poNumber}`, data: docs.purchaseOrder });
  docs.deliveryReceipts?.forEach((dr, i) => documents.push({ type: 'Delivery Receipt', title: `DR${dr.drNumber}`, data: dr }));
  docs.invoicesList?.forEach((inv, i) => documents.push({ type: 'Invoice', title: `INV${inv.invoiceNumber}`, data: inv }));
  docs.acknowledgementReceiptsList?.forEach((ar, i) => documents.push({ type: 'Acknowledgement Receipt', title: `AR${ar.arNumber}`, data: ar }));

  const handlePreview = (doc) => {
    if (doc.data?.file) {
      setSelectedFile({ file: doc.data.file, title: doc.title });
    } else {
      alert("No file attached to this document.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden relative">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Project Documents</h2>
            <p className="text-sm text-gray-500">{project.projectNumber} - {project.companyName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 bg-white rounded-full p-1 shadow-sm"><X className="w-6 h-6"/></button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
          {documents.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed">No documents found for this project.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((doc, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  <div className="flex items-start justify-between mb-3 border-b pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileText className="w-5 h-5"/></div>
                      <div>
                        <p className="font-bold text-gray-900">{doc.title}</p>
                        <p className="text-xs font-medium text-blue-600">{doc.type}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1 mb-4 flex-1 text-sm">
                    {doc.data.dateIssued && <p><span className="text-gray-500">Date:</span> {doc.data.dateIssued}</p>}
                    {doc.data.date && <p><span className="text-gray-500">Date:</span> {doc.data.date}</p>}
                    {doc.data.netAmount && <p><span className="text-gray-500">Net Amount:</span> {formatCurrency(doc.data.netAmount)}</p>}
                    {doc.data.grossAmount && <p><span className="text-gray-500">Gross Amount:</span> {formatCurrency(doc.data.grossAmount)}</p>}
                    {doc.data.amount && <p><span className="text-gray-500">Amount:</span> {formatCurrency(doc.data.amount)}</p>}
                    {doc.data.invoiceStatus && <p><span className="text-gray-500">Status:</span> {doc.data.invoiceStatus}</p>}
                    {doc.data.arStatus && <p><span className="text-gray-500">Status:</span> {doc.data.arStatus}</p>}
                  </div>
                  
                  <div className="flex gap-2 mt-auto">
                    <Button 
                      variant="outline" 
                      className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                      onClick={() => handlePreview(doc)}
                      disabled={!doc.data.file}
                    >
                      <Eye className="w-4 h-4 mr-2"/> Preview
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => downloadFile(doc.data.file, doc.title)}
                      disabled={!doc.data.file}
                    >
                      <Download className="w-4 h-4 mr-2"/> Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {selectedFile && (
        <FilePreviewModal 
          file={selectedFile.file} 
          title={selectedFile.title} 
          onClose={() => setSelectedFile(null)} 
        />
      )}
    </div>
  );
};

export default DocumentPreviewList;