import React from 'react';
import { X } from 'lucide-react';

const ActiveFiltersDisplay = ({ filters, onRemove, onClearAll }) => {
  if (!filters || filters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
      <span className="text-sm text-gray-500 font-medium mr-1">Active Filters:</span>
      {filters.map((filter, index) => (
        <span 
          key={`${filter.type}-${filter.value}-${index}`}
          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 transition-all hover:bg-blue-100"
        >
          {filter.label}
          <button
            type="button"
            onClick={() => onRemove(filter)}
            className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-800 focus:outline-none transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <button
        onClick={onClearAll}
        className="text-xs text-gray-500 hover:text-gray-700 font-medium ml-2 underline underline-offset-2 transition-colors"
      >
        Clear All
      </button>
    </div>
  );
};

export default ActiveFiltersDisplay;