import React from 'react';

export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="py-16 flex flex-col items-center justify-center gap-3">
      <div className="w-10 h-10 rounded-full border-4 border-emerald-100 border-t-[#15803D] animate-spin" />
      <span className="text-xs font-semibold text-slate-400">{text}</span>
    </div>
  );
}
