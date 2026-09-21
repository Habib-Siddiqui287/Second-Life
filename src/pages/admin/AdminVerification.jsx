import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/savedItemService';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { Building2, Check, X, ShieldCheck, ExternalLink, FileText, Phone, Mail } from 'lucide-react';

export default function AdminVerification() {
  const { showToast } = useToast();
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');

  // Review Modal state
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [reviewAction, setReviewAction] = useState('VERIFIED'); // VERIFIED or REJECTED
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchOrgs = () => {
    setLoading(true);
    adminService.getOrganizations({ status: filter !== 'ALL' ? filter : undefined })
      .then((data) => setOrgs(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrgs();
  }, [filter]);

  const openReviewModal = (org, action) => {
    setSelectedOrg(org);
    setReviewAction(action);
    setNotes(action === 'VERIFIED' ? 'Verified against official state non-profit registry.' : '');
    setModalOpen(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (reviewAction === 'REJECTED' && !notes.trim()) {
      showToast('A reason note is required when rejecting verification.', 'info');
      return;
    }

    setSubmitting(true);
    try {
      await adminService.verifyOrganization(selectedOrg.id, reviewAction, notes);
      showToast(`Organization successfully ${reviewAction.toLowerCase()}!`, 'success');
      setModalOpen(false);
      fetchOrgs();
    } catch (err) {
      showToast('Failed to update verification status.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Organization Verification Queue</h1>
          <p className="text-xs text-slate-500">
            Inspect legal licenses and approve non-profit, shelter, and school credentials.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm self-start">
          {['PENDING', 'VERIFIED', 'REJECTED', 'ALL'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === f ? 'bg-[#15803D] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading organizations queue..." />
      ) : orgs.length === 0 ? (
        <EmptyState
          title={`No ${filter.toLowerCase()} organizations`}
          message="There are no organizations pending verification in this queue."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {orgs.map((org) => (
            <div
              key={org.id}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-soft space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#15803D] flex items-center justify-center font-bold shadow-xs">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900">{org.organization_name}</h3>
                      <span className="text-xs text-emerald-700 font-semibold">{org.organization_type}</span>
                    </div>
                  </div>
                  <StatusBadge status={org.verification_status} size="sm" />
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block mb-0.5">License / Tax ID</span>
                    <span className="font-mono font-bold text-slate-800">{org.license_number || 'Pending Submission'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block mb-0.5">Contact Person</span>
                    <span className="font-extrabold text-slate-800">{org.contact_person}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block mb-0.5">Official Email</span>
                    <span className="font-medium text-slate-700 truncate block">{org.official_email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block mb-0.5">Location</span>
                    <span className="font-medium text-slate-700">{org.city}, {org.country}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">Mission / Description</span>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    {org.description || 'No organizational description provided.'}
                  </p>
                </div>

                {org.verification_reason && (
                  <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-100 text-xs text-amber-900">
                    <span className="font-bold block mb-0.5">Latest Moderator Note:</span>
                    {org.verification_reason}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-50 flex items-center justify-end gap-2">
                {org.verification_status !== 'VERIFIED' && (
                  <button
                    onClick={() => openReviewModal(org, 'VERIFIED')}
                    className="px-4 py-2 bg-[#15803D] hover:bg-[#0F5D28] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve & Verify</span>
                  </button>
                )}

                {org.verification_status !== 'REJECTED' && (
                  <button
                    onClick={() => openReviewModal(org, 'REJECTED')}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
                  >
                    <X className="w-4 h-4" />
                    <span>Decline</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`${reviewAction === 'VERIFIED' ? 'Approve' : 'Reject'} Verification for ${selectedOrg?.organization_name}`}
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
          <p className="text-slate-600">
            {reviewAction === 'VERIFIED'
              ? 'Approving will grant this organization a Verified badge, prioritizing their donation requests.'
              : 'Declining will notify the organization with your reason, allowing them to update documents.'}
          </p>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Moderator Audit Note {reviewAction === 'REJECTED' ? '(Required)' : '(Optional)'}
            </label>
            <textarea
              rows={3}
              required={reviewAction === 'REJECTED'}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none resize-none"
              placeholder="e.g. Verified against Washington State non-profit charity index..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-5 py-2 text-white rounded-xl font-bold shadow-sm ${
                reviewAction === 'VERIFIED' ? 'bg-[#15803D] hover:bg-[#0F5D28]' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {submitting ? 'Updating...' : `Confirm ${reviewAction === 'VERIFIED' ? 'Approval' : 'Rejection'}`}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
