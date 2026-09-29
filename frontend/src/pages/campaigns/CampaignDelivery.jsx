import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Send, RefreshCw, AlertTriangle, CheckCircle2, Clock, Eye, 
  MousePointer, Filter, Search, ArrowLeft, RotateCcw, Activity, 
  Layers, Globe, ShieldCheck, FileText, ChevronRight, X
} from 'lucide-react';
import { sendCampaign, getCampaignDeliverySummary, getDeliveryDetail, retryDelivery } from '../../api/delivery';
import { campaignsApi } from '../../api/campaigns';

export default function CampaignDelivery() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  // Filters & Table state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [channelFilter, setChannelFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Timeline Modal
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [retryingId, setRetryingId] = useState(null);

  const fetchDeliveryData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [campRes, sumRes] = await Promise.all([
        campaignsApi.getCampaign(id),
        getCampaignDeliverySummary(id, { search, status: statusFilter, channel: channelFilter, page, page_size: pageSize })
      ]);
      setCampaign(campRes);
      setSummary(sumRes);
      setError(null);
    } catch (err) {
      console.error('Failed to load delivery tracking data', err);
      setError('Failed to fetch campaign delivery metrics.');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [id, search, statusFilter, channelFilter, page, pageSize]);

  useEffect(() => {
    fetchDeliveryData();
  }, [fetchDeliveryData]);

  // Auto poll every 3 seconds if status is RUNNING or processing
  useEffect(() => {
    let interval;
    if (summary?.campaign_status === 'RUNNING' || summary?.kpis?.processing > 0 || summary?.kpis?.queued > 0) {
      interval = setInterval(() => {
        fetchDeliveryData(true);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [summary?.campaign_status, summary?.kpis?.processing, summary?.kpis?.queued, fetchDeliveryData]);

  const handleSendCampaign = async () => {
    setSending(true);
    try {
      await sendCampaign(id);
      await fetchDeliveryData(false);
    } catch (err) {
      console.error('Error dispatching campaign', err);
      alert(err.response?.data?.error || 'Failed to dispatch campaign.');
    } finally {
      setSending(false);
    }
  };

  const handleRetryRecipient = async (deliveryId) => {
    setRetryingId(deliveryId);
    try {
      await retryDelivery(deliveryId);
      await fetchDeliveryData(true);
      if (selectedDelivery && selectedDelivery.id === deliveryId) {
        const updated = await getDeliveryDetail(deliveryId);
        setSelectedDelivery(updated);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to trigger retry.');
    } finally {
      setRetryingId(null);
    }
  };

  const openTimelineModal = async (deliveryId) => {
    setTimelineLoading(true);
    try {
      const data = await getDeliveryDetail(deliveryId);
      setSelectedDelivery(data);
    } catch (err) {
      alert('Failed to load delivery timeline.');
    } finally {
      setTimelineLoading(false);
    }
  };

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-slate-600 font-medium">Loading Campaign Delivery Engine...</p>
        </div>
      </div>
    );
  }

  const kpis = summary?.kpis || summary?.summary || {
    total_recipients: 0, queued: 0, processing: 0, sent: 0,
    delivered: 0, read: 0, clicked: 0, failed: 0,
    delivery_rate: 0, read_rate: 0, click_rate: 0
  };

  const funnel = summary?.funnel || { queued: 0, sent: 0, delivered: 0, read: 0, clicked: 0 };
  const channels = summary?.channel_breakdown || [];
  const languages = summary?.language_breakdown || [];
  const deliveries = summary?.deliveries?.results || summary?.recipient_deliveries?.results || [];
  const totalCount = summary?.deliveries?.count || summary?.recipient_deliveries?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-slate-800">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <button 
            onClick={() => navigate('/campaigns')}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Campaigns
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{campaign?.title || 'Campaign Live Delivery'}</h1>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
              summary?.campaign_status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
              summary?.campaign_status === 'RUNNING' ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse' :
              summary?.campaign_status === 'FAILED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
              'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              {summary?.campaign_status || campaign?.status || 'DRAFT'}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time delivery pipeline tracking across email, SMS, WhatsApp, push, and web.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchDeliveryData(false)}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {summary?.campaign_status !== 'COMPLETED' && summary?.campaign_status !== 'RUNNING' && (
            <button
              onClick={handleSendCampaign}
              disabled={sending}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {sending ? 'Dispatching Pipeline...' : 'Send Campaign Now'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Recipients</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{kpis.total_recipients}</p>
          <span className="text-[10px] text-slate-400">Total target count</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Queued</p>
          <p className="text-xl font-bold text-blue-600 mt-1">{kpis.queued}</p>
          <span className="text-[10px] text-slate-400">Awaiting dispatch</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Processing</p>
          <p className="text-xl font-bold text-amber-600 mt-1">{kpis.processing}</p>
          <span className="text-[10px] text-slate-400">Adapter handoff</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Sent</p>
          <p className="text-xl font-bold text-indigo-600 mt-1">{kpis.sent}</p>
          <span className="text-[10px] text-slate-400">Provider accepted</span>
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
          <span className="text-[10px] text-slate-400">Needs retry/audit</span>
        </div>
      </div>

      {/* Delivery Funnel Component */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-600" />
          Delivery & Engagement Funnel
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

      {/* Analytics Breakdowns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Channel Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            Delivery by Communication Channel
          </h3>
          <div className="space-y-3">
            {channels.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No channel metrics available yet.</p>
            ) : (
              channels.map((ch, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                  <div>
                    <span className="font-semibold text-sm text-slate-800 uppercase tracking-wide">{ch.channel}</span>
                    <p className="text-xs text-slate-500">Sent: {ch.sent} | Delivered: {ch.delivered}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-emerald-600">{ch.read} Read</span>
                    <p className="text-xs text-rose-500">{ch.failed} Failed</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Language Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-600" />
            Multilingual Delivery Breakdown
          </h3>
          <div className="space-y-3">
            {languages.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No language breakdown data.</p>
            ) : (
              languages.map((lang, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                  <div>
                    <span className="font-semibold text-sm text-slate-800">{lang.language}</span>
                    <p className="text-xs text-slate-500">Target Count: {lang.count}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-emerald-600">{lang.delivered} Delivered</span>
                    <p className="text-xs text-purple-600">{lang.read} Read</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recipient-Level Delivery Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Recipient Message Status</h3>
            <p className="text-xs text-slate-500">Individual delivery progress, timeline events & retries</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search recipient..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none w-48"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-slate-700"
            >
              <option value="">All Statuses</option>
              <option value="QUEUED">Queued</option>
              <option value="PROCESSING">Processing</option>
              <option value="SENT">Sent</option>
              <option value="DELIVERED">Delivered</option>
              <option value="READ">Read</option>
              <option value="CLICKED">Clicked</option>
              <option value="FAILED">Failed</option>
              <option value="RETRYING">Retrying</option>
            </select>

            {/* Channel Filter */}
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="py-2 px-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-slate-700"
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
                <th className="p-4">Queued / Sent</th>
                <th className="p-4">Delivered / Read</th>
                <th className="p-4">Retries</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {deliveries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No recipient delivery records found matching filters.
                  </td>
                </tr>
              ) : (
                deliveries.map((del) => (
                  <tr key={del.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-4 font-medium text-slate-900">
                      {del.recipient_name || del.recipient_phone || del.recipient_email || 'Recipient'}
                      <div className="text-xs text-slate-400">{del.recipient_phone || del.recipient_email}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                        {del.channel}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-xs text-slate-500">
                      {del.provider_message_id || 'N/A'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                        del.status === 'CLICKED' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                        del.status === 'READ' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        del.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        del.status === 'SENT' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                        del.status === 'FAILED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        del.status === 'RETRYING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {del.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-600">
                      <div>Q: {del.queued_at ? new Date(del.queued_at).toLocaleTimeString() : '-'}</div>
                      <div>S: {del.sent_at ? new Date(del.sent_at).toLocaleTimeString() : '-'}</div>
                    </td>
                    <td className="p-4 text-xs text-slate-600">
                      <div>D: {del.delivered_at ? new Date(del.delivered_at).toLocaleTimeString() : '-'}</div>
                      <div>R: {del.read_at ? new Date(del.read_at).toLocaleTimeString() : '-'}</div>
                    </td>
                    <td className="p-4 text-xs font-semibold text-slate-700">
                      {del.retry_count} / 3
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => openTimelineModal(del.id)}
                        className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                        title="View Timeline"
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                      {del.status === 'FAILED' && (
                        <button
                          onClick={() => handleRetryRecipient(del.id)}
                          disabled={retryingId === del.id}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition disabled:opacity-50"
                          title="Retry Delivery"
                        >
                          <RotateCcw className={`w-4 h-4 ${retryingId === del.id ? 'animate-spin' : ''}`} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Showing page {page} of {totalPages} ({totalCount} total)</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Timeline & Detail Drawer / Modal */}
      {selectedDelivery && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedDelivery(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              Delivery Audit Timeline
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Recipient: <span className="font-semibold text-slate-800">{selectedDelivery.recipient_name}</span> ({selectedDelivery.channel})
            </p>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Provider Ref ID:</span>
                <span className="font-mono text-slate-800">{selectedDelivery.provider_message_id || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Current Status:</span>
                <span className="font-bold text-emerald-600">{selectedDelivery.status}</span>
              </div>
              {selectedDelivery.error_message && (
                <div className="text-rose-600 font-medium pt-1">
                  Error: {selectedDelivery.error_message}
                </div>
              )}
            </div>

            {/* Timeline Events List */}
            <div className="mt-6 space-y-4 max-h-80 overflow-y-auto pr-2">
              {selectedDelivery.events?.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No timeline events recorded.</p>
              ) : (
                selectedDelivery.events?.map((evt, idx) => (
                  <div key={idx} className="flex gap-3 relative">
                    {idx < selectedDelivery.events.length - 1 && (
                      <div className="absolute left-3.5 top-6 bottom-0 w-0.5 bg-slate-200" />
                    )}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold ${
                      evt.event_type.includes('DELIVERED') || evt.event_type.includes('READ') || evt.event_type.includes('CLICKED') ? 'bg-emerald-500' :
                      evt.event_type.includes('FAILED') ? 'bg-rose-500' :
                      evt.event_type.includes('RETRY') ? 'bg-amber-500' :
                      'bg-indigo-500'
                    }`}>
                      ✓
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{evt.event_type}</p>
                      <p className="text-[11px] text-slate-400">
                        {new Date(evt.timestamp).toLocaleString()}
                      </p>
                      {evt.metadata && Object.keys(evt.metadata).length > 0 && (
                        <pre className="mt-1 text-[10px] bg-slate-100 p-2 rounded text-slate-600 overflow-x-auto">
                          {JSON.stringify(evt.metadata, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-2">
              {selectedDelivery.status === 'FAILED' && (
                <button
                  onClick={() => handleRetryRecipient(selectedDelivery.id)}
                  disabled={retryingId === selectedDelivery.id}
                  className="px-4 py-2 bg-rose-600 text-white text-xs font-medium rounded-xl hover:bg-rose-700 transition"
                >
                  Retry Now
                </button>
              )}
              <button
                onClick={() => setSelectedDelivery(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-medium rounded-xl hover:bg-slate-200 transition"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
