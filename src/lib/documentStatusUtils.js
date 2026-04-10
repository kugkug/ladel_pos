export const getProjectDocumentStatus = (projectId, collections) => {
  const { 
    quotations = [], 
    purchaseOrders = [], 
    deliveryReceipts = [], 
    invoices = [], 
    acknowledgementReceipts = [] 
  } = collections || {};
  
  const hasQuote = quotations.some(q => q.projectId === projectId);
  const hasPO = purchaseOrders.some(p => p.projectId === projectId);
  const hasDR = deliveryReceipts.some(d => d.projectId === projectId);
  const hasInv = invoices.some(i => i.projectId === projectId);
  const hasAR = acknowledgementReceipts.some(a => a.projectId === projectId);

  return {
    quotation: hasQuote ? 'created' : 'pending',
    po: !hasQuote ? 'locked' : hasPO ? 'created' : 'pending',
    dr: !hasPO ? 'locked' : hasDR ? 'created' : 'pending',
    invoice: !hasDR ? 'locked' : hasInv ? 'created' : 'pending',
    ar: !hasInv ? 'locked' : hasAR ? 'created' : 'pending',
  };
};

export const getDocumentDetails = (projectId, documentType, collections) => {
  const { 
    quotations = [], 
    purchaseOrders = [], 
    deliveryReceipts = [], 
    invoices = [], 
    acknowledgementReceipts = [] 
  } = collections || {};
  
  switch (documentType) {
    case 'quotation': 
      return quotations.find(q => q.projectId === projectId) || null;
    case 'po': 
      return purchaseOrders.find(p => p.projectId === projectId) || null;
    case 'dr': 
      return deliveryReceipts.filter(d => d.projectId === projectId) || [];
    case 'invoice': 
      return invoices.find(i => i.projectId === projectId) || null;
    case 'ar': 
      return acknowledgementReceipts.find(a => a.projectId === projectId) || null;
    default: 
      return null;
  }
};

export const getDocumentCount = (projectId, documentType, collections) => {
  const docs = getDocumentDetails(projectId, documentType, collections);
  if (Array.isArray(docs)) return docs.length;
  return docs ? 1 : 0;
};

export const isDocumentLocked = (projectId, documentType, collections) => {
  const status = getProjectDocumentStatus(projectId, collections);
  return status[documentType] === 'locked';
};