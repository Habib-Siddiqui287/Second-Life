import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { donationService } from '../../services/donationService';
import { useToast } from '../../context/ToastContext';
import {
  Package,
  Upload,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Info,
  X
} from 'lucide-react';
import ConditionBadge from '../../components/ConditionBadge';

export default function CreateDonationWizard() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [form, setForm] = useState({
    title: '',
    category_id: '',
    description: '',
    condition: 'GOOD',
    quantity: 1,
    delivery_option: 'PICKUP',
    location: '',
    city: '',
    dimensions: '',
    weight: '',
    pickup_date: '',
    pickup_time: '',
    pickup_latitude: '',
    pickup_longitude: '',
    image_urls: [],
  });

  useEffect(() => {
    donationService.getCategories()
      .then((data) => {
        setCategories(data);
        if (data.length > 0) {
          setForm((f) => ({ ...f, category_id: data[0].id }));
        }
      })
      .catch(() => {});
  }, []);

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await donationService.uploadImage(file);
      setForm((prev) => ({
        ...prev,
        image_urls: [...prev.image_urls, res.url],
      }));
      showToast('Image uploaded successfully!', 'success');
    } catch (err) {
      console.error('Donation image upload error:', err);
      showToast(
        err.response?.data?.error ||
          'Could not upload image. Please try again.',
        'error'
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index) => {
    setForm((prev) => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== index),
    }));
  };

  const useLivePickupLocation = () => {
    if (!navigator.geolocation) return showToast('Live location is not supported by this browser.', 'error');
    navigator.geolocation.getCurrentPosition((position) => {
      const lat=position.coords.latitude.toFixed(7), lng=position.coords.longitude.toFixed(7);
      setForm(prev=>({...prev,pickup_latitude:lat,pickup_longitude:lng,location:`Live pickup location (${lat}, ${lng})`}));
      showToast('Live pickup location selected.', 'success');
    },()=>showToast('Please allow location access and try again.','error'),{enableHighAccuracy:true,timeout:10000});
  };

  const handlePublish = async () => {
    if (!form.category_id) {
      showToast('Please select a donation category.', 'error');
      setStep(2);
      return;
    }

    if (!form.city.trim() || !form.location.trim()) {
      showToast('Please enter the city and neighborhood/location.', 'error');
      setStep(3);
      return;
    }

    setLoading(true);
    try {
      await donationService.createDonation(form);
      showToast('Donation published successfully! 🌿', 'success');
      setStep(6);
    } catch (err) {
      showToast('Failed to publish donation. Please check form fields.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const conditionOptions = [
    { value: 'NEW', label: 'New in Box', desc: 'Unused, in original manufacturer packaging' },
    { value: 'LIKE_NEW', label: 'Like New', desc: 'Slightly used, excellent aesthetic and working condition' },
    { value: 'GOOD', label: 'Good Condition', desc: 'Minor visible cosmetic wear, fully functional' },
    { value: 'FAIR', label: 'Fair Condition', desc: 'Noticeable wear or minor repairs required' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Step Indicator */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
        <div className="flex items-center justify-between">
          {[
            { s: 1, label: 'Basic Info' },
            { s: 2, label: 'Category & Condition' },
            { s: 3, label: 'Logistics' },
            { s: 4, label: 'Photos' },
            { s: 5, label: 'Review & Publish' },
          ].map((item) => (
            <div key={item.s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  step === item.s
                    ? 'bg-[#15803D] text-white ring-4 ring-emerald-100'
                    : step > item.s
                    ? 'bg-emerald-100 text-[#15803D]'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {step > item.s ? <CheckCircle2 className="w-4 h-4" /> : item.s}
              </div>
              <span className="text-xs font-bold text-slate-700 hidden sm:inline">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: Basic Information */}
      {step === 1 && (
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-soft space-y-5">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Step 1: Item Overview</h2>
            <p className="text-xs text-slate-500 mt-1">What item are you giving a second life today?</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Item Title</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Vintage Oak Side Table or Children's Books Bundle"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Detailed Description</label>
            <textarea
              rows={4}
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe what the item is, brand, dimensions, story, and how it can be put to good use..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-none resize-none"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              disabled={!form.title.trim() || !form.description.trim()}
              onClick={() => setStep(2)}
              className="px-6 py-3 bg-[#15803D] hover:bg-[#0F5D28] disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <span>Next: Category & Condition</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Category & Condition */}
      {step === 2 && (
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-soft space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Step 2: Category & Condition</h2>
            <p className="text-xs text-slate-500 mt-1">Help receivers discover and verify your item.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Category</label>
            <select
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Item Condition</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {conditionOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => setForm({ ...form, condition: opt.value })}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    form.condition === opt.value
                      ? 'border-[#15803D] bg-emerald-50/50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-xs text-slate-900">{opt.label}</span>
                    <input
                      type="radio"
                      checked={form.condition === opt.value}
                      onChange={() => {}}
                      className="accent-[#15803D]"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">{opt.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-6 py-3 bg-[#15803D] hover:bg-[#0F5D28] text-white rounded-xl text-xs font-bold flex items-center gap-2"
            >
              <span>Next: Logistics</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Quantity & Location */}
      {step === 3 && (
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-soft space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Step 3: Location & Handover</h2>
            <p className="text-xs text-slate-500 mt-1">Specify how this item can be exchanged safely.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Quantity</label>
              <input
                type="number"
                min={1}
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Delivery Option</label>
              <select
                value={form.delivery_option}
                onChange={(e) => setForm({ ...form, delivery_option: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
              >
                <option value="PICKUP">Pickup by Receiver</option>
                <option value="DELIVERY">Eco-Courier Delivery</option>
                <option value="EITHER">Pickup or Delivery</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">City</label>
              <input
                type="text"
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Seattle"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Neighborhood / Location</label>
              <input
                type="text"
                required
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Ballard, Seattle, WA"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-xs font-bold text-slate-700 mb-1.5">Pickup Date</label><input type="date" value={form.pickup_date} onChange={e=>setForm({...form,pickup_date:e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"/></div>
            <div><label className="block text-xs font-bold text-slate-700 mb-1.5">Pickup Time</label><input type="time" value={form.pickup_time} onChange={e=>setForm({...form,pickup_time:e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"/></div>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><p className="text-xs font-extrabold text-slate-900">Pickup location</p><p className="text-[11px] text-slate-500">Use your live device location for the exact handover point.</p></div><button type="button" onClick={useLivePickupLocation} className="px-4 py-2 bg-[#15803D] text-white rounded-xl text-xs font-bold">Use My Live Location</button></div>{form.pickup_latitude && <p className="mt-2 text-[11px] font-semibold text-emerald-800">Selected: {form.pickup_latitude}, {form.pickup_longitude}</p>}</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Dimensions (Optional)</label>
              <input
                type="text"
                value={form.dimensions}
                onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
                placeholder='e.g. 24" W x 18" D x 22" H'
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Weight (lbs, optional)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={form.weight.replace(/\s*lbs?$/i, '')}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm({ ...form, weight: value === '' ? '' : `${value} lbs` });
                }}
                placeholder="e.g. 15 or 0.2"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">Enter any weight, including decimals such as 0.2 lbs.</p>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="px-6 py-3 bg-[#15803D] hover:bg-[#0F5D28] text-white rounded-xl text-xs font-bold flex items-center gap-2"
            >
              <span>Next: Photos</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Photos */}
      {step === 4 && (
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-soft space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Step 4: Upload Item Photos</h2>
            <p className="text-xs text-slate-500 mt-1">Clear photos help recipients verify condition quickly.</p>
          </div>

          {/* Upload Drop Area */}
          <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <Upload className="w-10 h-10 text-[#15803D] mx-auto mb-3" />
            <h4 className="font-bold text-sm text-slate-800">Upload item images</h4>
            <p className="text-[11px] text-slate-400 mt-1 mb-4">
              PNG, JPG, or WEBP up to 5MB. Item photographs only (no people).
            </p>
            <label className="px-5 py-2.5 bg-[#15803D] text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-[#0F5D28] inline-flex items-center gap-2 shadow-sm">
              <span>Choose Files</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                disabled={uploadingImage}
              />
            </label>
            {uploadingImage && <p className="text-xs text-emerald-700 font-bold mt-2">Uploading...</p>}
          </div>

          {/* Previews */}
          {form.image_urls.length > 0 && (
            <div>
              <span className="block text-xs font-bold text-slate-700 mb-2">Uploaded Images:</span>
              <div className="flex flex-wrap gap-3">
                {form.image_urls.map((url, index) => (
                  <div key={index} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(5)}
              className="px-6 py-3 bg-[#15803D] hover:bg-[#0F5D28] text-white rounded-xl text-xs font-bold flex items-center gap-2"
            >
              <span>Next: Review & Publish</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Review & Publish */}
      {step === 5 && (
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-soft space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Step 5: Review Your Donation</h2>
            <p className="text-xs text-slate-500 mt-1">Please confirm details before publishing to SecondLife.</p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 space-y-3 text-xs">
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-500 font-bold">Item Title</span>
              <span className="font-extrabold text-slate-900">{form.title}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-500 font-bold">Condition</span>
              <ConditionBadge condition={form.condition} />
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-500 font-bold">Location</span>
              <span className="font-semibold text-slate-800">{form.location}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-500 font-bold">Handover Option</span>
              <span className="font-semibold text-slate-800">{form.delivery_option}</span>
            </div>
            <div className="pt-1">
              <span className="text-slate-500 font-bold block mb-1">Description</span>
              <p className="text-slate-700 leading-relaxed">{form.description}</p>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(4)}
              className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold"
            >
              Back
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handlePublish}
              className="px-8 py-3 bg-[#15803D] hover:bg-[#0F5D28] text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2"
            >
              {loading ? 'Publishing...' : 'Publish Donation Now'}
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: Confirmation Screen */}
      {step === 6 && (
        <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-soft text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#15803D] flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Donation Submitted! 🎉</h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
              Your item is now live and waiting to be matched with someone who needs it. Thank you for contributing to a more sustainable, circular future.
            </p>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/donor/donations')}
              className="px-6 py-3 bg-[#15803D] text-white rounded-xl text-xs font-bold shadow-sm hover:bg-[#0F5D28]"
            >
              View My Donations
            </button>
            <button
              onClick={() => navigate('/donor')}
              className="px-6 py-3 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
