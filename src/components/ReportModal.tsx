import React, { useState } from 'react';
import { api } from '../api/client';
import { Complaint, ComplaintCategory, ComplaintSeverity } from '../types';
import {
  X,
  MapPin,
  Camera,
  AlertTriangle,
  UploadCloud,
  CheckCircle2,
  Trash2,
  Loader2,
  FileText,
} from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplaintCreated: (complaint: Complaint) => void;
}

const CATEGORIES: ComplaintCategory[] = [
  'Small Pothole',
  'Large Pothole',
  'Multiple Potholes',
  'Road Damage',
  'Other',
];

const SEVERITIES: { value: ComplaintSeverity; label: string; desc: string }[] = [
  { value: 'Low', label: 'Low', desc: 'Minor road surface dent, low traffic risk' },
  { value: 'Medium', label: 'Medium', desc: 'Noticeable crater, vehicles must brake or swerve' },
  { value: 'High', label: 'High', desc: 'Deep or wide pothole causing high danger to two-wheelers' },
  { value: 'Critical', label: 'Critical', desc: 'Severe hazard, immediate accident risk or structural failure' },
];

export function ReportModal({ isOpen, onClose, onComplaintCreated }: ReportModalProps) {
  const [location, setLocation] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [landmark, setLandmark] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('Large Pothole');
  const [severity, setSeverity] = useState<ComplaintSeverity>('High');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ complaintId: string } | null>(null);

  if (!isOpen) return null;

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result as string);
      setImageFileName(file.name);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!location.trim()) {
      setError('Street/Road Name is required.');
      return;
    }
    if (!area.trim()) {
      setError('Area is required.');
      return;
    }
    if (!city.trim()) {
      setError('City is required.');
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      setError('Please provide a detailed description (at least 10 characters).');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.createComplaint({
        location: location.trim(),
        area: area.trim(),
        city: city.trim(),
        landmark: landmark.trim() || undefined,
        category,
        severity,
        description: description.trim(),
        imageUrl: imageUrl || null,
      });

      setSuccessInfo({ complaintId: res.complaintId });
      onComplaintCreated(res.complaint);
    } catch (err: any) {
      setError(err.message || 'Failed to submit complaint. Please check your inputs and retry.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setSuccessInfo(null);
    setLocation('');
    setArea('');
    setCity('');
    setLandmark('');
    setDescription('');
    setImageUrl(null);
    setImageFileName('');
    setError(null);
    onClose();
  };

  return (
    <div
      id="report-pothole-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    >
      <div
        id="report-pothole-modal-container"
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Report a Pothole</h3>
              <p className="text-xs text-slate-400">File official road hazard complaint with municipal authority</p>
            </div>
          </div>
          <button
            id="close-report-modal-btn"
            onClick={resetAndClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {successInfo ? (
          <div id="report-success-state" className="p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-slate-900">
                Pothole complaint submitted successfully!
              </h4>
              <p className="text-sm text-slate-600 mt-1">
                Your complaint has been logged into the municipal database and dispatched for administrator review.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl inline-block max-w-sm w-full mx-auto">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Unique Tracking Reference
              </span>
              <span className="text-2xl font-mono font-extrabold text-amber-600 block mt-1 tracking-wider">
                {successInfo.complaintId}
              </span>
              <span className="text-xs text-slate-500 block mt-1">
                Initial Status:{' '}
                <span className="font-semibold text-blue-700">Submitted</span>
              </span>
            </div>

            <div className="pt-2">
              <button
                id="success-view-dashboard-btn"
                onClick={resetAndClose}
                className="w-full sm:w-auto px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition shadow-md cursor-pointer"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
            {error && (
              <div
                id="report-form-error"
                className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 text-xs"
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Section 1: Exact Location */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                <MapPin className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  1. Exact Location Details
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Street / Road Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="input-road-name"
                    type="text"
                    required
                    placeholder="e.g. College Main Road"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Area <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="input-area"
                    type="text"
                    required
                    placeholder="e.g. Eachanari"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="input-city"
                    type="text"
                    required
                    placeholder="e.g. Coimbatore"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Landmark <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    id="input-landmark"
                    type="text"
                    placeholder="e.g. Near Main Gate / Opposite Bus Stand"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Pothole Details & Severity */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  2. Pothole Classification & Severity
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <div className="space-y-1.5">
                    {CATEGORIES.map((cat) => (
                      <label
                        key={cat}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer transition ${
                          category === cat
                            ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="category"
                          value={cat}
                          checked={category === cat}
                          onChange={() => setCategory(cat)}
                          className="text-amber-600 focus:ring-amber-500"
                        />
                        {cat}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Severity Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Severity Level <span className="text-rose-500">*</span>
                  </label>
                  <div className="space-y-1.5">
                    {SEVERITIES.map((sev) => (
                      <label
                        key={sev.value}
                        className={`block p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                          severity === sev.value
                            ? sev.value === 'Critical'
                              ? 'bg-red-50 border-red-400 text-red-950 ring-1 ring-red-400'
                              : sev.value === 'High'
                              ? 'bg-orange-50 border-orange-400 text-orange-950 ring-1 ring-orange-400'
                              : 'bg-amber-50 border-amber-400 text-amber-950 ring-1 ring-amber-400'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="severity"
                              value={sev.value}
                              checked={severity === sev.value}
                              onChange={() => setSeverity(sev.value)}
                              className="text-amber-600 focus:ring-amber-500"
                            />
                            {sev.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 pl-5 leading-tight">
                          {sev.desc}
                        </p>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Description */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                <FileText className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  3. Description
                </h4>
              </div>

              <label className="block text-xs font-semibold text-slate-700">
                Describe the problem and hazard <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="input-description"
                rows={3}
                required
                placeholder="e.g. A large pothole is present near the main gate and is causing difficulty for two-wheelers."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500 leading-relaxed"
              />
              <p className="text-[11px] text-slate-500">
                Be specific about depth, size, visibility at night, or risk to vehicles.
              </p>
            </div>

            {/* Section 4: Optional Photo Upload */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                <Camera className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  4. Upload Photo <span className="text-slate-400 font-normal lowercase">(optional)</span>
                </h4>
              </div>

              {imageUrl ? (
                <div className="relative rounded-xl border border-slate-200 overflow-hidden max-h-48 bg-slate-100 flex items-center justify-center group">
                  <img
                    src={imageUrl}
                    alt="Pothole preview"
                    className="max-h-48 w-auto object-contain"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setImageUrl(null);
                        setImageFileName('');
                      }}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove Photo
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-xl p-5 text-center transition bg-slate-50/50"
                >
                  <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-slate-700">
                    Drag and drop your road photo here, or{' '}
                    <label className="text-amber-600 hover:text-amber-700 underline cursor-pointer">
                      browse files
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, WebP up to 5MB</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={resetAndClose}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="submit-complaint-btn"
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting Complaint...
                  </>
                ) : (
                  'Submit Complaint'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
