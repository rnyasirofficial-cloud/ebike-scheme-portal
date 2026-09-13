import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  variant: 'green' | 'blue';
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  badgeText?: string;
  badgeType?: 'success' | 'info' | 'warning' | 'neutral';
}

export default function KpiCard({
  variant,
  title,
  value,
  subtitle,
  icon: Icon,
  badgeText,
  badgeType = 'info',
}: KpiCardProps) {
  const isGreen = variant === 'green';

  const badgeStyles = {
    success: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    info: 'bg-blue-100 text-blue-800 border-blue-300',
    warning: 'bg-amber-100 text-amber-800 border-amber-300',
    neutral: 'bg-slate-100 text-slate-800 border-slate-300',
  };

  return (
    <div
      className={`rounded-xl p-5 shadow-sm transition-all duration-200 hover:shadow-md ${
        isGreen ? 'kpi-card-green' : 'kpi-card-blue'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">
            {value}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-600 font-medium">
              {subtitle}
            </p>
          )}
        </div>

        {Icon && (
          <div
            className={`p-2.5 rounded-xl ${
              isGreen ? 'bg-[#1FA37B]/15 text-[#0E8C82]' : 'bg-[#1565C0]/15 text-[#1565C0]'
            }`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {badgeText && (
        <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${
              badgeStyles[badgeType]
            }`}
          >
            {badgeText}
          </span>
        </div>
      )}
    </div>
  );
}
