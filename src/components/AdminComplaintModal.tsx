import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Complaint, ComplaintHistory, ComplaintStatus, ComplaintPriority } from '../types';
import { StatusBadge } from './StatusBadge';
import { SeverityBadge } from './SeverityBadge';
import { Timeline } from './Timeline';
import {
  X,
  MapPin,
  Calendar,
  User,
  Mail,
  Send,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  History,
  Shield,
  Clock,
  Flame,
} from 'lucide-react';

interface AdminComplaintModalProps {
  complaintId: string | null;
  onClose: () => void;
  onComplaintUpdated: (updated: Complaint) => void;
}

const STATUS_OPTIONS: ComplaintStatus[] = [
  'Submitted',
  'Under Review',
  'In Progress',
  'Resolved',
  'Rejected',
];

const PRIORITY_OPTIONS: ComplaintPriority[] = ['Low', 'Medium', 'High', 'Critical'];

export function AdminComplaintModal({
  complaintId,
  onClose,
  onComplaintUpdated,
}: AdminComplaintModalProps) {
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [history, setHistory] = useState<ComplaintHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form controls
  const [status, setStatus] = useState<ComplaintStatus>('Submitted');
  const [priority, setPriority] = useState<ComplaintPriority>('Medium');
  const [adminResponse, setAdminResponse] = useState('');

  useEffect(() => {
    if (!complaintId) {
      setComplaint(null);
      setHistory([]);
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        const res = await api.getComplaintDetails(complaintId!);
        setComplaint(res.complaint);
        setHistory(res.history);
        setStatus(res.complaint.status);
        setPriority(res.complaint.priority);
        setAdminResponse(res.complaint.adminResponse || '');
      } catch (err: any) {
        setError(err.message || 'Failed to load complaint data.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [complaintId]);

  if (!complaintId) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const res = await api.updateAdminComplaint(complaint.complaintId, {
        status,
        priority,
        adminResponse: adminResponse.trim(),
      });

      setComplaint(res.complaint);
      setHistory(res.history);
      setSuccessMessage('Complaint updated successfully! Notification dispatched to citizen.');
      onComplaintUpdated(res.complaint);
    } catch (err: any) {
      setError(err.message || 'Failed to update complaint.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      id="admin-complaint-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    >
      <div
        id="admin-complaint-modal-container"
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-300 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold font-mono text-amber-400">
                  {complaint ? complaint.complaintId : complaintId}
                </h3>
                {complaint && <StatusBadge status={complaint.status} size="sm" />}
              </div>
              <p className="text-xs text-slate-400">Administrator Incident Review & Dispatch</p>
            </div>
          </div>
          <button
            id="admin-close-modal-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[82vh] overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
              <p className="text-xs font-semibold text-slate-600">Loading complaint details...</p>
            </div>
          ) : error && !complaint ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
              {error}
            </div>
          ) : complaint ? (
            <>
              {successMessage && (
                <div
                  id="admin-update-success-alert"
                  className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2.5 text-xs text-emerald-900 font-bold"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Citizen Details & Location Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Complainant Info */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-500" />
                    Complainant Details
                  </h4>
                  <div className="text-xs space-y-1.5 pt-1">
                    <div>
                      <span className="text-slate-500 font-medium">Citizen Name: </span>
                      <span className="font-bold text-slate-900">{complaint.userName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Registered Email: </span>
                      <span className="font-semibold text-slate-800">{complaint.userEmail}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Logged Time: </span>
                      <span className="text-slate-700">{new Date(complaint.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Location Info */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-600" />
                    Incident Location
                  </h4>
                  <div className="text-xs space-y-1.5 pt-1">
                    <div>
                      <span className="text-slate-500 font-medium">Street: </span>
                      <span className="font-bold text-slate-900">{complaint.location}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Area / City: </span>
                      <span className="font-semibold text-slate-800">{complaint.area}, {complaint.city}</span>
                    </div>
                    {complaint.landmark && (
                      <div>
                        <span className="text-slate-500 font-medium">Landmark: </span>
                        <span className="font-semibold text-slate-800">{complaint.landmark}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Classification & Description */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">Reported Category:</span>
                    <span className="text-xs font-bold text-slate-900 px-2 py-0.5 bg-slate-100 rounded-md">
                      {complaint.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">Reported Severity:</span>
                    <SeverityBadge severity={complaint.severity} size="sm" />
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Citizen Description
                  </h5>
                  <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed whitespace-pre-wrap">
                    {complaint.description}
                  </p>
                </div>

                {complaint.imageUrl && (
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Attached Road Hazard Image
                    </h5>
                    <div className="rounded-lg border border-slate-200 overflow-hidden bg-slate-100 max-h-60 flex items-center justify-center">
                      <img
                        src={complaint.imageUrl}
                        alt="Road hazard documentation"
                        className="max-h-60 w-auto object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Administrator Action & Response Form */}
              <form onSubmit={handleUpdate} className="p-5 bg-amber-50/70 border-2 border-amber-300 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-amber-200">
                  <Shield className="w-4 h-4 text-amber-700" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950">
                    Administrator Action & Official Response
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Status Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Update Complaint Status <span className="text-rose-600">*</span>
                    </label>
                    <select
                      id="admin-select-status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as ComplaintStatus)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-semibold text-slate-900"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Priority Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Set Municipal Priority <span className="text-rose-600">*</span>
                    </label>
                    <select
                      id="admin-select-priority"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as ComplaintPriority)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-semibold text-slate-900"
                    >
                      {PRIORITY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Administrator Response Textarea */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Write response to user <span className="text-amber-800 text-[11px] font-normal">(Visible on Citizen Dashboard)</span>
                  </label>
                  <textarea
                    id="admin-response-textarea"
                    rows={3}
                    placeholder="e.g. The complaint has been received and is currently under review."
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 leading-relaxed text-slate-900 font-medium"
                  />
                  <p className="text-[11px] text-amber-900/80 mt-1">
                    This response will be saved to the database and will immediately show on the user's main dashboard.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    id="admin-send-response-btn"
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                        Saving to Database...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 text-amber-400" />
                        Send Response
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Complete Complaint History Audit Log */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                  <History className="w-4 h-4 text-slate-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Audit Log & Change History ({history.length})
                  </h4>
                </div>

                <div className="space-y-2">
                  {history.map((entry, idx) => (
                    <div
                      key={entry.id || idx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          {entry.previousStatus !== 'None'
                            ? `${entry.previousStatus} → ${entry.newStatus}`
                            : `Status: ${entry.newStatus}`}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(entry.changedAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-700">
                        <span className="font-medium text-slate-500">Remarks: </span>
                        {entry.remarks}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        <span className="font-medium">By: </span>
                        {entry.changedBy}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
