import React, { useState, useContext } from 'react';
import { ProjectContext } from '@/contexts/ProjectContext';
import { AuthorizationContext } from '@/contexts/AuthorizationContext';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, Plus, Lock } from 'lucide-react';
import AuthorizationModal from '@/components/AuthorizationModal';
import AcknowledgementReceiptForm from '@/components/AcknowledgementReceiptForm';

const AcknowledgementReceiptSection = ({ projectId, invoiceData }) => {
  const { acknowledgementReceipts, addAcknowledgementReceipt, updateAcknowledgementReceipt, deleteAcknowledgementReceipt, formatCurrency, projects } = useContext(ProjectContext);
  const { isAuthorized } = useContext(AuthorizationContext);
  
  const [editingId, setEditingId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const projectARs = acknowledgementReceipts.filter(ar => ar.projectId === projectId);
  const project = projects.find(p => p.id === projectId);
  const isLocked = project?.locked;

  const executeSave = (data) => {
    if (editingId) {
      updateAcknowledgementReceipt(editingId, data);
      setEditingId(null);
    } else {
      addAcknowledgementReceipt(data);
      setIsAdding(false);
    }
  };

  const handleSave = (data) => {
    if (editingId && !isAuthorized) {
      setPendingAction(() => () => executeSave(data));
      setShowAuth(true);
    } else {
      executeSave(data);
    }
  };

  const executeDelete = (id) => {
    deleteAcknowledgementReceipt(id);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete AR? Requires authorization.")) {
      if (!isAuthorized) {
        setPendingAction(() => () => executeDelete(id));
        setShowAuth(true);
      } else {
        executeDelete(id);
      }
    }
  };

  const handleEditClick = (id) => {
    if (!isAuthorized) {
      setPendingAction(() => () => setEditingId(id));
      setShowAuth(true);
    } else {
      setEditingId(id);
    }
  };

  return (
    <div className="bg-white relative">
      {isLocked && <div className="absolute top-4 right-4 flex items-center text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-bold z-10"><Lock className="w-3 h-3 mr-1"/> Paid & Locked</div>}
      
      {!isAdding && !editingId && (
        <div className="p-4">
          {projectARs.length > 0 ? (
            <div className="space-y-4 mb-4">
              {projectARs.map((ar, idx) => {
                const isPartial = ar.arStatus === 'Partial AR';
                const statusColor = isPartial ? 'bg-yellow-100 text-yellow-800' : 'bg-emerald-100 text-emerald-800';

                return (
                  <div key={ar.id} className="border p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50 shadow-sm hover:shadow-md transition-all">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 flex-1 w-full text-sm">
                      <div>
                        <span className="text-gray-500 text-xs block mb-1">AR Number</span>
                        <span className="font-semibold text-gray-900">AR{ar.arNumber}</span>
                        <span className="text-xs text-gray-400 block mt-1">AR {idx + 1} of 5</span>
                      </div>
                      <div><span className="text-gray-500 text-xs block mb-1">Date</span>{ar.date}</div>
                      <div><span className="text-gray-500 text-xs block mb-1">Amount</span><span className="font-medium text-gray-900">{formatCurrency(ar.amount)}</span></div>
                      <div>
                        <span className="text-gray-500 text-xs block mb-1">Status</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor}`}>{ar.arStatus || 'Completed AR'}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto justify-end">
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(ar.id)} className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200"><Edit className="w-4 h-4 mr-1"/> Secure Edit</Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(ar.id)}><Trash2 className="w-4 h-4 mr-1"/> Secure Delete</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 mb-4 text-sm">No Acknowledgement Receipts added yet.</p>
          )}
          
          <Button onClick={() => setIsAdding(true)} disabled={projectARs.length >= 5} className="bg-blue-600 text-white disabled:opacity-50">
            <Plus className="w-4 h-4 mr-1"/> {projectARs.length >= 5 ? 'Max 5 ARs Reached' : 'Add AR'}
          </Button>
        </div>
      )}

      {(isAdding || editingId) && (
        <div className="p-4 bg-gray-50 border-t">
          <AcknowledgementReceiptForm 
            projectId={projectId} 
            existingAR={editingId ? projectARs.find(a => a.id === editingId) : null}
            invoiceData={invoiceData}
            onCancel={() => { setIsAdding(false); setEditingId(null); }}
            onSuccess={handleSave}
          />
        </div>
      )}

      <AuthorizationModal isOpen={showAuth} onClose={() => setShowAuth(false)} onSuccess={() => pendingAction && pendingAction()} />
    </div>
  );
};

export default AcknowledgementReceiptSection;