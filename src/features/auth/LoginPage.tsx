import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LOGO_BASE64 } from '../../constants/imageAssets';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowRight, Loader2, UserPlus, LogIn, Info } from 'lucide-react';
import { useAuth } from '../../app/providers/AuthProvider';
import { requestPasswordReset } from '../../services/firebase/auth';

export const LoginPage: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetSentMessage, setResetSentMessage] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const { login, register, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setResetSentMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    if (mode === 'register') {
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please re-enter.');
        return;
      }

      try {
        await register(email.trim(), password);
        navigate(from, { replace: true });
      } catch (err: any) {
        setErrorMessage(err.message || 'Registration failed.');
      }
    } else {
      try {
        await login(email.trim(), password);
        navigate(from, { replace: true });
      } catch (err: any) {
        setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setErrorMessage('Please enter your email address above to receive a password reset link.');
      return;
    }
    setIsResetting(true);
    setErrorMessage(null);
    try {
      await requestPasswordReset(email);
      setResetSentMessage(`Password reset link sent to ${email.trim()}. Please check your inbox.`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send password reset email.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-4 selection:bg-brand-100 selection:text-brand-900">
      <div className="max-w-[440px] w-full">
        {/* Main Login Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/60 p-7 sm:p-9 space-y-6">
          {/* Header & Logo */}
          <div className="text-center space-y-2">
            <div className="inline-block p-3 rounded-xl bg-white border border-slate-100 shadow-sm">
              <img
                src={LOGO_BASE64}
                alt="AESCION Logo"
                className="h-10 w-auto mx-auto object-contain block"
              />
            </div>
            <div className="pt-2">
              <h1 className="text-base font-bold text-slate-900 tracking-wider uppercase">
                Document Studio
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Enterprise Invoicing & Quotation Portal
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMessage(null); }}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMessage(null); }}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                mode === 'register'
                  ? 'bg-white text-brand font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>

          {/* New Project Setup Info Callout */}
          <div className="p-3 bg-blue-50/80 border border-blue-100 rounded-xl flex items-start gap-2.5 text-xs text-blue-900">
            <Info className="w-4 h-4 text-brand shrink-0 mt-0.5" />
            <div className="leading-snug">
              {mode === 'login' ? (
                <span>
                  First time? Switch to <strong>Create Account</strong> above, or add a user in your <strong>Firebase Console</strong>.
                </span>
              ) : (
                <span>
                  Enter your email and password below to create your official administrator account.
                </span>
              )}
            </div>
          </div>

          {/* Session Notification / Error Alert */}
          {errorMessage && (
            <div
              role="alert"
              className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 animate-in fade-in duration-200"
            >
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span className="leading-snug font-medium">{errorMessage}</span>
            </div>
          )}

          {resetSentMessage && (
            <div
              role="status"
              className="flex items-start gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 animate-in fade-in duration-200"
            >
              <span className="leading-snug font-medium">{resetSentMessage}</span>
            </div>
          )}

          {/* Login / Register Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs" autoComplete="on">
            {/* Username / Email */}
            <div>
              <label htmlFor="login-email" className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact.aescion@gmail.com"
                  className="w-full h-11 pl-10 pr-3 border border-slate-300 rounded-xl bg-white text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="text-[11px] font-semibold text-slate-700">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={isResetting}
                    className="text-[11px] text-brand hover:text-brand-600 font-medium transition-colors"
                  >
                    {isResetting ? 'Sending...' : 'Forgot password?'}
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-10 border border-slate-300 rounded-xl bg-white text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Register Mode only) */}
            {mode === 'register' && (
              <div>
                <label htmlFor="login-confirm-password" className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 pl-10 pr-3 border border-slate-300 rounded-xl bg-white text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-brand hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md shadow-brand/20 transition-all flex items-center justify-center gap-2 uppercase tracking-wider disabled:opacity-60 mt-4 cursor-pointer active:scale-98"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{mode === 'login' ? 'Authenticating...' : 'Creating Account...'}</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In to Document Studio' : 'Create Account & Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="pt-3 border-t border-slate-100 text-center">
            <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Encrypted Firebase Cloud Authentication</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-4 text-center text-[11px] text-slate-400">
          © {new Date().getFullYear()} AESCION EDTECH SOLUTIONS. All rights reserved.
        </div>
      </div>
    </div>
  );
};
