import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { connectionService } from '../../services/connectionService';
import ConnectionTrackingFeedback from '../../components/ConnectionTrackingFeedback';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Truck, Calendar, Clock, MapPin, CheckCircle2, User, Phone, CheckCheck } from 'lucide-react';

export default function DonorConnections() {
  const { id } = useParams();
  const { showToast } = useToast();
  const [connections, setConnections] = useState([]);
  const [activeConnection, setActiveConnection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  const fetchConnections = (showLoader = false) => {
    if (showLoader) setLoading(true);
    connectionService.getConnections()
      .then(async (data) => {
        setConnections(data);
        if (id) {
          let found = data.find((c) => String(c.id) === String(id));
          if (!found) {
            try { found = await connectionService.getConnectionById(id); } catch {}
          }
          setActiveConnection(found || data[0] || null);
        } else if (data.length > 0) {
          setActiveConnection(data[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchConnections(true);
    const interval = setInterval(() => fetchConnections(false), 4000);
    return () => clearInterval(interval);
  }, [id]);

  const handleComplete = async (connId) => {
    setCompleting(true);
    try {
      await connectionService.completeConnection(connId);
      showToast('Exchange completed! Environmental impact updated. 🎉', 'success');
      fetchConnections();
    } catch (err) {
      showToast('Failed to complete exchange.', 'error');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading scheduled handovers..." />;

  if (connections.length === 0) {
    return (
      <EmptyState
        title="No scheduled handovers yet"
        message="When you approve an item request from a receiver, pickup & delivery tracking will appear here."
        actionLabel="Review Requests"
        onAction={() => (window.location.href = '/donor/requests')}
      />
    );
  }

  const conn = activeConnection || connections[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Scheduled Handovers & Deliveries</h1>
        <p className="text-xs text-slate-500">
          Coordinate pickup timing, dispatch notes, and verify delivery completion.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List of Connections */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Active Exchanges ({connections.length})
          </span>
          {connections.map((c) => (
            <div
              key={c.id}
              onClick={() => setActiveConnection(c)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                conn?.id === c.id
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
                  <span className="text-[11px] text-slate-500 block truncate">To: {c.receiver?.name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Connection Detail (Matches Design Image 7 & 8) */}
        {conn && (
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-soft space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-4">
              <div>
                <span className="text-[10px] font-extrabold tracking-widest text-[#15803D] uppercase">
                  EXCHANGE #{conn.id}
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">{conn.donation?.title}</h2>
              </div>
              <StatusBadge status={conn.status} />
            </div>

            {/* Handover Details Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                <div className="flex items-center gap-2 text-emerald-700 font-bold mb-1">
                  <Calendar className="w-4 h-4" />
                  <span>Scheduled Date</span>
                </div>
                <span className="font-extrabold text-slate-900 block">{conn.scheduled_date}</span>
                <span className="text-[11px] text-slate-500">{conn.pickup_time_slot}</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                <div className="flex items-center gap-2 text-emerald-700 font-bold mb-1">
                  <MapPin className="w-4 h-4" />
                  <span>Pickup Location</span>
                </div>
                <span className="font-extrabold text-slate-900 block truncate">{conn.pickup_address || conn.donation?.location}</span>
                <span className="text-[11px] text-slate-500">Contact donor on arrival</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                <div className="flex items-center gap-2 text-emerald-700 font-bold mb-1">
                  <User className="w-4 h-4" />
                  <span>Recipient</span>
                </div>
                <span className="font-extrabold text-slate-900 block truncate">{conn.receiver?.name}</span>
                <span className="text-[11px] text-slate-500">{conn.receiver?.account_type}</span>
              </div>
            </div>

            {/* Courier & Vehicle Info */}
            {conn.delivery && (
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white text-[#15803D] flex items-center justify-center shadow-xs">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{conn.delivery.courier_name}</h4>
                    <span className="text-[11px] text-emerald-800 font-medium">{conn.delivery.vehicle_info}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Tracking Code</span>
                  <span className="font-mono font-bold text-xs text-slate-800">{conn.delivery.tracking_code}</span>
                </div>
              </div>
            )}

            {/* Delivery Timeline (Matches Design Image 7 & 15) */}
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 mb-4">Handover Timeline</h3>
              <div className="space-y-4">
                {conn.delivery?.timeline_steps?.map((step, idx) => (
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

            {/* Action Bar */}
            {conn.status !== 'COMPLETED' && (
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  disabled={completing}
                  onClick={() => handleComplete(conn.id)}
                  className="px-6 py-2.5 bg-[#15803D] hover:bg-[#0F5D28] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>{completing ? 'Completing...' : 'Confirm Handover Complete'}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {activeConnection && <ConnectionTrackingFeedback connection={activeConnection} onRefresh={fetchConnections} showToast={showToast} />}
    </div>
  );
}
