import React, { useState, useContext } from 'react';
import { ProjectContext } from '@/contexts/ProjectContext';
import { CustomerContext } from '@/contexts/CustomerContext';
import SearchFilterPanel from '@/components/SearchFilterPanel';

const ProjectSearchPanel = () => {
  const { projects, setSelectedProject, getProjectDocuments } = useContext(ProjectContext);
  const { customers = [] } = useContext(CustomerContext);
  const [filters, setFilters] = useState({
    docType: 'All Documents',
    companyId: '',
    month: 'All Months',
    year: 'All Years',
    search: ''
  });

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const filtered = (projects || []).filter(p => {
    const docs = getProjectDocuments(p.id);
    const term = filters.search.toLowerCase();
    
    // Search match
    let matchSearch = true;
    if (term) {
      const mProj = p.projectNumber?.toLowerCase().includes(term);
      const mComp = p.companyName?.toLowerCase().includes(term);
      const mQT = docs.quotation?.quotationNumber && `qt${docs.quotation.quotationNumber}`.toLowerCase().includes(term);
      const mPO = docs.purchaseOrder?.poNumber && `po${docs.purchaseOrder.poNumber}`.toLowerCase().includes(term);
      const mDR = docs.deliveryReceipts?.some(dr => `dr${dr.drNumber}`.toLowerCase().includes(term));
      const mINV = docs.invoicesList?.some(inv => `inv${inv.invoiceNumber}`.toLowerCase().includes(term));
      const mAR = docs.acknowledgementReceiptsList?.some(ar => `ar${ar.arNumber}`.toLowerCase().includes(term));
      matchSearch = mProj || mComp || mQT || mPO || mDR || mINV || mAR;
    }

    // Company match
    const matchCompany = filters.companyId ? p.customerId === filters.companyId : true;

    // Doc Type match (if a specific doc type is selected, project MUST have it)
    let matchDocType = true;
    if (filters.docType !== 'All Documents') {
      if (filters.docType === 'QT') matchDocType = !!docs.quotation;
      if (filters.docType === 'PO') matchDocType = !!docs.purchaseOrder;
      if (filters.docType === 'DR') matchDocType = docs.deliveryReceipts?.length > 0;
      if (filters.docType === 'INV') matchDocType = docs.invoicesList?.length > 0;
      if (filters.docType === 'AR') matchDocType = docs.acknowledgementReceiptsList?.length > 0;
    }

    return matchSearch && matchCompany && matchDocType;
  });

  return (
    <div className="flex flex-col h-full space-y-4">
      <SearchFilterPanel onFilterChange={handleFilterChange} customers={customers} />
      
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex-1 flex flex-col transition-all">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Results ({filtered.length})</h3>
        
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {filtered.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed">
              <p className="text-gray-500">No matching projects found.</p>
            </div>
          ) : (
            filtered.map(p => (
              <div 
                key={p.id} 
                onClick={() => setSelectedProject(p)}
                className="p-4 border border-gray-100 rounded-xl cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-all flex flex-col justify-between"
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="font-bold text-gray-900 text-lg">{p.projectNumber}</p>
                  <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">View</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{p.companyName}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectSearchPanel;