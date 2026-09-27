import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/savedItemService';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Search, Inbox } from 'lucide-react';

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchRequests = () => {
    setLoading(true);
    adminService.getRequests({
      status: statusFilter !== 'ALL' ? statusFilter : undefined,
      search: search || undefined,
    })
      .then((data) => setRequests(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Platform Requests</h1>
          <p className="text-xs text-slate-500">
            Real-time feed of all item requests and recipient justifications.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search requests, items, users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 shadow-xs"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              statusFilter === st
                ? 'bg-[#15803D] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner text="Loading requests log..." />
      ) : requests.length === 0 ? (
        <EmptyState
          title="No requests found"
          message="No item requests match this criteria."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3.5 px-6">Item Requested</th>
                  <th className="py-3.5 px-6">Receiver</th>
                  <th className="py-3.5 px-6">Donor</th>
                  <th className="py-3.5 px-6">Reason / Message</th>
                  <th className="py-3.5 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-3">
                      <img src={r.donation?.primary_image} alt="" className="w-10 h-10 rounded-xl object-cover bg-slate-100 shrink-0" />
                      <span className="truncate max-w-[180px]">{r.donation?.title}</span>
                    </td>
                    <td className="py-4 px-6 font-extrabold text-slate-800">
                      {r.receiver?.name}
                      <span className="text-[10px] text-slate-400 font-normal block">{r.receiver?.account_type}</span>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-600">
                      {r.donation?.donor_name}
                    </td>
                    <td className="py-4 px-6 text-slate-600 italic max-w-xs truncate">
                      "{r.message}"
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={r.status} size="sm" />
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
