import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Play, Sparkles, Menu, X, Globe, Radio, ArrowRight, Languages, Shield, Zap, MessageSquare, Mail, Phone, Bell } from 'lucide-react';
import BoomerangVideoBg from '../components/BoomerangVideoBg';

const BG_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260511_131941_d136af49-e243-493a-be14-6ff3f24e09e6.mp4';

const SUPPORTED_LANGUAGES = [
  'English', 'Hindi', 'Telugu', 'Tamil', 'Kannada',
  'Malayalam', 'Marathi', 'Bengali', 'Gujarati', 'Punjabi', 'Odia', 'Assamese'
];

const CHANNELS = [
  { icon: MessageSquare, label: 'SMS' },
  { icon: Mail, label: 'Email' },
  { icon: Phone, label: 'WhatsApp' },
  { icon: Bell, label: 'Push' },
];

export const LandingPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#languages', label: 'Languages' },
    { href: '#channels', label: 'Channels' },
  ];

  return (
    <div className="min-h-screen bg-[#f8faf7]">
      {/* ======================== HERO SECTION ======================== */}
      <section className="relative w-full min-h-screen sm:h-screen overflow-hidden">
        <BoomerangVideoBg src={BG_VIDEO} className="absolute inset-0 w-full h-full" />

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1f2a1d]/10 via-transparent to-[#1f2a1d]/40 z-[1]" />

        {/* ---- Navbar ---- */}
        <nav className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 sm:px-6 md:px-10 py-4 sm:py-6">
          <div className="flex items-center gap-2 text-[#2d3a2a]">
            <div className="w-8 h-8 rounded-lg bg-[#1f2a1d] flex items-center justify-center">
              <Radio className="w-4 h-4 text-[#85AB8B]" />
            </div>
            <span className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight font-display">
              GovComm<sup className="text-[10px] sm:text-xs font-medium text-[#85AB8B]">AI</sup>
            </span>
          </div>

          {/* Desktop nav pill */}
          <div className="hidden lg:flex items-center gap-1 bg-white/70 backdrop-blur-md rounded-full pl-6 pr-1 py-1 shadow-sm border border-white/60">
            {navLinks.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm px-3 py-2 transition-colors ${
                  i === 0 ? 'font-semibold text-[#1f2a1d]' : 'font-medium text-[#4b5b47] hover:text-[#1f2a1d]'
                }`}
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={() => navigate('/login')}
              className="ml-2 bg-[#1f2a1d] hover:bg-[#2a3827] text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors"
            >
              Try it Live
            </button>
          </div>

          {/* Right nav items */}
          <div className="flex items-center gap-3 sm:gap-6 text-[#2d3a2a]">
            <button
              onClick={() => navigate('/login')}
              className="hidden sm:flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="lg:hidden relative flex items-center justify-center w-10 h-10 rounded-full bg-white/70 backdrop-blur-md border border-white/60 text-[#1f2a1d] transition-all duration-300 hover:bg-white/90"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <Menu
                className={`w-5 h-5 absolute transition-all duration-300 ${
                  menuOpen ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
                }`}
              />
              <X
                className={`w-5 h-5 absolute transition-all duration-300 ${
                  menuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
                }`}
              />
            </button>
          </div>
        </nav>

        {/* Mobile menu overlay */}
        <div
          className={`lg:hidden fixed inset-0 z-20 transition-opacity duration-300 ${
            menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setMenuOpen(false)}
        >
          <div className="absolute inset-0 bg-[#1f2a1d]/40 backdrop-blur-sm" />
        </div>

        {/* Mobile menu drawer */}
        <div
          className={`lg:hidden fixed top-0 right-0 bottom-0 z-20 w-[85%] max-w-sm bg-white/95 backdrop-blur-xl shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            menuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full pt-24 px-8 pb-8">
            <div className="flex flex-col gap-1">
              {navLinks.map((link, i) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`text-2xl font-semibold text-[#1f2a1d] py-4 border-b border-[#1f2a1d]/10 transition-all duration-500 ${
                    menuOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
                  }`}
                  style={{ transitionDelay: menuOpen ? `${150 + i * 70}ms` : '0ms' }}
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div
              className={`mt-8 flex flex-col gap-4 transition-all duration-500 ${
                menuOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
              }`}
              style={{ transitionDelay: menuOpen ? '400ms' : '0ms' }}
            >
              <button
                onClick={() => { setMenuOpen(false); navigate('/login'); }}
                className="flex items-center gap-2 text-sm font-medium text-[#2d3a2a]"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
              <button
                onClick={() => { setMenuOpen(false); navigate('/login'); }}
                className="mt-2 bg-[#1f2a1d] hover:bg-[#2a3827] text-white text-sm font-semibold px-5 py-3 rounded-full transition-colors"
              >
                Try it Live
              </button>
            </div>
          </div>
        </div>

        {/* ---- Hero Copy ---- */}
        <div className="relative z-10 flex flex-col items-center text-center pt-24 sm:pt-28 md:pt-32 px-4 sm:px-6">
          <div
            className={`transition-all duration-1000 ease-out ${
              heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-md rounded-full px-4 py-1.5 shadow-sm border border-white/60 mb-6 sm:mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-[#2d3a2a]">AI-Powered Multilingual Platform</span>
            </div>

            <h1
              className="font-normal leading-[0.95] text-[#336443] text-[2rem] sm:text-4xl md:text-5xl lg:text-[4.75rem] xl:text-[5.25rem] max-w-5xl font-display"
            >
              Reach every citizen{' '}
              <span className="text-[#85AB8B]">
                in their
                <br className="hidden sm:block" /> own language
              </span>
            </h1>
            <p className="mt-6 sm:mt-8 text-[#4b5b47] text-sm sm:text-base md:text-lg leading-relaxed max-w-lg px-2 mx-auto">
              AI-driven content generation and real-time translation across 12 Indian languages.
              Mass communication that truly connects.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={() => navigate('/login')}
                className="group bg-[#1f2a1d] hover:bg-[#2a3827] text-white text-sm font-semibold px-7 py-3.5 rounded-full transition-all duration-300 shadow-lg shadow-[#1f2a1d]/20 hover:shadow-xl hover:shadow-[#1f2a1d]/30 flex items-center gap-2"
              >
                Launch Dashboard
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              <a
                href="#features"
                className="text-[#3d5638] text-sm font-semibold hover:opacity-80 transition-opacity flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                See how it works
              </a>
            </div>
          </div>
        </div>

        {/* Bottom-left CTA block */}
        <div className="absolute left-4 right-4 sm:right-auto sm:left-6 md:left-10 bottom-6 sm:bottom-8 md:bottom-10 z-10 max-w-sm">
          <div className="flex items-center gap-2 text-[#3d5638] sm:text-white/95 mb-3">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold sm:font-medium">
              IndicTrans2<sup className="text-[10px]">AI</sup>
            </span>
          </div>
          <p className="text-[#3d5638]/90 sm:text-white/85 text-xs leading-relaxed mb-6 max-w-xs font-medium sm:font-normal">
            Real AI4Bharat neural machine translation — not lookup tables.
            Placeholders like {'{{name}}'} are preserved perfectly across all translations.
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={() => navigate('/login')}
              className="bg-[#3d5638] sm:bg-white hover:bg-[#2d4228] sm:hover:bg-white/90 text-white sm:text-[#1f2a1d] text-sm font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-full transition-colors shadow-sm"
            >
              Try it Live
            </button>
            <a href="#features" className="text-[#3d5638] sm:text-white text-sm font-semibold sm:font-medium hover:opacity-80 transition-opacity">
              Know More.
            </a>
          </div>
        </div>

        {/* Bottom-right video link */}
        <div className="hidden sm:flex absolute right-6 md:right-10 bottom-8 md:bottom-10 z-10 items-center gap-2 text-white/90 text-sm">
          <button className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors">
            <Play className="w-3 h-3 fill-white text-white ml-0.5" />
          </button>
          <span className="font-medium">Platform Demo</span>
          <span className="text-white/60">1:35</span>
        </div>
      </section>

      {/* ======================== FEATURES SECTION ======================== */}
      <section id="features" className="py-20 sm:py-28 px-4 sm:px-6 md:px-10 bg-[#f8faf7]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#336443] bg-[#85AB8B]/15 rounded-full px-4 py-1.5 mb-4">
              <Zap className="w-3.5 h-3.5" />
              Platform Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display text-[#1f2a1d] leading-tight">
              Everything you need for<br />
              <span className="text-[#336443]">mass public awareness</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Sparkles,
                title: 'AI Content Generation',
                desc: 'Generate context-aware public health messages, emergency alerts, and awareness campaigns using Groq-powered LLMs with automatic fallback.',
                tag: 'Groq AI'
              },
              {
                icon: Languages,
                title: 'Neural Translation',
                desc: 'Real AI4Bharat IndicTrans2 neural machine translation across 12 Indian languages. Not lookup tables — actual deep learning inference.',
                tag: 'IndicTrans2'
              },
              {
                icon: Shield,
                title: 'Placeholder Protection',
                desc: 'Template variables like {{name}} and {{date}} are preserved exactly during translation using native tokenizer entity protection.',
                tag: 'Enterprise'
              },
              {
                icon: Globe,
                title: '12 Indian Languages',
                desc: 'Hindi, Telugu, Tamil, Kannada, Malayalam, Marathi, Bengali, Gujarati, Punjabi, Odia, Assamese — all powered by a single unified model.',
                tag: 'Indic NLP'
              },
              {
                icon: MessageSquare,
                title: 'Multi-Channel Delivery',
                desc: 'SMS, Email, WhatsApp, Push Notifications, Web Portal, and Social Media — reach citizens wherever they are.',
                tag: '6 Channels'
              },
              {
                icon: Zap,
                title: 'Campaign Workflows',
                desc: 'Full 7-step campaign creation pipeline: define, target audiences, generate content, select languages, choose channels, schedule, and review.',
                tag: 'Workflow'
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="group relative bg-white rounded-2xl p-7 border border-[#e4ebe1] shadow-card hover:shadow-card-hover transition-all duration-500 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#336443] to-[#85AB8B] flex items-center justify-center text-white shadow-sm">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#85AB8B] bg-[#85AB8B]/10 px-2.5 py-1 rounded-full">
                      {feature.tag}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#1f2a1d] mb-2">{feature.title}</h3>
                  <p className="text-sm text-[#4b5b47] leading-relaxed">{feature.desc}</p>

                  {/* Hover accent line */}
                  <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-[#336443] to-[#85AB8B] rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======================== LANGUAGES SECTION ======================== */}
      <section id="languages" className="py-20 sm:py-28 px-4 sm:px-6 md:px-10 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#336443] bg-[#85AB8B]/15 rounded-full px-4 py-1.5 mb-4">
                <Globe className="w-3.5 h-3.5" />
                Language Support
              </span>
              <h2 className="text-3xl sm:text-4xl font-display text-[#1f2a1d] leading-tight mb-6">
                One model,<br />
                <span className="text-[#336443]">twelve languages</span>
              </h2>
              <p className="text-[#4b5b47] text-sm sm:text-base leading-relaxed mb-8 max-w-md">
                Powered by AI4Bharat's IndicTrans2 neural machine translation model.
                English source text is translated in real-time to any supported Indic language
                with production-grade accuracy.
              </p>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-2 text-[#336443] font-semibold bg-[#336443]/5 px-3 py-1.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live on CPU
                </div>
                <div className="text-[#4b5b47] font-medium">~1.5s per translation</div>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {SUPPORTED_LANGUAGES.map((lang, i) => (
                <div
                  key={lang}
                  className="group relative bg-[#f8faf7] hover:bg-gradient-to-br hover:from-[#336443] hover:to-[#85AB8B] border border-[#e4ebe1] hover:border-transparent rounded-xl p-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg cursor-default"
                >
                  <span className="text-xs font-semibold text-[#1f2a1d] group-hover:text-white transition-colors duration-300">{lang}</span>
                  {i === 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======================== CHANNELS SECTION ======================== */}
      <section id="channels" className="py-20 sm:py-28 px-4 sm:px-6 md:px-10 bg-[#f8faf7]">
        <div className="max-w-6xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#336443] bg-[#85AB8B]/15 rounded-full px-4 py-1.5 mb-4">
            <Radio className="w-3.5 h-3.5" />
            Delivery Channels
          </span>
          <h2 className="text-3xl sm:text-4xl font-display text-[#1f2a1d] leading-tight mb-4">
            Reach citizens <span className="text-[#336443]">everywhere</span>
          </h2>
          <p className="text-[#4b5b47] text-sm sm:text-base max-w-lg mx-auto mb-12">
            Broadcast across all major communication channels from a single campaign workflow.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {CHANNELS.map((ch, i) => {
              const Icon = ch.icon;
              return (
                <div
                  key={ch.label}
                  className="group flex items-center gap-3 bg-white rounded-full px-6 py-3 border border-[#e4ebe1] shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5"
                >
                  <div className="w-8 h-8 rounded-full bg-[#85AB8B]/15 flex items-center justify-center text-[#336443] group-hover:bg-[#336443] group-hover:text-white transition-colors duration-300">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-[#1f2a1d]">{ch.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======================== CTA SECTION ======================== */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 md:px-10">
        <div className="max-w-4xl mx-auto relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1f2a1d] via-[#2d3a2a] to-[#336443] p-10 sm:p-16 text-center">
          {/* Decorative orbs */}
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#85AB8B]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-[#336443]/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display text-white leading-tight mb-6">
              Ready to modernize<br />
              <span className="text-[#85AB8B]">public communication?</span>
            </h2>
            <p className="text-white/70 text-sm sm:text-base max-w-md mx-auto mb-10">
              Join the platform that combines AI content generation, neural translation,
              and multi-channel delivery in one unified workflow.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="group bg-white hover:bg-white/90 text-[#1f2a1d] text-sm font-bold px-8 py-4 rounded-full transition-all duration-300 shadow-elevated hover:shadow-xl inline-flex items-center gap-2"
            >
              Get Started Now
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      {/* ======================== FOOTER ======================== */}
      <footer className="py-8 px-4 sm:px-6 md:px-10 border-t border-[#e4ebe1]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[#2d3a2a]">
            <Radio className="w-4 h-4 text-[#336443]" />
            <span className="text-sm font-semibold font-display">GovComm<sup className="text-[8px] text-[#85AB8B]">AI</sup></span>
          </div>
          <p className="text-xs text-[#4b5b47]">
            AI-Based Multilingual Mass Communication & Public Awareness Platform &bull; Powered by Groq + IndicTrans2
          </p>
        </div>
      </footer>
    </div>
  );
};
