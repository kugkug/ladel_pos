import React from 'react';
import { cn } from '@/lib/utils';

const StatusBadge = ({ status, className }) => {
  const isPending = status === 'pending';
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        isPending
          ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
          : 'bg-green-100 text-green-800 border border-green-300',
        className
      )}
    >
      {isPending ? 'Pending' : 'Completed'}
    </span>
  );
};

export default StatusBadge;