import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Complaint, ComplaintHistory } from '../types';
import { StatusBadge } from './StatusBadge';
import { SeverityBadge } from './SeverityBadge';
import { Timeline } from './Timeline';
import {
  X,
  MapPin,
  Calendar,
  MessageSquare,
  History,
  AlertCircle,
  Tag,
  Clock,
  CheckCircle2,
  ShieldCheck,
  User,
  Loader2,
} from 'lucide-react';

interface ComplaintDetailsModalProps {
  complaintId: string | null;
  onClose: () => void;
}

export function ComplaintDetailsModal({ complaintId, onClose }: ComplaintDetailsModalProps) {
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [history, setHistory] = useState<ComplaintHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!complaintId) {
      setComplaint(null);
      setHistory([]);
      return;
    }

    async function fetchDetails() {
      try {
        setLoading(true);
        setError(null);
        const res = await api.getComplaintDetails(complaintId!);
        setComplaint(res.complaint);
        setHistory(res.history);
      } catch (err: any) {
        setError(err.message || 'Unable to load complaint details.');
      } finally {
        setLoading(false);
      }
    }

    fetchDetails();
  }, [complaintId]);

  if (!complaintId) return null;

  return (
    <div
      id="complaint-details-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    >
      <div
        id="complaint-details-modal-container"
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-mono font-bold text-sm">
              ID
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold font-mono text-amber-400">
                  {complaint ? complaint.complaintId : complaintId}
                </h3>
                {complaint && <StatusBadge status={complaint.status} size="sm" />}
              </div>
              <p className="text-xs text-slate-400">Municipal Road Incident Record</p>
            </div>
          </div>
          <button
            id="close-details-modal-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
              <p className="text-xs font-semibold text-slate-600">Retrieving official complaint record...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ) : complaint ? (
            <>
              {/* Visual Status Timeline */}
              <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Complaint Progress Workflow
                  </h4>
                  <span className="text-xs font-semibold text-slate-600">
                    Current:{' '}
                    <span className="font-bold text-slate-900">{complaint.status}</span>
                  </span>
                </div>
                <Timeline currentStatus={complaint.status} />
              </div>

              {/* Latest Administrator Response Section - Prominently Displayed */}
              <div
                id="details-admin-response-block"
                className="p-5 bg-amber-50/70 border-2 border-amber-300/80 rounded-xl space-y-2 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-700" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950">
                      Latest Administrator Response
                    </h4>
                  </div>
                  {complaint.responseAt && (
                    <span className="text-[11px] font-medium text-amber-800 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(complaint.responseAt).toLocaleString()}
                    </span>
                  )}
                </div>

                {complaint.adminResponse ? (
                  <p className="text-sm font-medium text-slate-900 bg-white p-3.5 rounded-lg border border-amber-200 leading-relaxed">
                    "{complaint.adminResponse}"
                  </p>
                ) : (
                  <p className="text-xs italic text-amber-800 bg-white/60 p-3 rounded-lg border border-amber-200/60">
                    The complaint is awaiting administrator remarks or initial inspection notes.
                  </p>
                )}
              </div>

              {/* Pothole Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Location Box */}
                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-4 h-4 text-amber-600" />
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Location Information
                    </h5>
                  </div>
                  <div className="text-xs space-y-1.5 pt-1">
                    <div>
                      <span className="text-slate-500 font-medium">Street / Road: </span>
                      <span className="font-bold text-slate-900">{complaint.location}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Area / Locality: </span>
                      <span className="font-semibold text-slate-800">{complaint.area}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">City: </span>
                      <span className="font-semibold text-slate-800">{complaint.city}</span>
                    </div>
                    {complaint.landmark && (
                      <div>
                        <span className="text-slate-500 font-medium">Landmark: </span>
                        <span className="font-semibold text-slate-800">{complaint.landmark}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Details Box */}
                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Tag className="w-4 h-4 text-amber-600" />
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Severity & Priority
                    </h5>
                  </div>
                  <div className="text-xs space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Category:</span>
                      <span className="font-bold text-slate-900">{complaint.category}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Severity:</span>
                      <SeverityBadge severity={complaint.severity} size="sm" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Municipal Priority:</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-bold border border-slate-200">
                        {complaint.priority}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Reported Date:</span>
                      <span className="text-slate-700 font-medium">
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1.5">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Problem Description
                </h5>
                <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {complaint.description}
                </p>
              </div>

              {/* Uploaded Photo */}
              {complaint.imageUrl && (
                <div className="space-y-1.5">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Uploaded Road Photo
                  </h5>
                  <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 max-h-72 flex items-center justify-center">
                    <img
                      src={complaint.imageUrl}
                      alt={`Pothole report ${complaint.complaintId}`}
                      className="max-h-72 w-auto object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Complaint History Audit Log */}
              <div id="complaint-history-section" className="space-y-3 pt-2">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                  <History className="w-4 h-4 text-slate-700" />
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Audit & Activity History ({history.length})
                  </h5>
                </div>

                <div className="space-y-2.5">
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
                        <span className="text-[11px] text-slate-500">
                          {new Date(entry.changedAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-700">
                        <span className="font-medium text-slate-500">Remarks: </span>
                        {entry.remarks}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        <span className="font-medium">Action by: </span>
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
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
