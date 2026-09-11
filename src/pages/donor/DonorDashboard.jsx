import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardService } from '../../services/savedItemService';
import {
  Gift,
  PackageCheck,
  Clock,
  CheckCircle2,
  Users,
  Sparkles,
  ArrowRight,
  Eye,
  Plus
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function DonorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getDonorStats()
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading donor dashboard..." />;

  return (
    <div className="space-y-8">
      {/* Hero Banner (Matches Design Image 6) */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#EBF5EE] via-[#F4F9F5] to-white p-8 sm:p-10 border border-emerald-100/70 shadow-soft flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-xl space-y-3 z-10">
          <span className="text-[11px] font-extrabold tracking-widest text-[#0F5D28] uppercase bg-emerald-100/80 px-3 py-1 rounded-full">
            MAKE AN IMPACT
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
            Have something you no longer need?
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Give your unused items a second life. Every donation helps build a stronger community and keeps durable goods out of local landfills.
          </p>
          <div className="pt-2">
            <Link
              to="/donor/donations/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#15803D] hover:bg-[#0F5D28] text-white text-xs font-bold rounded-xl shadow-md transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Donate an Item</span>
            </Link>
          </div>
        </div>

        <div className="w-48 sm:w-56 shrink-0 aspect-square rounded-2xl bg-white/80 backdrop-blur-sm p-4 shadow-sm border border-emerald-100 flex items-center justify-center">
          <img
            src="/images/secondlife_hero.jpeg"
            alt="Eco sharing"
            className="w-full h-full object-contain filter drop-shadow-sm"
          />
        </div>
      </div>

      {/* Metrics Row (Matches Design Image 6) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Listed</span>
            <Gift className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats?.total_donations || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Items listed on platform</div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats?.active_donations || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Ready to be matched</div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed</span>
            <PackageCheck className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats?.completed_donations || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Successfully delivered</div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">People Helped</span>
            <Users className="w-5 h-5 text-[#15803D]" />
          </div>
          <div className="text-3xl font-extrabold text-[#15803D]">{stats?.people_helped || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">{stats?.co2_diverted_kg || 0}kg CO2 diverted</div>
        </div>
      </div>

      {/* Recent Donations Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Recent Donations</h3>
            <p className="text-xs text-slate-400">Track and manage your posted items</p>
          </div>
          <Link
            to="/donor/donations"
            className="text-xs font-bold text-[#15803D] hover:text-[#0F5D28] flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3 px-6">Item</th>
                <th className="py-3 px-6">Category</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Requests</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-700">
              {stats?.recent_donations?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    You haven't listed any donations yet. Click 'Donate an Item' to begin!
                  </td>
                </tr>
              ) : (
                stats?.recent_donations?.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-3">
                      <img
                        src={d.primary_image}
                        alt=""
                        className="w-10 h-10 rounded-xl object-cover bg-slate-100"
                      />
                      <span>{d.title}</span>
                    </td>
                    <td className="py-4 px-6 font-semibold">{d.category?.name}</td>
                    <td className="py-4 px-6">
                      <StatusBadge status={d.status} size="sm" />
                    </td>
                    <td className="py-4 px-6 font-bold text-emerald-800">
                      {d.requests_count} request{d.requests_count !== 1 ? 's' : ''}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/donor/donations/${d.id}`}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-[#15803D] hover:text-white rounded-xl font-bold text-[11px] transition-all inline-flex items-center gap-1"
                      >
                        <span>Details</span>
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
