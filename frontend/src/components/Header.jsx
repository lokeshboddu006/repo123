import React from 'react';
import { Globe, Wifi } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Header = ({ title, subtitle, actions }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-[#e4ebe1] px-4 sm:px-6 md:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sticky top-0 z-30 shadow-card">
      <div className="min-w-0">
        <h2 className="text-lg sm:text-xl font-bold text-[#1f2a1d] font-display tracking-tight truncate">{title}</h2>
        {subtitle && <p className="text-xs text-[#4b5b47] mt-0.5 truncate">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {actions && <div className="flex items-center gap-2">{actions}</div>}

        <div className="hidden sm:block h-5 w-px bg-[#e4ebe1]" />

        <div className="hidden sm:flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            AI Online
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#85AB8B]/10 text-[#336443] border border-[#85AB8B]/20">
            <Globe className="w-3 h-3" />
            12 Languages
          </span>
        </div>
      </div>
    </header>
  );
};
