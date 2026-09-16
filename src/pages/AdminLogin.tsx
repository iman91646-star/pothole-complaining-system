import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, UserCheck, AlertCircle, Loader2, KeyRound } from 'lucide-react';

interface AdminLoginProps {
  onNavigate: (path: string) => void;
}

export function AdminLogin({ onNavigate }: AdminLoginProps) {
  const { adminLogin } = useAuth();
  const [adminEmail, setAdminEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!adminEmail.trim() || !password) {
      setError('Please provide both administrator identifier and password.');
      return;
    }

    try {
      setLoading(true);
      await adminLogin(adminEmail.trim(), password);
      onNavigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid administrator credentials. Access restricted.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950/5">
      <div className="max-w-md w-full bg-slate-900 text-white p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        {/* Header - Distinct Admin Aesthetic */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center mx-auto shadow-lg ring-4 ring-amber-500/20">
            <Shield className="w-7 h-7" />
          </div>
          <h2 id="admin-login-heading" className="text-2xl font-extrabold tracking-tight text-white">
            PotholeTrack Admin
          </h2>
          <p id="admin-login-subtitle" className="text-xs font-semibold text-amber-400 uppercase tracking-widest">
            Authorized Administrator Access
          </p>
          <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
            Restricted municipal portal. All administrative operations are cryptographically verified and logged.
          </p>
        </div>

        {error && (
          <div
            id="admin-login-error"
            className="p-3.5 bg-rose-950/80 border border-rose-800 rounded-xl flex items-center gap-2.5 text-xs text-rose-200"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Admin Email / Username
            </label>
            <div className="relative">
              <UserCheck className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                id="admin-email-input"
                type="text"
                required
                autoComplete="username"
                placeholder="Admin username or email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-medium placeholder-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                id="admin-password-input"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-medium placeholder-slate-500"
              />
            </div>
          </div>

          <button
            id="admin-login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 active:scale-99 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer mt-3"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                Authenticating Administrator...
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4 text-slate-950" />
                Login as Admin
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800 text-center">
          <button
            id="back-to-citizen-portal-btn"
            onClick={() => onNavigate('/login')}
            className="text-xs text-slate-400 hover:text-white transition font-medium"
          >
            ← Return to Citizen Portal
          </button>
        </div>
      </div>
    </div>
  );
}
