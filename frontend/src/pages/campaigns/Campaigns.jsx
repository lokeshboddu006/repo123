import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  Clock,
  Copy,
  XCircle,
  Eye,
  Trash2,
  Calendar,
  Activity,
} from 'lucide-react';
import { Header } from '../../components/Header';
import { DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { campaignsApi } from '../../api/campaigns';

export const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;

      const data = await campaignsApi.getCampaigns(params);
      setCampaigns(data.results || data);
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [statusFilter, priorityFilter]);

  const handleDuplicate = async (id) => {
    try {
      await campaignsApi.duplicateCampaign(id);
      fetchCampaigns();
    } catch (e) {
      console.error('Duplicate failed:', e);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Cancel this campaign? Scheduled dispatches will be stopped.')) {
      try {
        await campaignsApi.cancelCampaign(id);
        fetchCampaigns();
      } catch (e) {
        console.error('Cancel failed:', e);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this campaign record?')) {
      try {
        await campaignsApi.deleteCampaign(id);
        fetchCampaigns();
      } catch (e) {
        console.error('Delete failed:', e);
      }
    }
  };

  const columns = [
    {
      header: 'Campaign Title',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block">{row.title}</span>
          <span className="text-xs text-slate-400 capitalize">{row.campaign_type}</span>
        </div>
      ),
    },
    {
      header: 'Priority',
      render: (row) => <StatusBadge status={row.priority} />,
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Audiences',
      render: (row) => (
        <div className="text-xs text-slate-600 max-w-xs truncate">
          {row.audience_names && row.audience_names.length > 0 ? (
            row.audience_names.join(', ')
          ) : (
            <span className="text-slate-400">No audience assigned</span>
          )}
        </div>
      ),
    },
    {
      header: 'Target Languages',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.target_languages?.map((lang) => (
            <span key={lang} className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 uppercase text-slate-600">
              {lang}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: 'Channels',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.channels?.map((ch) => (
            <span key={ch} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-brand-50 text-brand-700">
              {ch}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: 'Scheduled For',
      render: (row) => (
        <div className="text-xs text-slate-500">
          {row.scheduled_at ? (
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <Calendar className="w-3 h-3 text-slate-400" />
              {new Date(row.scheduled_at).toLocaleString()}
            </span>
          ) : (
            <span className="text-slate-400">Not scheduled</span>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            to={`/campaigns/${row.id}/delivery`}
            className="p-1.5 rounded-lg border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 flex items-center gap-1 font-semibold text-xs"
            title="Live Delivery & Tracking"
          >
            <Activity className="w-3.5 h-3.5" /> Track
          </Link>
          <Link
            to={`/campaigns/${row.id}`}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            title="Inspect Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => handleDuplicate(row.id)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            title="Duplicate Campaign"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          {row.status !== 'CANCELLED' && row.status !== 'COMPLETED' && (
            <button
              onClick={() => handleCancel(row.id)}
              className="p-1.5 rounded-lg border border-slate-200 text-amber-600 hover:bg-amber-50"
              title="Cancel Campaign"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 rounded-lg border border-slate-200 text-rose-500 hover:bg-rose-50"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Header
        title="Campaign Management"
        subtitle="Orchestrate multilingual public awareness campaigns and emergency broadcast dispatches"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={fetchCampaigns}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              to="/campaigns/create"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Campaign Wizard
            </Link>
          </div>
        }
      />

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchCampaigns()}
            placeholder="Search campaigns by title..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="VALIDATED">Validated</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="RUNNING">Running</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="NORMAL">Normal</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
      </div>

      {/* Campaigns Table */}
      <DataTable
        columns={columns}
        data={campaigns}
        loading={loading}
        emptyMessage="No campaigns found. Click 'New Campaign Wizard' to start."
      />
    </div>
  );
};
