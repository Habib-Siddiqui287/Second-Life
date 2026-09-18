import React, { useState, useEffect } from 'react';
import { dashboardService } from '../../services/savedItemService';
import { Recycle, Users, PackageCheck, Leaf, Heart } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function DonorImpact() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchStats = (showLoader = false) => {
      if (showLoader) setLoading(true);

      dashboardService
        .getDonorStats()
        .then((data) => {
          if (mounted) setStats(data || {});
        })
        .catch((error) => {
          console.error('Failed to load donor impact:', error);
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
    return <LoadingSpinner text="Loading impact ledger..." />;
  }

  // IMPORTANT:
  // Use ?? instead of || so that real 0 values stay 0.
  const total = Number(stats?.total_donations ?? 0);
  const completed = Number(stats?.completed_donations ?? 0);
  const people = Number(stats?.people_helped ?? 0);
  const co2 = Number(stats?.co2_diverted_kg ?? 0);
  const reused = Number(stats?.items_reused ?? 0);
  const lifetimeWeightKg = Number(stats?.lifetime_weight_kg ?? 0);
  const lifetimeWeightLbs = lifetimeWeightKg / 0.45359237;
  const successfulDrops = Number(
    stats?.successful_drops ?? completed
  );

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
                See how your donations are creating a second life.
              </p>
            </div>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

          {/* CO2 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-emerald-600" />
              </div>

              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">
                CO₂ Diverted
              </span>
            </div>

            <div className="text-3xl font-extrabold text-slate-900">
              {co2.toFixed(1)}
              <span className="text-lg ml-1 text-slate-500">
                kg
              </span>
            </div>

            <p className="text-sm text-slate-500 mt-2">
              From your completed donations
            </p>
          </div>

          {/* Items Donated */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="w-11 h-11 rounded-2xl bg-blue-100 flex items-center justify-center">
                <PackageCheck className="w-5 h-5 text-blue-600" />
              </div>

              <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                Items Donated
              </span>
            </div>

            <div className="text-3xl font-extrabold text-slate-900">
              {total}
            </div>

            <p className="text-sm text-slate-500 mt-2">
              Total donations you created
            </p>
          </div>

          {/* People Helped */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-rose-600" />
              </div>

              <span className="text-xs font-bold text-rose-600 uppercase tracking-wide">
                People Helped
              </span>
            </div>

            <div className="text-3xl font-extrabold text-slate-900">
              {people}
            </div>

            <p className="text-sm text-slate-500 mt-2">
              Through completed donations
            </p>
          </div>

          {/* Successful Drops */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="w-11 h-11 rounded-2xl bg-violet-100 flex items-center justify-center">
                <Recycle className="w-5 h-5 text-violet-600" />
              </div>

              <span className="text-xs font-bold text-violet-600 uppercase tracking-wide">
                Successful Drops
              </span>
            </div>

            <div className="text-3xl font-extrabold text-slate-900">
              {successfulDrops}
            </div>

            <p className="text-sm text-slate-500 mt-2">
              Successfully completed handovers
            </p>
          </div>
        </div>

        {/* Impact Summary */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Heart className="w-5 h-5 text-amber-600" />
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Your Ripple
              </h2>

              <p className="text-sm text-slate-500">
                Every completed donation creates measurable impact.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500 mb-1">
                Items Reused
              </p>

              <p className="text-2xl font-extrabold text-slate-900">
                {reused}
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-50 p-5 border border-emerald-100">
              <p className="text-sm text-emerald-700 mb-1">Lifetime Weight Donated</p>
              <p className="text-2xl font-extrabold text-slate-900">{lifetimeWeightLbs.toFixed(2)} lbs</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500 mb-1">
                Completed Donations
              </p>

              <p className="text-2xl font-extrabold text-slate-900">
                {completed}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500 mb-1">
                Current Impact
              </p>

              <p className="text-2xl font-extrabold text-slate-900">
                {co2.toFixed(1)} kg
              </p>
            </div>

          </div>

          {/* Empty State */}
          {total === 0 && (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <Recycle className="w-10 h-10 mx-auto text-slate-400 mb-3" />

              <h3 className="font-bold text-slate-800">
                Your ripple starts here 🌱
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Create your first donation and watch your impact grow.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}