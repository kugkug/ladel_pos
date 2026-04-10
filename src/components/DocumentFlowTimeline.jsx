import React from 'react';
import { Check, Circle, Clock } from 'lucide-react';

const stages = [
  { id: 'QT', label: 'Quotation', key: 'qt' },
  { id: 'PO', label: 'Purchase Order', key: 'po' },
  { id: 'DR', label: 'Delivery Receipt', key: 'dr' },
  { id: 'INV', label: 'Invoice', key: 'inv' },
  { id: 'AR', label: 'Acknowledgement', key: 'ar' }
];

const DocumentFlowTimeline = ({ currentStage, flowStatus }) => {
  return (
    <div className="w-full bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-8 overflow-x-auto">
      <div className="min-w-[600px]">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-6 right-6 top-5 h-0.5 bg-gray-200 -z-10"></div>
          {stages.map((stage, index) => {
            const status = flowStatus[stage.key];
            const isCompleted = ['approved', 'confirmed', 'completed', 'paid', 'sent'].includes(status);
            const isCurrent = status === 'draft' || status === 'pending';
            const isPast = stages.findIndex(s => s.id === currentStage) > index;
            
            let Icon = Circle;
            let iconColor = "text-gray-300";
            let bgColor = "bg-white border-gray-300";
            let textColor = "text-gray-400";
            
            if (isCompleted || isPast) {
              Icon = Check;
              iconColor = "text-white";
              bgColor = "bg-green-500 border-green-500";
              textColor = "text-green-700 font-bold";
            } else if (isCurrent) {
              Icon = Clock;
              iconColor = "text-yellow-600";
              bgColor = "bg-yellow-100 border-yellow-400";
              textColor = "text-yellow-700 font-bold";
            }

            return (
              <div key={stage.id} className="flex flex-col items-center relative z-10 w-24">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors shadow-sm ${bgColor}`}>
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <p className={`mt-3 text-xs text-center uppercase tracking-wider ${textColor}`}>
                  {stage.label}
                </p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
                  {status !== 'none' ? status : ''}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DocumentFlowTimeline;