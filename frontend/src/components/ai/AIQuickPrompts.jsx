import React from 'react';
import { Sparkles } from 'lucide-react';

export const AIQuickPrompts = ({ onSelectPrompt }) => {
  const quickPrompts = [
    {
      title: 'Dengue Prevention',
      prompt: 'Urgent advisory on dengue fever prevention during monsoon: eliminate stagnant water, use repellents, and report symptoms early.',
    },
    {
      title: 'Flood Safety',
      prompt: 'Emergency flood preparedness advisory: stay alert to river levels, keep emergency kits ready, avoid low-lying areas, and call helpline 1070.',
    },
    {
      title: 'Vaccination Camp',
      prompt: 'Free universal immunization and pulse polio drive scheduled at primary health centers for children aged 0-5. Bring immunization card.',
    },
    {
      title: 'Scholarship',
      prompt: 'Announcement for Pre-Matric & Post-Matric National Scholarship portal applications opening for eligible students with fee waiver details.',
    },
    {
      title: 'Water Conservation',
      prompt: 'Community appeal for rainwater harvesting and sustainable irrigation practices before peak summer to conserve groundwater levels.',
    },
    {
      title: 'Heatwave Safety',
      prompt: 'Severe heatwave warning: avoid direct sunlight between 12 PM - 3 PM, drink abundant ORS/water, and ensure shaded care for livestock.',
    },
    {
      title: 'Emergency Advisory',
      prompt: 'Immediate emergency alert regarding adverse weather conditions. Stay indoors, charge communication devices, and monitor official bulletins.',
    },
    {
      title: 'Public Health',
      prompt: 'General public wellness advisory regarding seasonal flu, hand hygiene, balanced nutrition, and visiting local health wellness centers.',
    },
  ];

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-[#17301F] uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#336443]" />
          Quick Public Awareness Scenarios
        </label>
        <span className="text-[11px] text-[#557A60]">Click to populate prompt</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {quickPrompts.map((item) => (
          <button
            key={item.title}
            type="button"
            onClick={() => onSelectPrompt(item.prompt)}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-white/80 border border-[#e2ebd9] text-[#234A2D] hover:bg-[#336443] hover:text-white hover:border-[#336443] transition-all shadow-sm font-medium"
          >
            {item.title}
          </button>
        ))}
      </div>
    </div>
  );
};
