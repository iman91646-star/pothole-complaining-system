import React from 'react';
import { ComplaintSeverity } from '../types';
import { AlertTriangle, Flame, ShieldAlert, Info } from 'lucide-react';

interface SeverityBadgeProps {
  severity: ComplaintSeverity;
  size?: 'sm' | 'md';
}

export function SeverityBadge({ severity, size = 'md' }: SeverityBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-medium',
    md: 'px-2.5 py-1 text-xs font-semibold',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
  };

  switch (severity) {
    case 'Critical':
      return (
        <span
          id={`severity-badge-${severity.toLowerCase()}`}
          className={`inline-flex items-center gap-1 rounded-md bg-red-100 text-red-800 border border-red-300 font-bold ${sizeClasses[size]}`}
        >
          <Flame className={iconSizes[size]} />
          Critical
        </span>
      );
    case 'High':
      return (
        <span
          id={`severity-badge-${severity.toLowerCase()}`}
          className={`inline-flex items-center gap-1 rounded-md bg-orange-100 text-orange-800 border border-orange-300 ${sizeClasses[size]}`}
        >
          <AlertTriangle className={iconSizes[size]} />
          High
        </span>
      );
    case 'Medium':
      return (
        <span
          id={`severity-badge-${severity.toLowerCase()}`}
          className={`inline-flex items-center gap-1 rounded-md bg-amber-100 text-amber-800 border border-amber-300 ${sizeClasses[size]}`}
        >
          <ShieldAlert className={iconSizes[size]} />
          Medium
        </span>
      );
    case 'Low':
    default:
      return (
        <span
          id={`severity-badge-${severity.toLowerCase()}`}
          className={`inline-flex items-center gap-1 rounded-md bg-slate-100 text-slate-700 border border-slate-300 ${sizeClasses[size]}`}
        >
          <Info className={iconSizes[size]} />
          Low
        </span>
      );
  }
}
