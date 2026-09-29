import React from 'react';
import { FolderOpen } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = FolderOpen,
  title = 'No records found',
  description = 'There are no items matching your criteria.',
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 sm:p-16 text-center bg-white border border-dashed border-[#85AB8B]/30 rounded-2xl">
      <div className="p-4 bg-[#85AB8B]/10 rounded-2xl text-[#85AB8B] mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-[#1f2a1d]">{title}</h3>
      <p className="text-sm text-[#4b5b47] max-w-sm mt-1.5">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center px-5 py-2.5 text-sm font-semibold rounded-xl text-white bg-[#1f2a1d] hover:bg-[#2a3827] shadow-sm transition-all duration-300"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
