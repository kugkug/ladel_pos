import React, { useState, useContext } from 'react';
import { ProjectContext } from '@/contexts/ProjectContext';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, FileInput, Wand2 } from 'lucide-react';
import PurchaseOrderForm from '@/components/PurchaseOrderForm';
import GeneratePOForm from '@/components/GeneratePOForm';

const PurchaseOrderSection = ({ projectId, existingPO }) => {
  const { addPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder, formatCurrency } = useContext(ProjectContext);
  
  // Modes: 'view', 'choice', 'input', 'generate', 'edit'
  const [mode, setMode] = useState('view'); 

  const handleSave = (data) => {
    if (mode === 'edit' && existingPO) {
      const success = updatePurchaseOrder(existingPO.id, { ...data, projectId });
      if (success) setMode('view');
    } else {
      const success = addPurchaseOrder({ ...data, projectId });
      if (success) setMode('view');
    }
  };

  const handleDelete = () => {
    if (existingPO && window.confirm("Delete PO?")) {
      deletePurchaseOrder(existingPO.id);
      setMode('view');
    }
  };

  if (existingPO && mode === 'view') {
    return (
      <div className="p-4 bg-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div><p className="text-sm text-gray-500">PO Number</p><p className="font-medium text-gray-900">{existingPO.poNumber}</p></div>
          <div><p className="text-sm text-gray-500">Date</p><p className="font-medium text-gray-900">{existingPO.date}</p></div>
          <div><p className="text-sm text-gray-500">Gross Amount</p><p className="font-medium text-gray-900">{formatCurrency(existingPO.grossAmount)}</p></div>
          <div><p className="text-sm text-gray-500">Terms</p><p className="font-medium text-gray-900">{existingPO.paymentTerms}</p></div>
        </div>
        {existingPO.file && <div className="mb-4 text-sm text-blue-600 flex items-center gap-1">📎 Attached: {existingPO.file.name}</div>}
        <div className="flex gap-2 border-t pt-3 mt-2">
          <Button variant="outline" size="sm" onClick={() => setMode('edit')}><Edit className="w-4 h-4 mr-1"/> Edit PO</Button>
          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={handleDelete}><Trash2 className="w-4 h-4 mr-1"/> Delete</Button>
        </div>
      </div>
    );
  }

  if (!existingPO && mode === 'view') {
    return (
      <div className="p-6 bg-gray-50 flex flex-col md:flex-row items-center justify-center gap-4 border-t border-dashed border-gray-200">
        <Button onClick={() => setMode('input')} variant="outline" className="w-full md:w-auto bg-white border-blue-200 hover:bg-blue-50 text-blue-700">
          <FileInput className="w-4 h-4 mr-2"/> Input PO from Customer
        </Button>
        <span className="text-gray-400 text-sm font-medium">OR</span>
        <Button onClick={() => setMode('generate')} className="w-full md:w-auto bg-blue-600 text-white hover:bg-blue-700">
          <Wand2 className="w-4 h-4 mr-2"/> Generate PO
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 border-t">
      {mode === 'input' && <PurchaseOrderForm projectId={projectId} onCancel={() => setMode('view')} onSuccess={handleSave} />}
      {mode === 'generate' && <GeneratePOForm projectId={projectId} onCancel={() => setMode('view')} onSuccess={handleSave} />}
      {mode === 'edit' && <PurchaseOrderForm projectId={projectId} existingPO={existingPO} onCancel={() => setMode('view')} onSuccess={handleSave} />}
    </div>
  );
};

export default PurchaseOrderSection;