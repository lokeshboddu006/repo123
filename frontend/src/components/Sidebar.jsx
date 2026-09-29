import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Megaphone,
  Sparkles,
  Layers,
  Users,
  FileText,
  BookOpen,
  Settings as SettingsIcon,
  User as UserIcon,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Radio,
  Activity,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = () => {
  const { logout, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const profileMenuRef = useRef(null);

  // Close profile menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navGroups = [
    {
      group: 'MAIN',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Campaigns', path: '/campaigns', icon: Megaphone },
        { label: 'Live Tracking', path: '/delivery-tracking', icon: Activity, badge: 'LIVE' },
        { label: 'AI Content Studio', path: '/content-studio', icon: Sparkles, badge: 'AI' },
        { label: 'Audiences', path: '/audiences', icon: Layers },
        { label: 'Recipients', path: '/recipients', icon: Users },
      ],
    },
    {
      group: 'CONTENT',
      items: [
        { label: 'Templates', path: '/templates', icon: FileText },
        { label: 'Content Library', path: '/content-library', icon: BookOpen },
      ],
    },
    {
      group: 'SYSTEM',
      items: [
        { label: 'Settings', path: '/settings', icon: SettingsIcon },
      ],
    },
  ];

  const displayName = user?.first_name 
    ? `${user.first_name} ${user.last_name || ''}`.trim() 
    : (user?.username || 'Admin');
  const userInitial = (user?.first_name || user?.username || 'A').charAt(0).toUpperCase();

  return (
    <aside
      className={`${
        collapsed ? 'w-[76px]' : 'w-64'
      } bg-[#17301F] text-[#9BB8A1] flex flex-col flex-shrink-0 h-screen sticky top-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] z-30 select-none border-r border-[#234A2D] shadow-xl`}
    >
      {/* Brand Header */}
      <div className={`p-4 ${collapsed ? 'px-3' : 'p-5'} border-b border-[#234A2D]/80 flex items-center justify-between`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#234A2D] to-[#336443] border border-[#85AB8B]/20 flex items-center justify-center text-[#9BB8A1] shadow-md flex-shrink-0">
            <Radio className="w-5 h-5 text-emerald-300" />
          </div>
          <div className={`transition-all duration-300 overflow-hidden ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            <h1 className="text-sm font-bold text-white tracking-tight leading-tight whitespace-nowrap font-display flex items-center gap-1.5">
              GovComm AI
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </h1>
            <p className="text-[11px] text-[#7FA68A] font-medium whitespace-nowrap">
              Public Awareness Platform
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto scrollbar-thin">
        {navGroups.map((group) => (
          <div key={group.group} className="space-y-1">
            {!collapsed && (
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#7FA68A]/60">
                {group.group}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path + '/'));
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={collapsed ? item.label : undefined}
                  className={`group flex items-center justify-between ${
                    collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'
                  } rounded-xl text-sm font-medium transition-all duration-200 relative ${
                    isActive
                      ? 'bg-gradient-to-r from-[#234A2D] to-[#1D3A25] text-white shadow-sm border border-[#85AB8B]/30'
                      : 'text-[#9BB8A1] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${
                        isActive ? 'text-emerald-300' : 'text-[#7FA68A] group-hover:text-emerald-200'
                      }`}
                    />
                    <span className={`whitespace-nowrap transition-all duration-300 ${collapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
                      {item.label}
                    </span>
                  </div>

                  {!collapsed && item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="px-3 py-2 border-t border-[#234A2D]/60">
        <button
          onClick={() => {
            setCollapsed(!collapsed);
            setProfileMenuOpen(false);
          }}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[#7FA68A] hover:text-white hover:bg-white/5 transition-colors text-xs"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span className="font-medium">Collapse Menu</span>}
        </button>
      </div>

      {/* User Info & Profile Menu */}
      <div className="p-3 border-t border-[#234A2D]/80 relative" ref={profileMenuRef}>
        {/* Profile Popover Menu */}
        {profileMenuOpen && (
          <div className="absolute bottom-full left-3 right-3 mb-2 bg-[#1D3A25] border border-[#336443] rounded-2xl shadow-2xl p-2 text-sm z-50 animate-fade-in-scale">
            <div className="px-3 py-2 border-b border-white/5 mb-1">
              <p className="text-xs font-semibold text-white truncate">{displayName}</p>
              <p className="text-[10px] text-[#7FA68A] truncate">{user?.email || 'admin@govcomm.ai'}</p>
            </div>
            <button
              onClick={() => {
                navigate('/profile');
                setProfileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#C7D9CA] hover:bg-white/10 hover:text-white transition-colors"
            >
              <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>My Profile</span>
            </button>
            <button
              onClick={() => {
                navigate('/settings');
                setProfileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#C7D9CA] hover:bg-white/10 hover:text-white transition-colors"
            >
              <SettingsIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Platform Settings</span>
            </button>
            <div className="border-t border-white/5 my-1" />
            <button
              onClick={logout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-300 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* User Card trigger */}
        <div
          onClick={() => setProfileMenuOpen(!profileMenuOpen)}
          className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-white/5 transition-all ${
            collapsed ? 'justify-center p-1.5' : 'justify-between'
          }`}
          title={collapsed ? displayName : 'User settings'}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#234A2D] to-[#85AB8B] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm border border-emerald-400/20">
              {userInitial}
            </div>
            {!collapsed && (
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate leading-tight">
                  {displayName}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] text-[#7FA68A] uppercase tracking-wider font-semibold">
                    {user?.role || 'ADMIN'}
                  </span>
                </div>
              </div>
            )}
          </div>
          {!collapsed && (
            <ChevronDown className={`w-3.5 h-3.5 text-[#7FA68A] transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
          )}
        </div>
      </div>
    </aside>
  );
};
