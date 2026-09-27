import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen w-full bg-[#F0F7FB]">
      <div className="w-full">
        <Link
          to="/"
          className="flex items-center justify-center gap-3 py-6 group"
        >
          <div className="w-10 h-10 rounded-2xl overflow-hidden bg-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <img src="/images/items/image1.jpeg" alt="SecondLife" className="w-full h-full object-cover" />
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
      </div>

      <main className="w-full">
        <Outlet />
      </main>
    </div>
  );
}