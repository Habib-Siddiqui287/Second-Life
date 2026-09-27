import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, Bookmark, Eye, CheckCircle2 } from 'lucide-react';
import { donationService } from '../../services/donationService';
import StatusBadge from '../../components/StatusBadge';
import ConditionBadge from '../../components/ConditionBadge';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Categories() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [donations, setDonations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const selectedCategory = searchParams.get('category') || 'all';
  const selectedCondition = searchParams.get('condition') || 'all';
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    donationService.getCategories()
      .then((cats) => setCategories(cats))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {
      status: 'AVAILABLE',
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      condition: selectedCondition !== 'all' ? selectedCondition : undefined,
      search: searchQuery || undefined,
    };

    donationService.getDonations(params)
      .then((data) => setDonations(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedCategory, selectedCondition, searchQuery]);

  const handleCategoryChange = (catSlug) => {
    searchParams.set('category', catSlug);
    setSearchParams(searchParams);
  };

  const handleConditionChange = (cond) => {
    searchParams.set('condition', cond);
    setSearchParams(searchParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = e.target.elements.search.value;
    if (q) {
      searchParams.set('search', q);
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Explore Donations</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Discover available items ready for a second life in your community.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            name="search"
            defaultValue={searchQuery}
            type="text"
            placeholder="Search clothes, books, chairs..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs focus:outline-none focus:border-emerald-600 shadow-sm"
          />
        </form>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => handleCategoryChange('all')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
            selectedCategory === 'all'
              ? 'bg-[#15803D] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          All Items
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => handleCategoryChange(c.slug)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory.toLowerCase() === c.slug.toLowerCase()
                ? 'bg-[#15803D] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Condition filters */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <span>Condition:</span>
        {['all', 'NEW', 'LIKE_NEW', 'GOOD', 'FAIR'].map((cond) => (
          <button
            key={cond}
            onClick={() => handleConditionChange(cond)}
            className={`px-3 py-1 rounded-xl text-[11px] transition-colors ${
              selectedCondition === cond
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {cond === 'all' ? 'Any' : cond.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      {loading ? (
        <LoadingSpinner text="Searching available donations..." />
      ) : donations.length === 0 ? (
        <EmptyState
          title="No items found"
          message="Try selecting another category or clearing your search filters."
          actionLabel="View All Items"
          onAction={() => {
            searchParams.delete('category');
            searchParams.delete('condition');
            searchParams.delete('search');
            setSearchParams(searchParams);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {donations.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-100 shadow-card hover:shadow-elevated transition-all duration-300 overflow-hidden flex flex-col group"
            >
              {/* Image box */}
              <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden">
                <img
                  src={item.primary_image || '/images/secondlife_hero.jpeg'}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-extrabold text-slate-800 uppercase tracking-wider shadow-sm">
                    {item.category?.name}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <ConditionBadge condition={item.condition} />
                    <span className="text-[11px] font-medium text-slate-400">
                      {item.location}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-[#15803D] transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Donor & CTA */}
                <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-[#15803D] font-extrabold text-[9px] flex items-center justify-center">
                      {item.donor_initials}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-700 truncate max-w-[90px]">
                      {item.donor_name}
                    </span>
                  </div>

                  <Link
                    to={`/receiver/donations/${item.id}`}
                    className="px-3.5 py-1.5 bg-emerald-50 hover:bg-[#15803D] text-[#15803D] hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <span>View</span>
                    <Eye className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
