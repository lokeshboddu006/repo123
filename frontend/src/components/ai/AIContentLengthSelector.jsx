import React from 'react';
import { AlignLeft, FileText, AlignJustify } from 'lucide-react';

export const AIContentLengthSelector = ({ value = 'standard', onChange }) => {
  const options = [
    {
      id: 'brief',
      label: 'Brief',
      description: 'Concise, punchy 1-2 sentence alert. Ideal for SMS & Push.',
      icon: AlignLeft,
      badge: 'Fast Read',
    },
    {
      id: 'standard',
      label: 'Standard',
      description: 'Balanced 3-4 sentence message with core context & action.',
      icon: FileText,
      badge: 'Recommended',
    },
    {
      id: 'detailed',
      label: 'Detailed',
      description: 'Comprehensive advisory with background, steps & contacts.',
      icon: AlignJustify,
      badge: 'Full Guide',
    },
  ];

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-[#17301F] uppercase tracking-wider">
        Content Length
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'border-[#336443] bg-gradient-to-br from-[#336443]/10 to-white text-[#17301F] shadow-sm ring-1 ring-[#336443]'
                  : 'border-[#e2ebd9] bg-white/70 hover:border-[#85AB8B] hover:bg-white text-[#4a5e4c]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-[#336443]' : 'text-[#7FA68A]'}`} />
                  <span className="text-xs font-bold font-display">{opt.label}</span>
                </div>
                {opt.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    isSelected 
                      ? 'bg-[#336443] text-white' 
                      : 'bg-[#eef4ec] text-[#557A60]'
                  }`}>
                    {opt.badge}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#557A60] leading-snug">
                {opt.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
