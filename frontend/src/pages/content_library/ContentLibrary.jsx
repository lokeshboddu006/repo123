import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Search, Filter, Edit2, Trash2, Globe, RefreshCw } from 'lucide-react';
import { Header } from '../../components/Header';
import { Modal } from '../../components/Modal';
import { contentLibraryApi } from '../../api/contentLibrary';
import { masterDataApi } from '../../api/masterData';

export const ContentLibrary = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [languages, setLanguages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Public Health',
    language: '',
    content: '',
    active: true,
  });

  const categories = [
    'Dengue Prevention',
    'Flood Safety',
    'Public Health',
    'Water Conservation',
    'Education Scholarship',
    'Emergency Preparedness',
  ];

  const fetchContent = async () => {
    setLoading(true);
    try {
      const params = {};
      if (categoryFilter) params.category = categoryFilter;
      const data = await contentLibraryApi.getContentList(params);
      setItems(data.results || data);
    } catch (e) {
      console.error('Failed to load library:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    masterDataApi.getLanguages().then((d) => setLanguages(d.results || d));
  }, []);

  useEffect(() => {
    fetchContent();
  }, [categoryFilter]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      category: 'Public Health',
      language: languages[0]?.id || '',
      content: '',
      active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      category: item.category,
      language: item.language || '',
      content: item.content,
      active: item.active,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await contentLibraryApi.updateContentItem(editingItem.id, formData);
      } else {
        await contentLibraryApi.createContentItem(formData);
      }
      setIsModalOpen(false);
      fetchContent();
    } catch (err) {
      console.error('Failed to save library item:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this library content?')) {
      try {
        await contentLibraryApi.deleteContentItem(id);
        fetchContent();
      } catch (e) {
        console.error('Delete failed:', e);
      }
    }
  };

  return (
    <div className="space-y-6">
      <Header
        title="Content Library"
        subtitle="Verified public health notices, emergency protocols, and educational scholarship bulletins"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={fetchContent}
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
              Add Content
            </button>
          </div>
        }
      />

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setCategoryFilter('')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            categoryFilter === ''
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              categoryFilter === cat
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Content Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                  {item.category}
                </span>
                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1 border border-emerald-100">
                  <Globe className="w-3 h-3" />
                  {item.language_name || 'English'}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-sm mb-2">{item.title}</h3>

              <p className="text-xs text-slate-600 line-clamp-4 leading-relaxed p-3 bg-slate-50 rounded-lg border border-slate-100">
                {item.content}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-4">
              <span className="text-[11px] text-slate-400">
                {new Date(item.created_at).toLocaleDateString()}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                  title="Edit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
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

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Content Item' : 'New Content Item'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Language</label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white"
              >
                <option value="">Default (All)</option>
                {languages.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Content Body *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={5}
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
              Save Content
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
