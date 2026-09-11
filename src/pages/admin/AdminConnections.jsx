import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/savedItemService';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Truck, Calendar, MapPin } from 'lucide-react';

export default function AdminConnections() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchConnections = () => {
    setLoading(true);
    adminService.getConnections({ status: statusFilter !== 'ALL' ? statusFilter : undefined })
      .then((data) => setConnections(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchConnections();
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Connections & Delivery Monitoring</h1>
          <p className="text-xs text-slate-500">
            Real-time handover logistics between donors and recipients.
          </p>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-white p-2.5 rounded-2xl border border-slate-100 shadow-sm self-start">
          {['ALL', 'ACCEPTED', 'IN_PROGRESS', 'DELIVERED', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === st ? 'bg-[#15803D] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading connections..." />
      ) : connections.length === 0 ? (
        <EmptyState
          title="No connections found"
          message="No active connections match this filter."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {connections.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {c.donation?.category?.name}
                  </span>
                  <StatusBadge status={c.status} size="sm" />
                </div>

                <h3 className="font-extrabold text-sm text-slate-900 line-clamp-1">{c.donation?.title}</h3>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1 mt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">Donor:</span>
                    <span className="font-extrabold text-slate-800">{c.donor?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">Receiver:</span>
                    <span className="font-extrabold text-slate-800">{c.receiver?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">Scheduled:</span>
                    <span className="font-medium text-slate-700">{c.scheduled_date}</span>
                  </div>
                </div>
              </div>

              {c.delivery && (
                <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium text-slate-700">{c.delivery.courier_name}</span>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-slate-500">{c.delivery.tracking_code}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
