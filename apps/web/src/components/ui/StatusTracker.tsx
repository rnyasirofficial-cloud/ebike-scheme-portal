import React from 'react';
import { CheckCircle2, Clock, Check, AlertCircle } from 'lucide-react';
import { ApplicationStatus } from '@ebike/shared';

interface StatusTrackerProps {
  currentStatus: ApplicationStatus | string;
  rejectionReason?: string;
  rejectionRemarks?: string;
}

const STEPS = [
  { id: 'SUBMITTED', label: 'Submitted', desc: 'Application Received' },
  { id: 'VERIFIED', label: 'Verified', desc: 'HEC University Verified' },
  { id: 'SELECTED', label: 'Selected', desc: 'Balloting / Draw Winner' },
  { id: 'ALLOCATED', label: 'Allocated', desc: 'Assigned to Center' },
  { id: 'DELIVERED', label: 'Delivered', desc: 'Handover Completed' },
];

export default function StatusTracker({
  currentStatus,
  rejectionReason,
  rejectionRemarks,
}: StatusTrackerProps) {
  const isRejected = currentStatus === 'REJECTED';

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 0;
      case 'VERIFIED':
        return 1;
      case 'SELECTED':
        return 2;
      case 'ALLOCATED':
        return 3;
      case 'DELIVERED':
        return 4;
      default:
        return 0;
    }
  };

  const currentIndex = isRejected ? 1 : getStepIndex(currentStatus);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Application Milestone Tracker
          </h3>
          <p className="text-xs text-slate-500">
            Provincial E-Mobility Lifecycle Progress
          </p>
        </div>

        {isRejected ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
            <AlertCircle className="w-3.5 h-3.5" />
            Verification Disqualified
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="w-3.5 h-3.5" />
            Active Stage: {currentStatus}
          </span>
        )}
      </div>

      {isRejected && rejectionRemarks && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs">
          <p className="font-bold">Institutional Review Note:</p>
          <p className="mt-1">{rejectionRemarks}</p>
        </div>
      )}

      {/* Progress Bar Container */}
      <div className="relative">
        <div className="hidden sm:block absolute top-5 left-8 right-8 h-1 bg-slate-200 -z-0">
          <div
            className="h-full bg-gradient-to-r from-[#1FA37B] via-[#0E8C82] to-[#1565C0] transition-all duration-500"
            style={{
              width: `${(currentIndex / (STEPS.length - 1)) * 100}%`,
            }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
          {STEPS.map((step, index) => {
            const isCompleted = !isRejected && index < currentIndex;
            const isCurrent = !isRejected && index === currentIndex;
            const isFuture = !isRejected && index > currentIndex;
            const isStepRejected = isRejected && index === currentIndex;

            return (
              <div
                key={step.id}
                className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2"
              >
                {/* Node Circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-sm ${
                    isStepRejected
                      ? 'bg-red-500 text-white ring-4 ring-red-100'
                      : isCompleted
                      ? 'bg-[#1FA37B] text-white ring-4 ring-emerald-100'
                      : isCurrent
                      ? 'bg-[#0E8C82] text-white ring-4 ring-teal-100 animate-pulse'
                      : 'bg-white border-2 border-slate-300 text-slate-400'
                  }`}
                >
                  {isStepRejected ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : isCompleted ? (
                    <Check className="w-5 h-5 stroke-[3]" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                {/* Text Labels */}
                <div>
                  <div
                    className={`text-xs font-bold ${
                      isStepRejected
                        ? 'text-red-600'
                        : isCompleted || isCurrent
                        ? 'text-slate-900'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {step.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
