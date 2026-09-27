import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/savedItemService';
import StatusBadge from '../../components/StatusBadge';
import ConditionBadge from '../../components/ConditionBadge';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Search, Gift, Eye } from 'lucide-react';

export default function AdminDonations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchDonations = () => {
    setLoading(true);
    adminService.getDonations({
      status: statusFilter !== 'ALL' ? statusFilter : undefined,
      search: search || undefined
    })
      .then((data) => setDonations(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDonations();
  }, [statusFilter, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Donation Oversight</h1>
          <p className="text-xs text-slate-500">
            Platform-wide catalog of listed, matched, in-transit, and completed donations.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search donations, donors, cities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 shadow-xs"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
        {['ALL', 'AVAILABLE', 'MATCHED', 'IN_DELIVERY', 'DELIVERED', 'COMPLETED', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              statusFilter === st
                ? 'bg-[#15803D] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {st === 'ALL' ? 'All' : st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner text="Loading donation listings..." />
      ) : donations.length === 0 ? (
        <EmptyState
          title="No donations found"
          message="No items match your filter criteria."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3.5 px-6">Donation Title</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Donor</th>
                  <th className="py-3.5 px-6">Condition</th>
                  <th className="py-3.5 px-6">Location</th>
                  <th className="py-3.5 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                {donations.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-3">
                      <img src={d.primary_image} alt="" className="w-10 h-10 rounded-xl object-cover bg-slate-100" />
                      <span className="truncate max-w-[200px]">{d.title}</span>
                    </td>
                    <td className="py-4 px-6 font-semibold">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-full">
                        {d.category?.name}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-700">{d.donor_name}</td>
                    <td className="py-4 px-6">
                      <ConditionBadge condition={d.condition} />
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-500">{d.location?.split(',')[0]}</td>
                    <td className="py-4 px-6">
                      <StatusBadge status={d.status} size="sm" />
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
