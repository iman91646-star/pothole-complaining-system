import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Notification } from '../types';
import {
  Shield,
  Bell,
  LogOut,
  PlusCircle,
  LayoutDashboard,
  ShieldAlert,
  CheckCheck,
  MapPin,
  X,
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenReportModal?: () => void;
}

export function Navbar({ currentPath, onNavigate, onOpenReportModal }: NavbarProps) {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!user || user.role === 'admin') return;
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications);
    } catch {
      // ignore in background polling
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll notifications every 10s
    return () => clearInterval(interval);
  }, [user]);

  // Click outside to close notification dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    try {
      if (!notif.read) {
        await api.markNotificationRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
        );
      }
      setShowNotifications(false);
      onNavigate(`/complaint/${notif.complaintId}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <button
              id="brand-logo-btn"
              onClick={() => onNavigate(user?.role === 'admin' ? '/admin/dashboard' : '/dashboard')}
              className="flex items-center gap-2.5 text-left focus:outline-hidden group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-amber-400 shadow-xs group-hover:bg-slate-800 transition">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-slate-900 block leading-tight">
                  PotholeTrack
                </span>
                <span className="text-[11px] font-medium text-slate-500 block leading-none">
                  Municipal Road Repair
                </span>
              </div>
            </button>

            {/* Navigation links if logged in */}
            {user && (
              <nav className="hidden md:flex items-center gap-1">
                {user.role === 'admin' ? (
                  <button
                    id="nav-admin-dashboard-link"
                    onClick={() => onNavigate('/admin/dashboard')}
                    className={`px-3 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition ${
                      currentPath === '/admin/dashboard'
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Shield className="w-4 h-4 text-amber-600" />
                    Admin Control Center
                  </button>
                ) : (
                  <button
                    id="nav-user-dashboard-link"
                    onClick={() => onNavigate('/dashboard')}
                    className={`px-3 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition ${
                      currentPath === '/dashboard'
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 text-slate-600" />
                    My Complaints
                  </button>
                )}
              </nav>
            )}
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* User Report Button (Citizen only) */}
                {user.role === 'user' && onOpenReportModal && (
                  <button
                    id="nav-report-pothole-btn"
                    onClick={onOpenReportModal}
                    className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm shadow-xs transition active:scale-98 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Report a Pothole
                  </button>
                )}

                {/* Notifications Menu (Citizen) */}
                {user.role === 'user' && (
                  <div className="relative" ref={notifRef}>
                    <button
                      id="notifications-toggle-btn"
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition focus:outline-hidden"
                      aria-label="View notifications"
                    >
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-slate-950">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>

                    {/* Notification Dropdown */}
                    {showNotifications && (
                      <div
                        id="notifications-dropdown"
                        className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white border border-slate-200 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                      >
                        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
                          <div className="flex items-center gap-2">
                            <Bell className="w-4 h-4 text-slate-700" />
                            <span className="text-xs font-bold text-slate-800">
                              System Notifications ({notifications.length})
                            </span>
                          </div>
                          {unreadCount > 0 && (
                            <button
                              onClick={handleMarkAllRead}
                              className="text-[11px] font-medium text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCheck className="w-3.5 h-3.5" />
                              Mark all as read
                            </button>
                          )}
                        </div>

                        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                          {notifications.length === 0 ? (
                            <div className="p-6 text-center text-xs text-slate-500">
                              No notifications yet. You will be alerted when an administrator reviews your report.
                            </div>
                          ) : (
                            notifications.map((notif) => (
                              <div
                                key={notif.id}
                                onClick={() => handleNotificationClick(notif)}
                                className={`p-3 text-left hover:bg-slate-50 transition cursor-pointer ${
                                  !notif.read ? 'bg-amber-50/50' : ''
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <span className="text-xs font-bold text-slate-900">
                                    {notif.complaintId}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    {new Date(notif.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-700 mt-1 leading-snug">
                                  {notif.message}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* User Info / Role Badge */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-slate-900 leading-tight">
                      {user.name}
                    </p>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${
                        user.role === 'admin'
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>

                  <button
                    id="logout-btn"
                    onClick={() => {
                      logout();
                      onNavigate(user.role === 'admin' ? '/admin/login' : '/login');
                    }}
                    title="Log Out"
                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="nav-login-btn"
                  onClick={() => onNavigate('/login')}
                  className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                >
                  Citizen Login
                </button>
                <button
                  id="nav-register-btn"
                  onClick={() => onNavigate('/register')}
                  className="px-3.5 py-1.5 text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg shadow-xs transition"
                >
                  Sign Up
                </button>
                <button
                  id="nav-admin-portal-link"
                  onClick={() => onNavigate('/admin/login')}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition border border-slate-200"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  Admin Portal
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
