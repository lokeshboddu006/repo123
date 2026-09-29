import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Send,
  Edit3,
  Languages,
  Clock,
  Trash2,
  Cpu,
  Layers,
  CheckCircle2,
  Radio,
  FileText
} from 'lucide-react';
import { generateContent, checkAiHealth } from '../../api/ai';
import { AIContentLengthSelector } from '../../components/ai/AIContentLengthSelector';
import { AIToneSelector } from '../../components/ai/AIToneSelector';
import { AIChannelSelector } from '../../components/ai/AIChannelSelector';
import { AIQuickPrompts } from '../../components/ai/AIQuickPrompts';
import { TranslationPanel } from '../../components/ai/TranslationPanel';
import { useAuth } from '../../context/AuthContext';

export const ContentStudio = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Prompt and generation inputs
  const [prompt, setPrompt] = useState('');
  const [contentLength, setContentLength] = useState('standard');
  const [tone, setTone] = useState('formal');
  const [channel, setChannel] = useState('SMS');

  // Initialize target language with user's preferred language from profile
  const userPreferredLang = user?.primary_language || user?.profile?.primary_language || user?.preferred_language || 'English';
  const [targetLanguage, setTargetLanguage] = useState(userPreferredLang);

  useEffect(() => {
    if (user) {
      const preferred = user.primary_language || user.profile?.primary_language || user.preferred_language;
      if (preferred) {
        setTargetLanguage(preferred);
      }
    }
  }, [user]);


  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [generatedResult, setGeneratedResult] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Active view tab in right preview panel
  const [activeTab, setActiveTab] = useState('generated'); // 'generated', 'translate', 'history'

  // AI Health indicator
  const [aiOnline, setAiOnline] = useState(true);

  // Session history (stored in localStorage)
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('govcomm_content_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('govcomm_content_history', JSON.stringify(history));
    } catch {
      // Ignore storage errors
    }
  }, [history]);

  useEffect(() => {
    const verifyHealth = async () => {
      const ok = await checkAiHealth();
      setAiOnline(ok);
    };
    verifyHealth();
    const interval = setInterval(verifyHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please provide a prompt or select a public awareness scenario.');
      return;
    }

    setError(null);
    setIsGenerating(true);
    setGenerationStep('AI is thinking...');

    const timer1 = setTimeout(() => {
      setGenerationStep('Crafting your public communication...');
    }, 900);

    const timer2 = setTimeout(() => {
      setGenerationStep(`Optimizing register for ${channel} channel...`);
    }, 1800);

    try {
      const res = await generateContent({
        prompt: prompt.trim(),
        language: targetLanguage,
        channel: channel.toUpperCase(),
        tone,
        length: contentLength,
      });

      const resultObj = {
        id: Date.now().toString(),
        text: res.content || res.generated_content || res.message,
        provider: res.provider || 'groq',
        model: res.model || 'llama-3.3-70b-versatile',
        channel: channel.toUpperCase(),
        tone,
        contentLength,
        language: targetLanguage,
        prompt: prompt.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString(),
      };

      setGeneratedResult(resultObj);
      setEditedText(resultObj.text);
      setIsEditing(false);

      // Add to session history
      setHistory((prev) => [resultObj, ...prev.slice(0, 19)]);
    } catch (err) {
      console.error('Generation error:', err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'AI generation encountered an issue. Please verify backend services and try again.'
      );
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleCopy = () => {
    const textToCopy = isEditing ? editedText : (generatedResult?.text || '');
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUseInCampaign = (contentData) => {
    const content = contentData?.text || (isEditing ? editedText : generatedResult?.text);
    if (!content) return;
    navigate('/campaigns/create', {
      state: {
        prefilledContent: content,
        channel: generatedResult?.channel || channel,
        suggestedTitle: prompt.slice(0, 40),
      },
    });
  };

  const loadFromHistory = (item) => {
    setGeneratedResult(item);
    setEditedText(item.text);
    setPrompt(item.prompt || '');
    setChannel(item.channel || 'SMS');
    setTone(item.tone || 'formal');
    setContentLength(item.contentLength || 'standard');
    setActiveTab('generated');
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('govcomm_content_history');
    } catch {}
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#e2ebd9]">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#234A2D] to-[#336443] flex items-center justify-center text-emerald-300 shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold text-[#17301F] tracking-tight font-display">
              AI Content Studio
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Multilingual Hub
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#557A60]">
            Generate clear, impactful public awareness messages, announcements, emergency advisories, and citizen guidance in seconds.
          </p>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
            aiOnline
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${aiOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span>{aiOnline ? 'AI Online (Groq + IndicTrans2)' : 'Checking AI Services...'}</span>
          </div>
        </div>
      </div>

      {/* Main Workspace Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Configuration and Prompting (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="card-peaceful p-5 space-y-4">
            <h2 className="text-sm font-bold text-[#17301F] font-display flex items-center justify-between">
              <span>Message Specifications</span>
              <span className="text-[11px] font-normal text-[#557A60]">Step 1 of 2</span>
            </h2>

            {/* Quick Prompts */}
            <AIQuickPrompts onSelectPrompt={(p) => setPrompt(p)} />

            {/* Main Prompt Textarea */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#17301F] uppercase tracking-wider">
                What do you want citizens to know? *
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                placeholder="Example: Create an urgent public health advisory regarding dengue prevention during monsoon season. Advise eliminating standing water, using mosquito nets, and visiting nearest PHC."
                className="w-full px-3.5 py-3 rounded-xl border border-[#d2ded0] bg-white text-xs sm:text-sm text-[#17301F] placeholder-[#7FA68A] focus:outline-none focus:ring-2 focus:ring-[#336443] focus:border-transparent transition-all resize-y shadow-sm"
              />
              <p className="text-[11px] text-[#557A60]">
                Include key dates, preventive actions, locations, or citizen helplines.
              </p>
            </div>

            {/* Content Length: Brief, Standard, Detailed */}
            <AIContentLengthSelector value={contentLength} onChange={setContentLength} />

            {/* Tone Selector */}
            <AIToneSelector value={tone} onChange={setTone} />

            {/* Channel Selector */}
            <AIChannelSelector value={channel} onChange={setChannel} />

            {/* Error banner */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            {/* Generate Action Button */}
            <button
              type="button"
              disabled={isGenerating || !prompt.trim()}
              onClick={handleGenerate}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#234A2D] via-[#1D3A25] to-[#17301F] text-white font-semibold text-sm shadow-md hover:shadow-lg hover:from-[#336443] hover:to-[#234A2D] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-300" />
                  <span>{generationStep || 'Generating Content...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-300 group-hover:rotate-12 transition-transform" />
                  <span>Generate Content</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Output, Translation & History Tabs (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Navigation Tabs for Right Panel */}
          <div className="flex items-center gap-2 border-b border-[#e2ebd9] pb-2">
            <button
              onClick={() => setActiveTab('generated')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'generated'
                  ? 'bg-[#336443] text-white shadow-sm'
                  : 'text-[#557A60] hover:text-[#17301F] hover:bg-white/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Generated Content</span>
              {generatedResult && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('translate')}
              disabled={!generatedResult && !editedText}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed ${
                activeTab === 'translate'
                  ? 'bg-[#336443] text-white shadow-sm'
                  : 'text-[#557A60] hover:text-[#17301F] hover:bg-white/60'
              }`}
            >
              <Languages className="w-3.5 h-3.5" />
              <span>Translate Content</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20">11 Indic</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-[#336443] text-white shadow-sm'
                  : 'text-[#557A60] hover:text-[#17301F] hover:bg-white/60'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Recent Generations</span>
              {history.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#85AB8B]/20 text-[#17301F]">
                  {history.length}
                </span>
              )}
            </button>
          </div>

          {/* TAB 1: GENERATED CONTENT */}
          {activeTab === 'generated' && (
            <div className="card-peaceful p-5 space-y-4">
              {isGenerating ? (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                  <div className="relative mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#234A2D] to-[#85AB8B] flex items-center justify-center text-white shadow-lg animate-pulse">
                      <Sparkles className="w-6 h-6 text-emerald-200" />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-[#17301F] font-display">
                    {generationStep || 'AI is thinking...'}
                  </h3>
                  <p className="text-xs text-[#557A60] mt-1 max-w-sm">
                    Synthesizing public awareness directives with verified governmental clarity.
                  </p>
                </div>
              ) : generatedResult ? (
                <div className="space-y-4 animate-fade-in">
                  {/* Meta Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#f5f8f3] border border-[#e2ebd9] text-xs">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[#234A2D] font-medium">
                        <Cpu className="w-3.5 h-3.5 text-[#336443]" />
                        <span className="capitalize">{generatedResult.provider}</span>
                      </div>
                      <span className="text-[#85AB8B]">•</span>
                      <div className="text-[#557A60]">
                        Length: <span className="font-semibold text-[#17301F] capitalize">{generatedResult.contentLength}</span>
                      </div>
                      <span className="text-[#85AB8B]">•</span>
                      <div className="text-[#557A60]">
                        Channel: <span className="font-semibold text-[#17301F]">{generatedResult.channel}</span>
                      </div>
                    </div>
                    <div className="text-[11px] text-[#7FA68A]">
                      {generatedResult.timestamp}
                    </div>
                  </div>

                  {/* Content View / Edit mode */}
                  <div className="p-4 rounded-xl bg-white border border-[#e2ebd9] shadow-sm relative">
                    {isEditing ? (
                      <textarea
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        rows={7}
                        className="w-full text-sm text-[#17301F] font-sans leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#336443] p-1 resize-y"
                      />
                    ) : (
                      <div className="text-sm text-[#17301F] font-sans leading-relaxed whitespace-pre-wrap">
                        {editedText || generatedResult.text}
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#17301F] bg-white border border-[#d2ded0] hover:bg-[#f5f8f3] transition-colors shadow-sm"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied to Clipboard</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-[#557A60]" />
                            <span>Copy Content</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsEditing(!isEditing)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border shadow-sm ${
                          isEditing
                            ? 'bg-[#336443] text-white border-[#336443]'
                            : 'bg-white text-[#17301F] border-[#d2ded0] hover:bg-[#f5f8f3]'
                        }`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{isEditing ? 'Done Editing' : 'Edit Text'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleGenerate}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[#557A60] hover:text-[#17301F] hover:bg-white transition-colors"
                        title="Regenerate message"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Regenerate</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('translate')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#336443] bg-[#336443]/10 hover:bg-[#336443]/20 transition-colors border border-[#336443]/20"
                      >
                        <Languages className="w-3.5 h-3.5" />
                        <span>Translate Now</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUseInCampaign(generatedResult)}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#234A2D] to-[#336443] hover:from-[#336443] hover:to-[#234A2D] shadow-sm transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Use in Campaign</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-[#e2ebd9] flex items-center justify-center text-[#7FA68A] shadow-sm mb-3">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-[#17301F] font-display">
                    Your generated communication will appear here
                  </h3>
                  <p className="text-xs text-[#557A60] mt-1 max-w-sm">
                    Choose a quick scenario or type your prompt on the left, then click Generate Content.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TRANSLATE CONTENT */}
          {activeTab === 'translate' && (
            <div className="space-y-4 animate-fade-in">
              <TranslationPanel
                sourceText={isEditing ? editedText : (generatedResult?.text || '')}
                onUseTranslation={(item) => {
                  navigate('/campaigns/create', {
                    state: {
                      prefilledContent: item.text,
                      language: item.language,
                      channel: generatedResult?.channel || channel,
                      suggestedTitle: prompt.slice(0, 40),
                    },
                  });
                }}
              />
            </div>
          )}

          {/* TAB 3: RECENT GENERATIONS HISTORY */}
          {activeTab === 'history' && (
            <div className="card-peaceful p-5 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-[#e2ebd9]">
                <div>
                  <h3 className="text-sm font-bold text-[#17301F] font-display">
                    Recent Session Generations
                  </h3>
                  <p className="text-xs text-[#557A60]">
                    Local workspace cache. Click any item to preview or translate.
                  </p>
                </div>
                {history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Cache</span>
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#557A60]">
                  No recent generations recorded in this session.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => loadFromHistory(item)}
                      className="p-3 rounded-xl border border-[#e2ebd9] bg-white/70 hover:bg-white hover:border-[#85AB8B] transition-all cursor-pointer shadow-sm flex items-start justify-between gap-3 group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#17301F] font-display">
                            {item.prompt ? item.prompt.slice(0, 50) + '...' : 'Public Advisory'}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#eef4ec] text-[#336443] font-medium capitalize">
                            {item.contentLength || 'standard'}
                          </span>
                          <span className="text-[10px] text-[#7FA68A] uppercase font-semibold">
                            {item.channel}
                          </span>
                        </div>
                        <p className="text-xs text-[#557A60] line-clamp-2 leading-relaxed">
                          {item.text}
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="text-[10px] text-[#7FA68A] block">
                          {item.timestamp}
                        </span>
                        <span className="text-xs text-[#336443] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                          Load →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
