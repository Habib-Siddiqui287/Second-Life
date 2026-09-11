import React from 'react';
import { PackageOpen } from 'lucide-react';

export default function EmptyState({ title = 'No items found', message = 'There are no records matching your criteria.', actionLabel, onAction, icon: Icon = PackageOpen }) {
  return (
    <div className="py-16 px-4 text-center flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-100 shadow-sm">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#15803D] flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 opacity-80" />
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 bg-[#15803D] hover:bg-[#0F5D28] text-white rounded-xl text-xs font-bold shadow-sm transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
