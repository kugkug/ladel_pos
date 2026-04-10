import React, { useState, useContext } from 'react';
import { ProjectContext } from '@/contexts/ProjectContext';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, Plus, Eye } from 'lucide-react';
import DeliveryReceiptForm from '@/components/DeliveryReceiptForm';
import DRPreviewModal from '@/components/DRPreviewModal';

const DeliveryReceiptSection = ({ projectId, existingDRs }) => {
  const { addDeliveryReceipt, updateDeliveryReceipt, deleteDeliveryReceipt } = useContext(ProjectContext);
  const [editingId, setEditingId] = useState(null);
  const [previewId, setPreviewId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleSave = (data) => {
    if (editingId) {
      updateDeliveryReceipt(editingId, data);
      setEditingId(null);
    } else {
      addDeliveryReceipt(data);
      setIsAdding(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete DR?")) {
      deleteDeliveryReceipt(id);
    }
  };

  return (
    <div className="bg-white">
      {!isAdding && !editingId && (
        <div className="p-4">
          {existingDRs && existingDRs.length > 0 ? (
            <div className="space-y-4 mb-4">
              {existingDRs.map(dr => {
                const isPartial = dr.drStatus === 'Partial DR';
                const statusColor = isPartial ? 'bg-yellow-100 text-yellow-800' : 'bg-emerald-100 text-emerald-800';

                return (
                  <div key={dr.id} className="border p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50 shadow-sm hover:shadow-md transition-all group">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 flex-1 w-full text-sm">
                      <div><span className="text-gray-500 text-xs block mb-1">DR Number</span><span className="font-semibold text-gray-900">DR{dr.drNumber}</span></div>
                      <div><span className="text-gray-500 text-xs block mb-1">Date</span>{dr.date}</div>
                      <div><span className="text-gray-500 text-xs block mb-1">Qty</span>{dr.quantity}</div>
                      <div>
                        <span className="text-gray-500 text-xs block mb-1">Status</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor}`}>{dr.drStatus || 'Completed DR'}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto justify-end opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="sm" onClick={() => setEditingId(dr.id)}><Edit className="w-4 h-4 mr-1"/> Edit</Button>
                      <Button variant="outline" size="sm" onClick={() => setPreviewId(dr.id)}><Eye className="w-4 h-4 mr-1"/> Preview</Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(dr.id)}><Trash2 className="w-4 h-4"/></Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 mb-4 text-sm">No Delivery Receipts added yet.</p>
          )}
          <Button onClick={() => setIsAdding(true)} className="bg-blue-600 text-white"><Plus className="w-4 h-4 mr-1"/> Add More DRs</Button>
        </div>
      )}

      {(isAdding || editingId) && (
        <div className="p-4 bg-gray-50 border-t">
          <DeliveryReceiptForm 
            projectId={projectId} 
            existingDR={editingId ? existingDRs.find(d => d.id === editingId) : null}
            onCancel={() => { setIsAdding(false); setEditingId(null); }}
            onSuccess={handleSave}
          />
        </div>
      )}

      <DRPreviewModal 
        isOpen={!!previewId} 
        onClose={() => setPreviewId(null)} 
        data={existingDRs?.find(d => d.id === previewId) || null} 
      />
    </div>
  );
};

export default DeliveryReceiptSection;