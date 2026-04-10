import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const FilterDropdown = ({ label, options, value, onChange, multiSelect = false, placeholder = "Select..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    if (multiSelect) {
      const currentValues = Array.isArray(value) ? value : [];
      if (currentValues.includes(optionValue)) {
        onChange(currentValues.filter(v => v !== optionValue));
      } else {
        onChange([...currentValues, optionValue]);
      }
    } else {
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  const getDisplayText = () => {
    if (multiSelect) {
      if (!value || value.length === 0) return placeholder;
      if (value.length === 1) {
        const opt = options.find(o => o.value === value[0]);
        return opt ? opt.label : placeholder;
      }
      return `${value.length} selected`;
    } else {
      const opt = options.find(o => o.value === value);
      return opt ? opt.label : placeholder;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {label && <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">{label}</label>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors",
          isOpen ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-200 hover:border-gray-300"
        )}
      >
        <span className="truncate pr-2 text-gray-700 font-medium">{getDisplayText()}</span>
        <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform duration-200", isOpen && "transform rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full min-w-[200px] mt-1 bg-white border border-gray-100 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2">
          <div className="p-1">
            {options.map((option) => {
              const isSelected = multiSelect 
                ? (Array.isArray(value) && value.includes(option.value))
                : value === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "flex items-center justify-between w-full px-3 py-2 text-sm rounded-md text-left transition-colors",
                    isSelected ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-blue-600 ml-2 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;