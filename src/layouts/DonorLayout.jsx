import React, { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Bell, Menu, Plus } from 'lucide-react';

import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

export default function DonorLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileImage = user?.profile?.image || '';

  const initials =
    user?.initials ||
    user?.name?.split(' ').map((word) => word[0]).join('').slice(0, 2).toUpperCase() ||
    'SL';

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
      <Sidebar mode="donor" mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <div className="flex-1 min-w-0 w-0 flex flex-col">
        <header className="h-16 sm:h-20 bg-white border-b border-gray-200 flex items-center justify-between gap-3 px-3 sm:px-6 shrink-0 sticky top-0 z-40">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-xl font-extrabold text-slate-900 truncate">
                Welcome back, {user?.name || 'User'} 👋
              </h1>
              <p className="text-sm text-slate-400 mt-0.5 hidden sm:block">Ready to make an impact today?</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
            <Link to="/donor/donations/create" className="hidden sm:inline-flex items-center gap-2 px-4 lg:px-5 py-2.5 lg:py-3 bg-[#15803D] hover:bg-[#0F5D28] text-white text-sm font-bold rounded-2xl shadow-sm transition-all">
              <Plus className="w-5 h-5" />
              <span>Donate an Item</span>
            </Link>
            <Link to="/donor/donations/create" className="sm:hidden w-10 h-10 rounded-xl bg-[#15803D] text-white flex items-center justify-center" aria-label="Donate an Item">
              <Plus className="w-5 h-5" />
            </Link>
            <button type="button" onClick={() => navigate('/donor/notifications')} className="relative w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-[#15803D] transition-colors" aria-label="Notifications">
              <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-emerald-600 rounded-full border-2 border-white" />
            </button>
            <Link to="/donor/settings" className="w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden bg-[#15803D] text-white flex items-center justify-center font-extrabold text-xs sm:text-sm uppercase shrink-0" aria-label="Profile Settings">
              {profileImage ? <img src={profileImage} alt={user?.name || 'Profile'} className="w-full h-full object-cover" /> : initials}
            </Link>
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
