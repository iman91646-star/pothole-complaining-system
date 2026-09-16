import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Complaint, UserStats, Notification } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { SeverityBadge } from '../components/SeverityBadge';
import {
  PlusCircle,
  Clock,
  Eye,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  MapPin,
  Calendar,
  MessageSquare,
  Search,
  Filter,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  Bell,
  ArrowUpRight,
  FolderOpen,
} from 'lucide-react';

interface UserDashboardProps {
  onOpenReportModal: () => void;
  onOpenComplaintDetails: (complaintId: string) => void;
}

export function UserDashboard({ onOpenReportModal, onOpenComplaintDetails }: UserDashboardProps) {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    submitted: 0,
    underReview: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0,
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [complaintsRes, notifsRes] = await Promise.all([
        api.getUserComplaints(),
        api.getNotifications(),
      ]);

      setComplaints(complaintsRes.complaints);
      setStats(complaintsRes.stats);
      setNotifications(notifsRes.notifications);
    } catch (err) {
      console.error('Failed to load user dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Real-time polling every 8s to ensure administrator responses reflect automatically
    const timer = setInterval(() => {
      fetchData(true);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !q ||
      c.complaintId.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q) ||
      c.area.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || c.severity === severityFilter;

    return matchesQuery && matchesStatus && matchesSeverity;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome & Top Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
              Citizen Portal
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Official Road Hazard Reporting</span>
          </div>
          <h1 id="user-welcome-heading" className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Welcome, {user?.name || 'Citizen'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Track your road hazard submissions and review real-time municipal responses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="refresh-dashboard-btn"
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition border border-slate-200 disabled:opacity-50 cursor-pointer"
            title="Refresh Complaints Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-amber-600' : ''}`} />
          </button>

          <button
            id="report-pothole-main-btn"
            onClick={onOpenReportModal}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-bold text-sm rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Report a Pothole
          </button>
        </div>
      </div>

      {/* Real Database Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total */}
        <div id="stat-total-complaints" className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Filed</span>
            <FileSpreadsheet className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">{stats.total}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">All time complaints</span>
        </div>

        {/* Submitted */}
        <div id="stat-submitted-complaints" className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Submitted</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-900 font-mono">{stats.submitted}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Awaiting admin review</span>
        </div>

        {/* Under Review */}
        <div id="stat-under-review-complaints" className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Under Review</span>
            <Eye className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-900 font-mono">{stats.underReview}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Site assessment</span>
        </div>

        {/* In Progress */}
        <div id="stat-in-progress-complaints" className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-orange-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">In Progress</span>
            <AlertCircle className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-orange-900 font-mono">{stats.inProgress}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Crew working on road</span>
        </div>

        {/* Resolved */}
        <div id="stat-resolved-complaints" className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Resolved</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-900 font-mono">{stats.resolved}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Road repaired</span>
        </div>
      </div>

      {/* Notifications / Update Activity Section (Real events) */}
      {notifications.length > 0 && (
        <div id="dashboard-notifications-banner" className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-amber-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-950">
              Recent Complaint Updates & Administrator Actions
            </h3>
          </div>
          <div className="space-y-2">
            {notifications.slice(0, 3).map((notif) => (
              <div
                key={notif.id}
                onClick={() => onOpenComplaintDetails(notif.complaintId)}
                className="bg-white p-3 rounded-xl border border-amber-200 hover:border-amber-400 transition cursor-pointer flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 font-mono">
                        {notif.complaintId}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(notif.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 mt-0.5">{notif.message}</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Complaints List Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              My Pothole Complaints
            </h2>
            <p className="text-xs text-slate-500">
              Click any complaint card to view complete history and full details.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="search-my-complaints"
                type="text"
                placeholder="Search ID, road, area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 w-44 sm:w-56"
              />
            </div>

            <select
              id="filter-my-complaints-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-medium text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              id="filter-my-complaints-severity"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-medium text-slate-700"
            >
              <option value="all">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* Complaints Grid / Empty State */}
        {loading ? (
          <div className="py-20 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-600">Loading complaints from database...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div id="no-complaints-user-empty" className="py-16 px-4 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto ring-8 ring-amber-50/50">
              <FolderOpen className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                You haven't reported any potholes yet.
              </h3>
              <p className="text-xs text-slate-500">
                Report damaged road conditions in your neighborhood to alert municipal maintenance teams.
              </p>
            </div>
            <div>
              <button
                id="empty-state-report-btn"
                onClick={onOpenReportModal}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Report a Pothole
              </button>
            </div>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-2xl border border-slate-200">
            <p className="text-xs font-semibold text-slate-600">No complaints matching your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredComplaints.map((item) => (
              <div
                key={item.id}
                id={`complaint-card-${item.complaintId.toLowerCase()}`}
                onClick={() => onOpenComplaintDetails(item.complaintId)}
                className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 p-5 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between group space-y-4"
              >
                {/* Card Top: ID, Status, Severity */}
                <div>
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900 group-hover:text-amber-600 transition">
                        {item.complaintId}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        • {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <SeverityBadge severity={item.severity} size="sm" />
                      <StatusBadge status={item.status} size="sm" />
                    </div>
                  </div>

                  {/* Location & Category */}
                  <div className="mt-3 space-y-1">
                    <div className="flex items-start gap-1.5 text-xs text-slate-900 font-bold">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span>
                        {item.location}
                        {item.landmark ? `, Near ${item.landmark}` : ''}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 pl-5">
                      {item.area}, {item.city} • <span className="font-medium text-slate-700">{item.category}</span>
                    </p>
                  </div>

                  {/* Description preview */}
                  <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed pl-5">
                    {item.description}
                  </p>
                </div>

                {/* Card Bottom: Administrator Response (Prominently displayed) */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80">
                    <div className="flex items-center justify-between text-[11px] font-bold text-amber-900 mb-1">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                        Latest Administrator Response
                      </span>
                      {item.responseAt && (
                        <span className="text-[10px] font-normal text-amber-800">
                          {new Date(item.responseAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {item.adminResponse ? (
                      <p className="text-xs font-semibold text-slate-800 leading-snug">
                        "{item.adminResponse}"
                      </p>
                    ) : (
                      <p className="text-[11px] italic text-slate-500">
                        Pending municipal review. We will notify you once action is taken.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3 text-xs font-semibold text-slate-500 group-hover:text-amber-600 transition">
                    <span>View Timeline & Full Audit Log</span>
                    <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
