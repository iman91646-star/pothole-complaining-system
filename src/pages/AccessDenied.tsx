import React from 'react';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';

interface AccessDeniedProps {
  onNavigate: (path: string) => void;
}

export function AccessDenied({ onNavigate }: AccessDeniedProps) {
  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div
        id="access-denied-container"
        className="max-w-md w-full bg-white p-8 rounded-3xl border-2 border-rose-200 shadow-xl text-center space-y-6"
      >
        <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto ring-8 ring-rose-50">
          <ShieldAlert className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <h2 id="access-denied-title" className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Access Denied
          </h2>
          <p id="access-denied-subtitle" className="text-sm font-bold text-rose-700">
            Administrator privileges required.
          </p>
          <p className="text-xs text-slate-600 leading-relaxed pt-1">
            Your current account does not have permission to access the municipal administrator dashboard.
            Only authorized administrator accounts can manage complaint statuses and dispatch road crews.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            id="return-to-dashboard-btn"
            onClick={() => onNavigate('/dashboard')}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Go to My Dashboard
          </button>

          <button
            id="go-to-admin-login-btn"
            onClick={() => onNavigate('/admin/login')}
            className="w-full sm:w-auto px-5 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            Admin Login
          </button>
        </div>
      </div>
    </div>
  );
}
