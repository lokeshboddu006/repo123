import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Layers,
  Plus,
  Trash2,
  Users,
  Eye,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Filter,
  Sparkles,
} from 'lucide-react';
import { Header } from '../../components/Header';
import { audiencesApi } from '../../api/audiences';

export const CreateAudience = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [segmentType, setSegmentType] = useState('DYNAMIC');

  // Dynamic Rule Builder (Initial state with demo scenario)
  const [rules, setRules] = useState([
    { field: 'state', operator: '=', value: 'Andhra Pradesh' },
    { field: 'language', operator: '=', value: 'Telugu' },
    { field: 'occupation', operator: '=', value: 'Student' },
  ]);

  // Preview state
  const [previewResult, setPreviewResult] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const availableFields = [
    { label: 'State', value: 'state' },
    { label: 'Language', value: 'language' },
    { label: 'Occupation', value: 'occupation' },
    { label: 'District', value: 'district' },
    { label: 'Gender', value: 'gender' },
    { label: 'City', value: 'city' },
    { label: 'Status', value: 'status' },
  ];

  const availableOperators = [
    { label: 'equals (=)', value: '=' },
    { label: 'not equals (!=)', value: '!=' },
    { label: 'contains', value: 'contains' },
    { label: 'in (comma separated)', value: 'in' },
  ];

  const handleAddRule = () => {
    setRules((prev) => [...prev, { field: 'state', operator: '=', value: '' }]);
  };

  const handleRemoveRule = (index) => {
    setRules((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleRuleChange = (index, key, val) => {
    setRules((prev) => {
      const copy = [...prev];
      copy[index][key] = val;
      return copy;
    });
  };

  const handleRunPreview = async () => {
    setPreviewLoading(true);
    setError('');
    try {
      const res = await audiencesApi.previewRules(rules);
      setPreviewResult(res);
    } catch (err) {
      console.error(err);
      setError('Failed to preview matching recipients. Verify your rules.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSaveAudience = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a name for this audience segment.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await audiencesApi.createAudience({
        name,
        description,
        segment_type: segmentType,
        rules: segmentType === 'DYNAMIC' ? rules : [],
      });
      navigate('/audiences');
    } catch (err) {
      setError(err.response?.data?.name || 'Failed to save audience segment.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Header
        title="Create Audience Segment"
        subtitle="Build targeted citizen segments using real-time criteria"
        actions={
          <Link
            to="/audiences"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-lg bg-white"
          >
            &larr; Back to Audiences
          </Link>
        }
      />

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSaveAudience} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-600" />
            Segment Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Audience Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. AP Telugu College Students"
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-600"
              />
            </div>
          </div>



          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the demographic and communication purpose of this segment..."
              rows={2}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white"
            ></textarea>
          </div>
        </div>

        {/* Dynamic Rule Builder Section */}
        {segmentType === 'DYNAMIC' && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-purple-600" />
                  Audience Criteria
                </h3>
                <p className="text-xs text-slate-500">
                  Combine multi-variable rules with logical AND operator
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddRule}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Condition
              </button>
            </div>

            {/* Rules Container */}
            <div className="space-y-3 pt-2">
              {rules.map((rule, idx) => (
                <div key={idx} className="space-y-2">
                  {idx > 0 && (
                    <div className="flex items-center gap-2 px-4 py-1">
                      <span className="text-[11px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                        AND
                      </span>
                      <div className="h-px bg-slate-200 flex-1"></div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 p-3 bg-slate-50/70 border border-slate-200 rounded-xl">
                    <select
                      value={rule.field}
                      onChange={(e) => handleRuleChange(idx, 'field', e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-brand-600 w-36"
                    >
                      {availableFields.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>

                    <select
                      value={rule.operator}
                      onChange={(e) => handleRuleChange(idx, 'operator', e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 font-medium focus:ring-2 focus:ring-brand-600 w-36"
                    >
                      {availableOperators.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      value={rule.value}
                      onChange={(e) => handleRuleChange(idx, 'value', e.target.value)}
                      placeholder="e.g. Andhra Pradesh, Telugu, Student..."
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-brand-600"
                    />

                    {rules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRule(idx)}
                        className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-white"
                        title="Remove condition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Preview Action & Live Matching Counter */}
            <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleRunPreview}
                disabled={previewLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{previewLoading ? 'Evaluating Database...' : 'Preview Matching Audience'}</span>
              </button>

              {previewResult && (
                <div className="flex items-center gap-3 px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-bold text-purple-900">
                    Matching Recipients: {previewResult.matching_count}
                  </span>
                  <span className="text-[10px] text-purple-600 font-medium">(Live PostgreSQL query)</span>
                </div>
              )}
            </div>

            {/* Sample Recipients Cards */}
            {previewResult && previewResult.sample_recipients?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-600 mb-2">
                  Matching Sample Recipients (Showing first {previewResult.sample_recipients.length}):
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {previewResult.sample_recipients.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-900">
                          {rec.first_name} {rec.last_name}
                        </span>
                        <p className="text-[11px] text-slate-500">{rec.email || rec.phone}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-100 text-brand-800">
                        {rec.language_name} &bull; {rec.occupation_name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/audiences')}
            className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
          >
            <span>{saving ? 'Creating Audience...' : 'Save Audience Segment'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
