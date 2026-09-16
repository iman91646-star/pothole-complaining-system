import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MapPin, Lock, Mail, AlertCircle, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';

interface UserLoginProps {
  onNavigate: (path: string) => void;
}

export function UserLogin({ onNavigate }: UserLoginProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), password);
      onNavigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center mx-auto shadow-md">
            <MapPin className="w-6 h-6" />
          </div>
          <h2 id="login-heading" className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Citizen Login
          </h2>
          <p className="text-xs text-slate-500">
            Sign in to track your road damage complaints and review municipal responses
          </p>
        </div>

        {error && (
          <div
            id="login-error-alert"
            className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-800"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="login-email-input"
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="login-password-input"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-medium"
              />
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 active:scale-99 text-slate-950 font-extrabold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In to Dashboard
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer links */}
        <div className="pt-4 border-t border-slate-100 space-y-3 text-center">
          <p className="text-xs text-slate-600">
            Don't have an account?{' '}
            <button
              id="switch-to-register-btn"
              onClick={() => onNavigate('/register')}
              className="font-bold text-amber-600 hover:text-amber-700 underline cursor-pointer"
            >
              Create Citizen Account
            </button>
          </p>

          <div>
            <button
              id="switch-to-admin-login-link"
              onClick={() => onNavigate('/admin/login')}
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              Authorized Administrator Access
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
