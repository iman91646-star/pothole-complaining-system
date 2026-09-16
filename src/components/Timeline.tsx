import React from 'react';
import { ComplaintStatus } from '../types';
import { Check, Clock, Eye, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

interface TimelineProps {
  currentStatus: ComplaintStatus;
}

const STEPS: { status: ComplaintStatus; label: string; description: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { status: 'Submitted', label: 'Submitted', description: 'Complaint filed and logged', icon: Clock },
  { status: 'Under Review', label: 'Under Review', description: 'Assessed by road authorities', icon: Eye },
  { status: 'In Progress', label: 'In Progress', description: 'Maintenance team deployed', icon: AlertCircle },
  { status: 'Resolved', label: 'Resolved', description: 'Pothole repaired & verified', icon: CheckCircle2 },
];

export function Timeline({ currentStatus }: TimelineProps) {
  const isRejected = currentStatus === 'Rejected';

  const getStepIndex = (status: ComplaintStatus) => {
    switch (status) {
      case 'Submitted':
        return 0;
      case 'Under Review':
        return 1;
      case 'In Progress':
        return 2;
      case 'Resolved':
        return 3;
      case 'Rejected':
        return -1;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(currentStatus);

  if (isRejected) {
    return (
      <div id="timeline-rejected" className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3">
        <XCircle className="w-6 h-6 text-rose-600 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-bold text-rose-900">Complaint Rejected</h4>
          <p className="text-xs text-rose-700">
            This report was reviewed and rejected. Please see administrator remarks for specific details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="status-timeline" className="w-full py-2">
      {/* Desktop horizontal timeline */}
      <div className="hidden sm:grid grid-cols-4 relative">
        {/* Background track line */}
        <div className="absolute top-4 left-[12.5%] right-[12.5%] h-1 bg-slate-200 -z-0" />
        {/* Active track progress */}
        <div
          className="absolute top-4 left-[12.5%] h-1 bg-emerald-600 transition-all duration-500 -z-0"
          style={{ width: `${Math.min(100, (currentIndex / (STEPS.length - 1)) * 75)}%` }}
        />

        {STEPS.map((step, idx) => {
          const isPassed = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const StepIcon = step.icon;

          return (
            <div key={step.status} className="flex flex-col items-center text-center relative z-10">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isPassed
                    ? 'bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-50'
                    : isCurrent
                    ? 'bg-amber-600 text-white shadow-md ring-4 ring-amber-100 scale-110'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}
              >
                {isPassed ? <Check className="w-4 h-4 stroke-[3]" /> : <StepIcon className="w-4 h-4" />}
              </div>
              <div className="mt-2.5">
                <p
                  className={`text-xs font-bold ${
                    isCurrent
                      ? 'text-amber-800'
                      : isPassed
                      ? 'text-emerald-800'
                      : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 max-w-[110px] leading-tight mx-auto">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile vertical timeline */}
      <div className="sm:hidden space-y-4 relative pl-6 border-l-2 border-slate-200 ml-3">
        {STEPS.map((step, idx) => {
          const isPassed = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const StepIcon = step.icon;

          return (
            <div key={step.status} className="relative">
              <div
                className={`absolute -left-[31px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center ${
                  isPassed
                    ? 'bg-emerald-600 text-white'
                    : isCurrent
                    ? 'bg-amber-600 text-white ring-4 ring-amber-100'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}
              >
                {isPassed ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <StepIcon className="w-3 h-3" />}
              </div>
              <div>
                <span
                  className={`text-xs font-bold ${
                    isCurrent ? 'text-amber-800' : isPassed ? 'text-emerald-800' : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </span>
                <p className="text-[11px] text-slate-500">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
