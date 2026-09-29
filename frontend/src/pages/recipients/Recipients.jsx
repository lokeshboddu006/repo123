import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  Upload,
  Filter,
  CheckCircle,
  XCircle,
  Trash2,
  Edit2,
  RefreshCw,
  Phone,
  Mail,
  SlidersHorizontal,
} from 'lucide-react';
import { Header } from '../../components/Header';
import { DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal } from '../../components/Modal';
import { recipientsApi } from '../../api/recipients';
import { masterDataApi } from '../../api/masterData';
import { ALL_INDIAN_REGIONS, getDistrictsForRegion } from '../../data/indiaGeography';

export const Recipients = () => {
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [langFilter, setLangFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Master data for filters & add form
  const [languages, setLanguages] = useState([]);
  const [states, setStates] = useState(ALL_INDIAN_REGIONS.map(r => ({ id: r.name, name: r.name })));
  const [districts, setDistricts] = useState([]);
  const [occupations, setOccupations] = useState([]);


  // Add/Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipient, setEditingRecipient] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    external_reference_id: '',
    preferred_language: '',
    state: '',
    district: '',
    city: '',
    occupation: '',
    gender: 'OTHER',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load master data once
  // Predefined Indian states & districts dictionary for instant response & offline fallback
  const INDIAN_STATES_DISTRICTS = {
    'Andhra Pradesh': ['Anakapalli', 'Ananthapuramu', 'Annamayya', 'Bapatla', 'Chittoor', 'East Godavari', 'Eluru', 'Guntur', 'Kakinada', 'Konaseema', 'Krishna', 'Kurnool', 'Nandyal', 'NTR', 'Palnadu', 'Parvathipuram Manyam', 'Prakasam', 'Sri Potti Sriramulu Nellore', 'Sri Sathya Sai', 'Srikakulam', 'Tirupati', 'Visakhapatnam', 'Vizianagaram', 'West Godavari', 'YSR Kadapa'],
    'Telangana': ['Adilabad', 'Bhadradri Kothagudem', 'Hyderabad', 'Jagtial', 'Jangaon', 'Jayashankar Bhupalpally', 'Jogulamba Gadwal', 'Kamareddy', 'Karimnagar', 'Khammam', 'Komaram Bheem Asifabad', 'Mahabubabad', 'Mahabubnagar', 'Mancherial', 'Medak', 'Medchal-Malkajgiri', 'Mulugu', 'Nagarkurnool', 'Nalgonda', 'Narayanpet', 'Nirmal', 'Nizamabad', 'Peddapalli', 'Rajanna Sircilla', 'Rangareddy', 'Sangareddy', 'Siddipet', 'Suryapet', 'Vikarabad', 'Wanaparthy', 'Warangal', 'Hanamkonda', 'Yadadri Bhuvanagiri'],
    'Karnataka': ['Bagalkote', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban', 'Bidar', 'Chamarajanagara', 'Chikkaballapura', 'Chikkamagaluru', 'Chitradurga', 'Dakshina Kannada', 'Davanagere', 'Dharwad', 'Gadag', 'Hassan', 'Haveri', 'Kalaburagi', 'Kodagu', 'Kolar', 'Koppal', 'Mandya', 'Mysuru', 'Raichur', 'Ramanagara', 'Shivamogga', 'Tumakuru', 'Udupi', 'Uttara Kannada', 'Vijayapura', 'Yadgir'],
    'Tamil Nadu': ['Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram', 'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai', 'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Viluppuram', 'Virudhunagar'],
    'Maharashtra': ['Ahmednagar', 'Akola', 'Amravati', 'Chhatrapati Sambhajinagar', 'Beed', 'Bhandara', 'Buldhana', 'Chandrapur', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli', 'Jalgaon', 'Jalna', 'Kolhapur', 'Latur', 'Mumbai City', 'Mumbai Suburban', 'Nagpur', 'Nanded', 'Nandurbar', 'Nashik', 'Dharashiv', 'Palghar', 'Parbhani', 'Pune', 'Raigad', 'Ratnagiri', 'Sangli', 'Satara', 'Sindhudurg', 'Solapur', 'Thane', 'Wardha', 'Washim', 'Yavatmal'],
    'Kerala': ['Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod', 'Kollam', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad', 'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'],
    'Gujarat': ['Ahmedabad', 'Amreli', 'Anand', 'Aravalli', 'Banaskantha', 'Bharuch', 'Bhavnagar', 'Botad', 'Chhota Udaipur', 'Dahod', 'Dang', 'Devbhumi Dwarka', 'Gandhinagar', 'Gir Somnath', 'Jamnagar', 'Junagadh', 'Kheda', 'Kutch', 'Mahisagar', 'Mehsana', 'Morbi', 'Narmada', 'Navsari', 'Panchmahal', 'Patan', 'Porbandar', 'Rajkot', 'Sabarkantha', 'Surat', 'Surendranagar', 'Tapi', 'Vadodara', 'Valsad'],
    'Delhi': ['Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi', 'North East Delhi', 'North West Delhi', 'Shahdara', 'South Delhi', 'South East Delhi', 'South West Delhi', 'West Delhi'],
    'Uttar Pradesh': ['Agra', 'Aligarh', 'Ayodhya', 'Bareilly', 'Ghaziabad', 'Gorakhpur', 'Kanpur Nagar', 'Lucknow', 'Mathura', 'Meerut', 'Noida (Gautam Buddha Nagar)', 'Prayagraj', 'Varanasi'],
    'West Bengal': ['Bankura', 'Birbhum', 'Darjeeling', 'Howrah', 'Hooghly', 'Kolkata', 'Nadia', 'North 24 Parganas', 'South 24 Parganas', 'Paschim Medinipur', 'Purba Medinipur']
  };

  const FALLBACK_LANGUAGES = [
    { id: 'te', name: 'Telugu', native_name: 'తెలుగు' },
    { id: 'hi', name: 'Hindi', native_name: 'हिन्दी' },
    { id: 'en', name: 'English', native_name: 'English' },
    { id: 'ta', name: 'Tamil', native_name: 'தமிழ்' },
    { id: 'kn', name: 'Kannada', native_name: 'ಕನ್ನಡ' },
    { id: 'ml', name: 'Malayalam', native_name: 'മലയാളം' },
    { id: 'mr', name: 'Marathi', native_name: 'मराठी' },
    { id: 'bn', name: 'Bengali', native_name: 'বাংলা' },
    { id: 'gu', name: 'Gujarati', native_name: 'ગુજરાતી' },
    { id: 'pa', name: 'Punjabi', native_name: 'ਪੰਜਾਬੀ' },
    { id: 'or', name: 'Odia', native_name: 'ଓଡ଼ିଆ' },
    { id: 'ur', name: 'Urdu', native_name: 'اردو' }
  ];

  const FALLBACK_OCCUPATIONS = [
    { id: 'occ-1', title: 'Student', category: 'Education' },
    { id: 'occ-2', title: 'Teacher', category: 'Education' },
    { id: 'occ-3', title: 'Doctor', category: 'Healthcare' },
    { id: 'occ-4', title: 'Healthcare Worker', category: 'Healthcare' },
    { id: 'occ-5', title: 'Farmer', category: 'Agriculture' },
    { id: 'occ-6', title: 'Engineer', category: 'Technology' },
    { id: 'occ-7', title: 'Government Employee', category: 'Public Administration' },
    { id: 'occ-8', title: 'Business Owner', category: 'Commerce' },
  ];

  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const [langData, stateData, occData] = await Promise.allSettled([
          masterDataApi.getLanguages(),
          masterDataApi.getStates(),
          masterDataApi.getOccupations(),
        ]);
        const langs = langData.status === 'fulfilled' ? (langData.value.results || langData.value) : [];
        setLanguages(Array.isArray(langs) && langs.length > 0 ? langs : FALLBACK_LANGUAGES);

        const sts = stateData.status === 'fulfilled' ? (stateData.value.results || stateData.value) : [];
        if (Array.isArray(sts) && sts.length > 0) {
          setStates(sts);
        } else {
          setStates(Object.keys(INDIAN_STATES_DISTRICTS).map(st => ({ id: st, name: st })));
        }

        const occs = occData.status === 'fulfilled' ? (occData.value.results || occData.value) : [];
        setOccupations(Array.isArray(occs) && occs.length > 0 ? occs : FALLBACK_OCCUPATIONS);
      } catch (err) {
        console.error('Failed to load master data:', err);
        setLanguages(FALLBACK_LANGUAGES);
        setStates(Object.keys(INDIAN_STATES_DISTRICTS).map(st => ({ id: st, name: st })));
        setOccupations(FALLBACK_OCCUPATIONS);
      }
    };
    loadMasterData();
  }, []);

  // Fetch recipients on filter/page change
  const fetchRecipients = async () => {
    setLoading(true);
    try {
      const params = { page };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (langFilter) params.language = langFilter;

      const data = await recipientsApi.getRecipients(params);
      setRecipients(data.results || data);
      setTotalCount(data.count || (data.results ? data.results.length : data.length));
    } catch (err) {
      console.error('Failed to fetch recipients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipients();
  }, [page, statusFilter, langFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRecipients();
  };

  // State change loads corresponding districts
  const handleStateChange = async (stateId) => {
    setFormData((prev) => ({ ...prev, state: stateId, district: '' }));
    if (stateId) {
      // Instant cascading from central India geography dataset
      const matchedState = states.find(s => s.id === stateId || s.name === stateId);
      const stateName = matchedState ? matchedState.name : stateId;
      const distList = getDistrictsForRegion(stateName || stateId);
      if (distList && distList.length > 0) {
        setDistricts(distList.map(d => ({ id: d, name: d })));
        return;
      }

      try {
        const distData = await masterDataApi.getDistricts({ state: stateId });
        const list = distData.results || distData;
        if (Array.isArray(list) && list.length > 0) {
          setDistricts(list);
        }
      } catch (e) {
        console.warn('API getDistricts fallback error', e);
      }
    } else {
      setDistricts([]);
    }
  };

  const handleOpenAddModal = () => {
    setEditingRecipient(null);
    const defaultState = states[0]?.id || '';
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      external_reference_id: '',
      preferred_language: languages[0]?.id || '',
      state: defaultState,
      district: '',
      city: '',
      occupation: occupations[0]?.id || '',
      gender: 'OTHER',
    });
    if (defaultState) {
      handleStateChange(defaultState);
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rec) => {
    setEditingRecipient(rec);
    setFormData({
      first_name: rec.first_name || '',
      last_name: rec.last_name || '',
      email: rec.email || '',
      phone: rec.phone || '',
      external_reference_id: rec.external_reference_id || '',
      preferred_language: rec.preferred_language || '',
      state: rec.state || '',
      district: rec.district || '',
      city: rec.city || '',
      occupation: rec.occupation || '',
      gender: rec.gender || 'OTHER',
    });
    if (rec.state) {
      masterDataApi.getDistricts({ state: rec.state }).then((d) => {
        setDistricts(d.results || d);
      });
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveRecipient = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      if (editingRecipient) {
        await recipientsApi.updateRecipient(editingRecipient.id, formData);
      } else {
        await recipientsApi.createRecipient(formData);
      }
      setIsModalOpen(false);
      fetchRecipients();
    } catch (err) {
      const errData = err.response?.data;
      if (typeof errData === 'object') {
        const msg = Object.entries(errData)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`)
          .join(' | ');
        setFormError(msg);
      } else {
        setFormError('Failed to save recipient. Check duplicate email/phone.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await recipientsApi.toggleStatus(id);
      fetchRecipients();
    } catch (e) {
      console.error('Failed to toggle status:', e);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this recipient record?')) {
      try {
        await recipientsApi.deleteRecipient(id);
        fetchRecipients();
      } catch (e) {
        console.error('Failed to delete recipient:', e);
      }
    }
  };

  const columns = [
    {
      header: 'Recipient Name',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-900">
            {row.first_name} {row.last_name}
          </span>
          {row.external_reference_id && (
            <p className="text-[11px] text-slate-400 font-mono">
              ID: {row.external_reference_id}
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Contact Info',
      render: (row) => (
        <div className="space-y-0.5 text-xs">
          {row.email && (
            <div className="flex items-center gap-1.5 text-slate-600">
              <Mail className="w-3 h-3 text-slate-400" />
              <span>{row.email}</span>
            </div>
          )}
          {row.phone && (
            <div className="flex items-center gap-1.5 text-slate-600">
              <Phone className="w-3 h-3 text-slate-400" />
              <span>{row.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Language',
      render: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
          {row.language_name || 'English'}
        </span>
      ),
    },
    {
      header: 'Location',
      render: (row) => (
        <span className="text-xs text-slate-600">
          {row.district_name ? `${row.district_name}, ` : ''}
          {row.state_name || 'India'}
        </span>
      ),
    },
    {
      header: 'Occupation',
      render: (row) => (
        <span className="text-xs text-slate-700 font-medium">
          {row.occupation_name || 'General'}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => handleToggleStatus(row.id)}
            title={row.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
            className={`p-1.5 rounded-lg border transition-colors ${
              row.status === 'ACTIVE'
                ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                : 'border-slate-200 text-slate-400 hover:bg-slate-50'
            }`}
          >
            {row.status === 'ACTIVE' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => handleOpenEditModal(row)}
            title="Edit Recipient"
            className="p-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            title="Delete Recipient"
            className="p-1.5 border border-slate-200 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Header
        title="Recipient Management"
        subtitle="Manage verified citizen profiles, locations, language preferences, and communication channels"
        actions={
          <div className="flex items-center gap-2">
            <Link
              to="/recipients/import"
              className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <Upload className="w-4 h-4 text-slate-500" />
              Import CSV/Excel
            </Link>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Recipient
            </button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, ID..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:bg-white"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-600"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="UNSUBSCRIBED">Unsubscribed</option>
          </select>

          <select
            value={langFilter}
            onChange={(e) => setLangFilter(e.target.value)}
            className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-600"
          >
            <option value="">All Languages</option>
            {languages.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>

          <button
            onClick={fetchRecipients}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"
            title="Refresh Table"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Recipient Data Table */}
      <DataTable
        columns={columns}
        data={recipients}
        loading={loading}
        emptyMessage="No recipients found matching your filter criteria."
        pagination={{
          page,
          total: totalCount,
          hasPrev: page > 1,
          hasNext: page * 10 < totalCount,
        }}
        onPageChange={(newPage) => setPage(newPage)}
      />

      {/* Add / Edit Recipient Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRecipient ? 'Edit Recipient Record' : 'Add New Recipient'}
      >
        <form onSubmit={handleSaveRecipient} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Last Name</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="citizen@example.gov.in"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98480 12345"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">External Ref ID</label>
              <input
                type="text"
                value={formData.external_reference_id}
                onChange={(e) => setFormData({ ...formData, external_reference_id: e.target.value })}
                placeholder="REC-XXXX-001"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Preferred Language *</label>
              <select
                value={formData.preferred_language}
                onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value })}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white"
              >
                <option value="">Select Language</option>
                {languages.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.native_name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">State *</label>
              <select
                value={formData.state}
                onChange={(e) => handleStateChange(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white"
              >
                <option value="">Select State</option>
                {states.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">District</label>
              <select
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white"
              >
                <option value="">Select District</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Occupation</label>
              <select
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white"
              >
                <option value="">Select Occupation</option>
                {occupations.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingRecipient ? 'Save Changes' : 'Create Recipient'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
