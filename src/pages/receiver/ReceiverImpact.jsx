import React, { useState, useEffect } from 'react';
import { dashboardService } from '../../services/savedItemService';
import { Sparkles, Recycle, Package, Truck, Leaf, Heart } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function ReceiverImpact() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getReceiverStats()
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Calculating circular savings..." />;

  const received = stats?.items_given_second_life || 8;
  const reused = stats?.items_given_second_life || 8;
  const handovers = stats?.completed_requests || 6;
  const wasteDiverted = stats?.waste_diverted_kg || 24;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Banner (Matches Design Image 15) */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-soft flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 max-w-lg">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0F5D28] bg-emerald-50 px-3 py-1 rounded-full">
            ENVIRONMENTAL IMPACT
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
            Your choices keep useful things in circulation.
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Every item you've received is a step away from landfill. See how your participation in SecondLife is making a tangible difference in waste diversion and community resilience.
          </p>
        </div>

        {/* Circular Counter */}
        <div className="relative w-44 h-44 rounded-full border-4 border-dashed border-emerald-200 flex items-center justify-center p-4 bg-emerald-50/40">
          <div className="w-32 h-32 rounded-full bg-[#15803D] text-white flex flex-col items-center justify-center text-center shadow-lg">
            <Leaf className="w-8 h-8 text-emerald-200 mb-1" />
            <span className="text-2xl font-extrabold">{wasteDiverted}kg</span>
            <span className="text-[9px] uppercase font-bold text-emerald-200">Waste Diverted</span>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards (Matches Design Image 15) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#15803D] flex items-center justify-center mx-auto">
            <Package className="w-6 h-6" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{received}</div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Items Received</div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#15803D] flex items-center justify-center mx-auto">
            <Recycle className="w-6 h-6" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{reused}</div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Items Reused</div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#15803D] flex items-center justify-center mx-auto">
            <Truck className="w-6 h-6" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{handovers}</div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Handovers</div>
        </div>

        <div className="bg-[#15803D] text-white rounded-3xl p-6 shadow-soft text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="text-3xl font-extrabold text-white">{wasteDiverted}kg</div>
          <div className="text-xs font-bold text-emerald-100 uppercase tracking-wider">Waste Diverted</div>
        </div>
      </div>

      {/* Top Category Card (Matches Design Image 15) */}
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-soft grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#15803D] bg-emerald-50 px-2.5 py-0.5 rounded-full">
            TOP CATEGORY
          </span>
          <h3 className="text-xl font-extrabold text-slate-900 mt-2">Furniture & Home Living</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
            You've saved 4 items in this category, keeping bulky goods out of local landfills and supporting a circular neighborhood economy.
          </p>
          <div className="mt-4">
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
              <span>Category Share</span>
              <span className="text-[#15803D]">50% of your items</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#15803D] rounded-full w-1/2"></div>
            </div>
          </div>
        </div>

        <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-slate-50">
          <img src="/images/items/image12.png" alt="" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
}
