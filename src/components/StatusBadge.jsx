import React from 'react';
import { CheckCircle2, Clock, AlertCircle, RefreshCw, Truck, CheckCheck, XCircle, ShieldCheck } from 'lucide-react';

export default function StatusBadge({ status, size = 'md' }) {
  const normalized = (status || '').toUpperCase();

  const configs = {
    AVAILABLE: { label: 'Available', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle2 },
    PENDING: { label: 'Pending Review', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock },
    MATCHED: { label: 'Matched', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: RefreshCw },
    ACCEPTED: { label: 'Schedule Confirmed', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', icon: CheckCircle2 },
    IN_PROGRESS: { label: 'In Transit', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', icon: Truck },
    IN_DELIVERY: { label: 'Out for Delivery', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', icon: Truck },
    DELIVERED: { label: 'Delivered', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', icon: CheckCheck },
    COMPLETED: { label: 'Completed', bg: 'bg-emerald-100', text: 'text-emerald-900', border: 'border-emerald-300', icon: CheckCheck },
    CANCELLED: { label: 'Cancelled', bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200', icon: XCircle },
    VERIFIED: { label: 'Verified', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: ShieldCheck },
    REJECTED: { label: 'Rejected', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: XCircle },
  };

  const config = configs[normalized] || {
    label: status,
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
    icon: Clock
  };

  const Icon = config.icon;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
    </span>
  );
}
