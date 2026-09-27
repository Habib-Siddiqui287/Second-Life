import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Heart, Filter, Eye, Sparkles } from 'lucide-react';
import { donationService } from '../../services/donationService';
import { savedItemService } from '../../services/savedItemService';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import ConditionBadge from '../../components/ConditionBadge';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function BrowseDonations() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

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

  const fetchItems = (showLoader = true) => {
    if (showLoader) setLoading(true);
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
  };

  useEffect(() => {
    fetchItems();
    const interval = setInterval(() => fetchItems(false), 5000);

    return () => clearInterval(interval);
  }, [selectedCategory, selectedCondition, searchQuery]);

  const handleToggleSave = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await savedItemService.toggleSave(id);
      showToast(res.message, 'success');
      setDonations((prev) =>
        prev.map((d) => (d.id === id ? { ...d, is_saved: res.saved } : d))
      );
    } catch (err) {
      showToast('Please login to bookmark items.', 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Location Pin (Matches Design Image 12) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Browse Donations</h1>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold mt-0.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>Available across the community</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search clothes, furniture, books..."
            value={searchQuery}
            onChange={(e) => {
              const val = e.target.value;
              if (val) searchParams.set('search', val);
              else searchParams.delete('search');
              setSearchParams(searchParams);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-none shadow-sm"
          />
        </div>
      </div>

      {/* Category Pills (Matches Design Image 12) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => {
            searchParams.delete('category');
            setSearchParams(searchParams);
          }}
          className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
            selectedCategory === 'all'
              ? 'bg-[#15803D] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          All Items
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              searchParams.set('category', c.slug);
              setSearchParams(searchParams);
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory.toLowerCase() === c.slug.toLowerCase()
                ? 'bg-[#15803D] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Grid of Donation Cards */}
      {loading ? (
        <LoadingSpinner text="Searching available community donations..." />
      ) : donations.length === 0 ? (
        <EmptyState
          title="No available items found"
          message="Try adjusting your filters or search terms."
          actionLabel="Clear Filters"
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
              className="bg-white rounded-3xl border border-slate-100 shadow-card hover:shadow-elevated transition-all duration-300 overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Item Image with Heart bookmark & category */}
                <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden">
                  <img
                    src={item.primary_image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-extrabold text-slate-800 uppercase shadow-xs">
                      {item.category?.name}
                    </span>
                  </div>

                  {/* Bookmark Button */}
                  <button
                    onClick={(e) => handleToggleSave(item.id, e)}
                    className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
                      item.is_saved
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white/80 hover:bg-white text-slate-600 hover:text-rose-600'
                    }`}
                    title={item.is_saved ? 'Saved' : 'Save Item'}
                  >
                    <Heart className={`w-4 h-4 ${item.is_saved ? 'fill-current' : ''}`} />
                  </button>

                  {/* Smart Match badge if applicable */}
                  {item.match_score && item.match_score >= 70 && (
                    <div className="absolute bottom-3 left-3">
                      <span className="px-2.5 py-1 bg-[#15803D]/95 text-white backdrop-blur-sm rounded-full text-[10px] font-extrabold shadow-sm flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>{item.match_score}% Match</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between gap-1">
                    <ConditionBadge condition={item.condition} />
                    <span className="text-[11px] font-medium text-slate-400 truncate">
                      {item.location?.split(',')[0]}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-900 line-clamp-1 group-hover:text-[#15803D] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-slate-50 flex items-center justify-between mt-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-[#15803D] font-extrabold text-[9px] flex items-center justify-center shrink-0">
                    {item.donor_initials}
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 truncate max-w-[90px]">
                    {item.donor_name}
                  </span>
                </div>

                <Link
                  to={`/receiver/donations/${item.id}`}
                  className="px-3.5 py-1.5 bg-emerald-50 hover:bg-[#15803D] text-[#15803D] hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                >
                  <span>View Details</span>
                  <Eye className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
