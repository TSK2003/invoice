import React, { useState } from 'react';
import { LOGO_BASE64 } from '../../constants/imageAssets';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { authService } from '../../services/authService';

interface LoginPageProps {
  onLoginSuccess: () => void;
  sessionExpiredReason?: string | null;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  sessionExpiredReason,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(sessionExpiredReason || null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = authService.login(username, password);
      setIsLoading(false);

      if (result.success) {
        onLoginSuccess();
      } else {
        setErrorMessage(result.error || 'Authentication failed. Please verify credentials.');
      }
    }, 250);
  };

  return (
    <div className="min-h-screen bg-page flex flex-col items-center justify-center p-4 selection:bg-brand-100 selection:text-brand">
      <div className="max-w-[420px] w-full">
        {/* Main Login Card */}
        <div className="bg-surface border border-line rounded-md shadow-subtle p-7 sm:p-8 space-y-6">
          {/* Header & Logo */}
          <div className="text-center space-y-2">
            <img
              src={LOGO_BASE64}
              alt="AESCION Logo"
              className="h-11 w-auto mx-auto object-contain block"
            />
            <div className="pt-2">
              <h1 className="text-sm font-bold text-primary tracking-wider uppercase">
                Document Studio
              </h1>
              <p className="text-xs text-secondary mt-0.5 font-medium">
                Enterprise Invoicing & Quotation Portal
              </p>
            </div>
          </div>

          {/* Session Notification / Error Alert */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3 bg-page border border-line rounded-sm text-xs text-primary">
              <AlertCircle className="w-4 h-4 text-brand shrink-0 mt-0.5" />
              <span className="leading-snug">{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs" autoComplete="off">
            {/* Username / Email */}
            <div>
              <label className="block text-[11px] font-semibold text-secondary mb-1">
                Username / Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <input
                  type="email"
                  required
                  autoFocus
                  autoComplete="off"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="username"
                  className="w-full h-10 pl-9 pr-3 border border-line rounded-sm bg-surface text-primary text-xs focus:border-brand transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-semibold text-secondary mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="password"
                  className="w-full h-10 pl-9 pr-10 border border-line rounded-sm bg-surface text-primary text-xs font-medium focus:border-brand transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-brand hover:bg-brand-600 text-white font-semibold text-xs rounded-sm shadow-subtle transition-colors flex items-center justify-center gap-2 uppercase tracking-wider disabled:opacity-70 mt-2 cursor-pointer"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Document Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="pt-2 border-t border-line text-center">
            <div className="inline-flex items-center gap-1.5 text-[10.5px] text-secondary font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-brand" />
              <span>Protected Corporate Session · Auto-logout after 15m inactivity</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-4 text-center text-[10px] text-secondary">
          © {new Date().getFullYear()} AESCION EDTECH SOLUTIONS. All rights reserved.
        </div>
      </div>
    </div>
  );
};
