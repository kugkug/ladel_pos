import React from 'react';
import { Lock, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

const DocumentSectionHeader = ({ title, isLocked, isCompleted, isOpen, onToggle }) => {
  return (
    <div 
      className={`flex items-center justify-between p-4 cursor-pointer transition-colors border-b ${isLocked ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'}`}
      onClick={!isLocked ? onToggle : undefined}
    >
      <div className="flex items-center gap-3">
        {isLocked ? (
          <Lock className="w-5 h-5 text-gray-400" />
        ) : isCompleted ? (
          <CheckCircle className="w-5 h-5 text-emerald-500" />
        ) : (
          <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
        )}
        <h3 className={`font-semibold ${isLocked ? 'text-gray-400' : 'text-gray-900'}`}>{title}</h3>
        {isLocked && <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Locked</span>}
      </div>
      {!isLocked && (
        <div className="text-gray-400">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      )}
    </div>
  );
};

export default DocumentSectionHeader;