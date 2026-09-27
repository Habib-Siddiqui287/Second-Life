import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { savedItemService } from '../../services/savedItemService';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import ConditionBadge from '../../components/ConditionBadge';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Heart, Eye, ArrowRight } from 'lucide-react';

export default function SavedItems() {
  const { showToast } = useToast();
  const [savedList, setSavedList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = () => {
    setLoading(true);
    savedItemService.getSavedItems()
      .then((data) => setSavedList(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleRemove = async (donationId, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await savedItemService.toggleSave(donationId);
      showToast('Removed from saved items.', 'info');
      setSavedList((prev) => prev.filter((item) => item.donation?.id !== donationId));
    } catch (err) {
      showToast('Could not remove bookmark.', 'error');
    }
  };

  if (loading) return <LoadingSpinner text="Loading saved items..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Saved Items</h1>
        <p className="text-xs text-slate-500">Items you've bookmarked for later consideration.</p>
      </div>

      {savedList.length === 0 ? (
        <EmptyState
          title="No saved items yet"
          message="When browsing donations, click the heart icon on any card to bookmark it here."
          actionLabel="Browse Available Donations"
          onAction={() => (window.location.href = '/receiver/browse')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {savedList.map((entry) => {
            const item = entry.donation;
            if (!item) return null;
            return (
              <div
                key={entry.id}
                className="bg-white rounded-3xl border border-slate-100 shadow-card hover:shadow-elevated transition-all overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden">
                    <img src={item.primary_image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-extrabold text-slate-800 uppercase shadow-xs">
                        {item.category?.name}
                      </span>
                    </div>
                    {/* Unbookmark button */}
                    <button
                      onClick={(e) => handleRemove(item.id, e)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-emerald-600 text-white shadow-sm hover:scale-110 transition-transform"
                      title="Remove Bookmark"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <ConditionBadge condition={item.condition} />
                      <span className="text-[11px] font-medium text-slate-400">{item.location?.split(',')[0]}</span>
                    </div>

                    <h3 className="font-extrabold text-sm text-slate-900 truncate group-hover:text-[#15803D] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-slate-50 flex items-center justify-between mt-3">
                  <span className="text-[11px] font-bold text-slate-700 truncate max-w-[100px]">
                    {item.donor_name}
                  </span>
                  <Link
                    to={`/receiver/donations/${item.id}`}
                    className="px-3.5 py-1.5 bg-emerald-50 hover:bg-[#15803D] text-[#15803D] hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <span>View Item</span>
                    <Eye className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
