import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardService } from '../../services/savedItemService';
import { donationService } from '../../services/donationService';
import {
  Search,
  Package,
  Clock,
  Sparkles,
  Truck,
  ArrowRight,
  Eye,
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import ConditionBadge from '../../components/ConditionBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function ReceiverDashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async (showLoader = false) => {
    if (showLoader) {
      setLoading(true);
    }

    try {
      const [statsData, donationsData] = await Promise.all([
        dashboardService.getReceiverStats(),
        donationService.getDonations({
          status: 'AVAILABLE',
        }),
      ]);

      const availableDonations = Array.isArray(donationsData)
        ? donationsData
        : donationsData?.results || [];

      setStats(statsData || {});
      setDonations(availableDonations);
    } catch (error) {
      console.error('Failed to load receiver dashboard:', error);
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadDashboard(true);

    // Keep the receiver dashboard synchronized with new donations
    // without requiring the receiver to manually refresh the page.
    const refreshInterval = setInterval(() => {
      loadDashboard(false);
    }, 5000);

    return () => clearInterval(refreshInterval);
  }, [loadDashboard]);

  if (loading) {
    return <LoadingSpinner text="Loading receiver dashboard..." />;
  }

  return (
    <div className="space-y-8">
      {/* Hero Banner (Matches Design Image 11) */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#EBF5EE] via-[#F4F9F5] to-white p-8 sm:p-10 border border-emerald-100/70 shadow-soft flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-xl space-y-3 z-10">
          <span className="text-[11px] font-extrabold tracking-widest text-[#0F5D28] uppercase bg-emerald-100/80 px-3 py-1 rounded-full">
            FIND WHAT YOU NEED
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
            Something Useful Might Be Waiting for You.
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Explore available donations in your community and give useful
            items another life. Connect with verified donors and arrange
            convenient handovers.
          </p>

          <div className="pt-2">
            <Link
              to="/receiver/browse"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#15803D] hover:bg-[#0F5D28] text-white text-xs font-bold rounded-xl shadow-md transition-all hover:scale-[1.02]"
            >
              <Search className="w-4 h-4" />
              <span>Browse Donations</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="w-48 sm:w-56 shrink-0 aspect-square rounded-2xl bg-white/80 backdrop-blur-sm p-4 shadow-sm border border-emerald-100 flex items-center justify-center">
          <img
            src="/images/items/image1.jpeg"
            alt="SecondLife"
            className="w-full h-full object-contain filter drop-shadow-sm"
          />
        </div>
      </div>

      {/* Metrics Row (Matches Design Image 11) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Items Received
            </span>
            <Sparkles className="w-5 h-5 text-emerald-600" />
          </div>

          <div className="text-3xl font-extrabold text-[#15803D]">
            {stats?.items_given_second_life ?? 0}
          </div>

          <div className="text-[11px] text-slate-400 mt-1">
            Given a second life
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Requests
            </span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>

          <div className="text-3xl font-extrabold text-slate-900">
            {stats?.active_requests ?? 0}
          </div>

          <div className="text-[11px] text-slate-400 mt-1">
            Awaiting donor response
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Ready for Pickup
            </span>
            <Truck className="w-5 h-5 text-teal-600" />
          </div>

          <div className="text-3xl font-extrabold text-slate-900">
            {stats?.ready_for_pickup ?? 0}
          </div>

          <div className="text-[11px] text-slate-400 mt-1">
            Scheduled exchanges
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Waste Diverted
            </span>
            <Package className="w-5 h-5 text-blue-600" />
          </div>

          <div className="text-3xl font-extrabold text-slate-900">
            {Number(stats?.waste_diverted_kg ?? 0).toFixed(3)}kg
          </div>

          <div className="text-[11px] text-slate-400 mt-1">
            Exact lifetime donation weight
          </div>
        </div>
      </div>

      {/* Available Donations Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Available Donations
            </h3>

            <p className="text-xs text-slate-500">
              All currently available items from the community.
            </p>
          </div>

          <Link
            to="/receiver/browse"
            className="text-xs font-bold text-[#15803D] hover:text-[#0F5D28] flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {donations.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-10 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <Package className="w-7 h-7 text-emerald-600" />
            </div>

            <h4 className="font-extrabold text-slate-900 text-sm">
              No donations available right now
            </h4>

            <p className="text-xs text-slate-500 mt-2">
              New donations will appear here automatically when donors add
              available items.
            </p>

            <Link
              to="/receiver/browse"
              className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 bg-emerald-50 hover:bg-[#15803D] text-[#15803D] hover:text-white rounded-xl text-xs font-bold transition-all"
            >
              <Search className="w-3.5 h-3.5" />
              Browse Donations
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {donations.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-100 shadow-card hover:shadow-elevated transition-all overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden">
                    <img
                      src={item.primary_image}
                      alt={item.title || 'Donation item'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2 py-0.5 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-extrabold text-slate-800 uppercase">
                        {item.category?.name || 'Donation'}
                      </span>
                    </div>

                    {item.match_score !== null &&
                      item.match_score !== undefined && (
                        <div className="absolute top-2.5 right-2.5">
                          <span className="px-2 py-0.5 bg-[#15803D] text-white rounded-full text-[9px] font-extrabold shadow-sm">
                            {item.match_score}% Match
                          </span>
                        </div>
                      )}
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <ConditionBadge condition={item.condition} />

                      <span className="text-[10px] text-slate-400 font-semibold truncate">
                        {item.location?.split(',')[0] || item.city || 'Local'}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-xs text-slate-900 line-clamp-1 group-hover:text-[#15803D] transition-colors">
                      {item.title}
                    </h4>

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-slate-50 flex items-center justify-between mt-2">
                  <span className="text-[11px] font-bold text-slate-600 truncate max-w-[100px]">
                    {item.donor_name || 'Community Donor'}
                  </span>

                  <Link
                    to={`/receiver/donations/${item.id}`}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-[#15803D] text-[#15803D] hover:text-white rounded-xl text-[11px] font-bold transition-all flex items-center gap-1"
                  >
                    <span>View Details</span>
                    <Eye className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Recent Requests Table (Matches Design Image 11) */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              My Recent Requests
            </h3>

            <p className="text-xs text-slate-400">
              Track items you've requested from the community
            </p>
          </div>

          <Link
            to="/receiver/requests"
            className="text-xs font-bold text-[#15803D] hover:text-[#0F5D28] flex items-center gap-1"
          >
            <span>View All Requests</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3 px-6">Item</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Donor</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50 text-slate-700">
              {!stats?.recent_requests ||
              stats.recent_requests.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-slate-400"
                  >
                    No requests submitted yet. Browse items and submit your
                    first request!
                  </td>
                </tr>
              ) : (
                stats.recent_requests.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-3">
                      <img
                        src={r.donation?.primary_image}
                        alt={r.donation?.title || 'Donation item'}
                        className="w-10 h-10 rounded-xl object-cover bg-slate-100"
                      />

                      <span>{r.donation?.title || 'Donation item'}</span>
                    </td>

                    <td className="py-4 px-6">
                      <StatusBadge status={r.status} size="sm" />
                    </td>

                    <td className="py-4 px-6 font-medium text-slate-600">
                      {r.donation?.donor_name || 'Community Donor'}
                    </td>

                    <td className="py-4 px-6 text-right">
                      {r.connection_id ? (
                        <Link
                          to={`/receiver/connections/${r.connection_id}`}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-[#15803D] text-[#15803D] hover:text-white rounded-xl font-bold text-[11px] transition-all inline-flex items-center gap-1"
                        >
                          <span>Track Handover</span>
                          <Truck className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <Link
                          to={`/receiver/donations/${r.donation?.id}`}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-[11px] transition-all"
                        >
                          View Item
                        </Link>
                      )}
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