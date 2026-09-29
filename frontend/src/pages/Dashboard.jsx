import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Layers,
  FileEdit,
  Clock,
  Megaphone,
  ArrowUpRight,
  Plus,
  RefreshCw,
  Sparkles,
  Globe,
  Languages,
  TrendingUp,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { authApi } from '../api/auth';
import { checkAiHealth } from '../api/ai';
import { useAuth } from '../context/AuthContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#17301F] text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-xl border border-[#336443]">
        <p className="font-display">{label}</p>
        <p className="text-emerald-300 font-bold mt-0.5">{payload[0].value} Recipients</p>
      </div>
    );
  }
  return null;
};

export const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [pipeline, setPipeline] = useState(null);
  const [languageDistribution, setLanguageDistribution] = useState([]);
  const [recentCampaigns, setRecentCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiOnline, setAiOnline] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const data = await authApi.getDashboardSummary();
      setSummary(data.summary || {});
      setPipeline(data.pipeline || null);
      setLanguageDistribution(data.language_distribution || []);
      setRecentCampaigns(data.recent_campaigns || []);

      const aiStatus = await checkAiHealth();
      setAiOnline(aiStatus);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const recipientCount = summary?.recipients?.count ?? 0;
  const audienceCount = summary?.audiences?.count ?? 0;
  const draftCampaignCount = summary?.draft_campaigns?.count ?? 0;
  const scheduledCampaignCount = summary?.scheduled_campaigns?.count ?? 0;
  const activeCampaignCount = summary?.active_campaigns?.count ?? 0;
  const completedCampaignCount = summary?.completed_campaigns?.count ?? 0;

  // Real language chart data
  const chartData = languageDistribution.length > 0
    ? languageDistribution.map((item) => ({
        name: item.language,
        count: item.count,
      }))
    : [];

  const adminName = user?.first_name 
    ? user.first_name 
    : (user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : 'Admin');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#e2ebd9]">
        <div>
          <h1 className="text-2xl font-bold text-[#17301F] tracking-tight font-display">
            Good morning, {adminName}
          </h1>
          <p className="text-xs sm:text-sm text-[#557A60] mt-0.5">
            Your communication command center and citizen awareness overview for today.
          </p>
        </div>

        {/* Right side status badges & actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-[#e2ebd9] shadow-xs text-[#17301F]">
            <span className={`w-2 h-2 rounded-full ${aiOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span>{aiOnline ? 'AI Online' : 'AI Checking'}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#eef4ec] border border-[#d2ded0] text-[#234A2D]">
            <Globe className="w-3.5 h-3.5 text-[#336443]" />
            <span>12 Languages</span>
          </div>

          <button
            onClick={fetchDashboardData}
            className="p-2 border border-[#d2ded0] rounded-xl hover:bg-white text-[#557A60] hover:text-[#17301F] bg-white/70 shadow-xs transition-colors"
            title="Refresh dashboard metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#336443]' : ''}`} />
          </button>

          <Link
            to="/campaigns/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#234A2D] to-[#17301F] hover:from-[#336443] hover:to-[#234A2D] text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Campaign</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Recipients"
          value={recipientCount}
          icon={Users}
          color="emerald"
          description="Verified citizen records in database"
        />
        <StatCard
          title="Active Audiences"
          value={audienceCount}
          icon={Layers}
          color="purple"
          description="Segmented geographic & demographic groups"
        />
        <StatCard
          title="Draft Campaigns"
          value={draftCampaignCount}
          icon={FileEdit}
          color="amber"
          description="Prepared announcements awaiting review"
        />
        <StatCard
          title="Scheduled Campaigns"
          value={scheduledCampaignCount}
          icon={Clock}
          color="blue"
          description="Queued broadcasts ready for delivery"
        />
      </div>

      {/* Dedicated AI Content Studio Banner */}
      <div className="card-peaceful p-5 relative overflow-hidden bg-gradient-to-r from-[#17301F] via-[#1D3A25] to-[#234A2D] text-white border-0 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-300">
                <Sparkles className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold tracking-tight font-display text-white">
                New: AI Content Studio & IndicTrans2 Translation Hub
              </h3>
            </div>
            <p className="text-xs text-[#C7D9CA] max-w-2xl leading-relaxed">
              Generate Brief, Standard, or Detailed public health, safety, and educational advisories with Groq LLaMA 3.3 and translate seamlessly across 11 Indian languages with placeholder preservation.
            </p>
          </div>

          <Link
            to="/content-studio"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#17301F] hover:bg-[#F7F5EF] text-xs font-bold shadow-md transition-all flex-shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#336443]" />
            <span>Open AI Content Studio</span>
          </Link>
        </div>
      </div>

      {/* Analytics Grid: Language Distribution & Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Language Distribution Chart (8 cols) */}
        <div className="lg:col-span-8 card-peaceful p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#17301F] font-display flex items-center gap-2">
                  <Languages className="w-4 h-4 text-[#336443]" />
                  Recipient Language Distribution
                </h3>
                <p className="text-xs text-[#557A60] mt-0.5">
                  Real language breakdown from database recipient profiles
                </p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#336443] bg-[#eef4ec] px-2.5 py-1 rounded-full border border-[#336443]/20">
                Live Data
              </span>
            </div>

            {chartData.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center text-[#557A60] text-xs">
                <Globe className="w-8 h-8 text-[#7FA68A] mb-2 opacity-50" />
                <p>No recipient language data recorded yet.</p>
                <p className="text-[11px] text-[#7FA68A] mt-0.5">Add recipients to view live linguistic distribution.</p>
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#557A60', fontWeight: 500 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#557A60' }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(51, 100, 67, 0.06)' }} />
                    <Bar dataKey="count" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#234A2D" />
                        <stop offset="100%" stopColor="#85AB8B" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Campaign Pipeline (4 cols) */}
        <div className="lg:col-span-4 card-peaceful p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#17301F] font-display flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-[#336443]" />
              Campaign Pipeline
            </h3>
            <p className="text-xs text-[#557A60] mb-4">Lifecycle stages of broadcasts</p>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#fdfbf6] border border-[#f0e8d5]">
                <span className="text-xs font-semibold text-amber-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Draft
                </span>
                <span className="text-sm font-bold text-amber-900 font-display">
                  {pipeline?.draft ?? draftCampaignCount}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#f6f9fc] border border-[#d8e6f3]">
                <span className="text-xs font-semibold text-blue-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Scheduled
                </span>
                <span className="text-sm font-bold text-blue-900 font-display">
                  {pipeline?.scheduled ?? scheduledCampaignCount}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#f5faf6] border border-[#d6ecdc]">
                <span className="text-xs font-semibold text-emerald-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Active / Delivering
                </span>
                <span className="text-sm font-bold text-emerald-900 font-display">
                  {pipeline?.active ?? activeCampaignCount}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#f8faf7] border border-[#e2ebd9]">
                <span className="text-xs font-semibold text-[#17301F] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#336443]" />
                  Completed
                </span>
                <span className="text-sm font-bold text-[#17301F] font-display">
                  {pipeline?.completed ?? completedCampaignCount}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#e2ebd9] mt-4 text-center">
            <Link
              to="/campaigns"
              className="text-xs font-bold text-[#336443] hover:text-[#17301F] inline-flex items-center gap-1 transition-colors"
            >
              <span>View all campaigns</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Campaigns Table */}
      <div className="card-peaceful overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e2ebd9] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#17301F] font-display">Recent Campaigns</h3>
            <p className="text-xs text-[#557A60]">Latest awareness broadcasts and advisories</p>
          </div>
          <Link
            to="/campaigns"
            className="text-xs font-bold text-[#336443] hover:text-[#17301F] inline-flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentCampaigns.length === 0 ? (
          <div className="p-10 text-center text-[#557A60] text-xs">
            No recent campaigns found. Click <strong>"New Campaign"</strong> to start.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#17301F]">
              <thead className="bg-[#f5f8f3] text-[10px] font-bold text-[#557A60] uppercase tracking-wider border-b border-[#e2ebd9]">
                <tr>
                  <th className="px-6 py-3">Campaign Title</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Priority</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2ebd9]/70">
                {recentCampaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-white/80 transition-colors">
                    <td className="px-6 py-3.5 font-semibold text-[#17301F] font-display">{camp.title}</td>
                    <td className="px-6 py-3.5 text-[#557A60]">{camp.campaign_type}</td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={camp.priority} />
                    </td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={camp.status} />
                    </td>
                    <td className="px-6 py-3.5 text-[#557A60]">
                      {new Date(camp.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <Link
                        to={`/campaigns/${camp.id}`}
                        className="text-xs font-bold text-[#336443] hover:text-[#17301F] transition-colors"
                      >
                        Inspect →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
