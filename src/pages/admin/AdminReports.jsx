import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/savedItemService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { BarChart3, TrendingUp, Sparkles, CheckCircle2, ShieldCheck, Download } from 'lucide-react';

export default function AdminReports() {
  const [reports, setReports] = useState(null);
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminService.getReports(period)
      .then((data) => setReports(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period]);

  if (loading) return <LoadingSpinner text="Generating platform impact reports..." />;

  const metrics = reports?.metrics || {};
  const breakdown = reports?.breakdown_by_category || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Analytics & Impact Reports</h1>
          <p className="text-xs text-slate-500">
            Comprehensive audit of circular turnover, landfill offset, and match efficiency.
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm self-start max-w-full overflow-x-auto no-scrollbar">
          {[
            { id: '7d', label: '7 Days' },
            { id: '30d', label: '30 Days' },
            { id: '90d', label: '3 Months' },
            { id: '1y', label: '1 Year' },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                period === p.id ? 'bg-[#15803D] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completion Rate</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{metrics.completion_rate ? `${metrics.completion_rate}%` : '0%'}</div>
          <div className="text-[11px] text-slate-400 mt-1">Handovers successfully executed</div>
        </div>

        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Match Time</span>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{metrics.average_match_time || 'N/A'}</div>
          <div className="text-[11px] text-slate-400 mt-1">Listing to match approval</div>
        </div>

        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">CO2 Landfill Offset</span>
            <Sparkles className="w-5 h-5 text-[#15803D]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#15803D]">{metrics.total_co2_offset_tonnes ? `${metrics.total_co2_offset_tonnes}t` : '0t'}</div>
          <div className="text-[11px] text-slate-400 mt-1">Estimated greenhouse abatement</div>
        </div>

        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Community Rating</span>
            <ShieldCheck className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{metrics.community_satisfaction || 'N/A'}</div>
          <div className="text-[11px] text-slate-400 mt-1">Donor & receiver trust score</div>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-50 flex items-center justify-between gap-2">
          <h3 className="font-extrabold text-base text-slate-900">Breakdown by Item Category</h3>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl shrink-0">
            Period: {period.toUpperCase()}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[540px] text-left text-xs">
            <thead className="bg-slate-50/75 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6">Items Recirculated</th>
                <th className="py-3.5 px-6">Delivered & Verified</th>
                <th className="py-3.5 px-6">CO2 Saved (kg)</th>
                <th className="py-3.5 px-6 text-right">Fulfillment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-700 font-medium">
              {breakdown.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900">{row.category}</td>
                  <td className="py-4 px-6">{row.items} units</td>
                  <td className="py-4 px-6 font-semibold text-emerald-800">{row.delivered} units</td>
                  <td className="py-4 px-6">{row.co2_kg} kg</td>
                  <td className="py-4 px-6 text-right font-extrabold text-[#15803D]">
                    {Math.round((row.delivered / (row.items || 1)) * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
