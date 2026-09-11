import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { User, Building2, Heart, Gift, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [accountType, setAccountType] = useState('INDIVIDUAL'); // INDIVIDUAL or ORGANIZATION
  const [role, setRole] = useState('DONOR'); // DONOR or RECEIVER

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    address: '',
    city: 'Seattle',
    country: 'USA',
    organization_name: '',
    organization_type: 'NGO',
    license_number: '',
    website: '',
    org_description: '',
    preferred_categories: ['furniture', 'clothes'],
    needed_categories: ['furniture', 'books'],
  });

  const categoriesList = [
    { id: 'clothes', label: 'Clothes' },
    { id: 'books', label: 'Books' },
    { id: 'electronics', label: 'Electronics' },
    { id: 'furniture', label: 'Furniture' },
    { id: 'food', label: 'Food' },
    { id: 'other', label: 'Other Utility' },
  ];

  const toggleCategory = (catId) => {
    if (role === 'DONOR') {
      const current = form.preferred_categories;
      const updated = current.includes(catId) ? current.filter((c) => c !== catId) : [...current, catId];
      setForm({ ...form, preferred_categories: updated });
    } else {
      const current = form.needed_categories;
      const updated = current.includes(catId) ? current.filter((c) => c !== catId) : [...current, catId];
      setForm({ ...form, needed_categories: updated });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    if (accountType === 'ORGANIZATION' && !form.organization_name.trim()) {
      showToast('Organization Name is required for organization accounts.', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        account_type: accountType,
        role: role,
      };

      const user = await register(payload);
      showToast('Account registered successfully! Welcome aboard! 🌱', 'success');

      if (user.role === 'DONOR') {
        navigate('/donor', { replace: true });
      } else {
        navigate('/receiver', { replace: true });
      }
    } catch (err) {
      console.error("Registration status:", err.response?.status);
      console.error("Registration response:", err.response?.data);

      const status = err.response?.status;
      const data = err.response?.data;
      let msg = 'Registration failed. Please check your information.';

      if (!err.response) {
        msg = 'Unable to connect to SecondLife server. Please check your network or ensure the backend is running.';
      } else if (status === 404 || status === 405) {
        msg = `Backend API endpoint unreachable on this domain (HTTP ${status}). If testing locally, please open http://localhost:5173. For production, connect a deployed backend service.`;
      } else if (status === 500) {
        msg = 'Server encountered an error processing registration. Please try again.';
      } else if (data) {
        if (typeof data === 'string' && data.length > 0 && !data.startsWith('<!DOCTYPE')) {
          msg = data;
        } else if (typeof data === 'object') {
          const errorsList = [];
          for (const [key, value] of Object.entries(data)) {
            const fieldLabel = key
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (c) => c.toUpperCase());
            const text = Array.isArray(value) ? value.join(' ') : String(value);
            errorsList.push(`${fieldLabel}: ${text}`);
          }
          if (errorsList.length > 0) {
            msg = errorsList.join(' | ');
          }
        }
      }
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-soft">
      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
            step >= 1 ? 'bg-[#15803D] text-white' : 'bg-slate-100 text-slate-500'
          }`}>1</span>
          <span className="text-xs font-bold text-slate-700 hidden sm:inline">Entity</span>
        </div>
        <div className="h-0.5 w-8 bg-slate-200" />
        <div className="flex items-center gap-2">
          <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
            step >= 2 ? 'bg-[#15803D] text-white' : 'bg-slate-100 text-slate-500'
          }`}>2</span>
          <span className="text-xs font-bold text-slate-700 hidden sm:inline">Role</span>
        </div>
        <div className="h-0.5 w-8 bg-slate-200" />
        <div className="flex items-center gap-2">
          <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
            step >= 3 ? 'bg-[#15803D] text-white' : 'bg-slate-100 text-slate-500'
          }`}>3</span>
          <span className="text-xs font-bold text-slate-700 hidden sm:inline">Profile</span>
        </div>
      </div>

      {/* STEP 1: Account Type Selection */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="text-center">
            <h2 className="text-xl font-extrabold text-slate-900">Choose Account Type</h2>
            <p className="text-xs text-slate-500 mt-1">
              How will you be participating in SecondLife?
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setAccountType('INDIVIDUAL')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                accountType === 'INDIVIDUAL'
                  ? 'border-[#15803D] bg-emerald-50/50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-white text-[#15803D] shadow-sm flex items-center justify-center mb-3">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">Individual</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Contributing or requesting items personally on behalf of yourself or family.
                </p>
              </div>
            </div>

            <div
              onClick={() => setAccountType('ORGANIZATION')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                accountType === 'ORGANIZATION'
                  ? 'border-[#15803D] bg-emerald-50/50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-white text-[#15803D] shadow-sm flex items-center justify-center mb-3">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">Organization</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Registered non-profit, charity, school, or community shelter.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setStep(2)}
            className="w-full py-3 bg-[#15803D] hover:bg-[#0F5D28] text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 2: Role Selection */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="text-center">
            <h2 className="text-xl font-extrabold text-slate-900">Select Your Role</h2>
            <p className="text-xs text-slate-500 mt-1">
              Do you intend primarily to donate items or receive goods?
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setRole('DONOR')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                role === 'DONOR'
                  ? 'border-[#15803D] bg-emerald-50/50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-white text-[#15803D] shadow-sm flex items-center justify-center mb-3">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">I'm a Donor</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  I have useful items to donate and give a second life to reduce waste.
                </p>
              </div>
            </div>

            <div
              onClick={() => setRole('RECEIVER')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                role === 'RECEIVER'
                  ? 'border-[#15803D] bg-emerald-50/50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-white text-teal-700 shadow-sm flex items-center justify-center mb-3">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">I'm a Receiver</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  I'm looking for useful goods that my household or community program needs.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="flex-1 py-3 bg-[#15803D] hover:bg-[#0F5D28] text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span>Continue to Registration</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Details & Profile */}
      {step === 3 && (
        <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-200">
          <div className="text-center mb-4">
            <h2 className="text-xl font-extrabold text-slate-900">
              {accountType === 'ORGANIZATION' ? 'Organization Profile' : 'Personal Details'}
            </h2>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              {role} Account ({accountType})
            </span>
          </div>

          {accountType === 'ORGANIZATION' && (
            <div className="space-y-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Organization Legal Name</label>
                <input
                  type="text"
                  required
                  value={form.organization_name}
                  onChange={(e) => setForm({ ...form, organization_name: e.target.value })}
                  placeholder="e.g. Seattle Youth Community Foundation"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Entity Type</label>
                  <select
                    value={form.organization_type}
                    onChange={(e) => setForm({ ...form, organization_type: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:border-emerald-600 focus:outline-none"
                  >
                    <option value="NGO">Non-Profit / NGO</option>
                    <option value="CHARITY">Charity</option>
                    <option value="SCHOOL">School / Education</option>
                    <option value="COMMUNITY">Community Center</option>
                    <option value="SHELTER">Shelter / Relief Camp</option>
                    <option value="FOUNDATION">Foundation</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">License / Tax ID</label>
                  <input
                    type="text"
                    required
                    value={form.license_number}
                    onChange={(e) => setForm({ ...form, license_number: e.target.value })}
                    placeholder="e.g. WA-NGO-9921"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {accountType === 'ORGANIZATION' ? 'Contact Person Name' : 'Full Name'}
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your Full Name"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="name@example.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1 (555) 019-2000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
              <input
                type="text"
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Seattle"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Ballard Ave NW"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={form.confirm_password}
                onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Categories interest */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              {role === 'DONOR' ? 'Categories You Plan to Donate:' : 'Categories You Need Most:'}
            </label>
            <div className="flex flex-wrap gap-2">
              {categoriesList.map((cat) => {
                const isSelected = role === 'DONOR'
                  ? form.preferred_categories.includes(cat.id)
                  : form.needed_categories.includes(cat.id);
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                      isSelected
                        ? 'bg-[#15803D] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-[#15803D] hover:bg-[#0F5D28] text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 text-center text-xs text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-[#15803D] hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
