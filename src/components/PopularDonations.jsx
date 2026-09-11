import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, MapPin, Tag, Eye } from 'lucide-react';

export const POPULAR_ITEMS = [
  {
    id: 'chair-1',
    name: 'Solid Birch Ergonomic Dining Chair',
    category: 'Chairs',
    group: 'furniture',
    slug: 'furniture',
    image: '/images/donations/chair.jpg',
    description: 'Clean Scandinavian minimalist wooden chair with contoured curved backrest. Extremely sturdy and balanced.',
    condition: 'Like New',
    conditionColor: 'bg-emerald-50 text-[#15803D] border-emerald-200',
    location: 'Seattle, WA (Capitol Hill)',
    availability: 'Available',
    views: 42,
  },
  {
    id: 'bags-1',
    name: 'Heavyweight Canvas Daypack & Leather Tote',
    category: 'Bags',
    group: 'bags',
    slug: 'clothes',
    image: '/images/donations/bags.jpg',
    description: 'Durable reinforced commuter backpack with brass hardware and complementary zip utility organizer.',
    condition: 'Excellent',
    conditionColor: 'bg-blue-50 text-blue-700 border-blue-200',
    location: 'Seattle, WA (Fremont)',
    availability: 'Available',
    views: 68,
  },
  {
    id: 'suit-1',
    name: 'Tailored Navy Wool Two-Piece Suit',
    category: 'Suits',
    group: 'apparel',
    slug: 'clothes',
    image: '/images/donations/suit.jpg',
    description: 'Classic fit business suit jacket and matching trousers. Professional dry-cleaned, ready for job interviews.',
    condition: 'Like New',
    conditionColor: 'bg-emerald-50 text-[#15803D] border-emerald-200',
    location: 'Bellevue, WA',
    availability: 'Available',
    views: 55,
  },
  {
    id: 'kids-1',
    name: 'Educational Wooden Blocks & Plush Bear',
    category: 'Kids Accessories',
    group: 'kids',
    slug: 'other',
    image: '/images/donations/kids-accessories.jpg',
    description: 'Non-toxic solid wood sensory learning blocks paired with a sanitized huggable plush companion.',
    condition: 'Gently Used',
    conditionColor: 'bg-teal-50 text-teal-700 border-teal-200',
    location: 'Seattle, WA (Ballard)',
    availability: 'Available',
    views: 37,
  },
  {
    id: 'jacket-1',
    name: 'Weatherproof Thermal Down Puffer Jacket',
    category: 'Jackets',
    group: 'apparel',
    slug: 'clothes',
    image: '/images/donations/jacket.jpg',
    description: 'Deep olive insulated winter jacket with fleece-lined hood and storm-flap zip closure. Size Large.',
    condition: 'Like New',
    conditionColor: 'bg-emerald-50 text-[#15803D] border-emerald-200',
    location: 'Seattle, WA (Queen Anne)',
    availability: 'Available',
    views: 89,
  },
  {
    id: 'shoes-1',
    name: 'Classic White Leather Low-Top Sneakers',
    category: 'Shoes',
    group: 'apparel',
    slug: 'clothes',
    image: '/images/donations/shoes.jpg',
    description: 'Clean minimal unisex leather sneakers with cushioned insoles and durable vulcanized rubber soles.',
    condition: 'Excellent',
    conditionColor: 'bg-blue-50 text-blue-700 border-blue-200',
    location: 'Seattle, WA (University Dist)',
    availability: 'Available',
    views: 74,
  },
  {
    id: 'furniture-1',
    name: 'Handcrafted Heritage Oak Accent Table',
    category: 'Furniture',
    group: 'furniture',
    slug: 'furniture',
    image: '/images/donations/furniture.jpg',
    description: 'Solid carved wood nightstand or accent side table with smooth slide drawer and rich warm satin patina.',
    condition: 'Good',
    conditionColor: 'bg-amber-50 text-amber-800 border-amber-200',
    location: 'Kirkland, WA',
    availability: 'Available',
    views: 61,
  },
];

const FILTERS = [
  { label: 'All Items (7)', key: 'all' },
  { label: 'Furniture & Chairs', key: 'furniture' },
  { label: 'Apparel & Shoes', key: 'apparel' },
  { label: 'Bags & Accessories', key: 'bags' },
  { label: 'Kids & Family', key: 'kids' },
];

export default function PopularDonations() {
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredItems =
    activeFilter === 'all'
      ? POPULAR_ITEMS
      : POPULAR_ITEMS.filter((item) => item.group === activeFilter);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
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
            Real functional goods shared by generous community donors. High quality, zero waste, ready for rehoming.
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

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setActiveFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeFilter === f.key
                ? 'bg-[#15803D] text-white shadow-sm shadow-emerald-700/20'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 hover:border-slate-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
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
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              whileHover={{ y: -6 }}
              className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-soft hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              {/* Card Image Container */}
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />

                {/* Category Badge (Top Left) */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-full text-[11px] font-bold text-slate-800 shadow-sm border border-white/60">
                    {item.category}
                  </span>
                </div>

                {/* Availability Badge (Top Right) */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-full shadow-sm border border-white/60">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] font-bold text-emerald-800">
                    {item.availability}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    {/* Condition Pill */}
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${item.conditionColor}`}
                    >
                      {item.condition}
                    </span>

                    {/* Views Count */}
                    <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <Eye className="w-3 h-3 text-slate-400" />
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

                {/* Footer: Location & Button */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>

                  <Link
                    to={`/categories?category=${item.slug}`}
                    className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-[#15803D] text-[#15803D] hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 group/btn shadow-sm"
                  >
                    <span>View Donation</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
