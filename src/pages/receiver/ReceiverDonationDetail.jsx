import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { donationService } from '../../services/donationService';
import { requestService } from '../../services/requestService';
import { savedItemService } from '../../services/savedItemService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import ConditionBadge from '../../components/ConditionBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';


import {
  ArrowLeft,
  Heart,
  MapPin,
  Truck,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';


// Homepage-only fallback donations.
// These IDs are intentionally non-numeric, so they can never be submitted
// to the backend as real donation requests.
const HOMEPAGE_DEFAULTS = {
  'homepage-default-chair': {
    id: 'homepage-default-chair',
    title: 'Comfort Chair',
    category: { name: 'Furniture & Chairs', slug: 'furniture' },
    description:
      'A clean, sturdy chair ready for a new home and a second life. This community-highlight item is shown on the homepage as a preview so visitors can explore what kinds of useful items can be shared through SecondLife.',
    condition: 'GOOD',
    quantity: 1,
    location: 'Johar Town, Lahore',
    delivery_option: 'PICKUP',
    status: 'AVAILABLE',
    donor: { name: 'Ayesha Khan', initials: 'AK', is_verified: true },
    donor_items_count: 12,
    images: [{ url: '/images/donations/chair.jpg' }],
    dimensions: 'Standard chair size',
    weight: 'Not provided',
    is_saved: false,
  },
  'homepage-default-jacket': {
    id: 'homepage-default-jacket',
    title: 'Winter Jacket',
    category: { name: 'Apparel & Shoes', slug: 'apparel' },
    description:
      'A warm everyday jacket in good condition, ready to be reused. This community-highlight item is shown on the homepage as a preview so visitors can explore useful clothing donations available through SecondLife.',
    condition: 'LIKE_NEW',
    quantity: 1,
    location: 'Gulberg, Lahore',
    delivery_option: 'PICKUP',
    status: 'AVAILABLE',
    donor: { name: 'Hamza Malik', initials: 'HM', is_verified: true },
    donor_items_count: 8,
    images: [{ url: '/images/donations/jacket.jpg' }],
    dimensions: 'Standard jacket size',
    weight: 'Not provided',
    is_saved: false,
  },
  'homepage-default-bag': {
    id: 'homepage-default-bag',
    title: 'Everyday Carry Bag',
    category: { name: 'Bags & Accessories', slug: 'bags' },
    description:
      'A practical carry bag looking for someone who can use it again. This community-highlight item is shown on the homepage as a preview and is not a live donation that can be requested.',
    condition: 'GOOD',
    quantity: 1,
    location: 'DHA Phase 6, Lahore',
    delivery_option: 'PICKUP',
    status: 'AVAILABLE',
    donor: { name: 'Sara Ahmed', initials: 'SA', is_verified: true },
    donor_items_count: 15,
    images: [{ url: '/images/donations/bags.jpg' }],
    dimensions: 'Standard carry-bag size',
    weight: 'Not provided',
    is_saved: false,
  },
  'homepage-default-kids': {
    id: 'homepage-default-kids',
    title: 'Kids Essentials',
    category: { name: 'Kids & Family', slug: 'kids' },
    description:
      'Useful family items kept ready for another child to enjoy. This community-highlight item is shown on the homepage as a preview and is not a live donation that can be requested.',
    condition: 'GOOD',
    quantity: 1,
    location: 'Model Town, Lahore',
    delivery_option: 'PICKUP',
    status: 'AVAILABLE',
    donor: { name: 'Usman Raza', initials: 'UR', is_verified: true },
    donor_items_count: 10,
    images: [{ url: '/images/donations/kids-accessories.jpg' }],
    dimensions: 'Standard kids-item size',
    weight: 'Not provided',
    is_saved: false,
  },
};

function resolveDonationImage(value) {
  if (!value) return '';

  const raw = String(value).trim();
  if (!raw) return '';

  if (raw.startsWith('/images/')) {
    return `${window.location.origin}${raw}`;
  }

  try {
    const parsed = new URL(raw, window.location.origin);
    if (parsed.pathname.startsWith('/images/')) {
      return `${window.location.origin}${parsed.pathname}${parsed.search}`;
    }
    return parsed.href;
  } catch {
    return raw;
  }
}

export default function ReceiverDonationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isAuthenticated, user } = useAuth();

  const [donation, setDonation] = useState(null);
  const [similarItems, setSimilarItems] = useState([]);
  const [activeImage, setActiveImage] = useState('');
  const [loading, setLoading] = useState(true);

  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);

    try {
      // Homepage fallback cards are frontend-only. Resolve them locally
      // instead of calling /api/donations/<fake-id>/, which caused
      // "Donation Not Found" when a default card was opened.
      const defaultDonation = HOMEPAGE_DEFAULTS[id];

      if (defaultDonation) {
        if (!isAuthenticated) {
          navigate('/login', { state: { from: `/donations/${id}` } });
          return;
        }
        setDonation(defaultDonation);
        setActiveImage(resolveDonationImage(defaultDonation.images?.[0]?.url));
        setSimilarItems([]);
        return;
      }

      // Real donations continue through the normal backend/API flow.
      const data = await donationService.getDonationById(id);

      setDonation(data);

      setActiveImage(
        resolveDonationImage(data.images?.find((image) => image.url)?.url)
      );

      if (data.category?.slug) {
        donationService
          .getDonations({
            category: data.category.slug,
            status: 'AVAILABLE',
          })
          .then((sim) => {
            setSimilarItems(
              sim
                .filter((s) => String(s.id) !== String(id))
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

  const isHomepageDefault =
    donation && Object.prototype.hasOwnProperty.call(HOMEPAGE_DEFAULTS, String(donation.id));

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      navigate('/register', { state: { from: `/donations/${donation.id}` } });
      return;
    }

    if (isHomepageDefault) {
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

  const handleSubmitRequest = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      showToast(
        'Please include a brief message explaining your need.',
        'info'
      );
      return;
    }

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

  if (loading) {
    return (
      <LoadingSpinner text="Loading donation specifications..." />
    );
  }

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

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 sm:space-y-8 px-3 sm:px-6 lg:px-8 py-5 sm:py-8 min-w-0">

      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        <div className="lg:col-span-7 space-y-4">

          <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-soft relative">

            {activeImage ? (
              <img
                src={activeImage}
                alt={donation.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <span className="text-sm font-semibold">No image provided</span>
              </div>
            )}

            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-extrabold text-slate-800 uppercase shadow-xs">
                {donation.category?.name}
              </span>
            </div>

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

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">

            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              Description
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {donation.description}
            </p>

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
                  {donation.weight ? `${donation.weight}${donation.weight_kg ? ` (${donation.weight_kg} kg each)` : ''}${donation.total_weight_kg ? ` • ${donation.total_weight_kg} kg total` : ''}` : 'Not provided'}
                </span>
              </div>

            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">

          <div className="bg-white rounded-3xl p-4 sm:p-8 border border-slate-100 shadow-soft space-y-5 sm:space-y-6 min-w-0">

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

            {isHomepageDefault ? (

              <div className="p-3 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-2xl text-center">
                Community highlight preview — requests are available only for live donations.
              </div>

            ) : donation.status === 'AVAILABLE' ? (

              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/register', {
                      state: { from: `/donations/${donation.id}`, action: 'request' },
                    });
                    return;
                  }
                  if (user?.role !== 'RECEIVER') {
                    showToast('Please sign in with a Receiver account to request an item.', 'info');
                    return;
                  }
                  setRequestModalOpen(true);
                }}
                className="w-full py-3.5 bg-[#15803D] hover:bg-[#0F5D28] text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-emerald-700/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                <span>{isAuthenticated ? 'Request This Item' : 'Sign Up to Request'}</span>
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
                    src={resolveDonationImage(s.primary_image)}
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

      {!isHomepageDefault && (
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
                {submitting ? 'Submitting...' : 'Submit Request'}
              </span>
            </button>

          </div>
        </form>
      </Modal>
      )}

    </div>
  );
}