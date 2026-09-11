import React from 'react';
import { ShieldCheck, Building2, User } from 'lucide-react';

export default function UserAvatar({ name = 'User', role = 'DONOR', accountType = 'INDIVIDUAL', isVerified = false, size = 'md' }) {
  const initials = name
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('') || 'SL';

  const sizeStyles = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  };

  const bgStyles =
    role === 'ADMIN'
      ? 'bg-slate-900 text-white'
      : role === 'DONOR'
      ? 'bg-[#15803D] text-white'
      : 'bg-teal-700 text-white';

  return (
    <div className="relative inline-block shrink-0">
      <div
        className={`${sizeStyles[size] || sizeStyles.md} ${bgStyles} rounded-2xl flex items-center justify-center font-extrabold shadow-sm tracking-wider`}
      >
        {accountType === 'ORGANIZATION' ? (
          <Building2 className={size === 'xl' ? 'w-10 h-10' : size === 'lg' ? 'w-7 h-7' : 'w-4 h-4'} />
        ) : (
          initials
        )}
      </div>
      {isVerified && (
        <span
          title="Verified SecondLife Account"
          className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm text-emerald-600"
        >
          <ShieldCheck className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
        </span>
      )}
    </div>
  );
}
