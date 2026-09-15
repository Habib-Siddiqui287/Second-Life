import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { donationService } from '../../services/donationService';
import { requestService } from '../../services/requestService';
import { savedItemService } from '../../services/savedItemService';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import ConditionBadge from '../../components/ConditionBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { POPULAR_ITEMS } from '../../components/PopularDonations';

import {
  ArrowLeft,
  Heart,
  MapPin,
  Truck,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function ReceiverDonationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [donation, setDonation] = useState(null);
  const [similarItems, setSimilarItems] = useState([]);
  const [activeImage, setActiveImage] = useState('');
  const [loading, setLoading] = useState(true);

  // Request Modal State
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // =========================================================
  // LOAD DONATION
  // =========================================================
  const fetchDetails = async () => {
    setLoading(true);

    // ---------------------------------------------------------
    // 1. FIRST CHECK LANDING PAGE DEMO DONATIONS
    // ---------------------------------------------------------
    const demoItem = POPULAR_ITEMS.find(
      (item) => String(item.id) === String(id)
    );

    if (demoItem) {
      const demoDonation = {
        id: demoItem.id,
        title: demoItem.name,
        description: demoItem.description,
        status: 'AVAILABLE',
        condition: demoItem.condition,
        conditionColor: demoItem.conditionColor,
        location: demoItem.location,
        quantity: 1,
        delivery_option: 'PICKUP',

        category: {
          name: demoItem.category,
          slug: demoItem.slug,
        },

        images: [
          {
            url: demoItem.image,
          },
        ],

        donor: {
          name: 'SecondLife Community Donor',
          initials: 'SL',
          is_verified: true,
        },

        donor_items_count: 12,
        views: demoItem.views,
        is_saved: false,

        dimensions: 'Standard',
        weight: 'Approximate',
      };

      setDonation(demoDonation);
      setActiveImage(demoItem.image);

      // Similar landing-page donations
      const similar = POPULAR_ITEMS
        .filter(
          (item) =>
            item.id !== demoItem.id &&
            item.group === demoItem.group
        )
        .slice(0, 4)
        .map((item) => ({
          id: item.id,
          title: item.name,
          primary_image: item.image,
          location: item.location,
        }));

      setSimilarItems(similar);
      setLoading(false);
      return;
    }

    // ---------------------------------------------------------
    // 2. OTHERWISE LOAD REAL DONATION FROM BACKEND
    // ---------------------------------------------------------
    try {
      const data = await donationService.getDonationById(id);

      setDonation(data);

      if (data.images && data.images.length > 0) {
        setActiveImage(data.images[0].url);
      } else {
        setActiveImage('/images/secondlife_hero.jpeg');
      }

      // Fetch similar real donations
      if (data.category?.slug) {
        donationService
          .getDonations({
            category: data.category.slug,
            status: 'AVAILABLE',
          })
          .then((sim) => {
            setSimilarItems(
              sim
                .filter(
                  (s) => String(s.id) !== String(id)
                )
                .slice(0, 4)
            );
          })
          .catch(() => {});
      }
    } catch (err) {
      setDonation(null);
      showToast('Failed to load donation details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  // =========================================================
  // SAVE / UNSAVE
  // =========================================================
  const handleToggleSave = async () => {
    // Demo landing-page items are not connected to backend
    if (String(donation.id).includes('-')) {
      showToast(
        'This is a community highlight preview. Sign in to save real donations.',
        'info'
      );
      return;
    }

    try {
      const res = await savedItemService.toggleSave(donation.id);

      showToast(res.message, 'success');

      setDonation((prev) => ({
        ...prev,
        is_saved: res.saved,
      }));
    } catch (err) {
      showToast('Could not save item.', 'error');
    }
  };

  // =========================================================
  // REQUEST ITEM
  // =========================================================
  const handleSubmitRequest = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      showToast(
        'Please include a brief message explaining your need.',
        'info'
      );
      return;
    }

    // Demo landing-page donations don't exist in backend
    if (String(donation.id).includes('-')) {
      showToast(
        'This is a landing-page community highlight. Please browse real donations to submit a request.',
        'info'
      );
      setRequestModalOpen(false);
      return;
    }

    setSubmitting(true);

    try {
      await requestService.createRequest({
        donation_id: donation.id,
        message: message,
      });

      showToast(
        'Request submitted successfully! The donor has been notified. 📬',
        'success'
      );

      setRequestModalOpen(false);
      setMessage('');

      navigate('/receiver/requests');
    } catch (err) {
      const errDetail =
        err.response?.data?.donation_id?.[0] ||
        err.response?.data?.error ||
        'Failed to submit request.';

      showToast(errDetail, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================
  if (loading) {
    return (
      <LoadingSpinner text="Loading donation specifications..." />
    );
  }

  // =========================================================
  // NOT FOUND
  // =========================================================
  if (!donation) {
    return (
      <div className="max-w-5xl mx-auto py-16 px-4">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-12 text-center">
          <h2 className="text-xl font-extrabold text-slate-900 mb-2">
            Donation Not Found
          </h2>

          <p className="text-sm text-slate-500 mb-6">
            We couldn't find this donation.
          </p>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#15803D] text-white rounded-xl text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN PAGE
  // =========================================================
  return (
    <div className="max-w-5xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 py-8">

      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* =====================================================
            LEFT COLUMN
        ====================================================== */}
        <div className="lg:col-span-7 space-y-4">

          {/* Main Image */}
          <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-soft relative">

            <img
              src={activeImage}
              alt={donation.title}
              className="w-full h-full object-cover"
            />

            {/* Category */}
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-extrabold text-slate-800 uppercase shadow-xs">
                {donation.category?.name}
              </span>
            </div>

            {/* Compatibility Match */}
            {donation.match_details && (
              <div className="absolute bottom-4 left-4">
                <span className="px-3 py-1 bg-[#15803D] text-white rounded-full text-xs font-bold shadow-md flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {donation.match_details.percentage}% Compatibility Match
                  </span>
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {donation.images?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {donation.images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveImage(img.url)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${
                    activeImage === img.url
                      ? 'border-[#15803D] shadow-sm'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">

            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              Description
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {donation.description}
            </p>

            {/* Specifications */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50 text-xs">

              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block mb-0.5">
                  DIMENSIONS
                </span>

                <span className="font-extrabold text-slate-800">
                  {donation.dimensions || 'Standard'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block mb-0.5">
                  WEIGHT (APPROX)
                </span>

                <span className="font-extrabold text-slate-800">
                  {donation.weight || 'Approximate'}
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* =====================================================
            RIGHT COLUMN
        ====================================================== */}
        <div className="lg:col-span-5 space-y-6">

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-soft space-y-6">

            {/* Title */}
            <div className="flex items-start justify-between gap-4">

              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 leading-snug">
                  {donation.title}
                </h1>

                <div className="flex flex-wrap items-center gap-2 mt-2">

                  <ConditionBadge
                    condition={donation.condition}
                  />

                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {donation.quantity || 1} Available
                  </span>

                </div>
              </div>

              {/* Save */}
              <button
                onClick={handleToggleSave}
                className={`p-3 rounded-2xl border transition-all ${
                  donation.is_saved
                    ? 'bg-emerald-50 border-emerald-200 text-[#15803D]'
                    : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-rose-500'
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${
                    donation.is_saved ? 'fill-current' : ''
                  }`}
                />
              </button>
            </div>

            {/* Logistics */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 text-xs">

              <span className="font-extrabold text-slate-900 uppercase text-[10px] tracking-wider block">
                LOGISTICS & LOCATION
              </span>

              <div className="flex items-start gap-3">

                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#15803D] flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4" />
                </div>

                <div>
                  <span className="font-bold text-slate-800 block">
                    {donation.delivery_option === 'PICKUP'
                      ? 'Pickup Preferred'
                      : 'Delivery Supported'}
                  </span>

                  <p className="text-[11px] text-slate-500">
                    Donor prefers weekend mornings or scheduled public handovers.
                  </p>
                </div>

              </div>

              <div className="flex items-start gap-3">

                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#15803D] flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>

                <div>
                  <span className="font-bold text-slate-800 block">
                    {donation.location}
                  </span>

                  <p className="text-[11px] text-slate-400">
                    Exact address confirmed upon request approval.
                  </p>
                </div>

              </div>
            </div>

            {/* Donor */}
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-2xl bg-[#15803D] text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                  {donation.donor?.initials || 'SL'}
                </div>

                <div>

                  <div className="flex items-center gap-1.5">

                    <span className="font-extrabold text-xs text-slate-900">
                      {donation.donor?.name || 'SecondLife Community Donor'}
                    </span>

                    {donation.donor?.is_verified && (
                      <ShieldCheck
                        className="w-3.5 h-3.5 text-emerald-600"
                        title="Verified Donor"
                      />
                    )}

                  </div>

                  <span className="text-[11px] text-emerald-800 font-medium">
                    Verified Donor • {donation.donor_items_count || 12} items given
                  </span>

                </div>

              </div>
            </div>

            {/* Request Button */}
            {donation.status === 'AVAILABLE' ? (

              <button
                onClick={() => setRequestModalOpen(true)}
                className="w-full py-3.5 bg-[#15803D] hover:bg-[#0F5D28] text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-emerald-700/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                <span>Request This Item</span>
                <Send className="w-3.5 h-3.5" />
              </button>

            ) : (

              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold rounded-2xl text-center">
                This item is currently {donation.status.toLowerCase()}.
              </div>

            )}

          </div>
        </div>
      </div>

      {/* =====================================================
          SIMILAR DONATIONS
      ====================================================== */}
      {similarItems.length > 0 && (

        <div className="space-y-4 pt-6 border-t border-slate-100">

          <h3 className="font-extrabold text-lg text-slate-900">
            Similar Donations Nearby
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

            {similarItems.map((s) => (

              <Link
                key={s.id}
                to={`/donations/${s.id}`}
                className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all group"
              >

                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50 mb-3">

                  <img
                    src={s.primary_image}
                    alt={s.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />

                </div>

                <h4 className="font-bold text-xs text-slate-900 truncate group-hover:text-[#15803D] transition-colors">
                  {s.title}
                </h4>

                <span className="text-[11px] text-slate-400 mt-1 block">
                  {s.location?.split(',')[0]}
                </span>

              </Link>

            ))}

          </div>
        </div>
      )}

      {/* =====================================================
          REQUEST MODAL
      ====================================================== */}
      <Modal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        title={`Request "${donation.title}"`}
      >

        <form
          onSubmit={handleSubmitRequest}
          className="space-y-4 text-xs"
        >

          <p className="text-slate-600 leading-relaxed">
            Write a brief note to{' '}
            <strong>
              {donation.donor?.name || 'the donor'}
            </strong>{' '}
            explaining how you or your organization will put this item to good use.
          </p>

          <div>

            <label className="block font-bold text-slate-700 mb-1">
              Your Message to Donor
            </label>

            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Hi! I'm setting up a community study corner and this would be a wonderful addition..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none resize-none"
            />

          </div>

          <div className="flex justify-end gap-2 pt-2">

            <button
              type="button"
              onClick={() => setRequestModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-[#15803D] hover:bg-[#0F5D28] text-white rounded-xl font-bold shadow-sm flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />

              <span>
                {submitting
                  ? 'Submitting...'
                  : 'Submit Request'}
              </span>
            </button>

          </div>
        </form>
      </Modal>
    </div>
  );
}
