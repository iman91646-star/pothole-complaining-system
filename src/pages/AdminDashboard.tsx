import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Complaint, AdminStats } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { SeverityBadge } from '../components/SeverityBadge';
import {
  Shield,
  Search,
  Filter,
  RefreshCw,
  FolderOpen,
  Calendar,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  Eye,
  AlertCircle,
  FileSpreadsheet,
  MapPin,
  User,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface AdminDashboardProps {
  onOpenComplaint: (complaintId: string) => void;
}

export function AdminDashboard({ onOpenComplaint }: AdminDashboardProps) {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    total: 0,
    newComplaints: 0,
    underReview: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0,
    highOrCritical: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search and Filter controls
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const fetchAdminData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await api.getAdminComplaints({
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        severity: severityFilter !== 'all' ? severityFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
      });

      setComplaints(res.complaints);
      setStats(res.stats);
    } catch (err) {
      console.error('Failed to load admin complaints:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    // Live interval to check for new citizen submissions every 6s
    const timer = setInterval(() => {
      fetchAdminData(true);
    }, 6000);
    return () => clearInterval(timer);
  }, [searchQuery, statusFilter, severityFilter, priorityFilter, categoryFilter]);

  // Is a complaint "new"? (Submitted within the last 24 hours or status is 'Submitted')
  const isNewComplaint = (createdAt: string, status: string) => {
    const diff = Date.now() - new Date(createdAt).getTime();
    return status === 'Submitted' || diff < 24 * 60 * 60 * 1000;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              Administrative Portal
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-medium">Municipal Road Operations</span>
          </div>
          <h1 id="admin-dashboard-title" className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1.5 text-white">
            PotholeTrack Administration
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Logged in as <span className="text-amber-400 font-bold">{user?.name || 'Admin1234'}</span>. Real-time complaint moderation and maintenance workflow dispatch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="admin-refresh-btn"
            onClick={() => fetchAdminData(true)}
            disabled={refreshing}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-2 border border-slate-700 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-amber-400' : ''}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Real Database Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total */}
        <div id="admin-stat-total" className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Total</span>
            <FileSpreadsheet className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-mono">{stats.total}</p>
          <span className="text-[10px] text-slate-500 block">All recorded</span>
        </div>

        {/* New Complaints Alert */}
        <div id="admin-stat-new" className="bg-white p-4 rounded-2xl border-2 border-amber-300 shadow-xs bg-amber-50/20">
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              New
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
              Alert
            </span>
          </div>
          <p className="text-2xl font-extrabold text-amber-900 font-mono">{stats.newComplaints}</p>
          <span className="text-[10px] text-amber-800 font-medium block">Action required</span>
        </div>

        {/* Under Review */}
        <div id="admin-stat-under-review" className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Under Review</span>
            <Eye className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-amber-900 font-mono">{stats.underReview}</p>
          <span className="text-[10px] text-slate-500 block">Inspection stage</span>
        </div>

        {/* In Progress */}
        <div id="admin-stat-in-progress" className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-orange-600 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">In Progress</span>
            <AlertCircle className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-orange-900 font-mono">{stats.inProgress}</p>
          <span className="text-[10px] text-slate-500 block">Active repairs</span>
        </div>

        {/* Resolved */}
        <div id="admin-stat-resolved" className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Resolved</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-900 font-mono">{stats.resolved}</p>
          <span className="text-[10px] text-slate-500 block">Completed</span>
        </div>

        {/* High / Critical Priority */}
        <div id="admin-stat-critical" className="bg-white p-4 rounded-2xl border border-rose-200 shadow-xs bg-rose-50/30">
          <div className="flex items-center justify-between text-rose-700 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">High / Critical</span>
            <Flame className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-extrabold text-rose-900 font-mono">{stats.highOrCritical}</p>
          <span className="text-[10px] text-rose-700 font-medium block">Urgent priority</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="admin-search-input"
              type="text"
              placeholder="Search by Complaint ID, citizen name, location, or area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium text-slate-800"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status */}
            <select
              id="admin-filter-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-semibold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>

            {/* Severity */}
            <select
              id="admin-filter-severity"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-semibold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Priority */}
            <select
              id="admin-filter-priority"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-semibold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Category */}
            <select
              id="admin-filter-category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-semibold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">All Categories</option>
              <option value="Small Pothole">Small Pothole</option>
              <option value="Large Pothole">Large Pothole</option>
              <option value="Multiple Potholes">Multiple Potholes</option>
              <option value="Road Damage">Road Damage</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              All Citizen Road Hazard Complaints ({complaints.length})
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-600">Querying complaints repository...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div id="admin-empty-complaints" className="py-16 text-center space-y-3">
            <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <FolderOpen className="w-7 h-7" />
            </div>
            <div className="max-w-sm mx-auto">
              <h3 className="text-sm font-bold text-slate-900">No pothole complaints found.</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                New complaints filed by citizens will instantly display in this management log.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Complaint ID</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {complaints.map((item) => {
                  const isNew = isNewComplaint(item.createdAt, item.status);
                  return (
                    <tr
                      key={item.id}
                      id={`admin-table-row-${item.complaintId.toLowerCase()}`}
                      className="hover:bg-slate-50/80 transition group"
                    >
                      {/* Complaint ID + New Alert */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-900">
                            {item.complaintId}
                          </span>
                          {isNew && (
                            <span
                              id={`badge-new-${item.complaintId.toLowerCase()}`}
                              className="px-1.5 py-0.5 bg-amber-500 text-slate-950 font-extrabold text-[10px] rounded-sm tracking-wide animate-pulse"
                            >
                              NEW
                            </span>
                          )}
                        </div>
                      </td>

                      {/* User */}
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-bold text-slate-900">{item.userName}</p>
                          <p className="text-[11px] text-slate-400">{item.userEmail}</p>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-semibold text-slate-800">{item.location}</p>
                          <p className="text-[11px] text-slate-500">
                            {item.area}, {item.city}
                          </p>
                        </div>
                      </td>

                      {/* Severity */}
                      <td className="py-3 px-4">
                        <SeverityBadge severity={item.severity} size="sm" />
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-bold border border-slate-200">
                          {item.priority}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <StatusBadge status={item.status} size="sm" />
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <button
                          id={`admin-manage-btn-${item.complaintId.toLowerCase()}`}
                          onClick={() => onOpenComplaint(item.complaintId)}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          Review & Manage
                          <ExternalLink className="w-3 h-3 text-amber-400" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
