import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Mail,
  ShieldCheck,
  Building2,
  Globe,
  KeyRound,
  Check,
  AlertCircle,
  Save,
  Lock,
  RefreshCw,
  MapPin,
  Phone,
  Upload,
  Trash2,
  Bell,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/auth';
import { ALL_INDIAN_REGIONS } from '../../data/indiaGeography';

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'od', name: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'ur', name: 'Urdu', native: 'اردو' }
];

const ORGANIZATION_TYPES = [
  'Government Department',
  'Public Institution',
  'Healthcare Organization',
  'Educational Institution',
  'NGO',
  'Community Organization',
  'Private Organization',
  'Student Organization',
  'Other'
];

const CHANNELS = ['Email', 'SMS', 'WhatsApp', 'Push', 'Web'];

export const Profile = () => {
  const { user, updateUser } = useAuth();

  // Full Profile State
  const [profileData, setProfileData] = useState({
    id: user?.id || '',
    username: user?.username || '',
    email: user?.email || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    role: user?.role || 'CAMPAIGN_MANAGER',
    is_email_verified: user?.is_email_verified || false,

    // Profile Details
    display_name: user?.display_name || user?.profile?.display_name || '',
    phone: user?.phone || user?.profile?.phone || '',
    designation: user?.designation || user?.profile?.designation || '',
    bio: user?.bio || user?.profile?.bio || '',
    avatar: user?.avatar || user?.profile?.avatar || null,

    // Organization
    organization_name: user?.organization_name || user?.profile?.organization_name || user?.organization || '',
    organization_type: user?.organization_type || user?.profile?.organization_type || 'Government Department',
    department: user?.department || user?.profile?.department || '',
    role_title: user?.role_title || user?.profile?.role_title || '',

    // Location
    country: user?.country || user?.profile?.country || 'India',
    state: user?.state || user?.profile?.state || '',
    district: user?.district || user?.profile?.district || '',
    city: user?.city || user?.profile?.city || '',
    postal_code: user?.postal_code || user?.profile?.postal_code || '',

    // Preferences
    primary_language: user?.primary_language || user?.profile?.primary_language || user?.preferred_language || 'English',
    additional_languages: user?.additional_languages || user?.profile?.additional_languages || [],
    preferred_channels: user?.preferred_channels || user?.profile?.preferred_channels || ['Email', 'SMS'],

    // Notification Toggles
    notification_preferences: {
      campaign_updates: user?.communication_preferences?.campaign_updates ?? true,
      delivery_alerts: user?.communication_preferences?.delivery_alerts ?? true,
      ai_notifications: user?.communication_preferences?.ai_notifications ?? true,
      system_notifications: user?.communication_preferences?.system_notifications ?? true,
      marketing_announcements: user?.communication_preferences?.marketing_announcements ?? false
    }
  });

  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Fetch full latest profile from backend API
  useEffect(() => {
    const fetchLatestProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const data = await authApi.getProfile();
        setProfileData({
          id: data.id || '',
          username: data.username || '',
          email: data.email || '',
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          role: data.role || 'CAMPAIGN_MANAGER',
          is_email_verified: data.is_email_verified || false,

          display_name: data.display_name || data.profile?.display_name || '',
          phone: data.phone || data.profile?.phone || '',
          designation: data.designation || data.profile?.designation || '',
          bio: data.bio || data.profile?.bio || '',
          avatar: data.avatar || data.profile?.avatar || null,

          organization_name: data.organization_name || data.profile?.organization_name || '',
          organization_type: data.organization_type || data.profile?.organization_type || 'Government Department',
          department: data.department || data.profile?.department || '',
          role_title: data.role_title || data.profile?.role_title || '',

          country: data.country || data.profile?.country || 'India',
          state: data.state || data.profile?.state || '',
          district: data.district || data.profile?.district || '',
          city: data.city || data.profile?.city || '',
          postal_code: data.postal_code || data.profile?.postal_code || '',

          primary_language: data.primary_language || data.profile?.primary_language || data.preferred_language || 'English',
          additional_languages: data.additional_languages || data.profile?.additional_languages || [],
          preferred_channels: data.preferred_channels || data.profile?.preferred_channels || ['Email', 'SMS'],

          notification_preferences: {
            campaign_updates: data.communication_preferences?.campaign_updates ?? true,
            delivery_alerts: data.communication_preferences?.delivery_alerts ?? true,
            ai_notifications: data.communication_preferences?.ai_notifications ?? true,
            system_notifications: data.communication_preferences?.system_notifications ?? true,
            marketing_announcements: data.communication_preferences?.marketing_announcements ?? false
          }
        });

        if (data.avatar) {
          setAvatarPreview(data.avatar);
        }

        // Update local session user
        updateUser(data);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchLatestProfile();
  }, []);

  // Update districts when state changes
  useEffect(() => {
    if (profileData.state) {
      const region = ALL_INDIAN_REGIONS.find(
        (r) => r.name.toLowerCase() === profileData.state.toLowerCase()
      );
      if (region) {
        setAvailableDistricts(region.districts);
      } else {
        setAvailableDistricts([]);
      }
    } else {
      setAvailableDistricts([]);
    }
  }, [profileData.state]);

  // Handle Avatar Change
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setProfileError('Avatar image must be smaller than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarFile(file);
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setProfileData((prev) => ({ ...prev, avatar: null }));
  };

  // Submit Profile Changes
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSuccess('');
    setProfileError('');

    try {
      let updatePayload;
      if (avatarFile) {
        updatePayload = new FormData();
        updatePayload.append('first_name', profileData.first_name.trim());
        updatePayload.append('last_name', profileData.last_name.trim());
        updatePayload.append('display_name', profileData.display_name.trim());
        updatePayload.append('phone', profileData.phone.trim());
        updatePayload.append('designation', profileData.designation.trim());
        updatePayload.append('bio', profileData.bio.trim());
        updatePayload.append('organization_name', profileData.organization_name.trim());
        updatePayload.append('organization_type', profileData.organization_type);
        updatePayload.append('department', profileData.department.trim());
        updatePayload.append('role_title', profileData.role_title.trim());
        updatePayload.append('country', profileData.country);
        updatePayload.append('state', profileData.state);
        updatePayload.append('district', profileData.district);
        updatePayload.append('city', profileData.city.trim());
        updatePayload.append('postal_code', profileData.postal_code.trim());
        updatePayload.append('primary_language', profileData.primary_language);
        updatePayload.append('avatar', avatarFile);

        profileData.additional_languages.forEach((lang) => {
          updatePayload.append('additional_languages', lang);
        });
        profileData.preferred_channels.forEach((ch) => {
          updatePayload.append('preferred_channels', ch);
        });
        updatePayload.append('notification_preferences', JSON.stringify(profileData.notification_preferences));
      } else {
        updatePayload = {
          first_name: profileData.first_name.trim(),
          last_name: profileData.last_name.trim(),
          display_name: profileData.display_name.trim(),
          phone: profileData.phone.trim(),
          designation: profileData.designation.trim(),
          bio: profileData.bio.trim(),
          organization_name: profileData.organization_name.trim(),
          organization_type: profileData.organization_type,
          department: profileData.department.trim(),
          role_title: profileData.role_title.trim(),
          country: profileData.country,
          state: profileData.state,
          district: profileData.district,
          city: profileData.city.trim(),
          postal_code: profileData.postal_code.trim(),
          primary_language: profileData.primary_language,
          additional_languages: profileData.additional_languages,
          preferred_channels: profileData.preferred_channels,
          notification_preferences: profileData.notification_preferences
        };
      }

      const updated = await authApi.updateProfile(updatePayload);

      setProfileSuccess('Profile details saved successfully.');
      updateUser(updated);

      // Refresh form state
      setProfileData((prev) => ({
        ...prev,
        ...updated,
        display_name: updated.display_name || prev.display_name,
        primary_language: updated.primary_language || prev.primary_language
      }));

      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setProfileError(
        err.response?.data?.email?.[0] ||
        err.response?.data?.detail ||
        'Failed to save profile changes. Please try again.'
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Password Update
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    if (passwordForm.new_password.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    setIsChangingPassword(true);

    try {
      await authApi.changePassword({
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password,
      });
      setPasswordSuccess('Password successfully updated.');
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
      setTimeout(() => setPasswordSuccess(''), 4000);
    } catch (err) {
      console.error('Error changing password:', err);
      setPasswordError(
        err.response?.data?.old_password?.[0] ||
        err.response?.data?.new_password?.[0] ||
        err.response?.data?.detail ||
        'Password change failed. Please verify your current password.'
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const displayName = profileData.display_name || 
    (profileData.first_name ? `${profileData.first_name} ${profileData.last_name || ''}`.trim() : profileData.username);
  const initial = displayName.charAt(0).toUpperCase() || 'C';

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Page Header */}
      <div className="pb-3 border-b border-[#e2ebd9] flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#17301F] tracking-tight font-display">
            Creator Profile & Workspace Settings
          </h1>
          <p className="text-xs sm:text-sm text-[#557A60] mt-0.5">
            Manage your authenticated creator identity, organizational jurisdiction, languages, and security credentials.
          </p>
        </div>
      </div>

      {/* Top Profile Summary Card */}
      <div className="card-peaceful p-6 relative overflow-hidden bg-white shadow-glass border border-[#e2ebd9]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar representation */}
            <div className="relative">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={displayName}
                  className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#85AB8B] shadow-md"
                />
              ) : (
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#234A2D] via-[#1D3A25] to-[#17301F] text-emerald-300 flex items-center justify-center text-3xl font-bold font-display shadow-lg border border-[#85AB8B]/30 flex-shrink-0">
                  {initial}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-[#17301F] font-display">
                  {displayName}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active Creator
                </span>
                {profileData.is_email_verified && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-[#557A60] mt-0.5">
                @{profileData.username} &bull; {profileData.email} {profileData.phone ? `&bull; ${profileData.phone}` : ''}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-[#557A60] flex-wrap">
                <span className="flex items-center gap-1 font-semibold text-[#17301F]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Role: {profileData.role}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-[#7FA68A]" />
                  {profileData.organization_name || 'Individual Creator'}
                </span>
                {profileData.state && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#7FA68A]" />
                      {profileData.district ? `${profileData.district}, ` : ''}{profileData.state}
                    </span>
                  </>
                )}
                <span>•</span>
                <span className="flex items-center gap-1 text-[#336443] font-semibold">
                  <Globe className="w-3.5 h-3.5" />
                  Primary: {profileData.primary_language}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Profile Details & Preferences Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            {/* Notifications / Alerts */}
            {profileSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in shadow-xs">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-fade-in shadow-xs">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            {/* 1. Personal & Contact Details */}
            <div className="card-peaceful p-6 space-y-4 bg-white border border-[#e2ebd9]">
              <div className="flex items-center justify-between border-b border-[#e2ebd9] pb-3">
                <h3 className="text-sm font-bold text-[#17301F] font-display flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-[#336443]" />
                  1. Personal & Creator Identity
                </h3>
                <span className="text-[11px] text-[#557A60]">Author Identity</span>
              </div>

              {/* Photo Upload in Profile */}
              <div className="p-3.5 bg-[#f5f8f3] rounded-xl border border-[#e2ebd9] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-12 h-12 rounded-xl object-cover border border-[#85AB8B]" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[#17301F] text-emerald-300 flex items-center justify-center font-bold text-base">
                      {initial}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold text-[#17301F]">Profile Photo</p>
                    <p className="text-[10px] text-[#557A60]">Update avatar or department logo</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-white border border-[#d2ded0] hover:border-[#85AB8B] text-xs font-semibold text-[#17301F] shadow-xs transition-all">
                    <Upload className="w-3.5 h-3.5 inline mr-1 text-[#336443]" />
                    <span>Upload</span>
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="px-2.5 py-1.5 rounded-lg text-rose-700 bg-rose-50 border border-rose-200 text-xs font-semibold hover:bg-rose-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#17301F] uppercase tracking-wider">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={profileData.first_name}
                    onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2ded0] bg-white text-xs sm:text-sm text-[#17301F] focus:ring-2 focus:ring-[#336443]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#17301F] uppercase tracking-wider">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={profileData.last_name}
                    onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2ded0] bg-white text-xs sm:text-sm text-[#17301F] focus:ring-2 focus:ring-[#336443]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#17301F] uppercase tracking-wider">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={profileData.display_name}
                    onChange={(e) => setProfileData({ ...profileData, display_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2ded0] bg-white text-xs sm:text-sm text-[#17301F] focus:ring-2 focus:ring-[#336443]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#17301F] uppercase tracking-wider">
                    Contact Phone
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-[#d2ded0] bg-white text-xs sm:text-sm text-[#17301F] focus:ring-2 focus:ring-[#336443]"
                    />
                    <Phone className="w-4 h-4 text-[#7FA68A] absolute left-3 top-3" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#17301F] uppercase tracking-wider">
                    Email Address (Read-only)
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-[#e2ebd9] bg-[#f5f8f3] text-xs sm:text-sm text-[#557A60] cursor-not-allowed"
                    />
                    <Mail className="w-4 h-4 text-[#7FA68A] absolute left-3 top-3" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#17301F] uppercase tracking-wider">
                    Platform Role (Read-only)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={profileData.role}
                      disabled
                      className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-[#e2ebd9] bg-[#f5f8f3] text-xs sm:text-sm text-[#557A60] cursor-not-allowed font-semibold"
                    />
                    <ShieldCheck className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-semibold text-[#17301F] uppercase tracking-wider">
                    Bio / Creator Profile
                  </label>
                  <textarea
                    rows={2}
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    placeholder="Short summary of communication responsibilities..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2ded0] bg-white text-xs sm:text-sm text-[#17301F] focus:ring-2 focus:ring-[#336443]"
                  />
                </div>
              </div>
            </div>

            {/* 2. Organization Details */}
            <div className="card-peaceful p-6 space-y-4 bg-white border border-[#e2ebd9]">
              <div className="flex items-center justify-between border-b border-[#e2ebd9] pb-3">
                <h3 className="text-sm font-bold text-[#17301F] font-display flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#336443]" />
                  2. Organization & Department
                </h3>
                <span className="text-[11px] text-[#557A60]">Institutional Metadata</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#17301F] uppercase tracking-wider">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={profileData.organization_name}
                    onChange={(e) => setProfileData({ ...profileData, organization_name: e.target.value })}
                    placeholder="e.g. District Health Office"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2ded0] bg-white text-xs sm:text-sm text-[#17301F] focus:ring-2 focus:ring-[#336443]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#17301F] uppercase tracking-wider">
                    Organization Type
                  </label>
                  <select
                    value={profileData.organization_type}
                    onChange={(e) => setProfileData({ ...profileData, organization_type: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2ded0] bg-white text-xs sm:text-sm text-[#17301F] focus:ring-2 focus:ring-[#336443]"
                  >
                    {ORGANIZATION_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#17301F] uppercase tracking-wider">
                    Department / Division
                  </label>
                  <input
                    type="text"
                    value={profileData.department}
                    onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                    placeholder="e.g. Public Health"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2ded0] bg-white text-xs sm:text-sm text-[#17301F] focus:ring-2 focus:ring-[#336443]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#17301F] uppercase tracking-wider">
                    Designation / Title
                  </label>
                  <input
                    type="text"
                    value={profileData.designation}
                    onChange={(e) => setProfileData({ ...profileData, designation: e.target.value })}
                    placeholder="e.g. Communication Coordinator"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2ded0] bg-white text-xs sm:text-sm text-[#17301F] focus:ring-2 focus:ring-[#336443]"
                  />
                </div>
              </div>
            </div>

            {/* 3. Regional Geography (Cascading) */}
            <div className="card-peaceful p-6 space-y-4 bg-white border border-[#e2ebd9]">
              <div className="flex items-center justify-between border-b border-[#e2ebd9] pb-3">
                <h3 className="text-sm font-bold text-[#17301F] font-display flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#336443]" />
                  3. Regional Jurisdiction (Cascading India Geography)
                </h3>
                <span className="text-[11px] text-[#557A60]">36 States & UTs</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#17301F] uppercase tracking-wider">
                    State / Union Territory
                  </label>
                  <select
                    value={profileData.state}
                    onChange={(e) => setProfileData({ ...profileData, state: e.target.value, district: '' })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2ded0] bg-white text-xs sm:text-sm text-[#17301F] focus:ring-2 focus:ring-[#336443]"
                  >
                    <option value="">-- Select State / UT --</option>
                    {ALL_INDIAN_REGIONS.map((region) => (
                      <option key={region.id} value={region.name}>
                        {region.name} ({region.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#17301F] uppercase tracking-wider">
                    District
                  </label>
                  <select
                    value={profileData.district}
                    disabled={!profileData.state}
                    onChange={(e) => setProfileData({ ...profileData, district: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2ded0] bg-white text-xs sm:text-sm text-[#17301F] focus:ring-2 focus:ring-[#336443] disabled:bg-[#f5f8f3]"
                  >
                    <option value="">-- Select District --</option>
                    {availableDistricts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#17301F] uppercase tracking-wider">
                    City / Town
                  </label>
                  <input
                    type="text"
                    value={profileData.city}
                    onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                    placeholder="e.g. Visakhapatnam"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2ded0] bg-white text-xs sm:text-sm text-[#17301F] focus:ring-2 focus:ring-[#336443]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#17301F] uppercase tracking-wider">
                    Postal Code / PIN
                  </label>
                  <input
                    type="text"
                    value={profileData.postal_code}
                    onChange={(e) => setProfileData({ ...profileData, postal_code: e.target.value })}
                    placeholder="e.g. 530001"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2ded0] bg-white text-xs sm:text-sm text-[#17301F] focus:ring-2 focus:ring-[#336443]"
                  />
                </div>
              </div>
            </div>

            {/* 4. Languages & Channels */}
            <div className="card-peaceful p-6 space-y-4 bg-white border border-[#e2ebd9]">
              <div className="flex items-center justify-between border-b border-[#e2ebd9] pb-3">
                <h3 className="text-sm font-bold text-[#17301F] font-display flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#336443]" />
                  4. Languages & Delivery Channels
                </h3>
                <span className="text-[11px] text-[#557A60]">AI Studio Defaults</span>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#17301F] uppercase tracking-wider">
                    Primary Target Language
                  </label>
                  <select
                    value={profileData.primary_language}
                    onChange={(e) => setProfileData({ ...profileData, primary_language: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2ded0] bg-white text-xs sm:text-sm text-[#17301F] focus:ring-2 focus:ring-[#336443]"
                  >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.name}>
                        {lang.name} ({lang.native})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-[#557A60]">
                    AI Content Studio automatically selects this language when crafting awareness messages.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#17301F] uppercase tracking-wider">
                    Additional Languages
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SUPPORTED_LANGUAGES.filter((l) => l.name !== profileData.primary_language).map((l) => {
                      const isSelected = profileData.additional_languages.includes(l.name);
                      return (
                        <button
                          key={l.code}
                          type="button"
                          onClick={() => {
                            setProfileData((prev) => ({
                              ...prev,
                              additional_languages: isSelected
                                ? prev.additional_languages.filter((x) => x !== l.name)
                                : [...prev.additional_languages, l.name]
                            }));
                          }}
                          className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                              : 'bg-white border-[#d2ded0] text-[#557A60]'
                          }`}
                        >
                          {l.name} {isSelected && <Check className="w-3 h-3 inline ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#e2ebd9]">
                  <label className="block text-xs font-semibold text-[#17301F] uppercase tracking-wider">
                    Preferred Communication Channels
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {CHANNELS.map((ch) => {
                      const isChecked = profileData.preferred_channels.includes(ch);
                      return (
                        <label key={ch} className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#17301F]">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setProfileData((prev) => ({
                                ...prev,
                                preferred_channels: isChecked
                                  ? prev.preferred_channels.filter((c) => c !== ch)
                                  : [...prev.preferred_channels, ch]
                              }));
                            }}
                            className="rounded border-[#d2ded0] text-[#336443] focus:ring-[#336443]"
                          />
                          <span>{ch}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Notification Toggles */}
            <div className="card-peaceful p-6 space-y-4 bg-white border border-[#e2ebd9]">
              <div className="flex items-center justify-between border-b border-[#e2ebd9] pb-3">
                <h3 className="text-sm font-bold text-[#17301F] font-display flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#336443]" />
                  5. Platform Notification Preferences
                </h3>
                <span className="text-[11px] text-[#557A60]">Alert Channels</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'campaign_updates', title: 'Campaign Updates', desc: 'Alerts when campaigns change status or finish dispatch' },
                  { key: 'delivery_alerts', title: 'Delivery Tracking Alerts', desc: 'Real-time notifications on failed or retried messages' },
                  { key: 'ai_notifications', title: 'AI Studio Updates', desc: 'Updates regarding IndicTrans2 models & content generations' },
                  { key: 'system_notifications', title: 'System Health Warnings', desc: 'Platform maintenance and service availability alerts' }
                ].map((item) => {
                  const isEnabled = profileData.notification_preferences[item.key];
                  return (
                    <div
                      key={item.key}
                      onClick={() => {
                        setProfileData((prev) => ({
                          ...prev,
                          notification_preferences: {
                            ...prev.notification_preferences,
                            [item.key]: !prev.notification_preferences[item.key]
                          }
                        }));
                      }}
                      className="p-3 rounded-xl bg-white border border-[#e2ebd9] flex items-center justify-between cursor-pointer hover:border-[#85AB8B] transition-all"
                    >
                      <div className="pr-2">
                        <p className="text-xs font-bold text-[#17301F]">{item.title}</p>
                        <p className="text-[10px] text-[#557A60] leading-tight mt-0.5">{item.desc}</p>
                      </div>
                      <div
                        className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 ${
                          isEnabled ? 'bg-[#336443]' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                            isEnabled ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Save Profile Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="px-6 py-2.5 rounded-xl bg-[#336443] hover:bg-[#234A2D] text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSavingProfile ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Security Credentials & Account Status (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Change Password Card */}
          <div className="card-peaceful p-6 space-y-4 bg-white border border-[#e2ebd9]">
            <div className="flex items-center justify-between border-b border-[#e2ebd9] pb-3">
              <h3 className="text-sm font-bold text-[#17301F] font-display flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#336443]" />
                Security Credentials
              </h3>
              <span className="text-[11px] text-[#557A60]">Password Update</span>
            </div>

            {passwordSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#17301F] uppercase tracking-wider">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={passwordForm.old_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                    placeholder="Enter current password"
                    className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-[#d2ded0] bg-white text-xs sm:text-sm text-[#17301F] focus:ring-2 focus:ring-[#336443] shadow-sm"
                  />
                  <Lock className="w-4 h-4 text-[#7FA68A] absolute left-3 top-3" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#17301F] uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                    placeholder="At least 8 characters"
                    className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-[#d2ded0] bg-white text-xs sm:text-sm text-[#17301F] focus:ring-2 focus:ring-[#336443] shadow-sm"
                  />
                  <Lock className="w-4 h-4 text-[#7FA68A] absolute left-3 top-3" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#17301F] uppercase tracking-wider">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={passwordForm.confirm_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                    placeholder="Re-type new password"
                    className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-[#d2ded0] bg-white text-xs sm:text-sm text-[#17301F] focus:ring-2 focus:ring-[#336443] shadow-sm"
                  />
                  <Lock className="w-4 h-4 text-[#7FA68A] absolute left-3 top-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[#17301F] hover:bg-[#234A2D] text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isChangingPassword ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Account Security & Identity Card */}
          <div className="card-peaceful p-6 space-y-3 bg-[#f5f8f3] border border-[#e2ebd9]">
            <h4 className="text-xs font-bold text-[#17301F] uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#336443]" />
              Account Verification Status
            </h4>
            <div className="space-y-2 text-xs text-[#557A60]">
              <div className="flex items-center justify-between py-1 border-b border-[#e2ebd9]">
                <span>Authentication Method:</span>
                <span className="font-semibold text-[#17301F] capitalize">{profileData.auth_provider || 'Local JWT'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#e2ebd9]">
                <span>Email Verification:</span>
                <span className={`font-bold ${profileData.is_email_verified ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {profileData.is_email_verified ? 'Verified' : 'Pending / Development Mode'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>Account ID:</span>
                <span className="font-mono text-[10px] text-[#7FA68A] truncate max-w-[150px]">{profileData.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
