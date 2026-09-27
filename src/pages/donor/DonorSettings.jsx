import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';
import {
  User,
  MapPin,
  Save,
  Lock,
  Camera,
  Mail,
  Phone,
  Image as ImageIcon,
} from 'lucide-react';

export default function DonorSettings() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [profileImage, setProfileImage] = useState(null);

  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    address: '',
    bio: '',
    pickup_radius: 10,
    handover_preference: 'PICKUP',
  });

  const [passForm, setPassForm] = useState({
    old_password: '',
    new_password: '',
    confirm_new_password: '',
  });

  /*
   * Get the profile image from the actual backend serializer:
   *
   * user.profile.image
   */
  const getProfileImage = (currentUser) => {
    return currentUser?.profile?.image || '';
  };

  useEffect(() => {
    setProfileForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      city: user?.city || '',
      address: user?.address || '',
      bio: user?.profile?.bio || '',
      pickup_radius: user?.profile?.pickup_radius ?? 10,
      handover_preference:
        user?.profile?.handover_preference || 'PICKUP',
    });

    /*
     * Only replace the preview from the server when there is
     * no locally selected image waiting to be uploaded.
     */
    if (!profileImage) {
      setImagePreview(getProfileImage(user));
    }
  }, [user, profileImage]);

  const handleInputChange = (field, value) => {
    setProfileForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file.', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Profile image must be smaller than 5MB.', 'error');
      return;
    }

    /*
     * Keep the actual file for the Save request.
     */
    setProfileImage(file);

    /*
     * Create local preview immediately.
     */
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!profileForm.name.trim()) {
      showToast('Please enter your name.', 'error');
      return;
    }

    if (!profileForm.email.trim()) {
      showToast('Please enter your email.', 'error');
      return;
    }

    setLoading(true);

    try {
      /*
       * IMPORTANT:
       * ProfileUpdateSerializer does not update email.
       * So we intentionally don't send email here.
       */
      const profileData = {
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim(),
        city: profileForm.city.trim(),
        address: profileForm.address.trim(),
        bio: profileForm.bio.trim(),
        pickup_radius: Number(profileForm.pickup_radius),
        handover_preference: profileForm.handover_preference,
      };

      /*
       * 1. Save normal profile information.
       */
      const profileRes = await authService.updateProfile(profileData);

      let updatedUser = profileRes.user || profileRes;

      /*
       * 2. Upload profile image if a new one was selected.
       */
      if (
        profileImage &&
        typeof authService.uploadProfileImage === 'function'
      ) {
        const imageRes =
          await authService.uploadProfileImage(profileImage);

        /*
         * Backend returns the complete updated user.
         */
        updatedUser = imageRes.user || updatedUser;

        /*
         * Use the exact URL returned by the backend.
         */
        const serverImage =
          imageRes.profile_image ||
          imageRes.user?.profile?.image ||
          updatedUser?.profile?.image ||
          '';

        if (serverImage) {
          setImagePreview(serverImage);
        }
      }

      /*
       * Update global AuthContext.
       */
      updateUser(updatedUser);

      /*
       * Clear the pending file only after successful upload.
       */
      setProfileImage(null);

      showToast('Profile settings saved! 🌿', 'success');
    } catch (err) {
      console.error('Profile update error:', err);

      const message =
        err.response?.data?.email?.[0] ||
        err.response?.data?.name?.[0] ||
        err.response?.data?.image?.[0] ||
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to update profile.';

      showToast(message, 'error');
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

    if (passForm.new_password.length < 6) {
      showToast(
        'New password must be at least 6 characters.',
        'error'
      );
      return;
    }

    setLoading(true);

    try {
      await authService.changePassword({
        old_password: passForm.old_password,
        new_password: passForm.new_password,
      });

      showToast('Password changed successfully!', 'success');

      setPassForm({
        old_password: '',
        new_password: '',
        confirm_new_password: '',
      });
    } catch (err) {
      console.error('Password update error:', err);

      showToast(
        err.response?.data?.old_password?.[0] ||
          err.response?.data?.detail ||
          err.response?.data?.error ||
          'Failed to update password.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const initials =
    profileForm.name
      ?.trim()
      ?.split(' ')
      ?.filter(Boolean)
      ?.map((part) => part[0])
      ?.join('')
      ?.slice(0, 2)
      ?.toUpperCase() || 'SL';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Account Settings
        </h1>

        <p className="text-xs text-slate-500 mt-1">
          Manage your profile, contact information, pickup
          preferences, and account security.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* LEFT NAVIGATION */}
        <div className="md:col-span-4 bg-white rounded-3xl p-4 border border-slate-100 shadow-soft space-y-1 self-start">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-colors ${
              activeTab === 'profile'
                ? 'bg-[#15803D] text-white'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-3">
              <User className="w-4 h-4" />
              Profile & Contact
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('handover')}
            className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-colors ${
              activeTab === 'handover'
                ? 'bg-[#15803D] text-white'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-3">
              <MapPin className="w-4 h-4" />
              Handover Preferences
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-colors ${
              activeTab === 'security'
                ? 'bg-[#15803D] text-white'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-3">
              <Lock className="w-4 h-4" />
              Privacy & Security
            </span>
          </button>
        </div>

        {/* RIGHT CONTENT */}
        <div className="md:col-span-8 bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-soft">
          {/* PROFILE */}
          {activeTab === 'profile' && (
            <form
              onSubmit={handleProfileSubmit}
              className="space-y-5"
            >
              <div className="border-b border-slate-50 pb-4">
                <h3 className="font-extrabold text-base text-slate-900">
                  Profile Details
                </h3>

                <p className="text-[11px] text-slate-400 mt-1">
                  This information can be shown to people viewing
                  your donations.
                </p>
              </div>

              {/* PROFILE IMAGE */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 py-2">
                <div className="relative shrink-0">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt={profileForm.name || 'Profile'}
                      className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-md"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-2xl font-extrabold text-[#15803D]">
                      {initials}
                    </div>
                  )}

                  <label
                    htmlFor="profile-image"
                    className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-[#15803D] hover:bg-[#0F5D28] text-white flex items-center justify-center cursor-pointer shadow-md transition-colors"
                    title="Change profile image"
                  >
                    <Camera className="w-4 h-4" />

                    <input
                      id="profile-image"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>

                <div className="text-center sm:text-left">
                  <h4 className="text-sm font-extrabold text-slate-900">
                    Profile Image
                  </h4>

                  <p className="text-[11px] text-slate-500 mt-1 max-w-sm">
                    Add a clear photo so receivers can recognize
                    your profile. JPG, PNG, or WebP up to 5MB.
                  </p>

                  <label
                    htmlFor="profile-image"
                    className="inline-flex items-center gap-2 mt-3 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 cursor-pointer transition-colors"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    Choose Image

                    <input
                      id="profile-image"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>

                  {profileImage && (
                    <p className="text-[10px] text-emerald-600 font-semibold mt-2">
                      New image selected: {profileImage.name}
                    </p>
                  )}
                </div>
              </div>

              {/* NAME */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name
                </label>

                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) =>
                      handleInputChange(
                        'name',
                        e.target.value
                      )
                    }
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
                    placeholder="Your full name"
                  />
                </div>
              </div>

              {/* EMAIL + PHONE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                    <input
                      type="email"
                      required
                      value={profileForm.email}
                      onChange={(e) =>
                        handleInputChange(
                          'email',
                          e.target.value
                        )
                      }
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
                      placeholder="you@example.com"
                    />

                    <p className="text-[9px] text-slate-400 mt-1">
                      Email changes require a separate account
                      verification flow.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone
                  </label>

                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) =>
                        handleInputChange(
                          'phone',
                          e.target.value
                        )
                      }
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
                      placeholder="Phone number"
                    />
                  </div>
                </div>
              </div>

              {/* BIO */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bio / Your Story
                </label>

                <textarea
                  rows={4}
                  value={profileForm.bio}
                  onChange={(e) =>
                    handleInputChange(
                      'bio',
                      e.target.value
                    )
                  }
                  placeholder="Tell receivers a little about yourself and why you donate..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-none resize-none"
                />

                <p className="text-[10px] text-slate-400 mt-1">
                  Your bio can help receivers understand who is
                  behind a donation.
                </p>
              </div>

              {/* SAVE */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-[#15803D] hover:bg-[#0F5D28] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
                >
                  <Save className="w-3.5 h-3.5" />

                  <span>
                    {loading ? 'Saving...' : 'Save Profile'}
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
              <div className="border-b border-slate-50 pb-4">
                <h3 className="font-extrabold text-base text-slate-900">
                  Default Handover Logistics
                </h3>

                <p className="text-[11px] text-slate-400 mt-1">
                  These preferences help Second Life prioritize
                  suitable matches.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Primary City
                  </label>

                  <input
                    type="text"
                    value={profileForm.city}
                    onChange={(e) =>
                      handleInputChange(
                        'city',
                        e.target.value
                      )
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
                    placeholder="Your city"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pickup Address / Neighborhood
                  </label>

                  <input
                    type="text"
                    value={profileForm.address}
                    onChange={(e) =>
                      handleInputChange(
                        'address',
                        e.target.value
                      )
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
                    placeholder="Neighborhood or pickup area"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Handover Radius:{' '}
                  <span className="text-[#15803D]">
                    {profileForm.pickup_radius} miles
                  </span>
                </label>

                <input
                  type="range"
                  min="2"
                  max="50"
                  value={profileForm.pickup_radius}
                  onChange={(e) =>
                    handleInputChange(
                      'pickup_radius',
                      parseInt(e.target.value, 10)
                    )
                  }
                  className="w-full accent-[#15803D]"
                />

                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>2 miles</span>
                  <span>25 miles</span>
                  <span>50 miles</span>
                </div>

                <p className="text-[11px] text-slate-400 mt-2">
                  Items within this geographic distance will be
                  prioritized for matching.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Preferred Handover Method
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      value: 'PICKUP',
                      label: 'Pickup',
                      description: 'Receiver picks it up',
                    },
                    {
                      value: 'DELIVERY',
                      label: 'Delivery',
                      description: 'You prefer delivery',
                    },
                    {
                      value: 'EITHER',
                      label: 'Either',
                      description: 'Both are okay',
                    },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        handleInputChange(
                          'handover_preference',
                          option.value
                        )
                      }
                      className={`text-left p-4 rounded-2xl border transition-all ${
                        profileForm.handover_preference ===
                        option.value
                          ? 'border-emerald-600 bg-emerald-50'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`text-xs font-extrabold ${
                          profileForm.handover_preference ===
                          option.value
                            ? 'text-[#15803D]'
                            : 'text-slate-800'
                        }`}
                      >
                        {option.label}
                      </div>

                      <div className="text-[10px] text-slate-400 mt-1">
                        {option.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-[#15803D] hover:bg-[#0F5D28] disabled:opacity-60 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />

                  <span>
                    {loading
                      ? 'Saving...'
                      : 'Save Handover Settings'}
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* SECURITY */}
          {activeTab === 'security' && (
            <form
              onSubmit={handlePasswordSubmit}
              className="space-y-5"
            >
              <div className="border-b border-slate-50 pb-4">
                <h3 className="font-extrabold text-base text-slate-900">
                  Change Password
                </h3>

                <p className="text-[11px] text-slate-400 mt-1">
                  Keep your Second Life account secure with a strong
                  password.
                </p>
              </div>

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
                  placeholder="Enter current password"
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
                    placeholder="Minimum 6 characters"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm New Password
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
                    placeholder="Repeat new password"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm"
                >
                  <Lock className="w-3.5 h-3.5" />

                  <span>
                    {loading ? 'Updating...' : 'Update Password'}
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