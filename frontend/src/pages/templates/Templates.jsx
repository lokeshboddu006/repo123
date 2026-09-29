import React, { useState, useEffect } from 'react';
import { FileText, Plus, Edit2, Trash2, Tag, RefreshCw } from 'lucide-react';
import { Header } from '../../components/Header';
import { Modal } from '../../components/Modal';
import { templatesApi } from '../../api/templates';

export const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    scenario: 'Awareness',
    subject_template: '',
    body_template: '',
    default_languages: ['en', 'hi', 'te'],
    active: true,
  });

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const data = await templatesApi.getTemplates();
      setTemplates(data.results || data);
    } catch (e) {
      console.error('Failed to load templates:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleOpenAdd = () => {
    setEditingTemplate(null);
    setFormData({
      title: '',
      scenario: 'Awareness',
      subject_template: 'Public Notice: {{title}} in {{location}}',
      body_template: 'Official alert on {{date}}: {{message}}. Please take necessary precautions.',
      default_languages: ['en', 'hi', 'te'],
      active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tpl) => {
    setEditingTemplate(tpl);
    setFormData({
      title: tpl.title,
      scenario: tpl.scenario,
      subject_template: tpl.subject_template,
      body_template: tpl.body_template,
      default_languages: tpl.default_languages || ['en'],
      active: tpl.active,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingTemplate) {
        await templatesApi.updateTemplate(editingTemplate.id, formData);
      } else {
        await templatesApi.createTemplate(formData);
      }
      setIsModalOpen(false);
      fetchTemplates();
    } catch (err) {
      console.error('Save template failed:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this template?')) {
      try {
        await templatesApi.deleteTemplate(id);
        fetchTemplates();
      } catch (e) {
        console.error('Delete template failed:', e);
      }
    }
  };

  return (
    <div className="space-y-6">
      <Header
        title="Communication Templates"
        subtitle="Reusable message blueprints supporting dynamic variables: {{title}}, {{message}}, {{location}}, {{date}}"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={fetchTemplates}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Template
            </button>
          </div>
        }
      />

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200">
                  {tpl.scenario}
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    tpl.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {tpl.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-sm mb-2">{tpl.title}</h3>

              <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 space-y-1.5 mb-3">
                <p className="font-semibold text-slate-800 line-clamp-1">
                  Subject: {tpl.subject_template || 'N/A'}
                </p>
                <p className="text-slate-500 line-clamp-3 leading-relaxed">
                  {tpl.body_template}
                </p>
              </div>

              {/* Detected Variables Chips */}
              <div className="flex flex-wrap gap-1 mb-3">
                {['title', 'location', 'date', 'message'].map((v) => (
                  <span
                    key={v}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-mono border border-amber-200"
                  >
                    <Tag className="w-2.5 h-2.5" />
                    {'{{' + v + '}}'}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">
                Languages: {tpl.default_languages?.join(', ').toUpperCase()}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(tpl)}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                  title="Edit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(tpl.id)}
                  className="p-1.5 rounded-lg border border-slate-200 text-rose-500 hover:bg-rose-50"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Template Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTemplate ? 'Edit Template' : 'Create Communication Template'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Template Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Scenario Category</label>
            <select
              value={formData.scenario}
              onChange={(e) => setFormData({ ...formData, scenario: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white"
            >
              <option value="Awareness">Awareness</option>
              <option value="Emergency Alert">Emergency Alert</option>
              <option value="Educational">Educational</option>
              <option value="Announcement">Announcement</option>
              <option value="Health">Health</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Subject Template (supports {'{{title}}'}, {'{{location}}'})
            </label>
            <input
              type="text"
              value={formData.subject_template}
              onChange={(e) => setFormData({ ...formData, subject_template: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Body Template (supports {'{{title}}'}, {'{{message}}'}, {'{{location}}'}, {'{{date}}'})
            </label>
            <textarea
              value={formData.body_template}
              onChange={(e) => setFormData({ ...formData, body_template: e.target.value })}
              rows={4}
              required
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white leading-relaxed"
            ></textarea>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold"
            >
              Save Template
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
