import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  PackagePlus,
  PackageCheck,
  Inbox,
  Truck,
  Bookmark,
  Sparkles,
  Bell,
  Settings,
  LogOut,
  Search,
  Users,
  Building2,
  ShieldCheck,
  BarChart3,
  Mail,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ mode = 'donor' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const donorLinks = [
    { name: 'Dashboard', path: '/donor', icon: LayoutDashboard },
    { name: 'Donate an Item', path: '/donor/donations/create', icon: PackagePlus, highlight: true },
    { name: 'My Donations', path: '/donor/donations', icon: PackageCheck },
    { name: 'Pickup Requests', path: '/donor/requests', icon: Inbox },
    { name: 'Scheduled Handovers', path: '/donor/connections', icon: Truck },
    { name: 'Saved Items', path: '/donor/saved', icon: Bookmark },
    { name: 'My Impact', path: '/donor/impact', icon: Sparkles },
    { name: 'Notifications', path: '/donor/notifications', icon: Bell },
    { name: 'Settings', path: '/donor/settings', icon: Settings },
  ];

  const receiverLinks = [
    { name: 'Dashboard', path: '/receiver', icon: LayoutDashboard },
    { name: 'Browse Donations', path: '/receiver/browse', icon: Search, highlight: true },
    { name: 'My Requests', path: '/receiver/requests', icon: Inbox },
    { name: 'Pickups & Deliveries', path: '/receiver/connections', icon: Truck },
    { name: 'Saved Items', path: '/receiver/saved', icon: Bookmark },
    { name: 'My Impact', path: '/receiver/impact', icon: Sparkles },
    { name: 'Notifications', path: '/receiver/notifications', icon: Bell },
    { name: 'Settings', path: '/receiver/settings', icon: Settings },
  ];

  const adminLinks = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Donors', path: '/admin/donors', icon: Users },
    { name: 'Receivers', path: '/admin/receivers', icon: Users },
    { name: 'Organizations', path: '/admin/organizations', icon: Building2 },
    { name: 'Verification Queue', path: '/admin/verification', icon: ShieldCheck, highlight: true },
    { name: 'Donations', path: '/admin/donations', icon: PackageCheck },
    { name: 'Item Requests', path: '/admin/requests', icon: Inbox },
    { name: 'Active Connections', path: '/admin/connections', icon: Truck },
    { name: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
    { name: 'Contact Messages', path: '/admin/messages', icon: Mail },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const links = mode === 'admin' ? adminLinks : mode === 'donor' ? donorLinks : receiverLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <Link to="/" className="p-6 border-b border-slate-50 flex items-center gap-3 group hover:opacity-90 transition-opacity">
        <div className="w-9 h-9 rounded-xl bg-[#0F5D28] flex items-center justify-center text-white font-extrabold text-sm shadow-sm group-hover:scale-105 transition-transform">
          SL
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-slate-900 text-base leading-none">
            Second<span className="text-[#15803D]">Life</span>
          </span>
          <span className="text-[8px] font-bold tracking-widest text-slate-400 uppercase mt-1">
            GIVE THINGS A SECOND LIFE
          </span>
        </div>
      </Link>

      {/* Navigation List */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.name}
              to={link.path}
              end={link.path === '/donor' || link.path === '/receiver' || link.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#15803D] text-white shadow-sm'
                    : link.highlight
                    ? 'text-[#15803D] bg-emerald-50/70 hover:bg-emerald-100/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{link.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom User Area & Logout */}
      <div className="p-4 border-t border-slate-100 space-y-2">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="w-8 h-8 rounded-full bg-[#15803D] text-white flex items-center justify-center font-bold text-xs uppercase">
            {user?.initials || 'SL'}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-slate-900 truncate">{user?.name}</span>
            <span className="text-[10px] text-emerald-700 font-medium capitalize">{user?.role?.toLowerCase()}</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
