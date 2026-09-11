import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/savedItemService';
import {
  Users,
  Building2,
  Gift,
  Clock,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Activity
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboardStats()
      .then((res) => setData(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading platform administration analytics..." />;

  const overview = data?.overview || {};
  const charts = data?.charts || {};
  const COLORS = ['#15803D', '#0284C7', '#6366F1', '#F59E0B', '#EF4444', '#14B8A6'];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Platform Overview</h1>
        <p className="text-xs text-slate-500">Live operational metrics, verification queues, and social impact indicators.</p>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Users</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{overview.total_users || 0}</div>
          <div className="text-[10px] text-slate-400 mt-1">Donors: {overview.total_donors} • Receivers: {overview.total_receivers}</div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Organizations</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{overview.total_organizations || 0}</div>
          <Link to="/admin/verification" className="text-[10px] font-bold text-amber-600 hover:underline mt-1 block">
            {overview.pending_verifications || 0} Pending Verification →
          </Link>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Donations</span>
            <Gift className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{overview.total_donations || 0}</div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-1">{overview.active_donations} Available now</div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Requests</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{overview.pending_requests || 0}</div>
          <div className="text-[10px] text-slate-400 mt-1">Pending approval</div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Connections</span>
            <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
          </div>
          <div className="text-2xl font-extrabold text-[#15803D]">{overview.successful_connections || 0}</div>
          <div className="text-[10px] text-slate-400 mt-1">Exchanges completed</div>
        </div>
      </div>

      {/* Visual Recharts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Donations Over Time Chart */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Donation & Handover Trajectory</h3>
              <p className="text-[11px] text-slate-400">Monthly progression of circulated items across Seattle & regional network</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl">
              +38% vs prev period
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.donations_over_time || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDonations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#15803D" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#15803D" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '1rem', border: '1px solid #E2E8F0', fontSize: '11px' }} />
                <Area type="monotone" dataKey="donations" stroke="#15803D" strokeWidth={3} fillOpacity={1} fill="url(#colorDonations)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution Pie Chart */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Items by Category</h3>
            <p className="text-[11px] text-slate-400">Distribution of circulated donations</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.category_distribution || []}
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(charts.category_distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '0.75rem', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-600">
            {(charts.category_distribution || []).map((c, i) => (
              <div key={i} className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="truncate">{c.name} ({c.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Growth Bar Chart & Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* User Growth */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900">User Community Growth</h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.user_growth || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '0.75rem', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="donors" fill="#15803D" radius={[6, 6, 0, 0]} name="Donors" />
                <Bar dataKey="receivers" fill="#0284C7" radius={[6, 6, 0, 0]} name="Receivers" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live System Activity Log */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900">Recent Platform Activity</h3>
            <Link to="/admin/reports" className="text-xs font-bold text-[#15803D] hover:underline">
              Full Logs
            </Link>
          </div>

          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {data?.recent_activity?.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No recent activity logs.</div>
            ) : (
              data?.recent_activity?.map((log) => (
                <div key={log.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-slate-900 block truncate">{log.description}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">{log.created_at?.split('T')[0]}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
