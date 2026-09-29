import React from 'react';
import { MessageSquare, Mail, Smartphone, Bell, Globe } from 'lucide-react';

export const AIChannelSelector = ({ value = 'SMS', onChange }) => {
  const channels = [
    { id: 'SMS', label: 'SMS', icon: MessageSquare, limit: '160 chars max' },
    { id: 'WHATSAPP', label: 'WhatsApp', icon: Smartphone, limit: 'Rich text & emojis' },
    { id: 'EMAIL', label: 'Email', icon: Mail, limit: 'Formatted newsletters' },
    { id: 'PUSH', label: 'Push', icon: Bell, limit: 'Quick notifications' },
    { id: 'WEB', label: 'Web', icon: Globe, limit: 'Portal banner' },
  ];

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-[#17301F] uppercase tracking-wider">
        Target Delivery Channel
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {channels.map((c) => {
          const Icon = c.icon;
          const isSelected = value?.toUpperCase() === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onChange(c.id)}
              className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                isSelected
                  ? 'border-[#336443] bg-[#336443]/10 text-[#17301F] ring-1 ring-[#336443]'
                  : 'border-[#e2ebd9] bg-white/70 hover:border-[#85AB8B] hover:bg-white text-[#4a5e4c]'
              }`}
            >
              <Icon className={`w-4 h-4 mb-1 ${isSelected ? 'text-[#336443]' : 'text-[#7FA68A]'}`} />
              <span className="text-xs font-bold font-display">{c.label}</span>
              <span className="text-[9px] text-[#557A60] mt-0.5">{c.limit}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
