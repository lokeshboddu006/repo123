import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Phone,
  Building2,
  MapPin,
  Globe,
  Bell,
  Check,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Upload,
  Trash2,
  Radio,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  FileText,
  Layers,
  Send,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';
import { ALL_INDIAN_REGIONS } from '../data/indiaGeography';

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

const CHANNELS = [
  { id: 'Email', name: 'Email', desc: 'Campaign newsletters & reports' },
  { id: 'SMS', name: 'SMS', desc: 'Urgent mobile broadcast alerts' },
  { id: 'WhatsApp', name: 'WhatsApp', desc: 'Interactive citizen messages' },
  { id: 'Push', name: 'Push Notifications', desc: 'Web and mobile notifications' },
  { id: 'Web', name: 'Web Portal', desc: 'Public communication board' }
];

export const Signup = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  // Wizard Step State (1 to 6)
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Account
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',

    // Step 2: Profile
    display_name: '',
    designation: '',
    bio: '',
    avatarFile: null,
    avatarPreview: null,

    // Step 3: Organization
    organization_name: '',
    organization_type: 'Government Department',
    department: '',
    role_title: 'Communication Coordinator',

    // Step 4: Location
    country: 'India',
    state: '',
    district: '',
    city: '',
    postal_code: '',

    // Step 5: Communication Preferences
    primary_language: 'English',
    additional_languages: [],
    preferred_channels: ['Email', 'SMS'],
    notification_preferences: {
      campaign_updates: true,
      delivery_alerts: true,
      ai_notifications: true,
      system_notifications: true,
      marketing_announcements: false
    }
  });

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState('');
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(null);

  // Cascading districts list based on selected state
  const [availableDistricts, setAvailableDistricts] = useState([]);

  // Auto-suggest display name from full name if not manually modified
  const handleFullNameChange = (val) => {
    setFormData((prev) => {
      const parts = val.trim().split(' ');
      const suggested = parts[0] || '';
      return {
        ...prev,
        full_name: val,
        display_name: prev.display_name === '' || prev.display_name === prev.full_name.split(' ')[0] ? suggested : prev.display_name
      };
    });
    if (errors.full_name) {
      setErrors((prev) => ({ ...prev, full_name: '' }));
    }
  };

  // State selection updates cascading districts
  useEffect(() => {
    if (formData.state) {
      const region = ALL_INDIAN_REGIONS.find(
        (r) => r.name.toLowerCase() === formData.state.toLowerCase()
      );
      if (region) {
        setAvailableDistricts(region.districts);
        // If current district doesn't belong to the newly selected state, clear district
        if (formData.district && !region.districts.includes(formData.district)) {
          setFormData((prev) => ({ ...prev, district: '' }));
        }
      } else {
        setAvailableDistricts([]);
      }
    } else {
      setAvailableDistricts([]);
    }
  }, [formData.state]);

  // Debounced email check
  useEffect(() => {
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setEmailAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setEmailCheckLoading(true);
      try {
        const res = await authApi.checkEmail(formData.email);
        setEmailAvailable(res.available);
        if (!res.available) {
          setErrors((prev) => ({ ...prev, email: 'An account with this email address already exists.' }));
        } else {
          setErrors((prev) => {
            const next = { ...prev };
            delete next.email;
            return next;
          });
        }
      } catch (err) {
        console.error('Email check error:', err);
      } finally {
        setEmailCheckLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.email]);

  // Password Strength Calculation
  const calculatePasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: 'None', color: 'bg-gray-200', text: 'text-gray-400' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/\d/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500', text: 'text-rose-600' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-600' };
    if (score === 3 || score === 4) return { score: 3, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-600' };
    return { score: 4, label: 'Very Strong', color: 'bg-teal-600', text: 'text-teal-700' };
  };

  const passwordStrength = calculatePasswordStrength(formData.password);

  // Avatar Upload Handler
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, avatar: 'Avatar image must be smaller than 5MB.' }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          avatarFile: file,
          avatarPreview: reader.result
        }));
        setErrors((prev) => {
          const next = { ...prev };
          delete next.avatar;
          return next;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setFormData((prev) => ({
      ...prev,
      avatarFile: null,
      avatarPreview: null
    }));
  };

  // Step Validation
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.full_name.trim() || formData.full_name.trim().length < 2) {
        newErrors.full_name = 'Please enter your full name (at least 2 characters).';
      }
      if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Enter a valid email address.';
      } else if (emailAvailable === false) {
        newErrors.email = 'An account with this email address already exists.';
      }
      if (!formData.password) {
        newErrors.password = 'Password is required.';
      } else {
        if (formData.password.length < 8) {
          newErrors.password = 'Password must be at least 8 characters long.';
        } else if (!/[A-Z]/.test(formData.password)) {
          newErrors.password = 'Include at least one uppercase letter.';
        } else if (!/[a-z]/.test(formData.password)) {
          newErrors.password = 'Include at least one lowercase letter.';
        } else if (!/\d/.test(formData.password)) {
          newErrors.password = 'Include at least one number.';
        }
      }
      if (formData.password !== formData.confirm_password) {
        newErrors.confirm_password = 'Passwords do not match.';
      }
      if (formData.phone) {
        const cleaned = formData.phone.replace(/[\s\-\(\)]/g, '');
        if (!/^\+?[0-9]{7,15}$/.test(cleaned)) {
          newErrors.phone = 'Enter a valid phone number.';
        }
      }
    }

    if (step === 2) {
      if (!formData.display_name.trim()) {
        newErrors.display_name = 'Display name is required.';
      }
      if (!formData.designation.trim()) {
        newErrors.designation = 'Please specify your official designation or job title.';
      }
    }

    if (step === 3) {
      if (!formData.organization_name.trim()) {
        newErrors.organization_name = 'Organization name is required.';
      }
      if (!formData.organization_type) {
        newErrors.organization_type = 'Please select an organization type.';
      }
    }

    if (step === 4) {
      if (!formData.state) {
        newErrors.state = 'Please select a State or Union Territory.';
      }
      if (!formData.district) {
        newErrors.district = 'Please select a District.';
      }
    }

    if (step === 5) {
      if (!formData.primary_language) {
        newErrors.primary_language = 'Please select your primary communication language.';
      }
      if (!formData.preferred_channels || formData.preferred_channels.length === 0) {
        newErrors.preferred_channels = 'Select at least one preferred communication channel.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setServerError('');
      setCurrentStep((prev) => Math.min(prev + 1, 6));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setServerError('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleJumpToStep = (stepNumber) => {
    setCurrentStep(stepNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit Final Registration
  const handleSubmitRegistration = async () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4) || !validateStep(5)) {
      setServerError('Please review and complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    setServerError('');

    try {
      // Build form payload (using FormData if avatar file is present, or JSON)
      let payload;
      if (formData.avatarFile) {
        payload = new FormData();
        payload.append('full_name', formData.full_name.trim());
        payload.append('email', formData.email.trim().toLowerCase());
        payload.append('password', formData.password);
        payload.append('confirm_password', formData.confirm_password);
        payload.append('phone', formData.phone.trim());
        payload.append('display_name', formData.display_name.trim());
        payload.append('designation', formData.designation.trim());
        payload.append('bio', formData.bio.trim());
        payload.append('avatar', formData.avatarFile);
        payload.append('organization_name', formData.organization_name.trim());
        payload.append('organization_type', formData.organization_type);
        payload.append('department', formData.department.trim());
        payload.append('role_title', formData.role_title.trim());
        payload.append('country', formData.country);
        payload.append('state', formData.state);
        payload.append('district', formData.district);
        payload.append('city', formData.city.trim());
        payload.append('postal_code', formData.postal_code.trim());
        payload.append('primary_language', formData.primary_language);

        formData.additional_languages.forEach((lang) => {
          payload.append('additional_languages', lang);
        });
        formData.preferred_channels.forEach((ch) => {
          payload.append('preferred_channels', ch);
        });
        payload.append('notification_preferences', JSON.stringify(formData.notification_preferences));
      } else {
        payload = {
          full_name: formData.full_name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          confirm_password: formData.confirm_password,
          phone: formData.phone.trim(),
          display_name: formData.display_name.trim(),
          designation: formData.designation.trim(),
          bio: formData.bio.trim(),
          organization_name: formData.organization_name.trim(),
          organization_type: formData.organization_type,
          department: formData.department.trim(),
          role_title: formData.role_title.trim(),
          country: formData.country,
          state: formData.state,
          district: formData.district,
          city: formData.city.trim(),
          postal_code: formData.postal_code.trim(),
          primary_language: formData.primary_language,
          additional_languages: formData.additional_languages,
          preferred_channels: formData.preferred_channels,
          notification_preferences: formData.notification_preferences
        };
      }

      await register(payload);
      setIsSuccess(true);

      // Auto redirect to dashboard after 2.5 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2200);
    } catch (err) {
      console.error('Registration failed:', err);
      const data = err.response?.data;
      let msg = 'Registration failed. Please check your information and try again.';
      if (typeof data === 'object' && data !== null) {
        if (data.email) msg = Array.isArray(data.email) ? data.email[0] : data.email;
        else if (data.password) msg = Array.isArray(data.password) ? data.password[0] : data.password;
        else if (data.confirm_password) msg = Array.isArray(data.confirm_password) ? data.confirm_password[0] : data.confirm_password;
        else if (data.detail) msg = data.detail;
        else if (data.non_field_errors) msg = data.non_field_errors[0];
      }
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsMeta = [
    { num: 1, title: 'Account', desc: 'Credentials & Login' },
    { num: 2, title: 'Profile', desc: 'Identity & Designation' },
    { num: 3, title: 'Organization', desc: 'Institution & Role' },
    { num: 4, title: 'Location', desc: 'Jurisdiction & Geography' },
    { num: 5, title: 'Preferences', desc: 'Languages & Channels' },
    { num: 6, title: 'Review', desc: 'Final Verification' }
  ];

  return (
    <div className="min-h-screen bg-[#f8faf7] text-[#1f2a1d] flex flex-col relative overflow-x-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#85AB8B]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-[#336443]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="border-b border-[#e4ebe1] bg-white/80 backdrop-blur-md sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1f2a1d] to-[#336443] flex items-center justify-center text-white shadow-md shadow-[#1f2a1d]/15">
            <Radio className="w-5 h-5 text-[#85AB8B]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-base text-[#1f2a1d] tracking-tight">
                GovComm AI
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#85AB8B]/20 text-[#234A2D] border border-[#85AB8B]/30">
                Creator Onboarding
              </span>
            </div>
            <p className="text-[11px] text-[#557A60] hidden sm:block">
              Multilingual Public Communication & Awareness Platform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[#557A60] hidden sm:inline">Already registered?</span>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-xs font-semibold px-3.5 py-1.5 rounded-lg border border-[#d2ded0] text-[#1f2a1d] hover:bg-white hover:border-[#85AB8B] transition-all"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        {/* Success Modal / State */}
        {isSuccess ? (
          <div className="card-peaceful p-8 sm:p-12 text-center max-w-lg mx-auto shadow-glass animate-fade-in border border-[#85AB8B]/40 bg-white">
            <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-600 mx-auto mb-6 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold font-display text-[#17301F] tracking-tight mb-2">
              Your communication workspace is ready.
            </h2>
            <p className="text-sm text-[#557A60] mb-6 leading-relaxed">
              Welcome, <span className="font-semibold text-[#17301F]">{formData.display_name || formData.full_name}</span>!
              Your creator profile has been initialized with <span className="font-semibold text-[#336443]">{formData.primary_language}</span> as your AI workspace language.
            </p>
            <div className="p-3.5 rounded-xl bg-[#f5f8f3] border border-[#e2ebd9] text-xs text-[#4b5b47] flex items-center justify-center gap-2 mb-6">
              <div className="w-3.5 h-3.5 border-2 border-[#336443] border-t-transparent rounded-full animate-spin" />
              <span>Redirecting to your campaign dashboard...</span>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2.5 rounded-xl bg-[#1f2a1d] text-white text-xs font-bold shadow-md hover:bg-[#2a3827] transition-all"
            >
              Go to Dashboard Now
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Step Progress Tracker */}
            <div className="card-peaceful p-4 sm:p-5 border border-[#e4ebe1]/90 bg-white/90 shadow-glass">
              {/* Top Progress info */}
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-semibold text-[#17301F]">
                  Step {currentStep} of 6:{' '}
                  <span className="text-[#336443] font-bold">
                    {stepsMeta[currentStep - 1].title}
                  </span>
                </span>
                <span className="text-[#557A60] font-mono text-[11px]">
                  {Math.round((currentStep / 6) * 100)}% Complete
                </span>
              </div>

              {/* Progress bar line */}
              <div className="w-full h-2 rounded-full bg-[#e8efe5] overflow-hidden mb-4">
                <div
                  className="h-full bg-gradient-to-r from-[#336443] to-[#85AB8B] transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${(currentStep / 6) * 100}%` }}
                />
              </div>

              {/* Step Pills */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {stepsMeta.map((s) => {
                  const isCurrent = s.num === currentStep;
                  const isCompleted = s.num < currentStep;
                  return (
                    <button
                      key={s.num}
                      type="button"
                      disabled={s.num > currentStep}
                      onClick={() => handleJumpToStep(s.num)}
                      className={`text-left p-2 rounded-lg transition-all text-xs flex items-center gap-2 ${
                        isCurrent
                          ? 'bg-[#336443] text-white font-bold shadow-sm'
                          : isCompleted
                          ? 'bg-emerald-50 text-[#17301F] hover:bg-emerald-100/60 border border-emerald-200'
                          : 'bg-[#f5f8f3] text-[#7FA68A] cursor-not-allowed opacity-75'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                          isCurrent
                            ? 'bg-white text-[#336443]'
                            : isCompleted
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#e2ebd9] text-[#557A60]'
                        }`}
                      >
                        {isCompleted ? <Check className="w-3 h-3" /> : s.num}
                      </span>
                      <span className="truncate hidden sm:inline text-[11px]">
                        {s.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Global Error Banner */}
            {serverError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-fade-in shadow-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" />
                <div>
                  <p className="font-semibold">Registration notice</p>
                  <p className="mt-0.5">{serverError}</p>
                </div>
              </div>
            )}

            {/* Step Form Card */}
            <div className="card-peaceful p-6 sm:p-8 bg-white border border-[#e4ebe1] shadow-glass rounded-2xl relative">
              {/* STEP 1: ACCOUNT */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="border-b border-[#e2ebd9] pb-3">
                    <h2 className="text-lg font-bold text-[#17301F] font-display flex items-center gap-2">
                      <User className="w-5 h-5 text-[#336443]" />
                      Step 1: Account Credentials
                    </h2>
                    <p className="text-xs text-[#557A60] mt-0.5">
                      Create your secure login identity for the multilingual communication platform.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="block text-xs font-bold text-[#17301F] uppercase tracking-wider">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => handleFullNameChange(e.target.value)}
                        placeholder="e.g. Lokesh Boddu"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-[#17301F] focus:outline-none focus:ring-2 focus:ring-[#336443] transition-all ${
                          errors.full_name ? 'border-rose-300 bg-rose-50/30' : 'border-[#d2ded0] bg-white'
                        }`}
                      />
                      {errors.full_name && (
                        <p className="text-[11px] text-rose-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.full_name}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-[#17301F] uppercase tracking-wider">
                          Official Email Address <span className="text-rose-500">*</span>
                        </label>
                        {emailCheckLoading && (
                          <span className="text-[10px] text-[#557A60] animate-pulse">Checking availability...</span>
                        )}
                        {emailAvailable === true && (
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Available
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="e.g. lokesh@govcomm.ai"
                          className={`w-full px-3.5 py-2.5 pl-9 rounded-xl border text-xs sm:text-sm text-[#17301F] focus:outline-none focus:ring-2 focus:ring-[#336443] transition-all ${
                            errors.email ? 'border-rose-300 bg-rose-50/30' : 'border-[#d2ded0] bg-white'
                          }`}
                        />
                        <Mail className="w-4 h-4 text-[#7FA68A] absolute left-3 top-3 pointer-events-none" />
                      </div>
                      {errors.email && (
                        <p className="text-[11px] text-rose-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#17301F] uppercase tracking-wider">
                        Contact Phone <span className="text-[#7FA68A] font-normal text-[11px]">(Optional)</span>
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className={`w-full px-3.5 py-2.5 pl-9 rounded-xl border text-xs sm:text-sm text-[#17301F] focus:outline-none focus:ring-2 focus:ring-[#336443] transition-all ${
                            errors.phone ? 'border-rose-300 bg-rose-50/30' : 'border-[#d2ded0] bg-white'
                          }`}
                        />
                        <Phone className="w-4 h-4 text-[#7FA68A] absolute left-3 top-3 pointer-events-none" />
                      </div>
                      {errors.phone ? (
                        <p className="text-[11px] text-rose-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.phone}
                        </p>
                      ) : (
                        <p className="text-[10px] text-[#557A60]">Used for critical alerts & 2FA notifications</p>
                      )}
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#17301F] uppercase tracking-wider">
                        Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="At least 8 characters"
                          className={`w-full px-3.5 py-2.5 pl-9 pr-10 rounded-xl border text-xs sm:text-sm text-[#17301F] focus:outline-none focus:ring-2 focus:ring-[#336443] transition-all ${
                            errors.password ? 'border-rose-300 bg-rose-50/30' : 'border-[#d2ded0] bg-white'
                          }`}
                        />
                        <Lock className="w-4 h-4 text-[#7FA68A] absolute left-3 top-3 pointer-events-none" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-[#7FA68A] hover:text-[#17301F] transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-[11px] text-rose-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.password}
                        </p>
                      )}

                      {/* Password strength feedback */}
                      {formData.password && (
                        <div className="pt-1.5 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-[#557A60]">Password Strength:</span>
                            <span className={`font-bold ${passwordStrength.text}`}>
                              {passwordStrength.label}
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-1 h-1.5">
                            {[1, 2, 3, 4].map((level) => (
                              <div
                                key={level}
                                className={`rounded-full transition-all ${
                                  passwordStrength.score >= level ? passwordStrength.color : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#17301F] uppercase tracking-wider">
                        Confirm Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirm_password}
                          onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                          placeholder="Re-type your password"
                          className={`w-full px-3.5 py-2.5 pl-9 pr-10 rounded-xl border text-xs sm:text-sm text-[#17301F] focus:outline-none focus:ring-2 focus:ring-[#336443] transition-all ${
                            errors.confirm_password ? 'border-rose-300 bg-rose-50/30' : 'border-[#d2ded0] bg-white'
                          }`}
                        />
                        <Lock className="w-4 h-4 text-[#7FA68A] absolute left-3 top-3 pointer-events-none" />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-3 text-[#7FA68A] hover:text-[#17301F] transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.confirm_password && (
                        <p className="text-[11px] text-rose-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.confirm_password}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Password requirements reminder */}
                  <div className="p-3 bg-[#f5f8f3] rounded-xl border border-[#e2ebd9] text-[11px] text-[#557A60] grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <span className={`flex items-center gap-1 ${formData.password.length >= 8 ? 'text-emerald-700 font-bold' : ''}`}>
                      <Check className="w-3 h-3" /> At least 8 chars
                    </span>
                    <span className={`flex items-center gap-1 ${/[A-Z]/.test(formData.password) ? 'text-emerald-700 font-bold' : ''}`}>
                      <Check className="w-3 h-3" /> 1 Uppercase letter
                    </span>
                    <span className={`flex items-center gap-1 ${/[a-z]/.test(formData.password) ? 'text-emerald-700 font-bold' : ''}`}>
                      <Check className="w-3 h-3" /> 1 Lowercase letter
                    </span>
                    <span className={`flex items-center gap-1 ${/\d/.test(formData.password) ? 'text-emerald-700 font-bold' : ''}`}>
                      <Check className="w-3 h-3" /> 1 Number
                    </span>
                  </div>
                </div>
              )}

              {/* STEP 2: PROFILE */}
              {currentStep === 2 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="border-b border-[#e2ebd9] pb-3">
                    <h2 className="text-lg font-bold text-[#17301F] font-display flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#336443]" />
                      Step 2: Creator Profile
                    </h2>
                    <p className="text-xs text-[#557A60] mt-0.5">
                      Identify yourself as a communication coordinator and awareness author.
                    </p>
                  </div>

                  {/* Profile Photo Upload */}
                  <div className="p-4 rounded-xl bg-[#f5f8f3] border border-[#e2ebd9] flex flex-col sm:flex-row items-center gap-5">
                    <div className="relative">
                      {formData.avatarPreview ? (
                        <img
                          src={formData.avatarPreview}
                          alt="Avatar preview"
                          className="w-20 h-20 rounded-2xl object-cover border-2 border-[#85AB8B] shadow-md"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#234A2D] to-[#17301F] text-emerald-300 flex items-center justify-center text-2xl font-bold font-display shadow-md">
                          {(formData.display_name || formData.full_name || 'C').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-2 text-center sm:text-left">
                      <h4 className="text-xs font-bold text-[#17301F] uppercase tracking-wider">
                        Creator Avatar Photo
                      </h4>
                      <p className="text-[11px] text-[#557A60]">
                        Upload your official picture or department emblem (PNG, JPG, max 5MB).
                      </p>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#d2ded0] hover:border-[#85AB8B] text-xs font-semibold text-[#17301F] shadow-xs transition-all">
                          <Upload className="w-3.5 h-3.5 text-[#336443]" />
                          <span>{formData.avatarPreview ? 'Replace Photo' : 'Upload Photo'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                          />
                        </label>
                        {formData.avatarPreview && (
                          <button
                            type="button"
                            onClick={handleRemoveAvatar}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 bg-rose-50 text-xs font-semibold hover:bg-rose-100 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Display Name */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#17301F] uppercase tracking-wider">
                        Display Name / Short Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.display_name}
                        onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                        placeholder="e.g. Lokesh"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-[#17301F] focus:outline-none focus:ring-2 focus:ring-[#336443] transition-all ${
                          errors.display_name ? 'border-rose-300 bg-rose-50/30' : 'border-[#d2ded0] bg-white'
                        }`}
                      />
                      {errors.display_name && (
                        <p className="text-[11px] text-rose-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.display_name}
                        </p>
                      )}
                      <p className="text-[10px] text-[#557A60]">Used in dashboard greeting and author badges</p>
                    </div>

                    {/* Designation / Job Title */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#17301F] uppercase tracking-wider">
                        Designation / Job Title <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.designation}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        placeholder="e.g. Communication Coordinator"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-[#17301F] focus:outline-none focus:ring-2 focus:ring-[#336443] transition-all ${
                          errors.designation ? 'border-rose-300 bg-rose-50/30' : 'border-[#d2ded0] bg-white'
                        }`}
                      />
                      {errors.designation && (
                        <p className="text-[11px] text-rose-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.designation}
                        </p>
                      )}
                    </div>

                    {/* Bio */}
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="block text-xs font-bold text-[#17301F] uppercase tracking-wider">
                        Bio / Creator Brief <span className="text-[#7FA68A] font-normal text-[11px]">(Optional)</span>
                      </label>
                      <textarea
                        rows={3}
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Brief summary of your public communication role and outreach objectives..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2ded0] bg-white text-xs sm:text-sm text-[#17301F] focus:outline-none focus:ring-2 focus:ring-[#336443] transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: ORGANIZATION */}
              {currentStep === 3 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="border-b border-[#e2ebd9] pb-3">
                    <h2 className="text-lg font-bold text-[#17301F] font-display flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-[#336443]" />
                      Step 3: Organization & Role
                    </h2>
                    <p className="text-xs text-[#557A60] mt-0.5">
                      Link campaigns and awareness broadcasts to your department or institution.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Organization Name */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#17301F] uppercase tracking-wider">
                        Organization / Authority Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.organization_name}
                        onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                        placeholder="e.g. District Health Office"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-[#17301F] focus:outline-none focus:ring-2 focus:ring-[#336443] transition-all ${
                          errors.organization_name ? 'border-rose-300 bg-rose-50/30' : 'border-[#d2ded0] bg-white'
                        }`}
                      />
                      {errors.organization_name && (
                        <p className="text-[11px] text-rose-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.organization_name}
                        </p>
                      )}
                    </div>

                    {/* Organization Type */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#17301F] uppercase tracking-wider">
                        Organization Type <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formData.organization_type}
                        onChange={(e) => setFormData({ ...formData, organization_type: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2ded0] bg-white text-xs sm:text-sm text-[#17301F] focus:outline-none focus:ring-2 focus:ring-[#336443]"
                      >
                        {ORGANIZATION_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Department / Division */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#17301F] uppercase tracking-wider">
                        Department / Division
                      </label>
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        placeholder="e.g. Public Health & Disease Surveillance"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2ded0] bg-white text-xs sm:text-sm text-[#17301F] focus:outline-none focus:ring-2 focus:ring-[#336443]"
                      />
                    </div>

                    {/* Platform Role Title */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#17301F] uppercase tracking-wider">
                        Creator Role in Organization
                      </label>
                      <input
                        type="text"
                        value={formData.role_title}
                        onChange={(e) => setFormData({ ...formData, role_title: e.target.value })}
                        placeholder="e.g. Communication Coordinator"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2ded0] bg-white text-xs sm:text-sm text-[#17301F] focus:outline-none focus:ring-2 focus:ring-[#336443]"
                      />
                    </div>
                  </div>

                  {/* Role security badge */}
                  <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Verified Creator Access: </span>
                      Your account will be provisioned with standard Campaign Manager permissions to create, validate, and broadcast multilingual messages. Admin privileges can be granted by system superusers.
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: LOCATION */}
              {currentStep === 4 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="border-b border-[#e2ebd9] pb-3">
                    <h2 className="text-lg font-bold text-[#17301F] font-display flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-[#336443]" />
                      Step 4: Regional Geography & Jurisdiction
                    </h2>
                    <p className="text-xs text-[#557A60] mt-0.5">
                      Select your operational jurisdiction from the official India cascading geographic hierarchy.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Country */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#17301F] uppercase tracking-wider">
                        Country
                      </label>
                      <input
                        type="text"
                        value={formData.country}
                        disabled
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2ebd9] bg-[#f5f8f3] text-xs sm:text-sm text-[#557A60] cursor-not-allowed font-medium"
                      />
                    </div>

                    {/* State / Union Territory */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#17301F] uppercase tracking-wider">
                        State / Union Territory <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-[#17301F] focus:outline-none focus:ring-2 focus:ring-[#336443] ${
                          errors.state ? 'border-rose-300 bg-rose-50/30' : 'border-[#d2ded0] bg-white'
                        }`}
                      >
                        <option value="">-- Select State or UT (36) --</option>
                        {ALL_INDIAN_REGIONS.map((region) => (
                          <option key={region.id} value={region.name}>
                            {region.name} ({region.type})
                          </option>
                        ))}
                      </select>
                      {errors.state && (
                        <p className="text-[11px] text-rose-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.state}
                        </p>
                      )}
                    </div>

                    {/* District (Cascading) */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#17301F] uppercase tracking-wider">
                        Administrative District <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formData.district}
                        disabled={!formData.state}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-[#17301F] focus:outline-none focus:ring-2 focus:ring-[#336443] ${
                          !formData.state
                            ? 'bg-[#f5f8f3] text-[#7FA68A] cursor-not-allowed border-[#e2ebd9]'
                            : errors.district
                            ? 'border-rose-300 bg-rose-50/30'
                            : 'border-[#d2ded0] bg-white'
                        }`}
                      >
                        <option value="">
                          {formData.state
                            ? `-- Select District (${availableDistricts.length} available) --`
                            : '-- First select a state above --'}
                        </option>
                        {availableDistricts.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                      {errors.district && (
                        <p className="text-[11px] text-rose-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.district}
                        </p>
                      )}
                    </div>

                    {/* City / Town */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#17301F] uppercase tracking-wider">
                        City / Headquarters Town
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="e.g. Visakhapatnam"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2ded0] bg-white text-xs sm:text-sm text-[#17301F] focus:outline-none focus:ring-2 focus:ring-[#336443]"
                      />
                    </div>

                    {/* Postal Code */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#17301F] uppercase tracking-wider">
                        PIN Code / Postal Code <span className="text-[#7FA68A] font-normal text-[11px]">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={formData.postal_code}
                        onChange={(e) => setFormData({ ...formData, postal_code: e.target.value.replace(/\D/g, '') })}
                        placeholder="e.g. 530001"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2ded0] bg-white text-xs sm:text-sm text-[#17301F] focus:outline-none focus:ring-2 focus:ring-[#336443]"
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-[#557A60] italic">
                    Note: Exact GPS coordinates or home addresses are never required. Geographical selections serve to configure campaign audience segmentation filters.
                  </p>
                </div>
              )}

              {/* STEP 5: COMMUNICATION PREFERENCES */}
              {currentStep === 5 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="border-b border-[#e2ebd9] pb-3">
                    <h2 className="text-lg font-bold text-[#17301F] font-display flex items-center gap-2">
                      <Globe className="w-5 h-5 text-[#336443]" />
                      Step 5: Multilingual & Communication Preferences
                    </h2>
                    <p className="text-xs text-[#557A60] mt-0.5">
                      Configure your preferred Indic languages and delivery alert channels.
                    </p>
                  </div>

                  {/* Primary Language */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[#17301F] uppercase tracking-wider">
                      Primary Target Language <span className="text-rose-500">*</span>
                    </label>
                    <p className="text-[11px] text-[#557A60]">
                      This language will be used as your default generation target in AI Content Studio.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                      {SUPPORTED_LANGUAGES.map((lang) => {
                        const isSelected = formData.primary_language === lang.name;
                        return (
                          <button
                            key={lang.code}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, primary_language: lang.name });
                              // If this was in additional languages, remove it
                              if (formData.additional_languages.includes(lang.name)) {
                                setFormData((prev) => ({
                                  ...prev,
                                  primary_language: lang.name,
                                  additional_languages: prev.additional_languages.filter((l) => l !== lang.name)
                                }));
                              }
                            }}
                            className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                              isSelected
                                ? 'bg-[#336443] border-[#336443] text-white shadow-sm ring-2 ring-[#85AB8B]/40'
                                : 'bg-white border-[#d2ded0] hover:border-[#85AB8B] text-[#17301F]'
                            }`}
                          >
                            <div>
                              <p className="text-xs font-bold font-display">{lang.name}</p>
                              <p className={`text-[10px] ${isSelected ? 'text-emerald-200' : 'text-[#7FA68A]'}`}>
                                {lang.native}
                              </p>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Additional Languages */}
                  <div className="space-y-2 pt-2 border-t border-[#e2ebd9]">
                    <label className="block text-xs font-bold text-[#17301F] uppercase tracking-wider">
                      Additional Outreach Languages
                    </label>
                    <p className="text-[11px] text-[#557A60]">
                      Select secondary languages for multilingual broadcasting and batch translation.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {SUPPORTED_LANGUAGES.filter((l) => l.name !== formData.primary_language).map((lang) => {
                        const isChecked = formData.additional_languages.includes(lang.name);
                        return (
                          <button
                            key={lang.code}
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                additional_languages: isChecked
                                  ? prev.additional_languages.filter((l) => l !== lang.name)
                                  : [...prev.additional_languages, lang.name]
                              }));
                            }}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                              isChecked
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                                : 'bg-white border-[#d2ded0] text-[#557A60] hover:border-[#85AB8B]'
                            }`}
                          >
                            <span>{lang.name}</span>
                            <span className="text-[10px] opacity-70">({lang.native})</span>
                            {isChecked && <Check className="w-3 h-3 text-emerald-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Preferred Channels */}
                  <div className="space-y-2 pt-2 border-t border-[#e2ebd9]">
                    <label className="block text-xs font-bold text-[#17301F] uppercase tracking-wider">
                      Default Communication Channels <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {CHANNELS.map((ch) => {
                        const isSelected = formData.preferred_channels.includes(ch.id);
                        return (
                          <div
                            key={ch.id}
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                preferred_channels: isSelected
                                  ? prev.preferred_channels.filter((c) => c !== ch.id)
                                  : [...prev.preferred_channels, ch.id]
                              }));
                            }}
                            className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                              isSelected
                                ? 'bg-[#336443]/10 border-[#336443] ring-1 ring-[#336443]'
                                : 'bg-white border-[#d2ded0] hover:border-[#85AB8B]'
                            }`}
                          >
                            <div>
                              <p className="text-xs font-bold text-[#17301F]">{ch.name}</p>
                              <p className="text-[10px] text-[#557A60]">{ch.desc}</p>
                            </div>
                            <div
                              className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                                isSelected ? 'bg-[#336443] border-[#336443] text-white' : 'border-[#d2ded0] bg-white'
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {errors.preferred_channels && (
                      <p className="text-[11px] text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.preferred_channels}
                      </p>
                    )}
                  </div>

                  {/* Notification Preferences */}
                  <div className="space-y-3 pt-2 border-t border-[#e2ebd9]">
                    <label className="block text-xs font-bold text-[#17301F] uppercase tracking-wider flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-[#336443]" />
                      Creator Notification Toggles
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { key: 'campaign_updates', title: 'Campaign Updates', desc: 'Alerts when campaigns change status or finish dispatch' },
                        { key: 'delivery_alerts', title: 'Delivery Tracking Alerts', desc: 'Real-time notifications on failed or retried messages' },
                        { key: 'ai_notifications', title: 'AI Studio Updates', desc: 'Updates regarding IndicTrans2 models & content generations' },
                        { key: 'system_notifications', title: 'System Health Warnings', desc: 'Platform maintenance and service availability alerts' }
                      ].map((item) => {
                        const isEnabled = formData.notification_preferences[item.key];
                        return (
                          <div
                            key={item.key}
                            onClick={() => {
                              setFormData((prev) => ({
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
                </div>
              )}

              {/* STEP 6: REVIEW & CREATE */}
              {currentStep === 6 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="border-b border-[#e2ebd9] pb-3">
                    <h2 className="text-lg font-bold text-[#17301F] font-display flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-[#336443]" />
                      Step 6: Review & Final Confirmation
                    </h2>
                    <p className="text-xs text-[#557A60] mt-0.5">
                      Verify your onboarding details. You can click 'Edit' on any section to make adjustments before submission.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Section 1: Account Review */}
                    <div className="p-4 rounded-xl bg-[#f5f8f3] border border-[#e2ebd9] flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7FA68A]">
                          01 Account & Contact
                        </span>
                        <h4 className="text-sm font-bold text-[#17301F]">{formData.full_name}</h4>
                        <p className="text-xs text-[#557A60]">{formData.email}</p>
                        {formData.phone && <p className="text-xs text-[#557A60]">{formData.phone}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleJumpToStep(1)}
                        className="text-xs font-bold text-[#336443] hover:text-[#17301F] underline decoration-[#85AB8B] transition-colors"
                      >
                        Edit
                      </button>
                    </div>

                    {/* Section 2: Profile Review */}
                    <div className="p-4 rounded-xl bg-[#f5f8f3] border border-[#e2ebd9] flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {formData.avatarPreview ? (
                          <img
                            src={formData.avatarPreview}
                            alt="Avatar"
                            className="w-12 h-12 rounded-xl object-cover border border-[#85AB8B]"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-[#17301F] text-emerald-300 flex items-center justify-center font-bold font-display text-lg">
                            {(formData.display_name || formData.full_name || 'C').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7FA68A]">
                            02 Profile Details
                          </span>
                          <h4 className="text-sm font-bold text-[#17301F]">{formData.display_name}</h4>
                          <p className="text-xs text-[#557A60]">{formData.designation}</p>
                          {formData.bio && (
                            <p className="text-[11px] text-[#4b5b47] italic max-w-md line-clamp-1">
                              "{formData.bio}"
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleJumpToStep(2)}
                        className="text-xs font-bold text-[#336443] hover:text-[#17301F] underline decoration-[#85AB8B] transition-colors"
                      >
                        Edit
                      </button>
                    </div>

                    {/* Section 3: Organization Review */}
                    <div className="p-4 rounded-xl bg-[#f5f8f3] border border-[#e2ebd9] flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7FA68A]">
                          03 Organization & Department
                        </span>
                        <h4 className="text-sm font-bold text-[#17301F]">{formData.organization_name}</h4>
                        <p className="text-xs text-[#557A60]">
                          {formData.organization_type} • {formData.department || 'General Administration'}
                        </p>
                        <p className="text-xs text-[#336443] font-semibold">Role: {formData.role_title}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleJumpToStep(3)}
                        className="text-xs font-bold text-[#336443] hover:text-[#17301F] underline decoration-[#85AB8B] transition-colors"
                      >
                        Edit
                      </button>
                    </div>

                    {/* Section 4: Location Review */}
                    <div className="p-4 rounded-xl bg-[#f5f8f3] border border-[#e2ebd9] flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7FA68A]">
                          04 Regional Geography
                        </span>
                        <h4 className="text-sm font-bold text-[#17301F]">
                          {formData.district}, {formData.state}
                        </h4>
                        <p className="text-xs text-[#557A60]">
                          {formData.city ? `${formData.city} • ` : ''}India
                          {formData.postal_code ? ` • PIN: ${formData.postal_code}` : ''}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleJumpToStep(4)}
                        className="text-xs font-bold text-[#336443] hover:text-[#17301F] underline decoration-[#85AB8B] transition-colors"
                      >
                        Edit
                      </button>
                    </div>

                    {/* Section 5: Preferences Review */}
                    <div className="p-4 rounded-xl bg-[#f5f8f3] border border-[#e2ebd9] flex items-start justify-between">
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7FA68A]">
                          05 Preferences & Channels
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#336443] text-white font-bold">
                            Primary: {formData.primary_language}
                          </span>
                          {formData.additional_languages.map((l) => (
                            <span
                              key={l}
                              className="text-xs px-2 py-0.5 rounded-full bg-white border border-[#d2ded0] text-[#17301F]"
                            >
                              +{l}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          <span className="text-[11px] text-[#557A60]">Channels:</span>
                          {formData.preferred_channels.map((c) => (
                            <span
                              key={c}
                              className="text-[11px] font-semibold px-2 py-0.5 rounded bg-white text-[#336443] border border-[#e2ebd9]"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleJumpToStep(5)}
                        className="text-xs font-bold text-[#336443] hover:text-[#17301F] underline decoration-[#85AB8B] transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  {/* Declaration */}
                  <div className="p-3.5 bg-emerald-50/50 border border-emerald-200/80 rounded-xl text-xs text-[#234A2D] flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>
                      By clicking "Create Account", your credentials will be securely encrypted with Django authentication, your regional settings will be applied to AI Content Studio, and a safe creator session will be opened.
                    </span>
                  </div>
                </div>
              )}

              {/* Bottom Actions Bar */}
              <div className="mt-8 pt-5 border-t border-[#e2ebd9] flex items-center justify-between gap-3">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={isSubmitting}
                    className="px-4 py-2.5 rounded-xl border border-[#d2ded0] hover:border-[#85AB8B] text-xs font-semibold text-[#17301F] hover:bg-[#f5f8f3] transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="px-4 py-2.5 rounded-xl border border-transparent text-xs font-semibold text-[#557A60] hover:text-[#17301F] transition-colors flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Cancel to Login</span>
                  </button>
                )}

                {currentStep < 6 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2.5 rounded-xl bg-[#1f2a1d] hover:bg-[#2a3827] text-white text-xs font-bold shadow-md shadow-[#1f2a1d]/15 flex items-center gap-2 transition-all group"
                  >
                    <span>Continue to Step {currentStep + 1}</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitRegistration}
                    disabled={isSubmitting}
                    className="px-7 py-3 rounded-xl bg-gradient-to-r from-[#1f2a1d] to-[#336443] hover:from-[#2a3827] hover:to-[#274f34] text-white text-sm font-bold shadow-lg shadow-[#1f2a1d]/20 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Creating Workspace...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Account</span>
                        <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e4ebe1] bg-white py-4 px-6 text-center text-xs text-[#557A60]">
        Powered by Groq AI &bull; IndicTrans2 Multilingual Translation &bull; Django REST &bull; PostgreSQL
      </footer>
    </div>
  );
};
