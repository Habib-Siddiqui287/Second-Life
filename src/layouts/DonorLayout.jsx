import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import NotificationDropdown from '../components/NotificationDropdown';
import ChatWidget from '../components/ChatWidget';
import { useAuth } from '../context/AuthContext';
import { Search, Plus } from 'lucide-react';

export default function DonorLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex bg-[#F0F7FB]">
      <Sidebar mode="donor" />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-extrabold text-slate-900">
              Welcome back, {user?.name ? user.name.split(' ')[0] : 'Donor'} 👋
            </h2>
            <span className="text-xs text-slate-400 hidden sm:inline">
              Ready to make an impact today?
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/donor/donations/create"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-[#15803D] hover:bg-[#0F5D28] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Donate an Item</span>
            </Link>
            <NotificationDropdown />
            <div className="w-8 h-8 rounded-full bg-[#15803D] text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
              {user?.initials || 'SL'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
      <ChatWidget />
    </div>
  );
}
