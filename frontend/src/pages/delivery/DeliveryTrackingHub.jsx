import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, RefreshCw, Send, Layers, Globe, Filter, Search, 
  CheckCircle2, AlertTriangle, Clock, RotateCcw, ChevronRight, Eye, ShieldCheck
} from 'lucide-react';
import { campaignsApi } from '../../api/campaigns';
import { getCampaignDeliverySummary, getGlobalDeliveryLogs, retryDelivery } from '../../api/delivery';

export function DeliveryTrackingHub() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [summary, setSummary] = useState(null);
  const [globalLogs, setGlobalLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [channelFilter, setChannelFilter] = useState('');
  const [page, setPage] = useState(1);

  // Fetch campaign list on mount
  useEffect(() => {
    async function loadCampaigns() {
      try {
        const data = await campaignsApi.getCampaigns();
        const list = data.results || data || [];
        setCampaigns(list);
        if (list.length > 0) {
          // Default to first running or active or latest campaign
          const activeCamp = list.find(c => c.status === 'RUNNING' || c.status === 'SCHEDULED') || list[0];
          setSelectedCampaignId(activeCamp.id);
        }
      } catch (err) {
        console.error('Failed to load campaigns list for hub:', err);
      }
    }
    loadCampaigns();
  }, []);

  // Fetch metrics when selected campaign changes or filters change
  useEffect(() => {
    async function loadHubData() {
      setLoading(true);
      try {
        if (selectedCampaignId) {
          const sumRes = await getCampaignDeliverySummary(selectedCampaignId, {
            search,
            status: statusFilter,
            channel: channelFilter,
            page
          });
          setSummary(sumRes);
        } else {
          const logsRes = await getGlobalDeliveryLogs({ search, status: statusFilter, channel: channelFilter, page });
          setGlobalLogs(logsRes.results || logsRes || []);
        }
      } catch (err) {
        console.error('Failed to load tracking data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHubData();
  }, [selectedCampaignId, search, statusFilter, channelFilter, page]);

  const kpis = summary?.kpis || summary?.summary || {
    total_recipients: 0, queued: 0, processing: 0, sent: 0,
    delivered: 0, read: 0, clicked: 0, failed: 0,
    delivery_rate: 0, read_rate: 0, click_rate: 0
  };

  const funnel = summary?.funnel || { queued: 0, sent: 0, delivered: 0, read: 0, clicked: 0 };
  const channels = summary?.channel_breakdown || [];
  const languages = summary?.language_breakdown || [];
  const deliveries = summary?.deliveries?.results || summary?.recipient_deliveries?.results || [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-slate-800">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 font-display flex items-center gap-2.5">
              <Activity className="w-6 h-6 text-emerald-600" />
              Communication Delivery & Live Tracking
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
              LIVE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time delivery pipeline monitoring, carrier handoffs, engagement rates & event audit history.
          </p>
        </div>

        {/* Campaign Selector dropdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Campaign:</span>
            <select
              value={selectedCampaignId}
              onChange={(e) => {
                setSelectedCampaignId(e.target.value);
                setPage(1);
              }}
              className="py-2 px-3 text-xs font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 text-slate-800"
            >
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.status})
                </option>
              ))}
            </select>
          </div>

          {selectedCampaignId && (
            <button
              onClick={() => navigate(`/campaigns/${selectedCampaignId}/delivery`)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-semibold rounded-xl hover:shadow transition flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" /> Full Campaign Audit
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Recipients</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{kpis.total_recipients}</p>
          <span className="text-[10px] text-slate-400">Target count</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Queued</p>
          <p className="text-xl font-bold text-blue-600 mt-1">{kpis.queued}</p>
          <span className="text-[10px] text-slate-400">In queue</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Processing</p>
          <p className="text-xl font-bold text-amber-600 mt-1">{kpis.processing}</p>
          <span className="text-[10px] text-slate-400">Carrier dispatch</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Sent</p>
          <p className="text-xl font-bold text-indigo-600 mt-1">{kpis.sent}</p>
          <span className="text-[10px] text-slate-400">Accepted</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Delivered</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">{kpis.delivered}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">{kpis.delivery_rate}% rate</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Read / Opened</p>
          <p className="text-xl font-bold text-purple-600 mt-1">{kpis.read}</p>
          <span className="text-[10px] text-purple-600 font-semibold">{kpis.read_rate}% rate</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Clicked</p>
          <p className="text-xl font-bold text-teal-600 mt-1">{kpis.clicked}</p>
          <span className="text-[10px] text-teal-600 font-semibold">{kpis.click_rate}% rate</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Failed</p>
          <p className="text-xl font-bold text-rose-600 mt-1">{kpis.failed}</p>
          <span className="text-[10px] text-slate-400">Error count</span>
        </div>
      </div>

      {/* Visual Delivery Funnel */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-600" />
          Live Delivery Pipeline & Engagement Funnel
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            { label: 'Queued Pipeline', count: funnel.queued, color: 'bg-blue-500', pct: 100 },
            { label: 'Sent to Carriers', count: funnel.sent, color: 'bg-indigo-500', pct: kpis.total_recipients ? Math.round((funnel.sent / kpis.total_recipients) * 100) : 0 },
            { label: 'Successfully Delivered', count: funnel.delivered, color: 'bg-emerald-500', pct: kpis.total_recipients ? Math.round((funnel.delivered / kpis.total_recipients) * 100) : 0 },
            { label: 'Read / Opened', count: funnel.read, color: 'bg-purple-500', pct: kpis.total_recipients ? Math.round((funnel.read / kpis.total_recipients) * 100) : 0 },
            { label: 'Engaged / Clicked', count: funnel.clicked, color: 'bg-teal-500', pct: kpis.total_recipients ? Math.round((funnel.clicked / kpis.total_recipients) * 100) : 0 }
          ].map((step, idx) => (
            <div key={idx} className="bg-slate-50 p-4 rounded-xl relative overflow-hidden border border-slate-200/60">
              <div 
                className={`absolute left-0 top-0 bottom-0 ${step.color} opacity-15`}
                style={{ width: `${step.pct}%` }}
              />
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{step.label}</p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-bold text-slate-900">{step.count}</span>
                <span className="text-xs font-semibold text-slate-600">{step.pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recipient Message Activity Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Active Delivery Stream</h3>
            <p className="text-xs text-slate-500">Live recipient message statuses across channels</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search recipient..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none w-48"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-slate-700"
            >
              <option value="">All Statuses</option>
              <option value="QUEUED">Queued</option>
              <option value="PROCESSING">Processing</option>
              <option value="SENT">Sent</option>
              <option value="DELIVERED">Delivered</option>
              <option value="READ">Read</option>
              <option value="CLICKED">Clicked</option>
              <option value="FAILED">Failed</option>
            </select>

            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="py-2 px-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-slate-700"
            >
              <option value="">All Channels</option>
              <option value="SMS">SMS</option>
              <option value="EMAIL">Email</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="PUSH">Push</option>
              <option value="WEB">Web</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="p-4">Recipient</th>
                <th className="p-4">Channel</th>
                <th className="p-4">Provider Ref ID</th>
                <th className="p-4">Delivery Status</th>
                <th className="p-4">Timestamps</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {deliveries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No active delivery records found matching filters.
                  </td>
                </tr>
              ) : (
                deliveries.map((del) => (
                  <tr key={del.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-4 font-medium text-slate-900">
                      {del.recipient_name || del.recipient_phone || del.recipient_email || 'Recipient'}
                      <div className="text-[11px] text-slate-400">{del.recipient_phone || del.recipient_email}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                        {del.channel}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-[11px] text-slate-500">
                      {del.provider_message_id || 'N/A'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border ${
                        del.status === 'CLICKED' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                        del.status === 'READ' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        del.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        del.status === 'SENT' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                        del.status === 'FAILED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {del.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">
                      {del.updated_at ? new Date(del.updated_at).toLocaleTimeString() : '-'}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => navigate(`/campaigns/${del.campaign_id || selectedCampaignId}/delivery`)}
                        className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                        title="View Full Audit"
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
