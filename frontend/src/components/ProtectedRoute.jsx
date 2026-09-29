import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Radio } from 'lucide-react';

export const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8faf7] relative overflow-hidden">
        {/* Background decorative orbs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#85AB8B]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#336443]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center gap-4 relative z-10 animate-fade-in">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1f2a1d] to-[#336443] flex items-center justify-center text-[#85AB8B] shadow-lg shadow-[#1f2a1d]/20">
              <Radio className="w-6 h-6" />
            </div>
            <div className="absolute -inset-2 border-2 border-[#85AB8B]/20 border-t-[#336443] rounded-2xl animate-spin-slow" />
          </div>
          <span className="text-sm font-semibold text-[#4b5b47]">Loading platform...</span>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
