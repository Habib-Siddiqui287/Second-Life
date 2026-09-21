import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const uid = searchParams.get('uid') || '';
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!uid || !token) {
      showToast('This password reset link is invalid or incomplete.', 'error');
      return;
    }

    if (password.length < 8) {
      showToast('Password must be at least 8 characters.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword({
        uid,
        token,
        password,
      });

      setSuccess(true);
      showToast('Password reset successfully.', 'success');
    } catch (error) {
      showToast(
        error.response?.data?.error ||
          'This password reset link is invalid or has expired.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-soft text-center">
        <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto mb-4" />
        <h2 className="text-2xl font-extrabold text-slate-900">
          Password Updated
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          Your Second Life password has been changed successfully.
        </p>
        <Link
          to="/login"
          replace
          className="inline-flex items-center gap-2 mt-6 px-5 py-3 bg-[#15803D] text-white rounded-xl text-xs font-bold"
        >
          Continue to Login
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-soft">
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">
          Create New Password
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Choose a new password for your Second Life account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            New Password
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
            placeholder="Enter your new password"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Confirm New Password
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
            placeholder="Confirm your new password"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !uid || !token}
          className="w-full py-3 bg-[#15803D] hover:bg-[#0F5D28] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"
        >
          {loading ? 'Updating...' : 'Update Password'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="text-center pt-5">
        <button
          type="button"
          onClick={() => navigate('/login', { replace: true })}
          className="text-xs font-bold text-slate-500 hover:text-slate-800"
        >
          Return to Login
        </button>
      </div>
    </div>
  );
}
