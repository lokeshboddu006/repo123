import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Megaphone,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Layers,
  FileText,
  Globe,
  Radio,
  Check,
  ShieldCheck,
  Clock,
  Sparkles,
  Languages,
} from 'lucide-react';
import { Header } from '../../components/Header';
import { campaignsApi } from '../../api/campaigns';
import { audiencesApi } from '../../api/audiences';
import { templatesApi } from '../../api/templates';
import { masterDataApi } from '../../api/masterData';
import { generateContent } from '../../api/ai';
import { AIContentLengthSelector } from '../../components/ai/AIContentLengthSelector';
import { TranslationPanel } from '../../components/ai/TranslationPanel';


export const CreateCampaign = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Campaign Information
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [campaignType, setCampaignType] = useState('AWARENESS');
  const [priority, setPriority] = useState('NORMAL');

  // Step 2: Audiences
  const [availableAudiences, setAvailableAudiences] = useState([]);
  const [selectedAudienceIds, setSelectedAudienceIds] = useState([]);

  // Step 3: Content / Template
  const [availableTemplates, setAvailableTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [contentType, setContentType] = useState('TEMPLATE'); // 'TEMPLATE', 'MANUAL', or 'AI'
  const [contentSubject, setContentSubject] = useState('');
  const [contentBody, setContentBody] = useState('');

  const location = useLocation();
  // AI State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLanguage, setAiLanguage] = useState('English');
  const [aiChannel, setAiChannel] = useState('SMS');
  const [aiTone, setAiTone] = useState('informative');
  const [aiContentLength, setAiContentLength] = useState('standard');
  const [showStep3Translation, setShowStep3Translation] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState('');

  // Prefill if redirected from AI Content Studio
  useEffect(() => {
    if (location.state?.prefilledContent) {
      setContentBody(location.state.prefilledContent);
      setContentType('MANUAL');
      if (location.state.suggestedTitle && !title) {
        setTitle(location.state.suggestedTitle);
      }
      if (location.state.channel) {
        setSelectedChannels([location.state.channel]);
      }
      setCurrentStep(3);
    }
  }, [location.state]);


  // Step 4: Languages
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState(['en', 'te']); // default demo Telugu + English

  // Step 5: Channels
  const channelOptions = [
    { id: 'EMAIL', name: 'Email Broadcast' },
    { id: 'SMS', name: 'SMS Alerts' },
    { id: 'WHATSAPP', name: 'WhatsApp Official Messaging' },
    { id: 'PUSH', name: 'Mobile App Push Notification' },
    { id: 'WEB', name: 'Web Portal Announcement' },
    { id: 'SOCIAL', name: 'Social Media Feed' },
  ];
  const [selectedChannels, setSelectedChannels] = useState(['EMAIL', 'SMS']); // default demo Email + SMS

  // Step 6: Schedule
  const [scheduleType, setScheduleType] = useState('SCHEDULED'); // 'SEND_NOW' or 'SCHEDULED'
  const [scheduledDateTime, setScheduledDateTime] = useState('');

  // Step 7: Review & Validation Report
  const [validationReport, setValidationReport] = useState(null);
  const [validating, setValidating] = useState(false);
  const [createdCampaignId, setCreatedCampaignId] = useState(null);

  // Load audiences, templates, languages
  useEffect(() => {
    const loadPrerequisites = async () => {
      try {
        const [audData, tplData, langData] = await Promise.allSettled([
          audiencesApi.getAudiences(),
          templatesApi.getTemplates(),
          masterDataApi.getLanguages(),
        ]);

        let auds = audData.status === 'fulfilled' ? (audData.value.results || audData.value) : [];
        if (!Array.isArray(auds) || auds.length === 0) {
          auds = [
            {
              id: 'fallback-aud-1',
              name: 'Andhra Pradesh - Higher Education Youth',
              description: 'College and university students residing across Andhra Pradesh districts',
              member_count: 4250,
              segment_type: 'DYNAMIC'
            },
            {
              id: 'fallback-aud-2',
              name: 'Telangana & Hyderabad Citizens',
              description: 'Urban and district community residents in Telangana',
              member_count: 3100,
              segment_type: 'DYNAMIC'
            },
            {
              id: 'fallback-aud-3',
              name: 'National Healthcare & Emergency Responders',
              description: 'Doctors, paramedics, and public health officials nationwide',
              member_count: 1820,
              segment_type: 'DYNAMIC'
            },
            {
              id: 'fallback-aud-4',
              name: 'All Active Citizens (Pan-India Broadcast)',
              description: 'All verified mobile and email contacts across all states',
              member_count: 15400,
              segment_type: 'STATIC'
            }
          ];
        }
        setAvailableAudiences(auds);
        if (auds.length > 0 && selectedAudienceIds.length === 0) {
          setSelectedAudienceIds([auds[0].id]);
        }

        let tpls = tplData.status === 'fulfilled' ? (tplData.value.results || tplData.value) : [];
        if (!Array.isArray(tpls) || tpls.length === 0) {
          tpls = [
            {
              id: 'fallback-tpl-1',
              title: 'Seasonal Dengue Prevention & Health Advisory',
              scenario: 'Awareness',
              subject_template: 'Health Alert: Dengue & Viral Prevention Guidelines for {{location}}',
              body_template: 'Dear Citizen, on {{date}}, Public Health Department issues precautions for {{location}}: {{message}}. Keep water containers clean and avoid stagnation.'
            },
            {
              id: 'fallback-tpl-2',
              title: 'Emergency Flood / Weather Warning Protocol',
              scenario: 'Emergency Alert',
              subject_template: 'CRITICAL ALERT: Emergency Weather Warning in {{location}}',
              body_template: 'EMERGENCY: Heavy rainfall alert in {{location}} on {{date}}. {{message}}. Please proceed to designated relief shelters if in low-lying zones.'
            },
            {
              id: 'fallback-tpl-3',
              title: 'Higher Education & Scholarship Announcement',
              scenario: 'Educational',
              subject_template: 'Scholarship Application Open: {{title}}',
              body_template: 'Dear Students of {{location}}, applications for the {{title}} are open till {{date}}. {{message}}. Visit the state portal to submit documents.'
            }
          ];
        }
        setAvailableTemplates(tpls);
        if (tpls.length > 0 && !selectedTemplateId) {
          setSelectedTemplateId(tpls[0].id);
          setContentSubject(tpls[0].subject_template);
          setContentBody(tpls[0].body_template);
        }

        let langs = langData.status === 'fulfilled' ? (langData.value.results || langData.value) : [];
        if (!Array.isArray(langs) || langs.length === 0) {
          langs = [
            { id: 'en', code: 'en', name: 'English', native_name: 'English' },
            { id: 'hi', code: 'hi', name: 'Hindi', native_name: 'हिन्दी' },
            { id: 'te', code: 'te', name: 'Telugu', native_name: 'తెలుగు' },
            { id: 'ta', code: 'ta', name: 'Tamil', native_name: 'தமிழ்' },
            { id: 'kn', code: 'kn', name: 'Kannada', native_name: 'ಕನ್ನಡ' },
            { id: 'ml', code: 'ml', name: 'Malayalam', native_name: 'മലയാളം' },
            { id: 'mr', code: 'mr', name: 'Marathi', native_name: 'मराठी' },
            { id: 'bn', code: 'bn', name: 'Bengali', native_name: 'বাংলা' },
            { id: 'gu', code: 'gu', name: 'Gujarati', native_name: 'ગુજરાતી' },
            { id: 'pa', code: 'pa', name: 'Punjabi', native_name: 'ਪੰਜਾਬੀ' },
          ];
        }
        setAvailableLanguages(langs);

        // Set default future date (tomorrow at 10:00 AM)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);
        setScheduledDateTime(tomorrow.toISOString().slice(0, 16));
      } catch (err) {
        console.error('Failed to load prerequisites:', err);
      }
    };
    loadPrerequisites();
  }, []);

  const steps = [
    { num: 1, title: 'Information' },
    { num: 2, title: 'Audience' },
    { num: 3, title: 'Content' },
    { num: 4, title: 'Languages' },
    { num: 5, title: 'Channels' },
    { num: 6, title: 'Schedule' },
    { num: 7, title: 'Validate' },
  ];

  const handleTemplateSelect = (tplId) => {
    setSelectedTemplateId(tplId);
    const found = availableTemplates.find((t) => t.id === tplId);
    if (found) {
      setContentSubject(found.subject_template);
      setContentBody(found.body_template);
    }
  };

  const toggleAudience = (id) => {
    setSelectedAudienceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleLanguage = (code) => {
    setSelectedLanguages((prev) =>
      prev.includes(code) ? prev.filter((item) => item !== code) : [...prev, code]
    );
  };

  const toggleChannel = (id) => {
    setSelectedChannels((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Build the contents array for all selected languages
  const buildContentsPayload = () => {
    return selectedLanguages.map((langCode) => {
      const langObj = availableLanguages.find((l) => l.code === langCode);
      let subject = contentSubject || `${title} (${langCode.toUpperCase()})`;
      let body = contentBody || `Official public awareness notice regarding ${title}.`;

      // Localize sample text for Telugu in demo
      if (langCode === 'te') {
        body = `ఆంధ్రప్రదేశ్ ప్రజలకు మరియు విద్యార్థులకు ముఖ్య ప్రకటన: ${title}. వివరాల కోసం అధికారిక పోర్టల్ చూడండి.`;
      }

      return {
        language: langObj?.id,
        language_code: langCode,
        channel: selectedChannels[0] || 'EMAIL',
        subject: subject,
        title: title,
        body: body,
      };
    });
  };

  // Step 7: Run real campaign validation
  const handleValidateCampaign = async () => {
    setValidating(true);
    setError('');

    try {
      // First save or update draft campaign
      const payload = {
        title,
        description,
        campaign_type: campaignType,
        priority,
        status: 'DRAFT',
        audience_ids: selectedAudienceIds,
        template: selectedTemplateId || null,
        channels: selectedChannels,
        target_languages: selectedLanguages,
        contents: buildContentsPayload(),
        schedule: {
          schedule_type: scheduleType,
          scheduled_time: scheduledDateTime ? new Date(scheduledDateTime).toISOString() : null,
          timezone: 'Asia/Kolkata',
        },
      };

      let campaignId = createdCampaignId;
      if (!campaignId) {
        const created = await campaignsApi.createCampaign(payload);
        campaignId = created.id;
        setCreatedCampaignId(campaignId);
      } else {
        await campaignsApi.updateCampaign(campaignId, payload);
      }

      // Run backend validation API
      const valRes = await campaignsApi.validateCampaign(campaignId);
      setValidationReport(valRes);
    } catch (err) {
      console.error(err);
      setError('Validation failed. Please verify campaign attributes.');
    } finally {
      setValidating(false);
    }
  };

  // Final Action: Schedule Campaign
  const handleFinalSchedule = async () => {
    if (!createdCampaignId) return;
    setSaving(true);
    try {
      await campaignsApi.scheduleCampaign(createdCampaignId, {
        schedule_type: scheduleType,
        scheduled_time: scheduledDateTime ? new Date(scheduledDateTime).toISOString() : null,
        timezone: 'Asia/Kolkata',
      });
      navigate(`/campaigns/${createdCampaignId}`);
    } catch (err) {
      setError('Failed to schedule campaign.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!createdCampaignId) {
      await handleValidateCampaign();
    }
    navigate('/campaigns');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Header
        title="Campaign Creation Wizard"
        subtitle="Step-by-step orchestrator for multi-channel, multilingual citizen communications"
        actions={
          <Link
            to="/campaigns"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-lg bg-white"
          >
            &larr; Exit Wizard
          </Link>
        }
      />

      {/* Progress Step Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          {steps.map((s, idx) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep === s.num
                      ? 'bg-brand-600 text-white ring-4 ring-brand-100'
                      : currentStep > s.num
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {currentStep > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
                </div>
                <span
                  className={`text-[11px] font-medium mt-1 ${
                    currentStep >= s.num ? 'text-slate-800' : 'text-slate-400'
                  }`}
                >
                  {s.title}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`h-0.5 w-full mx-1 ${
                    currentStep > s.num ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Wizard Step Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-xs">
        {/* STEP 1: Information */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-brand-600" />
                Campaign Basics
              </h3>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-400">Quick Fill:</span>
                <button
                  type="button"
                  onClick={() => {
                    setTitle('Monsoon Dengue & Malaria Prevention Alert 2026');
                    setDescription('Statewide public health alert across Andhra Pradesh & Telangana advising citizens to eradicate standing water and report fever symptoms.');
                    setCampaignType('EMERGENCY_ALERT');
                    setPriority('HIGH');
                  }}
                  className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-[10px] font-bold"
                >
                  Health Emergency
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTitle('State Post-Matric Merit Scholarship Scheme 2026');
                    setDescription('Annual higher education financial aid application window for university and polytechnic students.');
                    setCampaignType('EDUCATIONAL');
                    setPriority('NORMAL');
                  }}
                  className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-[10px] font-bold"
                >
                  Scholarship Drive
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTitle('Coastal Heavy Cyclone & Flood Advisory');
                    setDescription('Urgent alert for coastal districts regarding impending storm surge and designated relief shelters.');
                    setCampaignType('AWARENESS');
                    setPriority('CRITICAL');
                  }}
                  className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded text-[10px] font-bold"
                >
                  Disaster Warning
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Campaign Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Dengue Prevention & Student Awareness Drive 2026"
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Campaign Type
                </label>
                <select
                  value={campaignType}
                  onChange={(e) => setCampaignType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white text-xs"
                >
                  <option value="AWARENESS">AWARENESS (Public Awareness)</option>
                  <option value="EMERGENCY_ALERT">EMERGENCY_ALERT (Urgent Notice)</option>
                  <option value="EDUCATIONAL">EDUCATIONAL (Academic / Scholarships)</option>
                  <option value="ORGANIZATIONAL_ANNOUNCEMENT">ORGANIZATIONAL_ANNOUNCEMENT (Policy)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Dispatch Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white text-xs"
                >
                  <option value="LOW">LOW</option>
                  <option value="NORMAL">NORMAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Description / Purpose
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Statewide outreach objectives and public safety mandate..."
                rows={3}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white text-xs"
              ></textarea>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                disabled={!title.trim()}
                onClick={() => setCurrentStep(2)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-sm"
              >
                <span>Continue to Audience</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Audience Selection */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                Target Audience Segments
              </h3>
              <p className="text-slate-500 mt-0.5">
                Select one or multiple audience cohorts. Recipients will be dynamically computed at dispatch.
              </p>
            </div>

            {availableAudiences.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl text-center">
                <Layers className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <h4 className="font-semibold text-slate-800">No Audience Segments Loaded Yet</h4>
                <p className="text-slate-500 text-xs mb-4">Click below to auto-populate recommended citizen audience segments.</p>
                <button
                  type="button"
                  onClick={() => {
                    const sampleAuds = [
                      {
                        id: 'sample-aud-1',
                        name: 'Andhra Pradesh - Higher Education Youth',
                        description: 'University and college youth across AP districts',
                        member_count: 4250,
                        segment_type: 'DYNAMIC'
                      },
                      {
                        id: 'sample-aud-2',
                        name: 'Telangana & Hyderabad Citizens',
                        description: 'Urban and district community residents in Telangana',
                        member_count: 3100,
                        segment_type: 'DYNAMIC'
                      },
                      {
                        id: 'sample-aud-3',
                        name: 'National Healthcare & Emergency Responders',
                        description: 'Doctors and medical personnel nationwide',
                        member_count: 1820,
                        segment_type: 'DYNAMIC'
                      },
                      {
                        id: 'sample-aud-4',
                        name: 'All Active Citizens (Pan-India Broadcast)',
                        description: 'Verified public citizens in all districts',
                        member_count: 15400,
                        segment_type: 'STATIC'
                      }
                    ];
                    setAvailableAudiences(sampleAuds);
                    setSelectedAudienceIds([sampleAuds[0].id]);
                  }}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow"
                >
                  Load Recommended Segments
                </button>
              </div>
            ) : (
              <div className="space-y-2 pt-2">
                {availableAudiences.map((aud) => {
                  const isSelected = selectedAudienceIds.includes(aud.id);
                  return (
                    <div
                      key={aud.id}
                      onClick={() => toggleAudience(aud.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50/40 ring-1 ring-brand-500'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center border ${
                            isSelected
                              ? 'bg-brand-600 border-brand-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{aud.name}</span>
                          <span className="text-[11px] text-slate-500">
                            {aud.description || `${aud.segment_type} segment`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-800">
                          {aud.member_count} Members
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {aud.segment_type}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                type="button"
                disabled={selectedAudienceIds.length === 0}
                onClick={() => setCurrentStep(3)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-sm"
              >
                <span>Continue to Content</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Content & Template */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              Communication Content & Template
            </h3>

            <div className="flex gap-4 p-1 bg-slate-100 rounded-lg max-w-md">
              <button
                type="button"
                onClick={() => setContentType('TEMPLATE')}
                className={`flex-1 py-1.5 rounded-md font-semibold text-xs transition-all ${
                  contentType === 'TEMPLATE' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                Predefined Template
              </button>
              <button
                type="button"
                onClick={() => setContentType('MANUAL')}
                className={`flex-1 py-1.5 rounded-md font-semibold text-xs transition-all ${
                  contentType === 'MANUAL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                Manual Content
              </button>
              <button
                type="button"
                onClick={() => setContentType('AI')}
                className={`flex-1 py-1.5 rounded-md font-semibold text-xs transition-all flex items-center justify-center gap-1 ${
                  contentType === 'AI' ? 'bg-white text-brand-600 shadow-sm ring-1 ring-brand-200' : 'text-slate-600 hover:text-brand-600'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                Generate AI
              </button>
            </div>

            {contentType === 'TEMPLATE' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Template</label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white text-xs"
                >
                  {availableTemplates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.scenario})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {contentType === 'AI' && (
              <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 space-y-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prompt / Instructions *</label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. Create a short public awareness message about dengue prevention."
                    rows={2}
                    className="w-full p-2.5 bg-white border border-brand-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-brand-500 text-xs"
                  ></textarea>
                </div>
                <div className="flex flex-wrap gap-1.5 pb-1">
                  <span className="text-[11px] font-semibold text-slate-500 self-center mr-1">Quick Prompts:</span>
                  {[
                    { label: '🦟 Dengue Prevention', text: 'Create an urgent monsoon public awareness alert advising citizens to eliminate stagnant water containers and prevent dengue fever.' },
                    { label: '🌊 Flood Safety Notice', text: 'Draft an emergency flash flood and heavy rainfall warning advisory instructing citizens to avoid low-lying roads.' },
                    { label: '🎓 State Scholarship', text: 'Write an inspiring announcement inviting eligible undergraduate students to apply for state government merit scholarships.' },
                    { label: '💉 Vaccination Camp', text: 'Announce a free community health and immunization drive happening this weekend across public health clinics.' }
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAiPrompt(chip.text)}
                      className="px-2 py-1 bg-white hover:bg-brand-100 text-brand-800 border border-brand-200 rounded text-[11px] font-medium transition-all"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                {/* AI Content Length Selection */}
                <div className="pt-1">
                  <AIContentLengthSelector value={aiContentLength} onChange={setAiContentLength} />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Target Language</label>
                    <select
                      value={aiLanguage}
                      onChange={(e) => setAiLanguage(e.target.value)}
                      className="w-full p-2 bg-white border border-brand-200 rounded-lg text-xs"
                    >
                      <option value="English">English</option>
                      <option value="Telugu">Telugu (తెలుగు)</option>
                      <option value="Hindi">Hindi (हिन्दी)</option>
                      <option value="Tamil">Tamil (தமிழ்)</option>
                      <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
                      <option value="Malayalam">Malayalam (മലയാളം)</option>
                      <option value="Marathi">Marathi (मराठी)</option>
                      <option value="Bengali">Bengali (বাংলা)</option>
                      <option value="Gujarati">Gujarati (ગુજરાતી)</option>
                      <option value="Punjabi">Punjabi (ਪੰਜਾਬੀ)</option>
                      <option value="Odia">Odia (ଓଡ଼ିଆ)</option>
                      <option value="Urdu">Urdu (اردو)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Channel</label>
                    <select
                      value={aiChannel}
                      onChange={(e) => setAiChannel(e.target.value)}
                      className="w-full p-2 bg-white border border-brand-200 rounded-lg text-xs"
                    >
                      <option value="SMS">SMS</option>
                      <option value="EMAIL">EMAIL</option>
                      <option value="WHATSAPP">WHATSAPP</option>
                      <option value="PUSH">PUSH</option>
                      <option value="WEB">WEB</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tone</label>
                    <select
                      value={aiTone}
                      onChange={(e) => setAiTone(e.target.value)}
                      className="w-full p-2 bg-white border border-brand-200 rounded-lg text-xs"
                    >
                      <option value="informative">Informative</option>
                      <option value="formal">Formal</option>
                      <option value="urgent">Urgent</option>
                      <option value="friendly">Friendly</option>
                    </select>
                  </div>
                </div>

                {aiError && (
                  <div className="p-3 bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold">
                    {aiError}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={isGenerating || !aiPrompt.trim()}
                    onClick={async () => {
                      setIsGenerating(true);
                      setAiError('');
                      setAiResult(null);
                      setShowStep3Translation(false);
                      try {
                        const result = await generateContent({
                          prompt: aiPrompt,
                          language: aiLanguage,
                          channel: aiChannel,
                          tone: aiTone,
                          length: aiContentLength
                        });
                        setAiResult(result);
                      } catch (err) {
                        setAiError(err.response?.data?.message || "AI service is currently unavailable. Please try again.");
                      } finally {
                        setIsGenerating(false);
                      }
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-sm text-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {isGenerating ? "Generating..." : "Generate Content"}
                  </button>
                </div>

                {aiResult && (
                  <div className="mt-4 p-4 bg-white border border-brand-200 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Generated Result</span>
                      <div className="flex gap-2 text-[10px] font-bold">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600">Provider: {aiResult.provider}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 capitalize">Length: {aiContentLength}</span>
                      </div>
                    </div>
                    <div className="text-sm text-slate-800 whitespace-pre-wrap">{aiResult.generated_content}</div>
                    
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setShowStep3Translation(!showStep3Translation)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-200 text-brand-700 hover:bg-brand-50 text-xs font-semibold"
                      >
                        <Languages className="w-3.5 h-3.5" />
                        <span>{showStep3Translation ? "Hide Translations" : "Translate Content (IndicTrans2)"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setContentBody(aiResult.generated_content);
                          if (!contentSubject) setContentSubject(`AI Generated - ${aiResult.tone}`);
                          setContentType('MANUAL');
                        }}
                        className="px-4 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-md hover:bg-slate-800"
                      >
                        Use This Content
                      </button>
                    </div>

                    {showStep3Translation && (
                      <div className="pt-3 border-t border-slate-200">
                        <TranslationPanel
                          sourceText={aiResult.generated_content}
                          onUseTranslation={(item) => {
                            setContentBody(item.text);
                            if (!contentSubject) setContentSubject(`AI Translated (${item.language})`);
                            setContentType('MANUAL');
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {contentType !== 'AI' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject Header</label>
                <input
                  type="text"
                  value={contentSubject}
                  onChange={(e) => setContentSubject(e.target.value)}
                  placeholder="Alert headline..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white text-xs"
                />
              </div>
            )}

            {contentType !== 'AI' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Body Content (Supports {'{{location}}'}, {'{{date}}'}, {'{{message}}'})
                </label>
                <textarea
                  value={contentBody}
                  onChange={(e) => setContentBody(e.target.value)}
                  rows={4}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white text-xs"
                ></textarea>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg shadow-sm"
              >
                <span>Continue to Languages</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Languages */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" />
                Target Language Selection
              </h3>
              <p className="text-slate-500 mt-0.5">
                Select target official and Indic languages for this campaign broadcast:
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              {availableLanguages.map((lang) => {
                const isSelected = selectedLanguages.includes(lang.code);
                return (
                  <div
                    key={lang.code}
                    onClick={() => toggleLanguage(lang.code)}
                    className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-500'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">{lang.name}</span>
                      <span className="text-[11px] text-slate-500">{lang.native_name}</span>
                    </div>
                    <span
                      className={`w-5 h-5 rounded flex items-center justify-center border text-xs ${
                        isSelected
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                type="button"
                disabled={selectedLanguages.length === 0}
                onClick={() => setCurrentStep(5)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-sm"
              >
                <span>Continue to Channels</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Delivery Channels */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Radio className="w-4 h-4 text-blue-600" />
                Delivery Channels
              </h3>
              <p className="text-slate-500 mt-0.5">
                Select active communication delivery channels:
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {channelOptions.map((ch) => {
                const isSelected = selectedChannels.includes(ch.id);
                return (
                  <div
                    key={ch.id}
                    onClick={() => toggleChannel(ch.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-500'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">{ch.name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{ch.id}</span>
                    </div>
                    <span
                      className={`w-5 h-5 rounded flex items-center justify-center border text-xs ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                type="button"
                disabled={selectedChannels.length === 0}
                onClick={() => setCurrentStep(6)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-sm"
              >
                <span>Continue to Schedule</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: Schedule */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                Campaign Scheduling
              </h3>
              <p className="text-slate-500 mt-0.5">
                Timezone: <strong>Asia/Kolkata (IST)</strong>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div
                onClick={() => setScheduleType('SCHEDULED')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  scheduleType === 'SCHEDULED'
                    ? 'border-brand-600 bg-brand-50/40 ring-1 ring-brand-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="font-bold text-slate-900 block text-sm">Schedule for Later</span>
                <p className="text-[11px] text-slate-500 mt-1">
                  Queue campaign to broadcast automatically at a designated date and time.
                </p>
              </div>

              <div
                onClick={() => setScheduleType('SEND_NOW')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  scheduleType === 'SEND_NOW'
                    ? 'border-brand-600 bg-brand-50/40 ring-1 ring-brand-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="font-bold text-slate-900 block text-sm">Send Now (Immediate)</span>
                <p className="text-[11px] text-slate-500 mt-1">
                  Prepares the campaign for immediate automated processing.
                </p>
              </div>
            </div>

            {scheduleType === 'SCHEDULED' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Scheduled Date & Time (Asia/Kolkata) *
                </label>
                <input
                  type="datetime-local"
                  value={scheduledDateTime}
                  onChange={(e) => setScheduledDateTime(e.target.value)}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white text-xs"
                />
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(7)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg shadow-sm"
              >
                <span>Review & Validate</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 7: Review & Validate */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Campaign Review & Real Validation
              </h3>
              <p className="text-slate-500 mt-0.5">
                Review complete broadcast specifications and execute the 12-rule automated validator:
              </p>
            </div>

            {/* Complete Campaign Summary Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 font-medium">Campaign Title:</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{title}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Type & Priority:</span>
                  <p className="font-semibold text-slate-700 mt-0.5">
                    {campaignType} &bull; {priority}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <span className="text-slate-400 font-medium">Audiences:</span>
                  <p className="font-medium text-slate-700 mt-0.5">
                    {availableAudiences
                      .filter((a) => selectedAudienceIds.includes(a.id))
                      .map((a) => a.name)
                      .join(', ')}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Languages:</span>
                  <p className="font-medium text-slate-700 mt-0.5 uppercase">
                    {selectedLanguages.join(', ')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <span className="text-slate-400 font-medium">Delivery Channels:</span>
                  <p className="font-medium text-slate-700 mt-0.5">
                    {selectedChannels.join(', ')}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Schedule Time:</span>
                  <p className="font-medium text-slate-700 mt-0.5">
                    {scheduleType === 'SEND_NOW' ? 'Send Now' : scheduledDateTime} (Asia/Kolkata)
                  </p>
                </div>
              </div>
            </div>

            {/* Validation Action Button */}
            <div className="text-center py-2">
              <button
                type="button"
                onClick={handleValidateCampaign}
                disabled={validating}
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-md shadow-slate-900/20 transition-all text-xs"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{validating ? 'Executing 12-Rule Validator...' : 'VALIDATE CAMPAIGN'}</span>
              </button>
            </div>

            {/* Validation Result Box */}
            {validationReport && (
              <div
                className={`p-5 rounded-xl border transition-all ${
                  validationReport.valid
                    ? 'bg-emerald-50/70 border-emerald-300'
                    : 'bg-rose-50/70 border-rose-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  {validationReport.valid ? (
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                      ✓
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold">
                      ✕
                    </div>
                  )}
                  <div>
                    <h4
                      className={`text-sm font-bold ${
                        validationReport.valid ? 'text-emerald-900' : 'text-rose-900'
                      }`}
                    >
                      {validationReport.valid ? '✓ Campaign is ready' : 'Validation Issues Detected'}
                    </h4>
                    <p className="text-[11px] text-slate-600">
                      {validationReport.valid
                        ? 'All 12 validation rules passed cleanly. Audience, channels, languages, and future schedule confirmed.'
                        : 'Please resolve the following required validation checks:'}
                    </p>
                  </div>
                </div>

                {validationReport.errors?.length > 0 && (
                  <ul className="mt-3 space-y-1 text-rose-700 pl-4 list-disc">
                    {validationReport.errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                )}

                {validationReport.warnings?.length > 0 && (
                  <ul className="mt-3 space-y-1 text-amber-700 pl-4 list-disc">
                    {validationReport.warnings.map((warn, idx) => (
                      <li key={idx}>{warn}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Final Action Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(6)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-4 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  CREATE DRAFT
                </button>

                <button
                  type="button"
                  onClick={handleFinalSchedule}
                  disabled={!validationReport?.valid || saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{saving ? 'Scheduling...' : 'SCHEDULE CAMPAIGN'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
