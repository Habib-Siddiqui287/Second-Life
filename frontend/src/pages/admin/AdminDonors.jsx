import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/savedItemService';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Search, UserCheck, UserX, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';

export default function AdminDonors() {
  const { showToast } = useToast();
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchDonors = () => {
    setLoading(true);
    adminService.getUsers({ role: 'DONOR', search: search || undefined })
      .then((data) => setDonors(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDonors();
  }, [search]);

  const toggleUserStatus = async (user) => {
    const newStatus = !user.is_active;
    const actionWord = newStatus ? 'activated' : 'suspended';
    try {
      await adminService.updateUserStatus(user.id, { is_active: newStatus });
      showToast(`Donor ${user.name} has been ${actionWord}.`, 'success');
      setDonors((prev) =>
        prev.map((d) => (d.id === user.id ? { ...d, is_active: newStatus } : d))
      );
    } catch (err) {
      showToast('Failed to update user status.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Donor Management</h1>
          <p className="text-xs text-slate-500">
            Monitor and manage registered individual and organizational donors.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search donors by name, city, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 shadow-xs"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading donors..." />
      ) : donors.length === 0 ? (
        <EmptyState
          title="No donors found"
          message="No registered donors match your search criteria."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3.5 px-6">Donor Details</th>
                  <th className="py-3.5 px-6">Entity</th>
                  <th className="py-3.5 px-6">Location</th>
                  <th className="py-3.5 px-6">Account Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                {donors.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#15803D] text-white font-extrabold text-xs flex items-center justify-center">
                          {d.initials}
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-extrabold text-xs text-slate-900">{d.name}</span>
                            {d.is_verified && (
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" title="Verified" />
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 block">{d.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-full">
                        {d.account_type}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-600">
                      {d.city || 'Seattle'}, {d.country}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        d.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {d.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => toggleUserStatus(d)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-colors inline-flex items-center gap-1 ${
                          d.is_active
                            ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {d.is_active ? (
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
    </div>
  );
}
