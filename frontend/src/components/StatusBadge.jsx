import React from 'react';

export const StatusBadge = ({ status }) => {
  const norm = (status || '').toUpperCase();

  const getStyle = () => {
    switch (norm) {
      case 'ACTIVE':
      case 'VALIDATED':
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/60 ring-1 ring-emerald-500/10';
      case 'SCHEDULED':
      case 'RUNNING':
      case 'SENDING':
        return 'bg-blue-50 text-blue-700 border-blue-200/60 ring-1 ring-blue-500/10';
      case 'DRAFT':
      case 'PENDING':
      case 'READY_FOR_REVIEW':
        return 'bg-amber-50 text-amber-700 border-amber-200/60 ring-1 ring-amber-500/10';
      case 'INACTIVE':
      case 'CANCELLED':
      case 'FAILED':
      case 'UNSUBSCRIBED':
        return 'bg-rose-50 text-rose-700 border-rose-200/60 ring-1 ring-rose-500/10';
      case 'HIGH':
        return 'bg-orange-50 text-orange-700 border-orange-200/60 ring-1 ring-orange-500/10';
      case 'CRITICAL':
      case 'EMERGENCY':
        return 'bg-red-100 text-red-800 border-red-300/60 ring-1 ring-red-500/10 font-semibold';
      case 'STATIC':
        return 'bg-[#f8faf7] text-[#4b5b47] border-[#e4ebe1] ring-1 ring-[#85AB8B]/10';
      case 'DYNAMIC':
        return 'bg-purple-50 text-purple-700 border-purple-200/60 ring-1 ring-purple-500/10';
      default:
        return 'bg-[#f8faf7] text-[#4b5b47] border-[#e4ebe1] ring-1 ring-[#85AB8B]/10';
    }
  };

  const getDotColor = () => {
    switch (norm) {
      case 'ACTIVE': case 'VALIDATED': case 'COMPLETED': return 'bg-emerald-500';
      case 'SCHEDULED': case 'RUNNING': case 'SENDING': return 'bg-blue-500';
      case 'DRAFT': case 'PENDING': case 'READY_FOR_REVIEW': return 'bg-amber-500';
      case 'INACTIVE': case 'CANCELLED': case 'FAILED': case 'UNSUBSCRIBED': return 'bg-rose-500';
      case 'HIGH': return 'bg-orange-500';
      case 'CRITICAL': case 'EMERGENCY': return 'bg-red-600';
      default: return 'bg-[#85AB8B]';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${getStyle()}`}
    >
      <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${getDotColor()}`} />
      {status || 'Unknown'}
    </span>
  );
};
