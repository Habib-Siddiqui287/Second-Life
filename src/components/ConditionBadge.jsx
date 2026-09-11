import React from 'react';
import { Sparkles, Star, ThumbsUp, Wrench } from 'lucide-react';

export default function ConditionBadge({ condition }) {
  const configs = {
    NEW: { label: 'New in Box', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: Sparkles },
    LIKE_NEW: { label: 'Like New', bg: 'bg-teal-50 text-teal-800 border-teal-200', icon: Star },
    GOOD: { label: 'Good Condition', bg: 'bg-blue-50 text-blue-800 border-blue-200', icon: ThumbsUp },
    FAIR: { label: 'Fair Condition', bg: 'bg-amber-50 text-amber-800 border-amber-200', icon: Wrench },
  };

  const config = configs[condition] || { label: condition, bg: 'bg-slate-50 text-slate-700 border-slate-200', icon: ThumbsUp };
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${config.bg}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}
