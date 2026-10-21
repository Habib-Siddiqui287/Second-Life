import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/savedItemService';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Search, UserCheck, UserX, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';

export default function AdminReceivers() {
  const { showToast } = useToast();
  const [receivers, setReceivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

  const fetchReceivers = () => {
    setLoading(true);
    adminService.getUsers({ role: 'RECEIVER', search: search || undefined })
      .then((data) => setReceivers(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(fetchReceivers, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const toggleUserStatus = async (user) => {
    const newStatus = !user.is_active;
    const actionWord = newStatus ? 'activated' : 'suspended';
    try {
      await adminService.updateUserStatus(user.id, { is_active: newStatus });
      showToast(`Receiver ${user.name} has been ${actionWord}.`, 'success');
      setReceivers((prev) =>
        prev.map((r) => (r.id === user.id ? { ...r, is_active: newStatus } : r))
      );
    } catch (err) {
      showToast('Failed to update user status.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Receiver Management</h1>
          <p className="text-xs text-slate-500">
            Monitor and manage individual recipients and receiving community organizations.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search receivers by name, city, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 shadow-xs"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading receivers..." />
      ) : receivers.length === 0 ? (
        <EmptyState
          title="No receivers found"
          message="No registered receivers match your search criteria."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3.5 px-6">Receiver Details</th>
                  <th className="py-3.5 px-6">Entity</th>
                  <th className="py-3.5 px-6">Location</th>
                  <th className="py-3.5 px-6">Account Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                {receivers.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => r.profile?.image && setPreviewImage({ url: r.profile.image, name: r.name })} title={r.profile?.image ? "View profile picture" : "No profile picture uploaded"} className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-teal-700 text-white font-extrabold text-xs flex items-center justify-center">
                          {r.profile?.image ? <img src={r.profile.image} alt={r.name} className="w-full h-full object-cover" onError={(e) => { const button = e.currentTarget.parentElement; e.currentTarget.remove(); if (button) button.textContent = r.initials || r.name?.slice(0, 1) || '?'; }} /> : (r.initials || r.name?.slice(0, 1) || '?')}
                        </button>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-extrabold text-xs text-slate-900">{r.name}</span>
                            {r.is_verified && (
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" title="Verified Receiver" />
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 block">{r.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-0.5 bg-teal-50 text-teal-800 text-[10px] font-bold rounded-full">
                        {r.account_type}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-600">
                      {r.city || 'Location not provided'}{r.country ? `, ${r.country}` : ''}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        r.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {r.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => toggleUserStatus(r)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-colors inline-flex items-center gap-1 ${
                          r.is_active
                            ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {r.is_active ? (
                          <>
                            <UserX className="w-3.5 h-3.5" />
                            <span>Suspend</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Activate</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {previewImage && (
        <div className="fixed inset-0 z-[100] bg-black/70 p-4 flex items-center justify-center" role="dialog" aria-modal="true" aria-label="Profile image preview" onClick={() => setPreviewImage(null)}>
          <div className="max-w-2xl max-h-[90vh] bg-white rounded-2xl p-3 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-4 px-1 pb-3">
              <span className="font-semibold text-slate-800">{previewImage.name}</span>
              <button type="button" onClick={() => setPreviewImage(null)} className="text-sm font-bold text-slate-600">Close</button>
            </div>
            <img src={previewImage.url} alt={`${previewImage.name} profile`} className="max-w-full max-h-[75vh] object-contain rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
}
