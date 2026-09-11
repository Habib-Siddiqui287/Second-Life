import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F0F7FB] p-4 sm:p-6">
      <Link to="/" className="flex items-center gap-3 mb-8 group">
        <div className="w-10 h-10 rounded-2xl bg-[#0F5D28] flex items-center justify-center text-white font-extrabold text-base shadow-sm group-hover:scale-105 transition-transform">
          SL
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-slate-900 text-xl leading-none">
            Second<span className="text-[#15803D]">Life</span>
          </span>
          <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase mt-1">
            GIVE THINGS A SECOND LIFE
          </span>
        </div>
      </Link>
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
}
