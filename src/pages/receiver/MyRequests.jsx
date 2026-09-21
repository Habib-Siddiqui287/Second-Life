import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { requestService } from '../../services/requestService';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Search, Plus, Truck, Eye, XCircle } from 'lucide-react';

export default function MyRequests() {
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchRequests = (showLoader = true) => {
    if (showLoader) setLoading(true);
    requestService.getRequests()
      .then((data) => setRequests(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(() => fetchRequests(false), 5000);

    return () => clearInterval(interval);
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    try {
      await requestService.cancelRequest(id);
      showToast('Request cancelled.', 'info');
      fetchRequests();
    } catch (err) {
      showToast('Failed to cancel request.', 'error');
    }
  };

  const filtered = activeTab === 'ALL'
    ? requests
    : requests.filter((r) => r.status.toUpperCase() === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Requests</h1>
          <p className="text-xs text-slate-500">
            Track the status of items you've requested from the community. When an item is approved, you can track handover logistics.
          </p>
        </div>
        <Link
          to="/receiver/browse"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#15803D] hover:bg-[#0F5D28] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Request</span>
        </Link>
      </div>

      {/* Tabs (Matches Design Image 14) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
        {['ALL', 'PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab
                ? 'bg-[#15803D] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab === 'ALL' ? 'All Requests' : tab === 'APPROVED' ? 'Matched / Approved' : tab}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching your requests..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No requests in this view"
          message="You haven't requested any items under this status yet."
          actionLabel="Browse Available Donations"
          onAction={() => (window.location.href = '/receiver/browse')}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3.5 px-6">Item Details</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Donor</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-3">
                      <img
                        src={r.donation?.primary_image}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="truncate block font-extrabold text-xs">{r.donation?.title}</span>
                        <span className="text-[11px] text-slate-400 font-normal line-clamp-1 italic">
                          "{r.message}"
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-full">
                        {r.donation?.category?.name}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={r.status} size="sm" />
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-700">
                      {r.donation?.donor_name}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      {r.connection_id ? (
                        <Link
                          to={`/receiver/connections/${r.connection_id}`}
                          className="px-3 py-1.5 bg-[#15803D] hover:bg-[#0F5D28] text-white rounded-xl font-bold text-[11px] inline-flex items-center gap-1 shadow-xs"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Track Handover</span>
                        </Link>
                      ) : (
                        <Link
                          to={`/receiver/donations/${r.donation?.id}`}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-[11px] inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Item</span>
                        </Link>
                      )}

                      {r.status === 'PENDING' && (
                        <button
                          onClick={() => handleCancel(r.id)}
                          className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl font-bold text-[11px] transition-colors"
                          title="Cancel Request"
                        >
                          Cancel
                        </button>
                      )}
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
