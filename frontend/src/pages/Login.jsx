import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio, Lock, User, Eye, EyeOff, AlertCircle, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BoomerangVideoBg from '../components/BoomerangVideoBg';

const BG_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260511_131941_d136af49-e243-493a-be14-6ff3f24e09e6.mp4';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cardVisible, setCardVisible] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setCardVisible(true), 150);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter your username and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        'Authentication failed. Please verify credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setUsername('admin');
    setPassword('Admin@123');
    setError('');
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Left side — video background */}
      <div className="hidden lg:block lg:w-1/2 xl:w-3/5 relative">
        <BoomerangVideoBg src={BG_VIDEO} className="absolute inset-0 w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#1f2a1d]/20 z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1f2a1d]/60 via-transparent to-transparent z-[1]" />

        {/* Overlay content */}
        <div className="absolute bottom-10 left-10 right-10 z-10 max-w-md">
          <div className="flex items-center gap-2 text-white/90 mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">AI-Powered Platform</span>
          </div>
          <h2 className="text-2xl xl:text-3xl font-display text-white leading-tight mb-3">
            Communicate with purpose.<br />
            <span className="text-[#85AB8B]">Reach every citizen.</span>
          </h2>
          <p className="text-white/70 text-sm leading-relaxed max-w-sm">
            Generate, translate, and broadcast public awareness messages
            across 12 Indian languages in seconds.
          </p>
        </div>
      </div>

      {/* Right side — login form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-8 lg:p-12 bg-[#f8faf7] relative">
        {/* Decorative background orbs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#85AB8B]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#336443]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Back to landing */}
        <div className="absolute top-6 left-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm font-medium text-[#4b5b47] hover:text-[#1f2a1d] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        <div
          className={`w-full max-w-md relative z-10 transition-all duration-700 ease-out ${
            cardVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {/* Brand Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1f2a1d] to-[#336443] text-white shadow-xl shadow-[#1f2a1d]/20 mb-5">
              <Radio className="w-7 h-7 text-[#85AB8B]" />
            </div>
            <h1 className="text-2xl font-bold text-[#1f2a1d] font-display tracking-tight">
              GovComm AI
            </h1>
            <p className="text-sm text-[#4b5b47] mt-1">
              Multilingual Mass Communication Platform
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl p-8 shadow-glass border border-[#e4ebe1]/80">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-[#1f2a1d]">Welcome back</h2>
              <p className="text-xs text-[#4b5b47] mt-1">
                Sign in with your administrator credentials
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 animate-fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#4b5b47] uppercase tracking-wider mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#85AB8B]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="w-full pl-10 pr-3 py-3 bg-[#f8faf7] border border-[#e4ebe1] rounded-xl text-sm text-[#1f2a1d] placeholder-[#85AB8B]/60 focus:outline-none focus:ring-2 focus:ring-[#336443]/30 focus:border-[#336443] focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4b5b47] uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#85AB8B]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-10 py-3 bg-[#f8faf7] border border-[#e4ebe1] rounded-xl text-sm text-[#1f2a1d] placeholder-[#85AB8B]/60 focus:outline-none focus:ring-2 focus:ring-[#336443]/30 focus:border-[#336443] focus:bg-white transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#85AB8B] hover:text-[#336443] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-3 px-4 bg-[#1f2a1d] hover:bg-[#2a3827] text-white rounded-xl text-sm font-semibold shadow-lg shadow-[#1f2a1d]/15 flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* Google Sign-in Preparation */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#e4ebe1]" />
              </div>
              <div className="relative flex justify-center text-[11px]">
                <span className="bg-white px-2 text-[#7FA68A]">or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="w-full py-2.5 px-4 bg-[#f8faf7] hover:bg-[#f0f4ef] border border-[#e4ebe1] hover:border-[#85AB8B] text-[#1f2a1d] rounded-xl text-xs font-semibold flex items-center justify-center gap-2.5 transition-all duration-200"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Link to Signup */}
            <div className="mt-4 text-center">
              <p className="text-xs text-[#4b5b47]">
                New creator?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="font-bold text-[#336443] hover:text-[#1f2a1d] underline decoration-[#85AB8B] underline-offset-2 transition-colors"
                >
                  Don't have an account? Create one
                </button>
              </p>
            </div>

            {/* Demo Quick-Fill */}
            <div className="mt-5 pt-4 border-t border-[#e4ebe1] flex items-center justify-between">
              <span className="text-xs text-[#4b5b47]">Demo Mode:</span>
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-xs font-semibold text-[#336443] hover:text-[#1f2a1d] bg-[#85AB8B]/10 hover:bg-[#85AB8B]/20 px-3 py-1.5 rounded-lg border border-[#85AB8B]/20 transition-all"
              >
                Auto-fill credentials
              </button>
            </div>
          </div>

          {/* Footer info */}
          <p className="text-center text-xs text-[#4b5b47] mt-6">
            Powered by Groq AI &bull; IndicTrans2 &bull; PostgreSQL &bull; JWT Auth
          </p>
        </div>
      </div>
    </div>
  );
};
