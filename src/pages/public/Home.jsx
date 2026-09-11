import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Truck,
  Heart,
  Shirt,
  BookOpen,
  Laptop,
  Armchair,
  Apple,
  Package,
  CheckCircle2,
  Sparkles,
  Users,
  Leaf,
  Globe2
} from 'lucide-react';
import { dashboardService } from '../../services/savedItemService';
import PopularDonations from '../../components/PopularDonations';

// Animated Counter component
function Counter({ value, suffix = '+' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = parseInt(value, 10) || 0;
    const duration = 1600;
    const stepTime = 20;
    const totalSteps = duration / stepTime;
    const increment = Math.ceil(end / totalSteps);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export default function Home() {
  const [stats, setStats] = useState({
    total_donations: 1250,
    active_donors: 850,
    receivers_helped: 1100,
    communities_served: 28,
  });

  useEffect(() => {
    dashboardService.getPublicStats()
      .then((data) => {
        if (data && typeof data === 'object') {
          setStats((prev) => ({ ...prev, ...data }));
        }
      })
      .catch(() => {});
  }, []);

  const categories = [
    { name: 'Clothes', icon: Shirt, count: '120+ items', color: 'bg-emerald-50 text-emerald-700', slug: 'clothes' },
    { name: 'Books', icon: BookOpen, count: '85+ items', color: 'bg-blue-50 text-blue-700', slug: 'books' },
    { name: 'Electronics', icon: Laptop, count: '64+ items', color: 'bg-indigo-50 text-indigo-700', slug: 'electronics' },
    { name: 'Furniture', icon: Armchair, count: '45+ items', color: 'bg-amber-50 text-amber-700', slug: 'furniture' },
    { name: 'Food', icon: Apple, count: '30+ crates', color: 'bg-rose-50 text-rose-700', slug: 'food' },
    { name: 'More', icon: Package, count: '50+ items', color: 'bg-teal-50 text-teal-700', slug: 'other' },
  ];

  const steps = [
    { number: '01', title: 'Donate', desc: 'List functional items you no longer use with clear product photos and condition notes.', icon: Package },
    { number: '02', title: 'Match', desc: 'Our smart rule-based engine pairs your donation with verified people or organizations in need.', icon: RefreshCw },
    { number: '03', title: 'Deliver', desc: 'Coordinate convenient public pickup or scheduled eco-courier handover.', icon: Truck },
    { number: '04', title: 'Impact', desc: 'Track waste diverted from landfills and community lives directly enriched.', icon: Sparkles },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  };

  return (
    <div className="space-y-24 pb-20 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 bg-gradient-to-b from-[#F0FDF4] via-[#F8FAFC] to-[#F0F7FB]">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none -z-0"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-teal-200/20 rounded-full blur-3xl pointer-events-none -z-0"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-7 space-y-6"
            >
              {/* Badge */}
              <motion.div variants={itemVariants}>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300/60 text-[#0F5D28] text-xs font-bold tracking-wide shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-[#15803D]" />
                  <span>CIRCULAR RESOURCE SHARING PLATFORM</span>
                </div>
              </motion.div>

              {/* Headline */}
              <motion.h1
                variants={itemVariants}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]"
              >
                Give What You Don't Need A{' '}
                <span className="text-[#15803D] underline decoration-emerald-200 decoration-wavy decoration-2">
                  Second Life.
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p
                variants={itemVariants}
                className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl"
              >
                A seamless platform connecting pre-loved item donations with communities in need. Turn your unused home items into someone else's treasure, responsibly and simply.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/donor/donations/create"
                  className="px-6 py-3.5 bg-[#15803D] hover:bg-[#0F5D28] text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-700/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                >
                  <span>Donate an Item</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/categories"
                  className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-2xl text-sm font-bold shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Find What You Need
                </Link>
              </motion.div>

              {/* Verified Trust Bar */}
              <motion.div
                variants={itemVariants}
                className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500 font-semibold"
              >
                <span className="flex items-center gap-1.5 text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  100% Verified Non-Profits
                </span>
                <span className="flex items-center gap-1.5 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Zero Platform Fees
                </span>
              </motion.div>
            </motion.div>

            {/* Right Hero Artwork */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-5 relative flex justify-center"
            >
              <div className="relative w-full max-w-md bg-white p-6 rounded-3xl shadow-xl border border-emerald-100/80">
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-tr from-emerald-50 to-emerald-100/40 flex items-center justify-center p-4">
                  <motion.img
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                    src="/images/secondlife_hero.jpeg"
                    alt="SecondLife donation illustration"
                    className="w-full h-full object-contain filter drop-shadow-md"
                  />
                </div>

                {/* Floating Stat Badge */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="mt-4 flex items-center justify-between px-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-xs font-bold text-slate-800">Over 1,250 items recirculated</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                    Zero Waste
                  </span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-soft grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        >
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#15803D]">
              <Counter value={stats.total_donations} />
            </div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Donations
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#15803D]">
              <Counter value={stats.active_donors} />
            </div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Donors
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#15803D]">
              <Counter value={stats.receivers_helped} />
            </div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Receivers Supported
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#15803D]">
              <Counter value={stats.communities_served} />
            </div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Communities Active
            </div>
          </div>
        </motion.div>
      </section>

      {/* Popular Donations Section (7 Product/Item Categories, ZERO humans) */}
      <PopularDonations />

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-12 space-y-3"
        >
          <span className="text-xs font-extrabold tracking-widest text-[#15803D] uppercase">
            SIMPLE PROCESS
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900">
            From Giving to Impact
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            We've designed a streamlined journey that makes donating and receiving effortless, accountable, and socially restorative.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#15803D] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-extrabold text-slate-200 group-hover:text-emerald-300 transition-colors">
                      {s.number}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Categories Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-extrabold tracking-widest text-[#15803D] uppercase">
              CIRCULAR MARKETPLACE
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Give More Than Things
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Explore the categories of items our community needs right now.
            </p>
          </div>
          <Link
            to="/categories"
            className="text-xs font-bold text-[#15803D] hover:text-[#0F5D28] flex items-center gap-1.5 group"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((c, idx) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <Link
                  to={`/categories?category=${c.slug}`}
                  className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all text-center flex flex-col items-center group block"
                >
                  <div className={`w-12 h-12 rounded-xl ${c.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">{c.name}</h4>
                  <span className="text-[10px] text-slate-400 font-medium">{c.count}</span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Why Second Life Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-emerald-900 to-[#0F5D28] text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl"
        >
          {/* Decorative accents */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-600/20 rounded-full blur-2xl pointer-events-none"></div>

          <div className="max-w-2xl relative z-10 space-y-4">
            <span className="text-xs font-extrabold tracking-widest text-emerald-300 uppercase">
              OUR SOCIAL & ECOLOGICAL MISSION
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight">
              Reduce Waste. Support Communities. Create Measurable Social Impact.
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              SecondLife isn't a marketplace for selling. It is a regenerative ecosystem connecting generous donors with individuals and non-profit organizations that put unused goods back to meaningful use.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                to="/register"
                className="px-6 py-3 bg-white hover:bg-emerald-50 text-[#0F5D28] rounded-xl text-xs font-bold shadow-md hover:scale-[1.02] transition-all"
              >
                Join Community Today
              </Link>
              <Link
                to="/about"
                className="px-6 py-3 bg-emerald-800/80 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all border border-emerald-600 hover:scale-[1.02]"
              >
                Read Our Impact Report
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl p-10 border border-slate-100 shadow-soft space-y-4"
        >
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Ready to Give Something a Second Life?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Whether you are clearing out your home or searching for items your family or non-profit needs, you belong here.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <Link
              to="/donor/donations/create"
              className="px-6 py-3 bg-[#15803D] hover:bg-[#0F5D28] text-white rounded-xl text-xs font-bold shadow-sm hover:scale-[1.02] transition-all"
            >
              Donate Now
            </Link>
            <Link
              to="/categories"
              className="px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold hover:scale-[1.02] transition-all"
            >
              Request an Item
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
