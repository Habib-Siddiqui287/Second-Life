import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';
import {
  Save,
  Lock,
  Camera,
  Upload,
  UserRound,
  MapPin,
} from 'lucide-react';

export default function ReceiverSettings() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const fileInputRef = useRef(null);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    city: user?.city || 'Seattle',
    address: user?.address || '',
    bio: user?.profile?.bio || '',
    pickup_radius: user?.profile?.pickup_radius || 10,
    latitude: user?.profile?.latitude ?? null,
    longitude: user?.profile?.longitude ?? null,
    handover_preference:
      user?.profile?.handover_preference || 'PICKUP',
  });

  const [passForm, setPassForm] = useState({
    old_password: '',
    new_password: '',
    confirm_new_password: '',
  });

  const profileImage = user?.profile?.image || '';

  const initials =
    user?.initials ||
    user?.name
      ?.split(' ')
      .filter(Boolean)
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ||
    'SL';

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await authService.updateProfile(profileForm);

      if (res?.user) {
        updateUser(res.user);
      }

      showToast('Settings saved successfully! 🌿', 'success');
    } catch (err) {
      console.error('Profile update error:', err);

      const message =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        'Failed to update settings.';

      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file.', 'error');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be 5 MB or smaller.', 'error');
      e.target.value = '';
      return;
    }

    setImageUploading(true);

    try {
      const res = await authService.uploadProfileImage(file);

      if (res?.user) {
        updateUser(res.user);
      }

      showToast('Profile image updated successfully! 📸', 'success');
    } catch (err) {
      console.error('Profile image upload error:', err);

      const message =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Failed to upload profile image.';

      showToast(message, 'error');
    } finally {
      setImageUploading(false);
      e.target.value = '';
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (
      passForm.new_password !==
      passForm.confirm_new_password
    ) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    setLoading(true);

    try {
      await authService.changePassword({
        old_password: passForm.old_password,
        new_password: passForm.new_password,
      });

      showToast(
        'Password updated successfully!',
        'success'
      );

      setPassForm({
        old_password: '',
        new_password: '',
        confirm_new_password: '',
      });
    } catch (err) {
      showToast(
        err.response?.data?.old_password?.[0] ||
          err.response?.data?.detail ||
          'Failed to update password.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Account Settings
        </h1>

        <p className="text-xs text-slate-500">
          Manage your profile, preferences, and how you receive
          items from the SecondLife community.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* LEFT SETTINGS MENU */}
        <div className="md:col-span-4 bg-white rounded-3xl p-4 border border-slate-100 shadow-soft space-y-1 self-start">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-4 py-2.5 rounded-2xl text-xs font-bold transition-colors ${
              activeTab === 'profile'
                ? 'bg-[#15803D] text-white'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Profile details
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('handover')}
            className={`w-full text-left px-4 py-2.5 rounded-2xl text-xs font-bold transition-colors ${
              activeTab === 'handover'
                ? 'bg-[#15803D] text-white'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Handover preferences
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`w-full text-left px-4 py-2.5 rounded-2xl text-xs font-bold transition-colors ${
              activeTab === 'security'
                ? 'bg-[#15803D] text-white'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Privacy & Security
          </button>
        </div>

        {/* RIGHT CONTENT */}
        <div className="md:col-span-8 bg-white rounded-3xl p-8 border border-slate-100 shadow-soft">

          {/* PROFILE */}
          {activeTab === 'profile' && (
            <form
              onSubmit={handleProfileSubmit}
              className="space-y-4"
            >
              <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-50 pb-3">
                Profile Details
              </h3>

              {/* PROFILE IMAGE */}
              <div className="flex items-center gap-5 py-3">
                <div className="relative">
                  <div className="w-20 h-20 rounded-3xl overflow-hidden bg-teal-700 text-white flex items-center justify-center shadow-sm">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt={user?.name || 'Receiver Profile'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-xl font-extrabold">
                        {initials}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    disabled={imageUploading}
                    className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-[#15803D] hover:bg-[#0F5D28] text-white flex items-center justify-center border-4 border-white shadow-md transition-all disabled:opacity-60"
                    title="Upload profile image"
                  >
                    <Camera className="w-4 h-4" />
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    {user?.name || 'Receiver'}
                  </h4>

                  <span className="text-xs text-emerald-700 font-semibold">
                    {user?.role} • {user?.account_type}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    disabled={imageUploading}
                    className="mt-2 flex items-center gap-1.5 text-xs font-bold text-[#15803D] hover:text-[#0F5D28]"
                  >
                    <Upload className="w-3.5 h-3.5" />

                    {imageUploading
                      ? 'Uploading...'
                      : 'Upload profile photo'}
                  </button>

                  <p className="text-[10px] text-slate-400 mt-1">
                    JPG, PNG or WEBP • Max 5 MB
                  </p>
                </div>
              </div>

              {/* NAME */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Name
                </label>

                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              {/* EMAIL + PHONE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address
                  </label>

                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-400 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        phone: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* CITY */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  City
                </label>

                <input
                  type="text"
                  value={profileForm.city}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      city: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              {/* LOCATION COORDINATES */}
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Donation distance location
                    </label>
                    <p className="text-[10px] text-slate-500">
                      Save your browser location so available donations can show their distance in miles when pickup coordinates are available.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!navigator.geolocation) {
                        showToast('Location is not supported by this browser.', 'error');
                        return;
                      }
                      navigator.geolocation.getCurrentPosition(
                        ({ coords }) => {
                          setProfileForm((prev) => ({
                            ...prev,
                            latitude: Number(coords.latitude.toFixed(6)),
                            longitude: Number(coords.longitude.toFixed(6)),
                          }));
                          showToast('Current location captured. Save your profile to keep it.', 'success');
                        },
                        () => showToast('Could not access your location. Please allow browser location access.', 'error'),
                        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
                      );
                    }}
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-emerald-200 text-[#15803D] text-[10px] font-bold hover:bg-emerald-50"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Use my location
                  </button>
                </div>
                {profileForm.latitude != null && profileForm.longitude != null && (
                  <p className="text-[10px] text-emerald-700 font-semibold mt-2">
                    Location saved in form: {profileForm.latitude}, {profileForm.longitude}
                  </p>
                )}
              </div>

              {/* ADDRESS */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Address
                </label>

                <input
                  type="text"
                  value={profileForm.address}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      address: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              {/* BIO */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bio (Optional)
                </label>

                <textarea
                  rows={3}
                  value={profileForm.bio}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      bio: e.target.value,
                    })
                  }
                  placeholder="Tell the community a bit about yourself or your organization..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-none resize-none"
                />
              </div>

              {/* SAVE */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-[#15803D] hover:bg-[#0F5D28] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-60"
                >
                  <Save className="w-3.5 h-3.5" />

                  <span>
                    {loading
                      ? 'Saving...'
                      : 'Save Settings'}
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* HANDOVER */}
          {activeTab === 'handover' && (
            <form
              onSubmit={handleProfileSubmit}
              className="space-y-6"
            >
              <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-50 pb-3">
                Handover Preferences
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Preferred Methods
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    onClick={() =>
                      setProfileForm({
                        ...profileForm,
                        handover_preference: 'PICKUP',
                      })
                    }
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      profileForm.handover_preference === 'PICKUP'
                        ? 'border-[#15803D] bg-emerald-50/50'
                        : 'border-slate-200'
                    }`}
                  >
                    <span className="font-bold text-xs text-slate-900 block mb-1">
                      🚶 I can pick up
                    </span>

                    <p className="text-[11px] text-slate-500">
                      I have transportation to collect items
                      from donors.
                    </p>
                  </div>

                  <div
                    onClick={() =>
                      setProfileForm({
                        ...profileForm,
                        handover_preference: 'DELIVERY',
                      })
                    }
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      profileForm.handover_preference === 'DELIVERY'
                        ? 'border-[#15803D] bg-emerald-50/50'
                        : 'border-slate-200'
                    }`}
                  >
                    <span className="font-bold text-xs text-slate-900 block mb-1">
                      🚚 I need delivery
                    </span>

                    <p className="text-[11px] text-slate-500">
                      I require items to be dropped off by
                      eco-van or donor.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Pickup Radius</span>

                  <span className="text-[#15803D]">
                    {profileForm.pickup_radius} miles
                  </span>
                </div>

                <input
                  type="range"
                  min="2"
                  max="50"
                  value={profileForm.pickup_radius}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      pickup_radius: parseInt(
                        e.target.value,
                        10
                      ),
                    })
                  }
                  className="w-full accent-[#15803D]"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-[#15803D] hover:bg-[#0F5D28] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm disabled:opacity-60"
                >
                  <Save className="w-3.5 h-3.5" />

                  <span>
                    {loading
                      ? 'Saving...'
                      : 'Save Preferences'}
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* SECURITY */}
          {activeTab === 'security' && (
            <form
              onSubmit={handlePasswordSubmit}
              className="space-y-4"
            >
              <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-50 pb-3">
                Security & Password
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Current Password
                </label>

                <input
                  type="password"
                  required
                  value={passForm.old_password}
                  onChange={(e) =>
                    setPassForm({
                      ...passForm,
                      old_password: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    New Password
                  </label>

                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passForm.new_password}
                    onChange={(e) =>
                      setPassForm({
                        ...passForm,
                        new_password: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm Password
                  </label>

                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passForm.confirm_new_password}
                    onChange={(e) =>
                      setPassForm({
                        ...passForm,
                        confirm_new_password: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm disabled:opacity-60"
                >
                  <Lock className="w-3.5 h-3.5" />

                  <span>
                    {loading
                      ? 'Updating...'
                      : 'Update Password'}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}