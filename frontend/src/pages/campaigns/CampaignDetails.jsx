import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Megaphone,
  ArrowLeft,
  Calendar,
  Layers,
  Globe,
  Radio,
  CheckCircle2,
  Clock,
  XCircle,
  Copy,
  ShieldCheck,
  RefreshCw,
  Activity,
} from 'lucide-react';
import { Header } from '../../components/Header';
import { StatusBadge } from '../../components/StatusBadge';
import { campaignsApi } from '../../api/campaigns';

export const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLangTab, setActiveLangTab] = useState('');
  const [validating, setValidating] = useState(false);
  const [validationReport, setValidationReport] = useState(null);

  const fetchCampaign = async () => {
    setLoading(true);
    try {
      const data = await campaignsApi.getCampaign(id);
      setCampaign(data);
      if (data.contents && data.contents.length > 0) {
        setActiveLangTab(data.contents[0].language_code || 'en');
      }
    } catch (err) {
      console.error('Failed to load campaign:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  const handleValidate = async () => {
    setValidating(true);
    try {
      const res = await campaignsApi.validateCampaign(id);
      setValidationReport(res);
      fetchCampaign();
    } catch (err) {
      console.error('Validation failed:', err);
    } finally {
      setValidating(false);
    }
  };

  const handleSchedule = async () => {
    try {
      await campaignsApi.scheduleCampaign(id, {
        schedule_type: 'SCHEDULED',
        scheduled_time: campaign.scheduled_at || new Date().toISOString(),
        timezone: 'Asia/Kolkata',
      });
      fetchCampaign();
    } catch (err) {
      console.error('Schedule failed:', err);
    }
  };

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this campaign?')) {
      try {
        await campaignsApi.cancelCampaign(id);
        fetchCampaign();
      } catch (err) {
        console.error('Cancel failed:', err);
      }
    }
  };

  const handleDuplicate = async () => {
    try {
      const dup = await campaignsApi.duplicateCampaign(id);
      navigate(`/campaigns/${dup.id}`);
    } catch (err) {
      console.error('Duplicate failed:', err);
    }
  };

  if (!campaign && loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-400">
        Loading campaign details...
      </div>
    );
  }

  const activeContent = campaign?.contents?.find(
    (c) => c.language_code === activeLangTab || c.language === activeLangTab
  ) || campaign?.contents?.[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Header
        title={campaign?.title || 'Campaign Overview'}
        subtitle={`Campaign ID: ${campaign?.id} &bull; Created by ${campaign?.created_by_username || 'Admin'}`}
        actions={
          <div className="flex items-center gap-2">
            <Link
              to="/campaigns"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-lg bg-white inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Campaigns
            </Link>
          </div>
        }
      />

      {/* Main Campaign Status Card */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h2 className="text-lg font-bold text-slate-900">{campaign?.title}</h2>
            <StatusBadge status={campaign?.priority} />
            <StatusBadge status={campaign?.status} />
          </div>
          <p className="text-xs text-slate-500 max-w-xl">
            {campaign?.description || 'No description provided.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to={`/campaigns/${id}/delivery`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg text-xs font-semibold shadow-sm hover:shadow transition"
          >
            <Activity className="w-4 h-4" />
            <span>Track Live Delivery</span>
          </Link>

          <button
            onClick={handleValidate}
            disabled={validating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{validating ? 'Checking...' : 'Validate'}</span>
          </button>

          {campaign?.status !== 'SCHEDULED' && campaign?.status !== 'RUNNING' && campaign?.status !== 'COMPLETED' && (
            <button
              onClick={handleSchedule}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold"
            >
              <Clock className="w-4 h-4" />
              <span>Schedule</span>
            </button>
          )}

          <button
            onClick={handleDuplicate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Copy className="w-4 h-4" />
            <span>Duplicate</span>
          </button>

          {campaign?.status !== 'CANCELLED' && campaign?.status !== 'COMPLETED' && (
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-rose-200 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50"
            >
              <XCircle className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          )}
        </div>
      </div>

      {/* Validation Alert Box if present */}
      {validationReport && (
        <div
          className={`p-4 rounded-xl border text-xs ${
            validationReport.valid
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-rose-50 border-rose-300 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2 font-bold mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>{validationReport.valid ? '✓ Campaign is Validated & Ready' : 'Validation Errors'}</span>
          </div>
          {validationReport.errors?.map((err, i) => (
            <p key={i} className="pl-6 text-[11px]">&bull; {err}</p>
          ))}
        </div>
      )}

      {/* Campaign Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Audiences */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-wider">
            <Layers className="w-4 h-4 text-purple-600" />
            Assigned Audiences
          </div>
          <div className="space-y-1">
            {campaign?.audience_names?.length > 0 ? (
              campaign.audience_names.map((name, i) => (
                <div key={i} className="text-xs font-semibold text-slate-800 bg-slate-50 p-2 rounded border border-slate-100">
                  {name}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">None assigned</p>
            )}
          </div>
        </div>

        {/* Channels */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-wider">
            <Radio className="w-4 h-4 text-blue-600" />
            Delivery Channels
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {campaign?.channels?.map((ch) => (
              <span key={ch} className="px-2.5 py-1 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                {ch}
              </span>
            ))}
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-amber-600" />
            Schedule Details
          </div>
          <div className="text-xs text-slate-700 pt-1 space-y-1">
            <p>
              Status:{' '}
              <strong className="text-slate-900">{campaign?.schedule?.status || campaign?.status}</strong>
            </p>
            <p>
              Dispatch Time:{' '}
              <strong className="text-slate-900">
                {campaign?.scheduled_at ? new Date(campaign.scheduled_at).toLocaleString() : 'Immediate'}
              </strong>
            </p>
            <p className="text-slate-400 text-[11px]">Timezone: Asia/Kolkata (IST)</p>
          </div>
        </div>
      </div>

      {/* Multilingual Content Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-600" />
            Multilingual Content Versions
          </h3>

          {/* Language Tabs */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
            {campaign?.contents?.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveLangTab(c.language_code || c.language)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  (activeLangTab === c.language_code || activeLangTab === c.language)
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {c.language_name || c.language_code?.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Active Content Preview */}
        {activeContent ? (
          <div className="p-6 space-y-4 text-xs">
            <div>
              <span className="font-semibold text-slate-400 block mb-1">Subject Header</span>
              <p className="text-sm font-bold text-slate-900 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                {activeContent.subject || 'No subject header'}
              </p>
            </div>

            <div>
              <span className="font-semibold text-slate-400 block mb-1">Message Body</span>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 whitespace-pre-wrap leading-relaxed">
                {activeContent.body || 'No message body configured.'}
              </div>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-2 border-t border-slate-100">
              <span>Channel: <strong className="text-slate-700">{activeContent.channel}</strong></span>
              <span>Version: <strong className="text-slate-700">v{activeContent.version}</strong></span>
              <span>AI Generated: <strong className="text-slate-700">{activeContent.ai_generated ? 'Yes' : 'No'}</strong></span>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400">
            No content configured for this campaign.
          </div>
        )}
      </div>
    </div>
  );
};
