import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import NotificationDropdown from '../components/NotificationDropdown';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck } from 'lucide-react';

export default function AdminLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex bg-[#F0F7FB]">
      <Sidebar mode="admin" />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-extrabold text-slate-900">
              SecondLife Platform Administration
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <NotificationDropdown />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                AD
              </div>
              <span className="text-xs font-bold text-slate-800 hidden sm:inline">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
