import React, { useState, useContext } from 'react';
import { ProjectContext } from '@/contexts/ProjectContext';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, Plus, Eye } from 'lucide-react';
import InvoiceForm from '@/components/InvoiceForm';
import InvoicePreviewModal from '@/components/InvoicePreviewModal';
import { differenceInDays, parseISO } from 'date-fns';

const InvoiceSection = ({ projectId, poData }) => {
  const { invoices, addInvoice, updateInvoice, deleteInvoice, formatCurrency } = useContext(ProjectContext);
  const [editingId, setEditingId] = useState(null);
  const [previewId, setPreviewId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const projectInvoices = invoices.filter(i => i.projectId === projectId);

  const handleSave = (data) => {
    if (editingId) {
      updateInvoice(editingId, data);
      setEditingId(null);
    } else {
      addInvoice(data);
      setIsAdding(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete Invoice?")) {
      deleteInvoice(id);
    }
  };

  const getRunningBit = (inv) => {
    if (!inv.date || !inv.dueDate) return '-';
    try {
      const start = parseISO(inv.date);
      const end = parseISO(inv.dueDate);
      return `${differenceInDays(end, start)} Days`;
    } catch {
      return '-';
    }
  };

  return (
    <div className="bg-white">
      {!isAdding && !editingId && (
        <div className="p-4">
          {projectInvoices.length > 0 ? (
            <div className="space-y-4 mb-4">
              {projectInvoices.map(inv => {
                const isPartial = inv.invoiceStatus === 'Partial Invoice';
                const statusColor = isPartial ? 'bg-yellow-100 text-yellow-800' : 'bg-emerald-100 text-emerald-800';

                return (
                  <div key={inv.id} className="border p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50 shadow-sm hover:shadow-md transition-all group">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 flex-1 w-full text-sm">
                      <div><span className="text-gray-500 text-xs block mb-1">Invoice No.</span><span className="font-semibold text-gray-900">INV{inv.invoiceNumber}</span></div>
                      <div><span className="text-gray-500 text-xs block mb-1">Date</span>{inv.date}</div>
                      <div><span className="text-gray-500 text-xs block mb-1">Amount</span><span className="font-medium text-gray-900">{formatCurrency(inv.grossAmount)}</span></div>
                      <div><span className="text-gray-500 text-xs block mb-1">Due & Bit</span>{inv.dueDate} <span className="text-xs text-gray-400 block">{getRunningBit(inv)}</span></div>
                      <div>
                        <span className="text-gray-500 text-xs block mb-1">Status</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor}`}>{inv.invoiceStatus || 'Completed Invoice'}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto justify-end opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="sm" onClick={() => setEditingId(inv.id)}><Edit className="w-4 h-4 mr-1"/> Edit</Button>
                      <Button variant="outline" size="sm" onClick={() => setPreviewId(inv.id)}><Eye className="w-4 h-4 mr-1"/> Preview</Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(inv.id)}><Trash2 className="w-4 h-4"/></Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 mb-4 text-sm">No invoices added yet.</p>
          )}
          <Button onClick={() => setIsAdding(true)} className="bg-blue-600 text-white"><Plus className="w-4 h-4 mr-1"/> Add More Invoices</Button>
        </div>
      )}

      {(isAdding || editingId) && (
        <div className="p-4 bg-gray-50 border-t">
          <InvoiceForm 
            projectId={projectId} 
            poData={poData} 
            existingInvoice={editingId ? projectInvoices.find(i => i.id === editingId) : null}
            onCancel={() => { setIsAdding(false); setEditingId(null); }}
            onSuccess={handleSave}
          />
        </div>
      )}

      <InvoicePreviewModal 
        isOpen={!!previewId} 
        onClose={() => setPreviewId(null)} 
        data={projectInvoices.find(i => i.id === previewId) || null} 
      />
    </div>
  );
};

export default InvoiceSection;