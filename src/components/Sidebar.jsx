import React from 'react';
import { Link, NavLink } from 'react-router-dom';
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
  X,
} from 'lucide-react';

export default function Sidebar({ mode = 'donor', mobileOpen = false, onClose = () => {} }) {
  const { user, logout } = useAuth();
  const profileImage = user?.profile?.image || '';

  const initials =
    user?.initials ||
    user?.name
      ?.split(' ')
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ||
    'SL';

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

  const handleLogout = () => {
    onClose();
    logout();
  };

  const handleNavClick = () => {
    onClose();
  };

  const content = (
    <>
      <div className="h-20 shrink-0 px-5 border-b border-slate-50 flex items-center">
        <Link
          to="/"
          onClick={handleNavClick}
          className="w-full flex items-center gap-3 group hover:opacity-90 transition-opacity"
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white flex items-center justify-center shadow-sm border border-slate-100 shrink-0 group-hover:scale-105 transition-transform">
            <img
              src="/images/IMG-20260831-WA0000.jpg.jpeg"
              alt="SecondLife"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-extrabold text-slate-900 text-base leading-none">
              Second<span className="text-[#15803D]">Life</span>
            </span>
            <span className="text-[8px] font-bold tracking-widest text-slate-400 uppercase mt-1 truncate">
              GIVE THINGS A SECOND LIFE
            </span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 min-h-0 p-3 sm:p-4 space-y-1.5 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <NavLink
              key={link.name}
              to={link.path}
              end={link.path === '/donor' || link.path === '/receiver' || link.path === '/admin'}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#15803D] text-white shadow-sm'
                    : link.highlight
                    ? 'text-[#15803D] bg-emerald-50/70 hover:bg-emerald-100/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 min-w-0 truncate">{link.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="shrink-0 p-4 border-t border-slate-100 space-y-2 bg-white">
        <div className="flex items-center gap-3 px-2 py-1.5 min-w-0">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-[#15803D] text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
            {profileImage ? (
              <img src={profileImage} alt={user?.name || 'Profile'} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-slate-900 truncate">
              {user?.name || 'SecondLife User'}
            </span>
            <span className="text-[10px] text-emerald-700 font-medium capitalize">
              {user?.role?.toLowerCase() || 'user'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 lg:w-72 bg-white border-r border-slate-100 flex-col shrink-0 h-screen sticky top-0">
        {content}
      </aside>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="md:hidden fixed inset-0 z-[60] bg-slate-900/35 backdrop-blur-[2px]"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 z-[70] w-[min(86vw,320px)] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!mobileOpen}
      >
        <div className="absolute top-5 right-4 z-10">
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {content}
      </aside>
    </>
  );
}
