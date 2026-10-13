import React, { useState, useEffect } from 'react';
import { dashboardService } from '../../services/savedItemService';
import { Recycle, Package, Truck, Leaf, Heart } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function ReceiverImpact() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchStats = (showLoader = false) => {
      if (showLoader) setLoading(true);

      dashboardService
        .getReceiverStats()
        .then((data) => {
          if (mounted) setStats(data || {});
        })
        .catch((error) => {
          console.error('Failed to load receiver impact:', error);
        })
        .finally(() => {
          if (mounted && showLoader) setLoading(false);
        });
    };

    fetchStats(true);
    const interval = setInterval(() => fetchStats(false), 2000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);


  if (loading) {
    return <LoadingSpinner text="Calculating circular savings..." />;
  }

  // IMPORTANT:
  // ?? keeps real zero values as zero.
  const received = Number(stats?.completed_requests ?? 0);
  const reused = Number(stats?.items_given_second_life ?? 0);
  const handovers = Number(stats?.completed_requests ?? 0);
  const wasteDiverted = Number(stats?.waste_diverted_kg ?? 0);
  const readyForPickup = Number(stats?.ready_for_pickup ?? 0);
  const totalRequests = Number(stats?.total_requests ?? 0);
  const lifetimeWeightKg = Number(stats?.lifetime_weight_kg ?? 0);
  const lifetimeWeightLbs = lifetimeWeightKg / 0.45359237;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <Leaf className="w-6 h-6 text-emerald-600" />
            </div>

            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">
                My Impact
              </h1>

              <p className="text-slate-500">
                See how your second-life journey is helping reduce waste.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

          {/* Items Received */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="w-11 h-11 rounded-2xl bg-blue-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>

              <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                Items Received
              </span>
            </div>

            <div className="text-3xl font-extrabold text-slate-900">
              {received}
            </div>

            <p className="text-sm text-slate-500 mt-2">
              Completed requests
            </p>
          </div>

          {/* Items Reused */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <Recycle className="w-5 h-5 text-emerald-600" />
              </div>

              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">
                Items Reused
              </span>
            </div>

            <div className="text-3xl font-extrabold text-slate-900">
              {reused}
            </div>

            <p className="text-sm text-slate-500 mt-2">
              Items given a second life
            </p>
          </div>

          {/* Successful Handovers */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="w-11 h-11 rounded-2xl bg-violet-100 flex items-center justify-center">
                <Truck className="w-5 h-5 text-violet-600" />
              </div>

              <span className="text-xs font-bold text-violet-600 uppercase tracking-wide">
                Handovers
              </span>
            </div>

            <div className="text-3xl font-extrabold text-slate-900">
              {handovers}
            </div>

            <p className="text-sm text-slate-500 mt-2">
              Successfully completed
            </p>
          </div>

          {/* Waste Diverted */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-amber-600" />
              </div>

              <span className="text-xs font-bold text-amber-600 uppercase tracking-wide">
                Lifetime Weight
              </span>
            </div>

            <div className="text-3xl font-extrabold text-slate-900">
              {lifetimeWeightLbs.toFixed(2)}
              <span className="text-lg ml-1 text-slate-500">
                lbs
              </span>
            </div>

            <p className="text-sm text-slate-500 mt-2">
              Through completed handovers
            </p>
          </div>
        </div>

        {/* Current Activity */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 mb-8">

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
              <Heart className="w-5 h-5 text-rose-600" />
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Your Circular Impact
              </h2>

              <p className="text-sm text-slate-500">
                Your real activity is shown below.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500 mb-1">
                Total Requests
              </p>

              <p className="text-2xl font-extrabold text-slate-900">
                {totalRequests}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500 mb-1">
                Ready for Pickup
              </p>

              <p className="text-2xl font-extrabold text-slate-900">
                {readyForPickup}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500 mb-1">
                Lifetime Weight
              </p>

              <p className="text-2xl font-extrabold text-slate-900">
                {lifetimeWeightLbs.toFixed(2)} lbs
              </p>
            </div>

          </div>

          {/* Empty State */}
          {totalRequests === 0 && (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <Package className="w-10 h-10 mx-auto text-slate-400 mb-3" />

              <h3 className="font-bold text-slate-800">
                Your journey starts here 🌱
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Request an item and your impact will appear here.
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}