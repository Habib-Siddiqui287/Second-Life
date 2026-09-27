import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from '../components/Sidebar';

export default function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const closeOnResize = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', closeOnResize);
    return () => window.removeEventListener('resize', closeOnResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen w-full bg-[#F0F7FB] flex overflow-x-hidden">
      <Sidebar mode="admin" mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <div className="flex-1 min-w-0 w-0 flex flex-col">
        <header className="h-16 sm:h-20 bg-white border-b border-gray-200 flex items-center gap-3 px-3 sm:px-6 shrink-0 sticky top-0 z-40">
          <button type="button" onClick={() => setMobileMenuOpen(true)} className="md:hidden w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0" aria-label="Open navigation">
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-extrabold text-gray-800 truncate">Admin Dashboard</h1>
            <p className="hidden sm:block text-xs text-slate-400 mt-0.5">SecondLife platform administration</p>
          </div>
        </header>

        <main className="flex-1 min-w-0 p-3 sm:p-5 lg:p-6 overflow-x-hidden">
          <div className="w-full min-w-0 max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
