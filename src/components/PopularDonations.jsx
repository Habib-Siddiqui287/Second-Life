import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  MapPin,
  Eye,
} from 'lucide-react';

import { donationService } from '../services/donationService';

const FILTERS = [
  { label: 'All Items', key: 'all' },
  { label: 'Furniture & Chairs', key: 'furniture' },
  { label: 'Apparel & Shoes', key: 'apparel' },
  { label: 'Bags & Accessories', key: 'bags' },
  { label: 'Kids & Family', key: 'kids' },
];

// These are ONLY homepage fallback cards.
// They are never sent to the backend and therefore never appear
// in donor/receiver donation data.
const DEFAULT_DONATIONS = [
  {
    id: 'homepage-default-chair',
    name: 'Comfort Chair',
    category: 'Furniture & Chairs',
    group: 'furniture',
    description: 'A clean, sturdy chair ready for a new home and a second life.',
    condition: 'Good',
    image: '/images/donations/chair.jpg',
    location: 'Johar Town, Lahore',
    availability: 'Available',
    views: 18,
    donor: 'Ayesha Khan',
  },
  {
    id: 'homepage-default-jacket',
    name: 'Winter Jacket',
    category: 'Apparel & Shoes',
    group: 'apparel',
    description: 'A warm everyday jacket in good condition, ready to be reused.',
    condition: 'Like New',
    image: '/images/donations/jacket.jpg',
    location: 'Gulberg, Lahore',
    availability: 'Available',
    views: 24,
    donor: 'Hamza Malik',
  },
  {
    id: 'homepage-default-bag',
    name: 'Everyday Carry Bag',
    category: 'Bags & Accessories',
    group: 'bags',
    description: 'A practical carry bag looking for someone who can use it again.',
    condition: 'Good',
    image: '/images/donations/bags.jpg',
    location: 'DHA Phase 6, Lahore',
    availability: 'Available',
    views: 12,
    donor: 'Sara Ahmed',
  },
  {
    id: 'homepage-default-kids',
    name: 'Kids Essentials',
    category: 'Kids & Family',
    group: 'kids',
    description: 'Useful family items kept ready for another child to enjoy.',
    condition: 'Good',
    image: '/images/donations/kids-accessories.jpg',
    location: 'Model Town, Lahore',
    availability: 'Available',
    views: 9,
    donor: 'Usman Raza',
  },
];

const CATEGORY_FALLBACK_IMAGES = {
  furniture: '/images/donations/chair.jpg',
  apparel: '/images/donations/jacket.jpg',
  bags: '/images/donations/bags.jpg',
  kids: '/images/donations/kids-accessories.jpg',
  other: '/images/donations/furniture.jpg',
};

function getCategoryGroup(item) {
  const categoryName =
    item?.category_name ||
    item?.category?.name ||
    item?.category ||
    '';

  const categorySlug =
    item?.category_slug ||
    item?.category?.slug ||
    String(categoryName)
      .toLowerCase()
      .replace(/\s+/g, '-');

  const text = [
    categorySlug,
    item?.title,
    item?.name,
    item?.item_name,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (
    ['furniture', 'chair', 'chairs', 'table', 'desk', 'sofa', 'couch'].some((x) =>
      text.includes(x)
    )
  ) {
    return 'furniture';
  }

  if (
    ['clothes', 'clothing', 'apparel', 'shoes', 'shoe', 'jacket', 'suit', 'coat', 'footwear'].some(
      (x) => text.includes(x)
    )
  ) {
    return 'apparel';
  }

  if (
    ['bag', 'bags', 'accessor', 'backpack', 'purse'].some((x) =>
      text.includes(x)
    )
  ) {
    return 'bags';
  }

  if (
    ['kid', 'kids', 'family', 'toy', 'baby', 'child', 'children'].some((x) =>
      text.includes(x)
    )
  ) {
    return 'kids';
  }

  return 'other';
}

function resolveImageUrl(value, fallback) {
  if (!value) return fallback;

  const raw = String(value).trim();
  if (!raw) return fallback;

  if (raw.startsWith('/images/')) {
    return `${window.location.origin}${raw}`;
  }

  try {
    const parsed = new URL(raw, window.location.origin);

    // Demo/static item images live in the frontend public folder. The API
    // may return them as http://127.0.0.1:8000/images/... or another backend
    // origin, so always serve /images/... from the current frontend origin.
    if (parsed.pathname.startsWith('/images/')) {
      return `${window.location.origin}${parsed.pathname}${parsed.search}`;
    }

    return parsed.href;
  } catch {
    return raw;
  }
}

function normalizeDonation(item) {
  if (!item) return null;

  const categoryName =
    item.category_name ||
    item.category?.name ||
    item.category ||
    'Other';

  const group = getCategoryGroup(item);

  return {
    id: item.id,
    name:
      item.title ||
      item.name ||
      item.item_name ||
      'Donation',
    category: categoryName,
    group,
    description:
      item.description ||
      'A community donation ready for a new home.',
    condition:
      item.condition_display ||
      item.condition ||
      'Good',
    // Prefer the real uploaded image from the backend.
    // If it is missing, use a real item photo from public/images/donations.
    image: resolveImageUrl(
      item.primary_image ||
        item.image_url ||
        item.image ||
        item.photo,
      CATEGORY_FALLBACK_IMAGES[group]
    ),
    location:
      item.location ||
      item.city ||
      item.pickup_location ||
      'Community Location',
    availability:
      item.status_display ||
      item.status ||
      'Available',
    views:
      item.views_count ??
      item.views ??
      item.view_count ??
      0,
    donor:
      item.donor_name ||
      item.donor?.name ||
      item.user_name ||
      '',
  };
}

export default function PopularDonations() {
  const [items, setItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    let firstLoad = true;

    async function loadDonations() {
      try {
        if (firstLoad) setLoading(true);
        setError('');

        const response = await donationService.getDonations({
          status: 'available',
        });

        if (!mounted) return;

        const results = Array.isArray(response)
          ? response
          : response?.results || [];

        const normalized = results
          .map(normalizeDonation)
          .filter(Boolean);

        // Show up to four newest real donations first. Any remaining
        // slots are filled by the four frontend-only Pakistani defaults.
        // As new donations arrive, they replace default slots one by one.
        setItems(normalized.slice(0, 4));
        firstLoad = false;
      } catch (err) {
        console.error('Failed to load popular donations:', err);

        if (mounted) {
          // On API failure, keep the homepage useful by showing defaults.
          // These defaults are frontend-only and are NOT receiver data.
          setItems([]);
          setError('');
          firstLoad = false;
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDonations();

    // New real donations appear on the homepage automatically.
    const interval = setInterval(loadDonations, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const displayItems = useMemo(() => {
    const source = [
      ...items,
      ...DEFAULT_DONATIONS.slice(items.length, 4),
    ];

    if (activeFilter === 'all') return source;

    return source.filter((item) => item.group === activeFilter);
  }, [items, activeFilter]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#15803D] text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-200/50">
            <Sparkles className="w-3.5 h-3.5" />
            <span>COMMUNITY HIGHLIGHTS</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Popular Donations
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Real donations shared by generous community donors. Find something useful and give it a second life.
          </p>
        </div>

        <Link
          to="/categories"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#15803D] hover:text-[#0F5D28] group transition-colors self-start md:self-auto"
        >
          <span>Explore All Donations</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {FILTERS.map((filter) => (
          <button
            key={filter.key}
            type="button"
            onClick={() => setActiveFilter(filter.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeFilter === filter.key
                ? 'bg-[#15803D] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm animate-pulse"
            >
              <div className="aspect-[4/3] bg-slate-200" />
              <div className="p-5 space-y-4">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-5 bg-slate-200 rounded w-3/4" />
                <div className="h-10 bg-slate-200 rounded" />
                <div className="h-10 bg-slate-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cards */}
      {!loading && displayItems.length > 0 && (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {displayItems.map((item, idx) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                whileHover={{ y: -6 }}
              >
                <Link
                  to={String(item.id).startsWith('homepage-default-') ? '/login' : `/donations/${item.id}`}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-soft hover:shadow-xl transition-all duration-300 flex flex-col group h-full"
                >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      const fallback =
                        CATEGORY_FALLBACK_IMAGES[item.group] ||
                        CATEGORY_FALLBACK_IMAGES.other;

                      if (e.currentTarget.dataset.fallbackApplied === 'true') return;

                      e.currentTarget.dataset.fallbackApplied = 'true';
                      e.currentTarget.src = fallback;
                    }}
                  />

                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-full text-[11px] font-bold text-slate-800 shadow-sm">
                      {item.category}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-full shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-800">
                      {item.availability}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-50 text-[#15803D] border-emerald-200">
                        {item.condition}
                      </span>

                      <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {item.views}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#15803D] transition-colors line-clamp-1">
                      {item.name}
                    </h3>

                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>

                    {item.donor && (
                      <p className="text-xs text-slate-400 pt-1">
                        Donated by {item.donor}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>

                    <span className="w-full py-2.5 px-4 bg-emerald-50 group-hover:bg-[#15803D] text-[#15803D] group-hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200">
                      <span>{String(item.id).startsWith('homepage-default-') ? 'Sign in to view' : 'View Donation'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Empty state only if a real filter has no matching item. */}
      {!loading && displayItems.length === 0 && (
        <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center">
          <Sparkles className="w-8 h-8 mx-auto mb-3 text-emerald-600" />
          <h3 className="text-lg font-bold text-slate-900">
            No donations in this category yet
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Try another category or check back when a new donation is shared.
          </p>
        </div>
      )}
    </section>
  );
}
