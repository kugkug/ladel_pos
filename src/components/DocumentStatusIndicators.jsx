import React from 'react';

const StatusBadge = ({ label, status, details }) => {
  let bgColor = "bg-gray-100 text-gray-500"; // locked/pending
  if (status === 'created') bgColor = "bg-emerald-100 text-emerald-700";
  if (status === 'overdue') bgColor = "bg-red-100 text-red-700";

  return (
    <div className="relative group flex items-center">
      <span className={`px-2 py-1 text-xs font-semibold rounded-md ${bgColor} cursor-help`}>
        {label}
      </span>
      {details && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 bg-gray-900 text-white text-xs rounded p-2 z-10 shadow-lg">
          {details}
        </div>
      )}
    </div>
  );
};

const DocumentStatusIndicators = ({ docsStatus, docsDetails }) => {
  const getDetails = (type, data) => {
    if (!data || (Array.isArray(data) && data.length === 0)) return null;
    if (Array.isArray(data)) return `${data.length} document(s)`;
    return `${data.poNumber || data.invoiceNumber || data.arNumber || ''} ${data.date ? '- ' + data.date : ''}`;
  };

  return (
    <div className="flex gap-2 items-center">
      <StatusBadge label="PO" status={docsStatus.po} details={getDetails('po', docsDetails.purchaseOrder)} />
      <StatusBadge label="DR" status={docsStatus.dr} details={getDetails('dr', docsDetails.deliveryReceipts)} />
      <StatusBadge label="INV" status={docsStatus.invoice} details={getDetails('invoice', docsDetails.invoice)} />
      <StatusBadge label="AR" status={docsStatus.ar} details={getDetails('ar', docsDetails.acknowledgementReceipt)} />
    </div>
  );
};

export default DocumentStatusIndicators;