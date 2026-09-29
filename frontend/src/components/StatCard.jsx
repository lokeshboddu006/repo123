import React from 'react';

export const StatCard = ({ title, value, icon: Icon, color = 'green', description, subtitle }) => {
  const colorMap = {
    green:   { bg: 'bg-gradient-to-br from-[#336443] to-[#85AB8B]', text: 'text-white', ring: 'ring-[#336443]/10' },
    emerald: { bg: 'bg-gradient-to-br from-emerald-500 to-emerald-400', text: 'text-white', ring: 'ring-emerald-500/10' },
    amber:   { bg: 'bg-gradient-to-br from-amber-500 to-amber-400', text: 'text-white', ring: 'ring-amber-500/10' },
    blue:    { bg: 'bg-gradient-to-br from-blue-500 to-blue-400', text: 'text-white', ring: 'ring-blue-500/10' },
    purple:  { bg: 'bg-gradient-to-br from-purple-500 to-purple-400', text: 'text-white', ring: 'ring-purple-500/10' },
    indigo:  { bg: 'bg-gradient-to-br from-indigo-500 to-indigo-400', text: 'text-white', ring: 'ring-indigo-500/10' },
  };

  const scheme = colorMap[color] || colorMap.green;

  return (
    <div className="group bg-white rounded-2xl p-5 sm:p-6 border border-[#e4ebe1] shadow-card hover:shadow-card-hover transition-all duration-500 hover:-translate-y-0.5 relative overflow-hidden">
      {/* Subtle gradient accent at top */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] ${scheme.bg} opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />

      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#4b5b47]/70 mb-1">{title}</p>
          <p className="text-3xl sm:text-4xl font-bold text-[#1f2a1d] font-display tracking-tight">{value ?? 0}</p>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${scheme.bg} ${scheme.text} shadow-sm ring-4 ${scheme.ring} flex-shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {(description || subtitle) && (
        <div className="mt-4 pt-3 border-t border-[#e4ebe1]/60 flex items-center justify-between">
          <span className="text-xs text-[#4b5b47] truncate">{description || subtitle}</span>
          <span className="flex-shrink-0 inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      )}
    </div>
  );
};
