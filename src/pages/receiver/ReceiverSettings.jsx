import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';
import { User, ShieldCheck, MapPin, Save, Lock, Truck } from 'lucide-react';

export default function ReceiverSettings() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    city: user?.city || 'Seattle',
    address: user?.address || '',
    bio: user?.profile?.bio || '',
    pickup_radius: user?.profile?.pickup_radius || 10,
    handover_preference: user?.profile?.handover_preference || 'PICKUP',
  });

  const [passForm, setPassForm] = useState({
    old_password: '',
    new_password: '',
    confirm_new_password: '',
  });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.updateProfile(profileForm);
      updateUser(res.user);
      showToast('Settings saved successfully! 🌿', 'success');
    } catch (err) {
      showToast('Failed to update settings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passForm.new_password !== passForm.confirm_new_password) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    setLoading(true);
    try {
      await authService.changePassword({
        old_password: passForm.old_password,
        new_password: passForm.new_password,
      });
      showToast('Password updated successfully!', 'success');
      setPassForm({ old_password: '', new_password: '', confirm_new_password: '' });
    } catch (err) {
      showToast(err.response?.data?.old_password?.[0] || 'Failed to update password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Account Settings</h1>
        <p className="text-xs text-slate-500">
          Manage your profile, preferences, and how you receive items from the SecondLife community.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Navigation Tabs (Matches Design Image 16) */}
        <div className="md:col-span-4 bg-white rounded-3xl p-4 border border-slate-100 shadow-soft space-y-1 self-start">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-4 py-2.5 rounded-2xl text-xs font-bold transition-colors ${
              activeTab === 'profile' ? 'bg-[#15803D] text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Profile details
          </button>
          <button
            onClick={() => setActiveTab('handover')}
            className={`w-full text-left px-4 py-2.5 rounded-2xl text-xs font-bold transition-colors ${
              activeTab === 'handover' ? 'bg-[#15803D] text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Handover preferences
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`w-full text-left px-4 py-2.5 rounded-2xl text-xs font-bold transition-colors ${
              activeTab === 'security' ? 'bg-[#15803D] text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Privacy & Security
          </button>
        </div>

        {/* Form area */}
        <div className="md:col-span-8 bg-white rounded-3xl p-8 border border-slate-100 shadow-soft">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-50 pb-3">
                Profile Details
              </h3>

              {/* Avatar Initial (NO HUMAN PHOTOS) */}
              <div className="flex items-center gap-4 py-2">
                <div className="w-16 h-16 rounded-3xl bg-teal-700 text-white font-extrabold text-xl flex items-center justify-center shadow-sm">
                  {user?.initials || 'SL'}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{user?.name}</h4>
                  <span className="text-xs text-emerald-700 font-semibold">{user?.role} • {user?.account_type}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-400 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bio (Optional)</label>
                <textarea
                  rows={3}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  placeholder="Tell the community a bit about yourself or your organization..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-[#15803D] hover:bg-[#0F5D28] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{loading ? 'Saving...' : 'Save Settings'}</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'handover' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-50 pb-3">
                Handover Preferences
              </h3>

              {/* Radio options: I can pick up vs I need delivery (Matches Design Image 16) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Preferred Methods</label>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    onClick={() => setProfileForm({ ...profileForm, handover_preference: 'PICKUP' })}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      profileForm.handover_preference === 'PICKUP'
                        ? 'border-[#15803D] bg-emerald-50/50'
                        : 'border-slate-200'
                    }`}
                  >
                    <span className="font-bold text-xs text-slate-900 block mb-1">🚶 I can pick up</span>
                    <p className="text-[11px] text-slate-500">I have transportation to collect items from donors.</p>
                  </div>

                  <div
                    onClick={() => setProfileForm({ ...profileForm, handover_preference: 'DELIVERY' })}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      profileForm.handover_preference === 'DELIVERY'
                        ? 'border-[#15803D] bg-emerald-50/50'
                        : 'border-slate-200'
                    }`}
                  >
                    <span className="font-bold text-xs text-slate-900 block mb-1">🚚 I need delivery</span>
                    <p className="text-[11px] text-slate-500">I require items to be dropped off by eco-van or donor.</p>
                  </div>
                </div>
              </div>

              {/* Pickup radius slider (Matches Design Image 16: "Pickup Radius: 10 miles") */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Pickup Radius</span>
                  <span className="text-[#15803D]">{profileForm.pickup_radius} miles</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="50"
                  value={profileForm.pickup_radius}
                  onChange={(e) => setProfileForm({ ...profileForm, pickup_radius: parseInt(e.target.value) })}
                  className="w-full accent-[#15803D]"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-[#15803D] hover:bg-[#0F5D28] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Preferences</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-50 pb-3">
                Security & Password
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={passForm.old_password}
                  onChange={(e) => setPassForm({ ...passForm, old_password: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passForm.new_password}
                    onChange={(e) => setPassForm({ ...passForm, new_password: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passForm.confirm_new_password}
                    onChange={(e) => setPassForm({ ...passForm, confirm_new_password: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
