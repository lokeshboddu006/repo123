import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Menu, X, Sparkles } from 'lucide-react';

export const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-peaceful-canvas text-[#1f2a1d] relative overflow-hidden">
      {/* Subtle organic ambient glow elements */}
      <div className="fixed top-0 right-0 w-[550px] h-[550px] rounded-full bg-gradient-to-br from-[#85AB8B]/10 to-transparent blur-3xl pointer-events-none -z-0" />
      <div className="fixed bottom-0 left-64 w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-[#336443]/5 to-transparent blur-3xl pointer-events-none -z-0" />

      {/* Desktop Sidebar */}
      <div className="hidden md:flex relative z-20">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div className="absolute inset-0 bg-[#17301F]/60 backdrop-blur-sm" />
      </div>

      {/* Mobile Sidebar Drawer */}
      <div
        className={`md:hidden fixed top-0 left-0 bottom-0 z-50 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10 h-screen">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-md border-b border-[#e2ebd9] sticky top-0 z-30 flex-shrink-0">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-[#1f2a1d] hover:bg-[#85AB8B]/10 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#17301F] text-[#85AB8B] flex items-center justify-center text-xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm font-bold text-[#17301F] font-display">GovComm AI</span>
          </div>
          <div className="w-9" />
        </div>

        <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 overflow-y-auto min-h-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
