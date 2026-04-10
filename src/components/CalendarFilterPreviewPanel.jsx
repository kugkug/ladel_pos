import React, { useContext } from 'react';
import { X, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

const CalendarFilterPreviewPanel = ({ events, filterType, onClose }) => {
  if (!events || events.length === 0) return null;

  const typeConfig = {
    upcoming: { color: 'bg-blue-100 text-blue-800 border-blue-200', title: 'Upcoming Collections' },
    overdue: { color: 'bg-red-100 text-red-800 border-red-200', title: 'Overdue Projects' },
    paid: { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', title: 'Paid/Completed' },
    reminder: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', title: 'Custom Reminders' }
  };

  const config = typeConfig[filterType] || typeConfig.upcoming;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl z-50 flex flex-col border-l border-gray-100 animate-in slide-in-from-right duration-300">
      <div className={`px-4 py-4 border-b flex justify-between items-center ${config.color}`}>
        <h3 className="font-bold flex items-center gap-2"><CalendarIcon className="w-5 h-5"/> {config.title} ({events.length})</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-white/20"><X className="w-5 h-5"/></Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {events.map((evt, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-semibold px-2 py-1 bg-gray-100 rounded text-gray-600 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {format(new Date(evt.date), 'MMM dd, yyyy')}
              </span>
              {evt.amount && <span className="font-bold text-gray-900">{formatCurrency(evt.amount)}</span>}
            </div>
            <h4 className="font-bold text-gray-800">{evt.title}</h4>
            {evt.projectId && <p className="text-sm text-gray-500 mt-1">Project reference linked</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarFilterPreviewPanel;