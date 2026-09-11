import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { donationService } from '../../services/donationService';
import { requestService } from '../../services/requestService';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import ConditionBadge from '../../components/ConditionBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { ArrowLeft, MapPin, Calendar, Check, X, ShieldCheck } from 'lucide-react';

export default function DonationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [donation, setDonation] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Approval modal state
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [scheduledDate, setScheduledDate] = useState('Tomorrow, 10:00 AM');
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 12:00 PM');
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    donationService.getDonationById(id)
      .then((data) => setDonation(data))
      .catch(() => showToast('Failed to load donation details.', 'error'))
      .finally(() => setLoading(false));

    requestService.getRequests({ donation_id: id })
      .then((data) => setRequests(data))
      .catch(() => {});
  }, [id]);

  const handleApprove = async () => {
    if (!selectedRequestId) return;
    setActionLoading(true);
    try {
      const res = await requestService.approveRequest(selectedRequestId, {
        scheduled_date: scheduledDate,
        pickup_time_slot: timeSlot,
        notes: notes,
      });
      showToast('Request approved! Handover connection created. 🎉', 'success');
      setApproveModalOpen(false);
      navigate(`/donor/connections/${res.connection_id}`);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to approve request.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reqId) => {
    try {
      await requestService.rejectRequest(reqId, { reason: 'Item allocated to another community member.' });
      showToast('Request declined.', 'info');
      setRequests((prev) => prev.filter((r) => r.id !== reqId));
    } catch (err) {
      showToast('Action failed.', 'error');
    }
  };

  if (loading) return <LoadingSpinner text="Loading donation details..." />;
  if (!donation) return <div className="p-8 text-center text-xs text-slate-500">Donation not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        to="/donor/donations"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to My Donations
      </Link>

      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-soft space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full">
                {donation.category?.name}
              </span>
              <ConditionBadge condition={donation.condition} />
              <StatusBadge status={donation.status} size="sm" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">{donation.title}</h1>
          </div>
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {donation.images?.map((img, idx) => (
            <div key={idx} className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        {/* Specs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl text-xs">
          <div>
            <span className="text-slate-400 font-bold block mb-0.5">Location</span>
            <span className="font-extrabold text-slate-800">{donation.location}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold block mb-0.5">Delivery Method</span>
            <span className="font-extrabold text-slate-800">{donation.delivery_option}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold block mb-0.5">Dimensions</span>
            <span className="font-extrabold text-slate-800">{donation.dimensions || 'Standard'}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold block mb-0.5">Weight</span>
            <span className="font-extrabold text-slate-800">{donation.weight || 'Approximate'}</span>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</h3>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
            {donation.description}
          </p>
        </div>
      </div>

      {/* Incoming Requests Section */}
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-soft space-y-4">
        <h3 className="font-extrabold text-base text-slate-900">
          Incoming Requests for this Item ({requests.length})
        </h3>

        {requests.length === 0 ? (
          <p className="text-xs text-slate-400 py-4">No requests received for this donation yet.</p>
        ) : (
          <div className="space-y-3">
            {requests.map((r) => (
              <div
                key={r.id}
                className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold text-[10px] flex items-center justify-center">
                      {r.receiver?.initials || 'RC'}
                    </div>
                    <span className="font-bold text-xs text-slate-900">{r.receiver?.name}</span>
                    <span className="text-[10px] text-slate-400 font-medium">({r.receiver?.account_type})</span>
                    <StatusBadge status={r.status} size="sm" />
                  </div>
                  <p className="text-xs text-slate-600 italic pl-8">"{r.message}"</p>
                </div>

                {r.status === 'PENDING' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setSelectedRequestId(r.id);
                        setApproveModalOpen(true);
                      }}
                      className="px-3.5 py-2 bg-[#15803D] hover:bg-[#0F5D28] text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleReject(r.id)}
                      className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Decline</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Handover Scheduling Modal */}
      <Modal
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        title="Schedule Handover Connection"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Confirming this request will schedule the exchange and create an active delivery tracking connection.
          </p>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Scheduled Date</label>
            <input
              type="text"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
              placeholder="e.g. Tomorrow, Oct 24"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Time Window</label>
            <input
              type="text"
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
              placeholder="e.g. 10:00 AM - 12:00 PM"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Pickup Notes / Instructions</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 resize-none"
              placeholder="e.g. Ring buzzer 4B or meet at community lobby."
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
              {actionLoading ? 'Confirming...' : 'Confirm Handover'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
