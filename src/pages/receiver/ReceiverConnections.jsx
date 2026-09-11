import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { connectionService } from '../../services/connectionService';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Truck, Calendar, MapPin, CheckCircle2, Clock, CheckCheck, User } from 'lucide-react';

export default function ReceiverConnections() {
  const { id } = useParams();
  const { showToast } = useToast();
  const [connections, setConnections] = useState([]);
  const [activeConnection, setActiveConnection] = useState(null);
  const [filter, setFilter] = useState('UPCOMING');
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  const fetchConnections = () => {
    setLoading(true);
    connectionService.getConnections({ filter })
      .then((data) => {
        setConnections(data);
        if (id) {
          const found = data.find((c) => String(c.id) === String(id));
          setActiveConnection(found || data[0] || null);
        } else if (data.length > 0) {
          setActiveConnection(data[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchConnections();
  }, [id, filter]);

  const handleConfirmReceived = async (connId) => {
    setCompleting(true);
    try {
      await connectionService.completeConnection(connId);
      showToast('Item receipt confirmed! Thank you for giving it a second life! 🎉', 'success');
      fetchConnections();
    } catch (err) {
      showToast('Failed to confirm delivery.', 'error');
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Pickups & Deliveries</h1>
          <p className="text-xs text-slate-500">
            Manage your scheduled exchanges and track incoming circular items.
          </p>
        </div>

        {/* Upcoming vs Completed Toggle (Matches Design Image 15) */}
        <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm self-start">
          <button
            onClick={() => setFilter('UPCOMING')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'UPCOMING' ? 'bg-[#15803D] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('COMPLETED')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'COMPLETED' ? 'bg-[#15803D] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching handover logistics..." />
      ) : connections.length === 0 ? (
        <EmptyState
          title={`No ${filter.toLowerCase()} deliveries`}
          message="When a donor accepts your request, your scheduled pickup and delivery status will appear here."
          actionLabel="Browse Available Donations"
          onAction={() => (window.location.href = '/receiver/browse')}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Connection List */}
          <div className="lg:col-span-4 space-y-3">
            {connections.map((c) => (
              <div
                key={c.id}
                onClick={() => setActiveConnection(c)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  activeConnection?.id === c.id
                    ? 'bg-white border-[#15803D] shadow-md ring-2 ring-emerald-100'
                    : 'bg-white/80 border-slate-100 hover:bg-white shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={c.donation?.primary_image}
                    alt=""
                    className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-extrabold text-emerald-800 uppercase bg-emerald-50 px-2 py-0.5 rounded-full">
                        {c.donation?.category?.name}
                      </span>
                      <StatusBadge status={c.status} size="sm" />
                    </div>
                    <h4 className="font-extrabold text-xs text-slate-900 truncate">{c.donation?.title}</h4>
                    <span className="text-[11px] text-slate-500 block truncate">Donor: {c.donor?.name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Handover Details & Delivery Tracking (Matches Design Image 15) */}
          {activeConnection && (
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-soft space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-4">
                <div>
                  <span className="text-[10px] font-extrabold tracking-widest text-[#15803D] uppercase">
                    DELIVERY #{activeConnection.delivery?.tracking_code || activeConnection.id}
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                    {activeConnection.donation?.title}
                  </h2>
                </div>
                <StatusBadge status={activeConnection.status} />
              </div>

              {/* Courier Bar */}
              {activeConnection.delivery && (
                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white text-[#15803D] flex items-center justify-center shadow-xs">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{activeConnection.delivery.courier_name}</h4>
                      <span className="text-[11px] text-emerald-800 font-medium">
                        {activeConnection.delivery.vehicle_info} • Est. Arrival: {activeConnection.delivery.estimated_arrival}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Handover Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold mb-1">
                    <Calendar className="w-4 h-4" />
                    <span>Scheduled Handover</span>
                  </div>
                  <span className="font-extrabold text-slate-900 block">{activeConnection.scheduled_date}</span>
                  <span className="text-[11px] text-slate-500">{activeConnection.pickup_time_slot}</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold mb-1">
                    <MapPin className="w-4 h-4" />
                    <span>Handover Location</span>
                  </div>
                  <span className="font-extrabold text-slate-900 block truncate">
                    {activeConnection.pickup_address || activeConnection.donation?.location}
                  </span>
                  <span className="text-[11px] text-slate-500">Contact donor {activeConnection.donor?.phone}</span>
                </div>
              </div>

              {/* Progress Timeline */}
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 mb-4">Delivery Progression</h3>
                <div className="space-y-4">
                  {activeConnection.delivery?.timeline_steps?.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className="mt-0.5">
                        {step.status === 'COMPLETED' ? (
                          <div className="w-6 h-6 rounded-full bg-[#15803D] text-white flex items-center justify-center text-xs">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        ) : step.status === 'IN_PROGRESS' ? (
                          <div className="w-6 h-6 rounded-full bg-amber-400 text-white flex items-center justify-center text-xs animate-pulse">
                            <Clock className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-xs" />
                        )}
                      </div>
                      <div className="flex-1 pb-3 border-b border-slate-50 last:border-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${
                            step.status === 'COMPLETED' ? 'text-slate-900' : 'text-slate-400'
                          }`}>
                            {step.step}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">{step.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirm Receipt CTA */}
              {activeConnection.status !== 'COMPLETED' && (
                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    disabled={completing}
                    onClick={() => handleConfirmReceived(activeConnection.id)}
                    className="px-6 py-2.5 bg-[#15803D] hover:bg-[#0F5D28] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span>{completing ? 'Confirming...' : 'I Have Received This Item'}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
