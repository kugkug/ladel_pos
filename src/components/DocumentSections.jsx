import React, { useState } from 'react';
import { Edit, Trash2, CheckCircle2, AlertCircle, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddQuotationModal, AddPurchaseOrderModal, AddDeliveryReceiptModal, AddInvoiceModal, AddAcknowledgementReceiptModal } from '@/components/DocumentForms';

const StatusBadge = ({ status }) => {
  let color = 'bg-gray-100 text-gray-700';
  if (['Approved', 'Confirmed', 'Completed DR', 'Paid', 'Completed AR'].includes(status)) color = 'bg-green-100 text-green-700';
  if (['Draft', 'Pending', 'Sent'].includes(status)) color = 'bg-yellow-100 text-yellow-700';
  if (['Rejected'].includes(status)) color = 'bg-red-100 text-red-700';
  return <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${color}`}>{status}</span>;
};

export const DocumentSection = ({ title, icon: Icon, documents, isAllowed, disabledMessage, onAdd, onEdit, onDelete, onStatusChange, ModalComponent, projectId, nextActionLabel, onNextAction }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);

  const handleSave = async (data, isEditPayload) => {
    if (isEditPayload) await onEdit(data, isEditPayload);
    else await onAdd(data);
  };

  const openEdit = (doc) => {
    setEditingDoc(doc);
    setIsModalOpen(true);
  };

  const openAdd = () => {
    setEditingDoc(null);
    setIsModalOpen(true);
  };

  return (
    <div className={`bg-white border rounded-xl shadow-sm overflow-hidden mb-6 ${!isAllowed ? 'opacity-60 grayscale' : 'border-gray-200'}`}>
      <div className="bg-gray-50 border-b border-gray-100 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-gray-500" />
          <h3 className="font-bold text-gray-900">{title}</h3>
        </div>
        {isAllowed && (
          <Button variant="outline" size="sm" onClick={openAdd} className="bg-white hover:bg-gray-50">
            Add {title}
          </Button>
        )}
      </div>

      <div className="p-5">
        {!isAllowed ? (
          <div className="text-center py-6 text-gray-500 flex flex-col items-center">
            <AlertCircle className="w-8 h-8 mb-2 text-gray-300" />
            <p className="font-medium text-sm">{disabledMessage}</p>
          </div>
        ) : documents && documents.length > 0 ? (
          <div className="space-y-4">
            {documents.map(doc => (
              <div key={doc.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900">{doc.quotation_number || doc.po_number || doc.dr_number || doc.invoice_number || doc.ar_number}</span>
                    <StatusBadge status={doc.status} />
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-4">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Issued: {new Date(doc.date_issued || doc.date_delivered || doc.created_at).toLocaleDateString()}</span>
                    {doc.gross_amount && <span className="font-medium text-gray-700">Gross: ₱{parseFloat(doc.gross_amount).toFixed(2)}</span>}
                    {doc.amount && <span className="font-medium text-gray-700">Amount: ₱{parseFloat(doc.amount).toFixed(2)}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(doc)} className="bg-white text-blue-600 hover:bg-blue-50 border-gray-200">
                    <Edit className="w-4 h-4 mr-1" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { if(window.confirm('Are you sure?')) onDelete(doc.id); }} className="bg-white text-red-600 hover:bg-red-50 border-gray-200">
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            ))}
            
            {nextActionLabel && onNextAction && (
              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <Button onClick={onNextAction} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {nextActionLabel}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 flex flex-col items-center border border-dashed border-gray-200 rounded-lg bg-gray-50">
            <FileText className="w-8 h-8 mb-2 text-gray-300" />
            <p className="font-medium">No {title.toLowerCase()} created yet</p>
          </div>
        )}
      </div>

      <ModalComponent 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        projectId={projectId} 
        initialData={editingDoc} 
      />
    </div>
  );
};