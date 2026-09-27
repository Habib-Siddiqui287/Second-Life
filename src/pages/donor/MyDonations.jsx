import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { donationService } from '../../services/donationService';
import StatusBadge from '../../components/StatusBadge';
import ConditionBadge from '../../components/ConditionBadge';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Plus, Search, Eye, Pencil, Trash2 } from 'lucide-react';

export default function MyDonations() {
  const [donations, setDonations] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchDonations = (showLoader = false) => {
      if (showLoader) setLoading(true);

      donationService
        .getMyDonations({
          status: statusFilter,
          search: search || undefined,
        })
        .then((data) => {
          if (mounted) setDonations(Array.isArray(data) ? data : []);
        })
        .catch((error) => {
          console.error('Failed to load donations:', error);
        })
        .finally(() => {
          if (mounted && showLoader) setLoading(false);
        });
    };

    fetchDonations(true);
    const interval = setInterval(() => fetchDonations(false), 5000);

    const handleDelete = async (id) => {
    if (!window.confirm('Delete this donation? This cannot be undone.')) return;
    try { await donationService.deleteDonation(id); setDonations(prev=>prev.filter(d=>d.id!==id)); }
    catch(err) { alert(err.response?.data?.error || 'Unable to delete donation.'); }
  };

  return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [statusFilter, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">All My Donations</h1>
          <p className="text-xs text-slate-500">Track and manage your published items and handover progress.</p>
        </div>
        <Link
          to="/donor/donations/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#15803D] hover:bg-[#0F5D28] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Donation</span>
        </Link>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'AVAILABLE', 'MATCHED', 'IN_DELIVERY', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-[#15803D] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st === 'ALL' ? 'All Items' : st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search my donations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching your donations..." />
      ) : donations.length === 0 ? (
        <EmptyState
          title="No donations found"
          message="You haven't listed any items under this filter yet."
          actionLabel="Create a Donation"
          onAction={() => (window.location.href = '/donor/donations/create')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {donations.map((d) => (
            <div
              key={d.id}
              className="bg-white rounded-3xl border border-slate-100 shadow-card hover:shadow-elevated transition-all overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden">
                  <img src={d.primary_image} alt="" className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3">
                    <StatusBadge status={d.status} size="sm" />
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-full">
                      {d.category?.name}
                    </span>
                    <ConditionBadge condition={d.condition} />
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-900 line-clamp-1">{d.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{d.description}</p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-slate-50 flex items-center justify-between mt-3">
                <span className="text-xs font-bold text-slate-700">
                  {d.requests_count} pending request{d.requests_count !== 1 ? 's' : ''}
                </span>
                <div className="flex items-center gap-2"><Link to={`/donor/donations/${d.id}`} className="px-3 py-1.5 bg-emerald-50 text-[#15803D] rounded-xl text-xs font-bold flex items-center gap-1"><Eye className="w-3.5 h-3.5"/>View</Link><Link to={`/donor/donations/${d.id}?edit=1`} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1"><Pencil className="w-3.5 h-3.5"/>Edit</Link><button type="button" onClick={()=>handleDelete(d.id)} className="px-3 py-1.5 bg-rose-50 text-rose-700 rounded-xl"><Trash2 className="w-3.5 h-3.5"/></button></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
