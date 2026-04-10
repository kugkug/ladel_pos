import React from 'react';
import { FileText, ShoppingCart, Receipt, Truck, CheckSquare, Lock } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';

const ICONS = {
  Quotation: FileText,
  PO: ShoppingCart,
  Invoice: Receipt,
  DR: Truck,
  AR: CheckSquare
};

const COLORS = {
  Quotation: 'bg-purple-100 text-purple-600 border-purple-200 group-hover:bg-purple-600 group-hover:text-white',
  PO: 'bg-blue-100 text-blue-600 border-blue-200 group-hover:bg-blue-600 group-hover:text-white',
  Invoice: 'bg-green-100 text-green-600 border-green-200 group-hover:bg-green-600 group-hover:text-white',
  DR: 'bg-orange-100 text-orange-600 border-orange-200 group-hover:bg-orange-600 group-hover:text-white',
  AR: 'bg-pink-100 text-pink-600 border-pink-200 group-hover:bg-pink-600 group-hover:text-white'
};

const DocumentCard = ({ type, title, status, count, onClick, locked }) => {
  const Icon = ICONS[type] || FileText;
  const colorClass = COLORS[type] || COLORS.Quotation;

  return (
    <div 
      onClick={!locked ? onClick : undefined}
      className={`group relative p-6 bg-white rounded-xl border border-gray-200 shadow-sm transition-all duration-200 
        ${locked ? 'opacity-60 cursor-not-allowed bg-gray-50' : 'cursor-pointer hover:shadow-md hover:border-gray-300 hover:-translate-y-1'}
      `}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl border transition-colors duration-200 ${locked ? 'bg-gray-100 text-gray-400 border-gray-200' : colorClass}`}>
          {locked ? <Lock className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
        </div>
        {!locked && <StatusBadge status={status === 'Completed' ? 'completed' : 'pending'} />}
      </div>
      
      <div>
        <h3 className={`text-lg font-semibold mb-1 ${locked ? 'text-gray-500' : 'text-gray-900'}`}>{title}</h3>
        {count !== undefined && (
          <p className="text-sm text-gray-500">
            {count} {count === 1 ? 'Document' : 'Documents'}
          </p>
        )}
      </div>

      {locked && (
        <div className="mt-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
          Complete previous steps
        </div>
      )}
    </div>
  );
};

export default DocumentCard;