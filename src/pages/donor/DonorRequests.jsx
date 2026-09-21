import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { requestService } from '../../services/requestService';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { Check, X, ArrowRight, Eye, Calendar, Clock } from 'lucide-react';

export default function DonorRequests() {
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);
  const [scheduledDate, setScheduledDate] = useState('Tomorrow, 10:00 AM');
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 12:00 PM');
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRequests = (showLoader = true) => {
    if (showLoader) setLoading(true);
    requestService.getRequests()
      .then((data) => setRequests(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(() => fetchRequests(false), 5000);

    return () => clearInterval(interval);
  }, []);

  const handleApprove = async () => {
    if (!selectedReq) return;
    setActionLoading(true);
    try {
      const res = await requestService.approveRequest(selectedReq.id, {
        scheduled_date: scheduledDate,
        pickup_time_slot: timeSlot,
        notes: notes,
      });
      showToast('Request approved! Handover connection created. 🎉', 'success');
      setApproveModalOpen(false);
      fetchRequests();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to approve request.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reqId) => {
    try {
      await requestService.rejectRequest(reqId, { reason: 'Allocated to another community member.' });
      showToast('Request declined.', 'info');
      fetchRequests();
    } catch (err) {
      showToast('Failed to reject request.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Pickup & Item Requests</h1>
        <p className="text-xs text-slate-500">
          Review requests from community members and verified non-profits for your items.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching requests..." />
      ) : requests.length === 0 ? (
        <EmptyState
          title="No incoming requests"
          message="When receivers request your available items, they will appear here for your review."
          actionLabel="View My Donations"
          onAction={() => (window.location.href = '/donor/donations')}
        />
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              {/* Left Item Info */}
              <div className="flex items-center gap-4 min-w-0">
                <img
                  src={r.donation?.primary_image}
                  alt=""
                  className="w-16 h-16 rounded-2xl object-cover bg-slate-100 shrink-0"
                />
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {r.donation?.category?.name}
                    </span>
                    <StatusBadge status={r.status} size="sm" />
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900 truncate">
                    {r.donation?.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-bold text-slate-700">Requested by {r.receiver?.name}</span>
                    <span>•</span>
                    <span className="text-[11px]">{r.receiver?.account_type}</span>
                  </div>
                </div>
              </div>

              {/* Middle Message */}
              <div className="flex-1 max-w-md bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs text-slate-600 italic">
                "{r.message}"
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {r.status === 'PENDING' ? (
                  <>
                    <button
                      onClick={() => {
                        setSelectedReq(r);
                        setApproveModalOpen(true);
                      }}
                      className="px-4 py-2 bg-[#15803D] hover:bg-[#0F5D28] text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleReject(r.id)}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : r.connection_id ? (
                  <Link
                    to={`/donor/connections/${r.connection_id}`}
                    className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#15803D] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <span>View Scheduled Pickup</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <span className="text-xs font-semibold text-slate-400">Archived</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Modal */}
      <Modal
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        title="Confirm & Schedule Handover"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Set the pickup date and window for <strong>{selectedReq?.donation?.title}</strong> to be handed over to <strong>{selectedReq?.receiver?.name}</strong>.
          </p>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Scheduled Date</label>
            <input
              type="text"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
              placeholder="e.g. Tomorrow, 10:00 AM"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Pickup Time Window</label>
            <input
              type="text"
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
              placeholder="e.g. 10:00 AM - 12:00 PM"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Pickup Instructions</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 resize-none"
              placeholder="e.g. Ring Apt 4B or meet at building lobby."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setApproveModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleApprove}
              className="px-5 py-2 bg-[#15803D] hover:bg-[#0F5D28] text-white rounded-xl font-bold shadow-sm"
            >
              {actionLoading ? 'Scheduling...' : 'Confirm Handover'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
