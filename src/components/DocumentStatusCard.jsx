import React from 'react';
import { CheckCircle2, Clock, Lock } from 'lucide-react';

const DocumentStatusCard = ({ title, status }) => {
  const isCompleted = status === 'Completed';
  const isPending = status === 'Pending';
  const isLocked = status === 'Locked';

  return (
    <div className={`p-4 rounded-lg border flex items-center justify-between ${
      isCompleted ? 'bg-green-50 border-green-200' :
      isPending ? 'bg-blue-50 border-blue-200' :
      'bg-gray-50 border-gray-200 opacity-75'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${
          isCompleted ? 'bg-green-100 text-green-600' :
          isPending ? 'bg-blue-100 text-blue-600' :
          'bg-gray-200 text-gray-500'
        }`}>
          {isCompleted && <CheckCircle2 className="w-5 h-5" />}
          {isPending && <Clock className="w-5 h-5" />}
          {isLocked && <Lock className="w-5 h-5" />}
        </div>
        <div>
          <h4 className={`font-medium ${isLocked ? 'text-gray-500' : 'text-gray-900'}`}>{title}</h4>
          <p className={`text-sm ${
            isCompleted ? 'text-green-700' :
            isPending ? 'text-blue-700' :
            'text-gray-500'
          }`}>{status}</p>
        </div>
      </div>
    </div>
  );
};

export default DocumentStatusCard;