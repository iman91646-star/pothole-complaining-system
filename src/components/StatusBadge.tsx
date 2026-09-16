import React from 'react';
import { ComplaintStatus } from '../types';
import { Clock, Eye, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-medium',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-semibold',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  switch (status) {
    case 'Submitted':
      return (
        <span
          id={`status-badge-${status.toLowerCase().replace(/\s+/g, '-')}`}
          className={`inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses[size]}`}
        >
          <Clock className={iconSizes[size]} />
          Submitted
        </span>
      );
    case 'Under Review':
      return (
        <span
          id={`status-badge-${status.toLowerCase().replace(/\s+/g, '-')}`}
          className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 ${sizeClasses[size]}`}
        >
          <Eye className={iconSizes[size]} />
          Under Review
        </span>
      );
    case 'In Progress':
      return (
        <span
          id={`status-badge-${status.toLowerCase().replace(/\s+/g, '-')}`}
          className={`inline-flex items-center gap-1.5 rounded-full bg-orange-50 text-orange-800 border border-orange-200 ${sizeClasses[size]}`}
        >
          <AlertCircle className={iconSizes[size]} />
          In Progress
        </span>
      );
    case 'Resolved':
      return (
        <span
          id={`status-badge-${status.toLowerCase().replace(/\s+/g, '-')}`}
          className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 ${sizeClasses[size]}`}
        >
          <CheckCircle2 className={iconSizes[size]} />
          Resolved
        </span>
      );
    case 'Rejected':
      return (
        <span
          id={`status-badge-${status.toLowerCase().replace(/\s+/g, '-')}`}
          className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 ${sizeClasses[size]}`}
        >
          <XCircle className={iconSizes[size]} />
          Rejected
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 ${sizeClasses[size]}`}>
          {status}
        </span>
      );
  }
}
