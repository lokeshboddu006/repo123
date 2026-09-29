import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layers, Users, ArrowLeft, RefreshCw, Mail, Phone } from 'lucide-react';
import { Header } from '../../components/Header';
import { StatusBadge } from '../../components/StatusBadge';
import { DataTable } from '../../components/DataTable';
import { audiencesApi } from '../../api/audiences';

export const AudienceDetails = () => {
  const { id } = useParams();
  const [audience, setAudience] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalMembers, setTotalMembers] = useState(0);

  const fetchAudienceData = async () => {
    setLoading(true);
    try {
      const [audData, membersData] = await Promise.all([
        audiencesApi.getAudience(id),
        audiencesApi.getAudienceMembers(id, { page }),
      ]);
      setAudience(audData);
      setMembers(membersData.results || membersData);
      setTotalMembers(membersData.count || (membersData.results ? membersData.results.length : membersData.length));
    } catch (err) {
      console.error('Failed to load audience details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudienceData();
  }, [id, page]);

  const memberColumns = [
    {
      header: 'Name',
      render: (row) => (
        <span className="font-semibold text-slate-900">
          {row.first_name} {row.last_name}
        </span>
      ),
    },
    {
      header: 'Contact',
      render: (row) => (
        <div className="space-y-0.5 text-xs text-slate-600">
          {row.email && <div>{row.email}</div>}
          {row.phone && <div>{row.phone}</div>}
        </div>
      ),
    },
    {
      header: 'Language',
      render: (row) => (
        <span className="px-2 py-0.5 rounded text-xs bg-slate-100 font-medium">
          {row.language_name || 'English'}
        </span>
      ),
    },
    {
      header: 'State / District',
      render: (row) => (
        <span className="text-xs text-slate-600">
          {row.district_name ? `${row.district_name}, ` : ''}
          {row.state_name}
        </span>
      ),
    },
    {
      header: 'Occupation',
      render: (row) => (
        <span className="text-xs text-slate-700 font-medium">{row.occupation_name || 'General'}</span>
      ),
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  if (!audience && loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-400">
        Loading audience details...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header
        title={audience?.name || 'Audience Details'}
        subtitle={audience?.description || 'Audience segment specification and roster'}
        actions={
          <Link
            to="/audiences"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-lg bg-white inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Audiences
          </Link>
        }
      />

      {/* Summary Header Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base font-bold text-slate-900">{audience?.name}</h2>
            <StatusBadge status={audience?.segment_type} />
          </div>
          <p className="text-xs text-slate-500">{audience?.description || 'No description provided.'}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg text-center">
            <span className="text-[11px] font-semibold text-purple-700 uppercase">Matching Reach</span>
            <p className="text-lg font-extrabold text-purple-900">{totalMembers} Citizens</p>
          </div>
        </div>
      </div>

      {/* Dynamic Rules Display */}
      {audience?.segment_type === 'DYNAMIC' && audience?.rules?.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Applied Filter Rules
          </h3>
          <div className="flex flex-wrap gap-2">
            {audience.rules.map((r, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800"
              >
                <span className="font-semibold capitalize">{r.field}</span>
                <span className="text-slate-400 font-mono text-[11px]">{r.operator}</span>
                <span className="font-bold text-brand-700">"{r.value}"</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members Table */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-slate-800">Matching Recipient Members</h3>
        <DataTable
          columns={memberColumns}
          data={members}
          loading={loading}
          emptyMessage="No recipients match this audience filter."
          pagination={{
            page,
            total: totalMembers,
            hasPrev: page > 1,
            hasNext: page * 20 < totalMembers,
          }}
          onPageChange={(p) => setPage(p)}
        />
      </div>
    </div>
  );
};
