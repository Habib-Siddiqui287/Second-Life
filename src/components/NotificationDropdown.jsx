import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { notificationService } from '../services/savedItemService';

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const fetchNotifications = () => {
    notificationService.getNotifications()
      .then((data) => {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {}
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {}
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-600 rounded-full ring-2 ring-white animate-pulse" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-emerald-100 text-[#15803D] text-[10px] font-extrabold rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No notifications right now.
              </div>
            ) : (
              notifications.slice(0, 8).map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleMarkRead(notif.id)}
                  className={`p-3.5 hover:bg-slate-50 transition-colors flex items-start gap-3 cursor-pointer ${
                    !notif.is_read ? 'bg-emerald-50/40' : ''
                  }`}
                >
                  <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-emerald-600 opacity-80" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 leading-tight mb-1">
                      {notif.title}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {notif.time_ago}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="px-4 pt-2 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400 font-medium">
              SecondLife Notification Center
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
