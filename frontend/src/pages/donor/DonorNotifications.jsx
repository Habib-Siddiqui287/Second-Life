import React, { useState, useEffect } from 'react';
import { notificationService } from '../../services/savedItemService';
import { useToast } from '../../context/ToastContext';
import { Bell, Check, CheckCheck, Clock } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function DonorNotifications() {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = () => {
    setLoading(true);
    notificationService.getNotifications()
      .then((data) => setNotifications(data.notifications || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      showToast('All notifications marked as read.', 'success');
      fetchNotifs();
    } catch (err) {}
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {}
  };

  if (loading) return <LoadingSpinner text="Loading notifications..." />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Notifications</h1>
          <p className="text-xs text-slate-500">Stay updated on item requests, courier milestones, and impact updates.</p>
        </div>
        <button
          onClick={handleMarkAllRead}
          className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#15803D] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Mark All as Read</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-soft divide-y divide-slate-50 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No notifications to display right now.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleMarkRead(n.id)}
              className={`p-5 flex items-start gap-4 hover:bg-slate-50/70 transition-colors cursor-pointer ${
                !n.is_read ? 'bg-emerald-50/30' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#15803D] flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-xs text-slate-900">{n.title}</h4>
                  <span className="text-[10px] text-slate-400 font-medium">{n.time_ago}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
