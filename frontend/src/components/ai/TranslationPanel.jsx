import React, { useState } from 'react';
import { Languages, Check, Copy, RefreshCw, AlertCircle, Sparkles, Send } from 'lucide-react';
import { translateContent } from '../../api/ai';

export const SUPPORTED_INDIC_LANGUAGES = [
  { code: 'Hindi', name: 'Hindi', native: 'हिन्दी', region: 'North/Central' },
  { code: 'Telugu', name: 'Telugu', native: 'తెలుగు', region: 'South' },
  { code: 'Tamil', name: 'Tamil', native: 'தமிழ்', region: 'South' },
  { code: 'Kannada', name: 'Kannada', native: 'ಕನ್ನಡ', region: 'South' },
  { code: 'Malayalam', name: 'Malayalam', native: 'മലയാളം', region: 'South' },
  { code: 'Marathi', name: 'Marathi', native: 'मराठी', region: 'West' },
  { code: 'Bengali', name: 'Bengali', native: 'বাংলা', region: 'East' },
  { code: 'Gujarati', name: 'Gujarati', native: 'ગુજરાતી', region: 'West' },
  { code: 'Punjabi', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', region: 'North' },
  { code: 'Odia', name: 'Odia', native: 'ଓଡ଼ିଆ', region: 'East' },
  { code: 'Urdu', name: 'Urdu', native: 'اردو', region: 'Pan-India' },
];

export const TranslationPanel = ({ sourceText, onUseTranslation }) => {
  const [selectedLangs, setSelectedLangs] = useState(['Hindi', 'Telugu']);
  const [translations, setTranslations] = useState({});
  const [loadingLangs, setLoadingLangs] = useState({});
  const [errorLangs, setErrorLangs] = useState({});
  const [copiedLang, setCopiedLang] = useState(null);
  const [isTranslatingAll, setIsTranslatingAll] = useState(false);

  const toggleLanguage = (langCode) => {
    setSelectedLangs((prev) =>
      prev.includes(langCode) ? prev.filter((l) => l !== langCode) : [...prev, langCode]
    );
  };

  const selectAll = () => {
    setSelectedLangs(SUPPORTED_INDIC_LANGUAGES.map((l) => l.code));
  };

  const clearAll = () => {
    setSelectedLangs([]);
  };

  const translateSingle = async (langCode) => {
    if (!sourceText || !sourceText.trim()) return;

    setLoadingLangs((prev) => ({ ...prev, [langCode]: true }));
    setErrorLangs((prev) => ({ ...prev, [langCode]: null }));

    try {
      const res = await translateContent({
        text: sourceText,
        sourceLanguage: 'English',
        targetLanguage: langCode,
      });

      setTranslations((prev) => ({
        ...prev,
        [langCode]: {
          text: res.translated_text,
          provider: res.provider || 'indictrans2',
          model: res.model || 'IndicTrans2-en-indic',
        },
      }));
    } catch (err) {
      console.error(`Translation error for ${langCode}:`, err);
      setErrorLangs((prev) => ({
        ...prev,
        [langCode]: err.response?.data?.message || err.response?.data?.detail || 'Translation failed',
      }));
    } finally {
      setLoadingLangs((prev) => ({ ...prev, [langCode]: false }));
    }
  };

  const translateAllSelected = async () => {
    if (!sourceText || !sourceText.trim() || selectedLangs.length === 0) return;
    setIsTranslatingAll(true);

    // Sequential to avoid slamming rate limits
    for (const langCode of selectedLangs) {
      await translateSingle(langCode);
    }
    setIsTranslatingAll(false);
  };

  const handleCopy = (langCode, text) => {
    navigator.clipboard.writeText(text);
    setCopiedLang(langCode);
    setTimeout(() => setCopiedLang(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header and language select bar */}
      <div className="card-peaceful p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="text-sm font-bold text-[#17301F] font-display flex items-center gap-2">
              <Languages className="w-4 h-4 text-[#336443]" />
              AI Indic Translation Studio
            </h3>
            <p className="text-xs text-[#557A60] mt-0.5">
              High-fidelity translation using IndicTrans2 (English → Indic Languages). Placeholders are strictly preserved.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={selectAll}
              className="text-[11px] font-medium text-[#336443] hover:underline"
            >
              Select All
            </button>
            <span className="text-[#85AB8B]/40">•</span>
            <button
              type="button"
              onClick={clearAll}
              className="text-[11px] font-medium text-[#557A60] hover:underline"
            >
              Clear
            </button>
            <button
              type="button"
              disabled={isTranslatingAll || selectedLangs.length === 0 || !sourceText}
              onClick={translateAllSelected}
              className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#336443] hover:bg-[#234A2D] text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              {isTranslatingAll ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Translating ({selectedLangs.length})...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Translate to Selected ({selectedLangs.length})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Language selector chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {SUPPORTED_INDIC_LANGUAGES.map((lang) => {
            const isSelected = selectedLangs.includes(lang.code);
            const isTranslated = !!translations[lang.code];
            const isLoading = !!loadingLangs[lang.code];

            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => toggleLanguage(lang.code)}
                className={`px-2.5 py-2 rounded-xl text-left border transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-[#336443] bg-[#336443]/10 text-[#17301F] ring-1 ring-[#336443]'
                    : 'border-[#e2ebd9] bg-white/60 hover:bg-white text-[#4a5e4c]'
                }`}
              >
                <div>
                  <p className="text-xs font-bold leading-none font-display">{lang.native}</p>
                  <p className="text-[10px] text-[#557A60] mt-1">{lang.name}</p>
                </div>
                {isLoading ? (
                  <RefreshCw className="w-3 h-3 text-[#336443] animate-spin flex-shrink-0" />
                ) : isTranslated ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Translated results display cards */}
      {selectedLangs.length === 0 ? (
        <div className="card-peaceful p-6 text-center text-[#557A60] text-xs">
          Select one or more Indian languages above to view translations.
        </div>
      ) : (
        <div className="space-y-3">
          {selectedLangs.map((langCode) => {
            const langMeta = SUPPORTED_INDIC_LANGUAGES.find((l) => l.code === langCode);
            const translation = translations[langCode];
            const isLoading = loadingLangs[langCode];
            const error = errorLangs[langCode];

            return (
              <div
                key={langCode}
                className="card-peaceful p-4 card-peaceful-hover relative overflow-hidden"
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#e2ebd9]">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#17301F] font-display">
                      {langMeta?.native || langCode}
                    </span>
                    <span className="text-xs text-[#557A60]">({langMeta?.name || langCode})</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#eef4ec] text-[#336443] font-medium border border-[#336443]/15">
                      IndicTrans2 Engine
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {translation && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleCopy(langCode, translation.text)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-[#234A2D] hover:bg-[#85AB8B]/20 transition-colors border border-[#85AB8B]/30"
                          title="Copy translation"
                        >
                          {copiedLang === langCode ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700 font-semibold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        {onUseTranslation && (
                          <button
                            type="button"
                            onClick={() => onUseTranslation({ language: langCode, text: translation.text })}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-white bg-[#336443] hover:bg-[#234A2D] shadow-sm transition-colors"
                            title="Use this version"
                          >
                            <Send className="w-3 h-3" />
                            <span>Use</span>
                          </button>
                        )}
                      </>
                    )}

                    <button
                      type="button"
                      disabled={isLoading || !sourceText}
                      onClick={() => translateSingle(langCode)}
                      className="p-1 text-[#557A60] hover:text-[#17301F] rounded-lg hover:bg-white transition-colors disabled:opacity-50"
                      title={translation ? 'Regenerate translation' : 'Translate now'}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Content Area */}
                {isLoading ? (
                  <div className="py-6 flex flex-col items-center justify-center text-center">
                    <RefreshCw className="w-5 h-5 text-[#336443] animate-spin mb-2" />
                    <p className="text-xs font-medium text-[#17301F]">
                      Translating to {langMeta?.name} with IndicTrans2...
                    </p>
                    <p className="text-[10px] text-[#557A60] mt-0.5">Preserving placeholders & linguistic nuances</p>
                  </div>
                ) : error ? (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                    <button
                      onClick={() => translateSingle(langCode)}
                      className="text-xs font-semibold underline hover:text-rose-900"
                    >
                      Retry
                    </button>
                  </div>
                ) : translation ? (
                  <div className="space-y-2">
                    <p className="text-sm text-[#17301F] leading-relaxed font-sans whitespace-pre-wrap">
                      {translation.text}
                    </p>
                    {/* Placeholder detection indicator */}
                    {translation.text.includes('{{') && (
                      <div className="pt-1 flex items-center gap-1.5 text-[10px] text-emerald-700 font-medium">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Dynamic campaign variables preserved intact</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-4 text-center">
                    <p className="text-xs text-[#557A60] mb-2">No translation generated yet for {langMeta?.name}.</p>
                    <button
                      type="button"
                      disabled={!sourceText}
                      onClick={() => translateSingle(langCode)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium text-[#336443] bg-white border border-[#85AB8B]/40 hover:bg-[#eef4ec] transition-colors"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Translate now</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
