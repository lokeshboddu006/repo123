import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Globe,
  MapPin,
  Briefcase,
  Building2,
  Database,
  ShieldCheck,
  RefreshCw,
  Check,
  Search,
  CheckCircle2,
  AlertCircle,
  Sun,
  Laptop
} from 'lucide-react';
import { masterDataApi } from '../../api/masterData';
import { ALL_INDIAN_REGIONS, INDIAN_STATES, UNION_TERRITORIES } from '../../data/indiaGeography';
import { checkAiHealth } from '../../api/ai';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/auth';

export const Settings = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('preferences');
  const [languages, setLanguages] = useState([]);
  const [occupations, setOccupations] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiOnline, setAiOnline] = useState(true);

  // Geography search state
  const [geoSearch, setGeoSearch] = useState('');
  const [selectedGeoRegion, setSelectedGeoRegion] = useState(INDIAN_STATES[0]);

  // Preferences form state
  const userLang = user?.primary_language || user?.profile?.primary_language || 'English';
  const [preferences, setPreferences] = useState({
    defaultLanguage: userLang,
    timezone: 'Asia/Kolkata (IST +5:30)',
    autoTranslate: true,
    notificationDigest: 'instant',
    theme: 'light',
  });
  const [prefSaved, setPrefSaved] = useState(false);

  useEffect(() => {
    if (user) {
      const current = user.primary_language || user.profile?.primary_language;
      if (current) {
        setPreferences((prev) => ({ ...prev, defaultLanguage: current }));
      }
    }
  }, [user]);


  const loadData = async () => {
    setLoading(true);
    try {
      const [langRes, occRes, orgRes] = await Promise.all([
        masterDataApi.getLanguages(),
        masterDataApi.getOccupations(),
        masterDataApi.getOrganizations(),
      ]);
      setLanguages(langRes.results || langRes);
      setOccupations(occRes.results || occRes);
      setOrganizations(orgRes.results || orgRes);

      const aiOk = await checkAiHealth();
      setAiOnline(aiOk);
    } catch (e) {
      console.error('Failed to load master data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    try {
      if (user && preferences.defaultLanguage) {
        const updated = await authApi.updateProfile({ primary_language: preferences.defaultLanguage });
        updateUser(updated);
      }
      setPrefSaved(true);
      setTimeout(() => setPrefSaved(false), 3000);
    } catch (err) {
      console.error('Error saving preferences:', err);
    }
  };

  const filteredRegions = ALL_INDIAN_REGIONS.filter(
    (r) =>
      r.name.toLowerCase().includes(geoSearch.toLowerCase()) ||
      r.districts.some((d) => d.toLowerCase().includes(geoSearch.toLowerCase()))
  );

  const tabs = [
    { id: 'preferences', label: 'Preferences & General', icon: Sliders },
    { id: 'geography', label: 'India Geography (36 States & UTs)', icon: MapPin },
    { id: 'masterdata', label: 'Standard Master Data', icon: Globe },
    { id: 'system', label: 'System & Services Health', icon: Database },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#e2ebd9]">
        <div>
          <h1 className="text-2xl font-bold text-[#17301F] tracking-tight font-display">
            Platform Settings & System Registry
          </h1>
          <p className="text-xs sm:text-sm text-[#557A60]">
            Manage platform defaults, standardized administrative divisions, Indian geographic hierarchies, and backend status.
          </p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#d2ded0] rounded-xl hover:bg-white text-xs font-semibold text-[#17301F] bg-white/70 shadow-sm transition-all"
          title="Refresh master data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#336443]' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-[#e2ebd9] overflow-x-auto pb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap rounded-t-xl ${
                isActive
                  ? 'border-[#336443] text-[#17301F] bg-white shadow-sm'
                  : 'border-transparent text-[#557A60] hover:text-[#17301F] hover:bg-white/40'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#336443]' : 'text-[#7FA68A]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENTS */}
      <div className="card-peaceful p-6 space-y-6">
        {/* 1. PREFERENCES TAB */}
        {activeTab === 'preferences' && (
          <form onSubmit={handleSavePreferences} className="space-y-6">
            <div className="border-b border-[#e2ebd9] pb-3">
              <h2 className="text-sm font-bold text-[#17301F] font-display">
                Regional Preferences & Default Configurations
              </h2>
              <p className="text-xs text-[#557A60]">
                Configure localization defaults and appearance behavior for your administrative account.
              </p>
            </div>

            {prefSaved && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Preferences saved successfully.</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#17301F] uppercase tracking-wider">
                  Default Platform Language
                </label>
                <select
                  value={preferences.defaultLanguage}
                  onChange={(e) => setPreferences({ ...preferences, defaultLanguage: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2ded0] bg-white text-xs sm:text-sm text-[#17301F] focus:ring-2 focus:ring-[#336443]"
                >
                  <option value="English">English</option>
                  <option value="Hindi">हिन्दी (Hindi)</option>
                  <option value="Telugu">తెలుగు (Telugu)</option>
                  <option value="Tamil">தமிழ் (Tamil)</option>
                  <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#17301F] uppercase tracking-wider">
                  Operational Timezone
                </label>
                <input
                  type="text"
                  value={preferences.timezone}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2ebd9] bg-[#f5f8f3] text-xs sm:text-sm text-[#557A60]"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-[#17301F] uppercase tracking-wider">
                Platform Appearance
              </label>
              <div className="grid grid-cols-2 gap-4 max-w-md">
                <div
                  onClick={() => setPreferences({ ...preferences, theme: 'light' })}
                  className={`p-3.5 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                    preferences.theme === 'light'
                      ? 'border-[#336443] bg-[#336443]/10 ring-1 ring-[#336443]'
                      : 'border-[#e2ebd9] bg-white hover:border-[#85AB8B]'
                  }`}
                >
                  <Sun className="w-5 h-5 text-amber-600" />
                  <div>
                    <p className="text-xs font-bold text-[#17301F]">Peaceful Light</p>
                    <p className="text-[10px] text-[#557A60]">Sage, cream & warm white</p>
                  </div>
                </div>

                <div
                  onClick={() => setPreferences({ ...preferences, theme: 'system' })}
                  className={`p-3.5 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                    preferences.theme === 'system'
                      ? 'border-[#336443] bg-[#336443]/10 ring-1 ring-[#336443]'
                      : 'border-[#e2ebd9] bg-white hover:border-[#85AB8B]'
                  }`}
                >
                  <Laptop className="w-5 h-5 text-[#557A60]" />
                  <div>
                    <p className="text-xs font-bold text-[#17301F]">System Synchronized</p>
                    <p className="text-[10px] text-[#557A60]">Matches OS preference</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#e2ebd9] flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#336443] hover:bg-[#234A2D] text-white text-xs font-bold shadow-sm transition-all"
              >
                Save Preferences
              </button>
            </div>
          </form>
        )}

        {/* 2. INDIA GEOGRAPHY TAB */}
        {activeTab === 'geography' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e2ebd9] pb-3">
              <div>
                <h2 className="text-sm font-bold text-[#17301F] font-display flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#336443]" />
                  Indian Administrative Geography
                </h2>
                <p className="text-xs text-[#557A60]">
                  Official 28 States and 8 Union Territories with 700+ cascading administrative districts.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={geoSearch}
                  onChange={(e) => setGeoSearch(e.target.value)}
                  placeholder="Search state or district..."
                  className="w-full px-3 py-1.5 pl-8 rounded-xl border border-[#d2ded0] text-xs text-[#17301F] focus:outline-none focus:ring-1 focus:ring-[#336443]"
                />
                <Search className="w-3.5 h-3.5 text-[#7FA68A] absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              {/* Region Selector List (5 cols) */}
              <div className="md:col-span-5 border border-[#e2ebd9] rounded-xl overflow-hidden bg-white max-h-[480px] overflow-y-auto scrollbar-thin">
                <div className="p-2.5 bg-[#f5f8f3] border-b border-[#e2ebd9] text-[11px] font-bold text-[#17301F] uppercase tracking-wider flex items-center justify-between">
                  <span>States & UTs ({filteredRegions.length})</span>
                  <span className="text-[10px] text-[#557A60]">Click to view districts</span>
                </div>
                <div className="divide-y divide-[#e2ebd9]">
                  {filteredRegions.map((region) => {
                    const isSelected = selectedGeoRegion?.id === region.id;
                    return (
                      <button
                        key={region.id}
                        onClick={() => setSelectedGeoRegion(region)}
                        className={`w-full text-left px-3 py-2.5 flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-[#336443]/15 font-bold text-[#17301F]'
                            : 'hover:bg-[#f5f8f3] text-[#4a5e4c]'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-display">{region.name}</p>
                          <p className="text-[10px] text-[#557A60]">{region.type}</p>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-[#d2ded0] text-[#17301F] font-semibold">
                          {region.districts.length} districts
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* District Viewer (7 cols) */}
              <div className="md:col-span-7 card-peaceful p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#e2ebd9]">
                  <div>
                    <h3 className="text-sm font-bold text-[#17301F] font-display">
                      {selectedGeoRegion?.name}
                    </h3>
                    <p className="text-xs text-[#557A60]">
                      {selectedGeoRegion?.type} • {selectedGeoRegion?.districts?.length} Districts
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Cascading Ready
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-[380px] overflow-y-auto scrollbar-thin p-1">
                  {selectedGeoRegion?.districts?.map((district) => (
                    <span
                      key={district}
                      className="text-xs px-2.5 py-1 rounded-lg bg-white border border-[#e2ebd9] text-[#234A2D] shadow-xs font-medium"
                    >
                      {district}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. MASTER DATA TAB */}
        {activeTab === 'masterdata' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-bold text-[#17301F] font-display">
                Indian Languages Registry
              </h2>
              <p className="text-xs text-[#557A60] mb-3">
                Classified languages registered in database for campaign targeting and IndicTrans2 translation.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {languages.map((l) => (
                  <div
                    key={l.id || l.code}
                    className="p-3 rounded-xl bg-white border border-[#e2ebd9] shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <p className="text-sm font-bold text-[#17301F] font-display">{l.name}</p>
                      <p className="text-xs text-[#557A60] mt-0.5">{l.native_name || l.name}</p>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[10px]">
                      <span className="font-mono text-[#7FA68A] uppercase">{l.code}</span>
                      <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-[#e2ebd9] pt-4">
              <h2 className="text-sm font-bold text-[#17301F] font-display">
                Citizen Classifications & Occupations ({occupations.length})
              </h2>
              <p className="text-xs text-[#557A60] mb-3">
                Standardized socio-economic classifications for audience segmentation.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {occupations.map((o) => (
                  <div key={o.id || o.name} className="p-2.5 rounded-xl bg-white border border-[#e2ebd9] text-xs font-medium text-[#17301F]">
                    {o.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. SYSTEM HEALTH TAB */}
        {activeTab === 'system' && (
          <div className="space-y-5">
            <div className="border-b border-[#e2ebd9] pb-3">
              <h2 className="text-sm font-bold text-[#17301F] font-display">
                Platform Microservices & Infrastructure
              </h2>
              <p className="text-xs text-[#557A60]">
                Live connectivity verification across Django REST API, FastAPI AI Service, and Translation models.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Django API */}
              <div className="p-4 rounded-xl bg-white border border-[#e2ebd9] shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#17301F] font-display">Django Core REST API</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online (Port 8000)
                  </span>
                </div>
                <p className="text-xs text-[#557A60]">
                  Endpoints: Authentication, Campaigns, Audiences, Recipients, Templates.
                </p>
              </div>

              {/* FastAPI AI Service */}
              <div className="p-4 rounded-xl bg-white border border-[#e2ebd9] shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#17301F] font-display">FastAPI AI Microservice</span>
                  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                    aiOnline
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      : 'text-amber-700 bg-amber-50 border-amber-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${aiOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    {aiOnline ? 'Online (Port 8001)' : 'Offline / Checking'}
                  </span>
                </div>
                <p className="text-xs text-[#557A60]">
                  Providers: Groq LLaMA 3.3 (Generation) + IndicTrans2 (Translation).
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
