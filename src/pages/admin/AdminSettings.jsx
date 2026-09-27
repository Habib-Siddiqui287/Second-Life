import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/savedItemService';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Settings,
  Sliders,
  ShieldCheck,
  Leaf,
  Mail,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Database,
  Building,
} from 'lucide-react';

export default function AdminSettings() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    platform_name: 'SecondLife',
    support_email: 'support@secondlife.eco',
    contact_phone: '+1 (206) 555-0192',
    address: '742 Evergreen Terrace, Seattle, WA',
    auto_matching_enabled: true,
    auto_matching_threshold: 60,
    require_org_verification: true,
    max_active_requests_per_receiver: 5,
    allow_anonymous_browsing: true,
    maintenance_mode: false,
    impact_co2_factor: 3.5,
  });

  useEffect(() => {
    adminService.getSettings()
      .then((data) => {
        if (data && typeof data === 'object') {
          setSettings((prev) => ({ ...prev, ...data }));
        }
      })
      .catch(() => {
        showToast('Using default settings profile.', 'info');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminService.updateSettings(settings);
      showToast('System configuration saved successfully.', 'success');
    } catch {
      showToast('Failed to save settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (!window.confirm('Reset all parameters to default platform values?')) return;
    setSettings({
      platform_name: 'SecondLife',
      support_email: 'support@secondlife.eco',
      contact_phone: '+1 (206) 555-0192',
      address: '742 Evergreen Terrace, Seattle, WA',
      auto_matching_enabled: true,
      auto_matching_threshold: 60,
      require_org_verification: true,
      max_active_requests_per_receiver: 5,
      allow_anonymous_browsing: true,
      maintenance_mode: false,
      impact_co2_factor: 3.5,
    });
    showToast('Values reset to defaults. Click "Save Configuration" to persist.', 'info');
  };

  if (loading) {
    return <LoadingSpinner text="Loading platform settings..." />;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Platform Settings & Control</h1>
          <p className="text-xs text-slate-500">
            Tune algorithmic matching, safety policies, environmental factors, and platform metadata.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold text-xs transition-colors"
          >
            Reset Defaults
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-[#15803D] hover:bg-[#0F5D28] text-white rounded-xl font-extrabold text-xs shadow-soft transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Matching & AI Recommendation Engine */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#15803D] flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">
                Matching Algorithm & Smart Recommendation
              </h2>
              <p className="text-xs text-slate-400">
                Configure rule-based scoring criteria between donor listings and receiver requests.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-800">Auto-Matching Engine</p>
                  <p className="text-[11px] text-slate-400">
                    Automatically propose matches when items share category, city, or urgent tags.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.auto_matching_enabled}
                    onChange={(e) => handleChange('auto_matching_enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#15803D]"></div>
                </label>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Minimum Compatibility Score to Propose Match
                  </label>
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {settings.auto_matching_threshold}%
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="95"
                  step="5"
                  value={settings.auto_matching_threshold}
                  onChange={(e) => handleChange('auto_matching_threshold', parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#15803D]"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Relaxed (40%)</span>
                  <span>Balanced (60% Recommended)</span>
                  <span>Strict (95%)</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Max Active Item Requests per Receiver
                </label>
                <input
                  type="number"
                  min="1"
                  max="25"
                  value={settings.max_active_requests_per_receiver}
                  onChange={(e) =>
                    handleChange('max_active_requests_per_receiver', parseInt(e.target.value) || 1)
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-600"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Limits hoarders and prioritizes equitable distribution across community members.
                </p>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-800">Allow Anonymous Marketplace Browsing</p>
                  <p className="text-[11px] text-slate-400">
                    Unauthenticated guests can browse available donations without logging in.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.allow_anonymous_browsing}
                    onChange={(e) => handleChange('allow_anonymous_browsing', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#15803D]"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Verification & Community Trust */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">
                Verification & Trust Policies
              </h2>
              <p className="text-xs text-slate-400">
                Safeguards for organization onboarding and high-value resource claims.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Mandatory Organization Verification
                </p>
                <p className="text-[11px] text-slate-400">
                  Non-profits and charities must have an approved registration certificate before receiving.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.require_org_verification}
                  onChange={(e) => handleChange('require_org_verification', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#15803D]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-rose-50/50 rounded-2xl border border-rose-100">
              <div>
                <p className="text-xs font-bold text-rose-900">Emergency Maintenance Mode</p>
                <p className="text-[11px] text-rose-600">
                  Suspends all outgoing requests and displays a maintenance banner across client portals.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenance_mode}
                  onChange={(e) => handleChange('maintenance_mode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Section 3: Eco & Impact Calculation Parameters */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">
                Environmental & Circular Economy Metrics
              </h2>
              <p className="text-xs text-slate-400">
                Formula coefficients used in public impact widgets, carbon badges, and certificates.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Average CO2 Offset per Donated Item (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="50"
                value={settings.impact_co2_factor}
                onChange={(e) =>
                  handleChange('impact_co2_factor', parseFloat(e.target.value) || 3.5)
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-600"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Industry standard estimate for embodied manufacturing & landfill emissions averted.
              </p>
            </div>

            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#15803D] shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-950 leading-relaxed">
                <span className="font-extrabold block">Impact Formula Active</span>
                Total CO2 = (Completed Deliveries × {settings.impact_co2_factor} kg) + (Total Listed Items × 0.5 kg).
                Certified badges are stamped onto user profile certificates.
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Public Platform Metadata */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">
                Platform Identity & Public Contacts
              </h2>
              <p className="text-xs text-slate-400">
                Shown in platform footer, contact page, transactional emails, and automated receipts.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Platform Name</label>
              <input
                type="text"
                value={settings.platform_name}
                onChange={(e) => handleChange('platform_name', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Support Email</label>
              <input
                type="email"
                value={settings.support_email}
                onChange={(e) => handleChange('support_email', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                value={settings.contact_phone}
                onChange={(e) => handleChange('contact_phone', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">HQ Operating Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Save button footer */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-[#15803D] hover:bg-[#0F5D28] text-white rounded-2xl font-extrabold text-sm shadow-soft transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Saving Changes...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
