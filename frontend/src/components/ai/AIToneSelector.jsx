import React from 'react';
import { Info, ShieldAlert, HeartHandshake, Award } from 'lucide-react';

export const AIToneSelector = ({ value = 'formal', onChange }) => {
  const tones = [
    { id: 'informative', label: 'Informative', icon: Info, desc: 'Clear, factual & direct' },
    { id: 'formal', label: 'Formal', icon: Award, desc: 'Official government register' },
    { id: 'urgent', label: 'Urgent', icon: ShieldAlert, desc: 'High priority alert' },
    { id: 'friendly', label: 'Friendly', icon: HeartHandshake, desc: 'Warm community guidance' },
  ];

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-[#17301F] uppercase tracking-wider">
        Communication Tone
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {tones.map((t) => {
          const Icon = t.icon;
          const isSelected = value === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange(t.id)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-[#336443] bg-[#336443]/10 text-[#17301F] ring-1 ring-[#336443]'
                  : 'border-[#e2ebd9] bg-white/70 hover:border-[#85AB8B] hover:bg-white text-[#4a5e4c]'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#336443]' : 'text-[#7FA68A]'}`} />
                <span className="text-xs font-bold font-display">{t.label}</span>
              </div>
              <p className="text-[10px] text-[#557A60]">{t.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
