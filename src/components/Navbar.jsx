import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Bell, LogOut, LayoutDashboard } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin';
    if (user.role === 'DONOR') return '/donor';
    return '/receiver';
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Explore', path: '/categories' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  // Saved profile image from backend
  const profileImage = user?.profile?.image || '';

  // Fallback initials
  const profileInitials =
    user?.initials ||
    user?.name
      ?.split(' ')
      .filter(Boolean)
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ||
    'SL';

  const ProfileAvatar = ({ size = 'w-8 h-8', textSize = 'text-xs' }) => {
    if (profileImage) {
      return (
        <img
          src={profileImage}
          alt={user?.name || 'Profile'}
          className={`${size} rounded-full object-cover border border-slate-200 shadow-sm`}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      );
    }

    return (
      <div
        className={`${size} rounded-full bg-[#15803D] text-white flex items-center justify-center font-bold ${textSize} uppercase shadow-sm`}
      >
        {profileInitials}
      </div>
    );
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/images/items/image1.jpeg"
              alt="SecondLife"
              className="w-9 h-9 object-contain rounded-xl group-hover:scale-105 transition-transform"
            />

            <div className="flex flex-col">
              <span className="font-extrabold text-slate-900 text-lg leading-tight tracking-tight">
                Second<span className="text-[#15803D]">Life</span>
              </span>

              <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                GIVE THINGS A SECOND LIFE
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;

              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`transition-colors hover:text-[#15803D] ${
                    isActive ? 'text-[#15803D] font-bold' : ''
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right Auth / User Area */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">

                <NotificationDropdown />

                <Link
                  to={getDashboardLink()}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-[#15803D] hover:bg-emerald-100 rounded-xl text-xs font-bold transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                {/* User badge */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">

                  {/* PROFILE IMAGE */}
                  <ProfileAvatar />

                  <div className="hidden lg:flex flex-col">
                    <span className="text-xs font-bold text-slate-800 leading-tight">
                      {user?.name || 'User'}
                    </span>

                    <span className="text-[10px] text-emerald-700 font-medium capitalize">
                      {user?.role?.toLowerCase() || 'user'}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    title="Log Out"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-xs font-bold text-slate-700 hover:text-[#15803D] px-3 py-2 transition-colors"
                >
                  Sign In
                </Link>

                <Link
                  to="/register"
                  className="px-4 py-2.5 bg-[#15803D] hover:bg-[#0F5D28] text-white rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            {isAuthenticated && <NotificationDropdown />}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
            >
              {mobileOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3">

          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className="block text-sm font-semibold text-slate-700 hover:text-[#15803D] py-2"
            >
              {link.name}
            </Link>
          ))}

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">

            {isAuthenticated ? (
              <>
                {/* Mobile profile */}
                <div className="flex items-center gap-3 py-2">
                  <ProfileAvatar
                    size="w-10 h-10"
                    textSize="text-sm"
                  />

                  <div>
                    <div className="text-sm font-bold text-slate-800">
                      {user?.name || 'User'}
                    </div>

                    <div className="text-xs text-emerald-700 capitalize">
                      {user?.role?.toLowerCase() || 'user'}
                    </div>
                  </div>
                </div>

                <Link
                  to={getDashboardLink()}
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-2.5 bg-emerald-50 text-[#15803D] text-center font-bold text-xs rounded-xl"
                >
                  Open Dashboard ({user?.role})
                </Link>

                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                    navigate('/');
                  }}
                  className="w-full py-2.5 bg-rose-50 text-rose-600 text-center font-bold text-xs rounded-xl"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-2.5 border border-slate-200 text-center font-bold text-xs rounded-xl text-slate-700"
                >
                  Sign In
                </Link>

                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-2.5 bg-[#15803D] text-white text-center font-bold text-xs rounded-xl"
                >
                  Get Started
                </Link>
              </>
            )}

          </div>
        </div>
      )}
    </nav>
  );
}