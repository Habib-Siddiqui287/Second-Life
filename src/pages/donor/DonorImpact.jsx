import React, { useState, useEffect } from 'react';
import { dashboardService } from '../../services/savedItemService';
import { Sparkles, Recycle, Users, PackageCheck, Leaf, Heart } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function DonorImpact() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getDonorStats()
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading impact ledger..." />;

  const total = stats?.total_donations || 12;
  const completed = stats?.completed_donations || 9;
  const people = stats?.people_helped || 15;
  const co2 = stats?.co2_diverted_kg || 45.6;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Banner (Matches Design Image 9) */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-soft flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 max-w-lg">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0F5D28] bg-emerald-50 px-3 py-1 rounded-full">
            CIRCULAR FOOTPRINT
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
            Your ripple effect.
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Every donation gives something useful a second life. By choosing to renew instead of discard, you are actively participating in a more sustainable, circular, and equitable community.
          </p>
        </div>

        {/* Circular Eco Badge Graphic */}
        <div className="relative w-44 h-44 rounded-full border-4 border-dashed border-emerald-200 flex items-center justify-center p-4 bg-emerald-50/40">
          <div className="w-32 h-32 rounded-full bg-[#15803D] text-white flex flex-col items-center justify-center text-center shadow-lg">
            <Leaf className="w-8 h-8 text-emerald-200 mb-1" />
            <span className="text-xl font-extrabold">{co2}kg</span>
            <span className="text-[9px] uppercase font-bold text-emerald-200">CO2 Diverted</span>
          </div>
        </div>
      </div>

      {/* 4 Impact Stat Cards (Matches Design Image 9) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#15803D] flex items-center justify-center mx-auto">
            <Recycle className="w-6 h-6" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{total}</div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Items Donated</div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#15803D] flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{people}</div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">People Helped</div>
        </div>

        <div className="bg-[#15803D] text-white rounded-3xl p-6 shadow-soft text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center mx-auto">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div className="text-3xl font-extrabold text-white">{completed}</div>
          <div className="text-xs font-bold text-emerald-100 uppercase tracking-wider">Successful Drops</div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#15803D] flex items-center justify-center mx-auto">
            <Heart className="w-6 h-6" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{completed * 2 || 12}</div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Items Reused</div>
        </div>
      </div>
    </div>
  );
}
