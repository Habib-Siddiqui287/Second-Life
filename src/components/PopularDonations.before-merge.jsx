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

function normalizeDonation(item) {
  if (!item) return null;

  const categoryName =
    item.category_name ||
    item.category?.name ||
    item.category ||
    'Other';

  const categorySlug =
    item.category_slug ||
    item.category?.slug ||
    String(categoryName)
      .toLowerCase()
      .replace(/\s+/g, '-');

  let group = 'other';

  if (
    ['furniture', 'chair', 'chairs'].some((x) =>
      categorySlug.includes(x)
    )
  ) {
    group = 'furniture';
  } else if (
    ['clothes', 'clothing', 'apparel', 'shoes', 'jacket'].some((x) =>
      categorySlug.includes(x)
    )
  ) {
    group = 'apparel';
  } else if (
    ['bag', 'bags', 'accessor'].some((x) =>
      categorySlug.includes(x)
    )
  ) {
    group = 'bags';
  } else if (
    ['kid', 'kids', 'family', 'toy', 'baby'].some((x) =>
      categorySlug.includes(x)
    )
  ) {
    group = 'kids';
  }

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

    image:
      item.image_url ||
      item.image ||
      item.photo ||
      '/images/secondlife_hero.jpeg',

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
      item.views ??
      item.view_count ??
      0,
  };
}

export default function PopularDonations() {
  const [items, setItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadDonations() {
      try {
        setLoading(true);
        setError('');

        const response = await donationService.getDonations({
          status: 'available',
        });

        if (!mounted) return;

        // DRF pagination support
        const results = Array.isArray(response)
          ? response
          : response?.results || [];

        const normalized = results
          .map(normalizeDonation)
          .filter(Boolean);

        setItems(normalized);
      } catch (err) {
        console.error('Failed to load popular donations:', err);

        if (mounted) {
          setItems([]);
          setError('Unable to load donations right now.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDonations();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') {
      return items;
    }

    return items.filter(
      (item) => item.group === activeFilter
    );
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
            Real donations shared by generous community donors.
            Find something useful and give it a second life.
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

      {/* Error */}
      {!loading && error && (
        <div className="bg-white border border-red-100 rounded-3xl p-8 text-center">
          <p className="text-sm text-red-600 font-semibold">
            {error}
          </p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filteredItems.length === 0 && (
        <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center">
          <Sparkles className="w-8 h-8 mx-auto mb-3 text-emerald-600" />

          <h3 className="text-lg font-bold text-slate-900">
            No donations available yet
          </h3>

          <p className="text-sm text-slate-500 mt-1">
            New donations from community donors will appear here.
          </p>
        </div>
      )}

      {/* Cards */}
      {!loading && !error && filteredItems.length > 0 && (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {filteredItems.map((item, idx) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.35,
                  delay: idx * 0.05,
                }}
                whileHover={{ y: -6 }}
                className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-soft hover:shadow-xl transition-all duration-300 flex flex-col group"
              >

                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">

                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src =
                        '/images/secondlife_hero.jpeg';
                    }}
                  />

                  {/* Category */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-full text-[11px] font-bold text-slate-800 shadow-sm">
                      {item.category}
                    </span>
                  </div>

                  {/* Availability */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-full shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />

                    <span className="text-[10px] font-bold text-emerald-800">
                      {item.availability}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">

                  <div className="space-y-2">

                    {/* Condition + Views */}
                    <div className="flex items-center justify-between gap-2">

                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-50 text-[#15803D] border-emerald-200">
                        {item.condition}
                      </span>

                      <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {item.views}
                      </span>

                    </div>

                    {/* Title */}
                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#15803D] transition-colors line-clamp-1">
                      {item.name}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>

                  </div>

                  {/* Footer */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />

                      <span className="truncate">
                        {item.location}
                      </span>
                    </div>

                    <Link
                      to={`/donations/${item.id}`}
                      className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-[#15803D] text-[#15803D] hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200"
                    >
                      <span>View Donation</span>

                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                  </div>

                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

    </section>
  );
}