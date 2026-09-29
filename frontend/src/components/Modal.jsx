import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1f2a1d]/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative w-full ${maxWidth} bg-white rounded-2xl shadow-elevated border border-[#e4ebe1] overflow-hidden animate-fade-in-scale`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#e4ebe1] bg-[#f8faf7]">
            <h3 className="text-lg font-bold text-[#1f2a1d] font-display">{title}</h3>
            <button
              onClick={onClose}
              className="text-[#85AB8B] hover:text-[#1f2a1d] p-1.5 rounded-lg hover:bg-[#85AB8B]/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Body */}
          <div className="p-6 max-h-[80vh] overflow-y-auto scrollbar-thin">{children}</div>
        </div>
      </div>
    </div>
  );
};
