import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Plus,
  Users,
  Eye,
  Trash2,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';
import { Header } from '../../components/Header';
import { DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { audiencesApi } from '../../api/audiences';

export const Audiences = () => {
  const [audiences, setAudiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchAudiences = async () => {
    setLoading(true);
    try {
      const data = await audiencesApi.getAudiences({ search });
      setAudiences(data.results || data);
    } catch (err) {
      console.error('Failed to load audiences:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudiences();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this audience segment?')) {
      try {
        await audiencesApi.deleteAudience(id);
        fetchAudiences();
      } catch (err) {
        console.error('Failed to delete audience:', err);
      }
    }
  };

  const columns = [
    {
      header: 'Segment Name',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block">{row.name}</span>
          {row.description && (
            <span className="text-xs text-slate-500 line-clamp-1">{row.description}</span>
          )}
        </div>
      ),
    },

    {
      header: 'Estimated Reach',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 font-bold text-slate-900 text-xs px-2.5 py-1 bg-slate-100 rounded-md">
          <Users className="w-3.5 h-3.5 text-slate-500" />
          {row.member_count} Recipients
        </span>
      ),
    },
    {
      header: 'Rules / Criteria',
      render: (row) => (
        <div className="text-xs text-slate-600 max-w-xs truncate">
          {row.rules && row.rules.length > 0 ? (
            row.rules.map((r) => `${r.field} ${r.operator} "${r.value}"`).join(' AND ')
          ) : (
            <span className="text-slate-400">Manual Membership</span>
          )}
        </div>
      ),
    },
    {
      header: 'Created By',
      render: (row) => (
        <span className="text-xs text-slate-500">{row.created_by_username || 'System'}</span>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            to={`/audiences/${row.id}`}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Eye className="w-3.5 h-3.5" />
            Inspect
          </Link>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 border border-slate-200 rounded-lg text-rose-500 hover:bg-rose-50"
            title="Delete Segment"
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
        title="Audience Segmentation"
        subtitle="Dynamic multi-variable filtering and targeted communication cohorts"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAudiences}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              to="/audiences/create"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Audience
            </Link>
          </div>
        }
      />

      {/* Audiences List */}
      <DataTable
        columns={columns}
        data={audiences}
        loading={loading}
        emptyMessage="No audience segments found. Click 'Create Audience' to build one."
      />
    </div>
  );
};
