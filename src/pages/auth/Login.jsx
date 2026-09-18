import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Leaf,
  ShieldCheck,
  HeartHandshake,
  Recycle,
} from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      showToast('Please enter your email address.', 'error');
      return;
    }

    if (!password) {
      showToast('Please enter your password.', 'error');
      return;
    }

    setLoading(true);

    try {
      const user = await login(email.trim(), password);

      showToast(`Welcome back, ${user.name}!`, 'success');

      const dest = location.state?.from?.pathname;

      if (dest) {
        navigate(dest, { replace: true });
      } else if (user.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'DONOR') {
        navigate('/donor', { replace: true });
      } else {
        navigate('/receiver', { replace: true });
      }
    } catch (err) {
      console.error('Login status:', err.response?.status);
      console.error('Login response:', err.response?.data);

      const status = err.response?.status;

      let errMsg =
        'Invalid credentials. Please verify your email and password.';

      if (!err.response) {
        errMsg =
          'Unable to connect to SecondLife server. Please check your network or verify the backend is running.';
      } else if (status === 404 || status === 405) {
        errMsg = `Backend API endpoint unreachable on this domain (HTTP ${status}). If testing locally, please open http://localhost:5173. For production, connect a deployed backend service.`;
      } else if (err.response?.data?.error) {
        errMsg = err.response.data.error;
      } else if (err.response?.data?.detail) {
        errMsg = err.response.data.detail;
      } else if (err.response?.data?.message) {
        errMsg = err.response.data.message;
      } else if (status === 400 || status === 401) {
        errMsg =
          'Invalid email or password. Please verify your credentials.';
      } else if (status === 500) {
        errMsg =
          'Server encountered an internal error. Please try again or check backend logs.';
      }

      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_25px_80px_-30px_rgba(15,23,42,0.35)]">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-28 -right-28 h-64 w-64 rounded-full bg-emerald-100/70 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-green-100/60 blur-3xl" />
      </div>

      <div className="relative grid lg:grid-cols-[0.9fr_1.1fr]">
        {/* LEFT BRAND PANEL */}
        <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-green-700 via-emerald-600 to-teal-600 p-10 xl:p-12 text-white flex-col justify-between">
          <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-white/10" />
          <div className="absolute bottom-20 -left-24 w-64 h-64 rounded-full bg-white/10" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <img src="/images/IMG-20260831-WA0000.jpg.jpeg" alt="SecondLife" className="w-full h-full object-cover" />
              </div>

              <div>
                <div className="font-extrabold text-xl tracking-tight">
                  SecondLife
                </div>
                <div className="text-xs text-green-100">
                  Give. Share. Reuse.
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 py-12">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-2 text-xs font-semibold text-green-50">
              <HeartHandshake size={15} />
              Community-powered sharing
            </span>

            <h2 className="mt-6 text-4xl xl:text-5xl font-extrabold leading-[1.05] tracking-tight">
              Welcome back to a world of
              <span className="block text-green-100">
                second chances.
              </span>
            </h2>

            <p className="mt-6 text-sm xl:text-base leading-7 text-green-50/90 max-w-md">
              Connect with people and organizations, share useful items,
              and help valuable things find a new home.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/10 border border-white/10 p-4 backdrop-blur-sm">
              <Recycle size={20} />
              <p className="mt-3 text-sm font-semibold">
                Reuse more
              </p>
              <p className="mt-1 text-xs text-green-100">
                Keep useful items in circulation.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 border border-white/10 p-4 backdrop-blur-sm">
              <HeartHandshake size={20} />
              <p className="mt-3 text-sm font-semibold">
                Help others
              </p>
              <p className="mt-1 text-xs text-green-100">
                Share what someone else may need.
              </p>
            </div>
          </div>
        </div>

        {/* LOGIN PANEL */}
        <div className="relative p-6 sm:p-9 lg:p-12">
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-2xl overflow-hidden bg-white flex items-center justify-center">
              <img src="/images/IMG-20260831-WA0000.jpg.jpeg" alt="SecondLife" className="w-full h-full object-cover" />
            </div>

            <div>
              <div className="font-extrabold text-lg text-slate-900">
                SecondLife
              </div>
              <div className="text-xs text-slate-500">
                Give. Share. Reuse.
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="max-w-md mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-green-50 border border-green-100 px-3 py-1.5 text-xs font-semibold text-green-700">
              <ShieldCheck size={14} />
              Secure sign-in
            </div>

            <h1 className="mt-5 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Welcome back
            </h1>

            <p className="mt-2 text-sm sm:text-base text-slate-500 leading-6">
              Sign in to continue making a difference with SecondLife.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full h-13 rounded-2xl border border-slate-200 bg-slate-50/70 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-xs sm:text-sm font-semibold text-green-600 hover:text-green-700 transition"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <Lock
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />

                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full h-13 rounded-2xl border border-slate-200 bg-slate-50/70 pl-11 pr-12 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                    aria-label={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              {/* Sign In */}
              <button
                type="submit"
                disabled={loading}
                className="group w-full h-13 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold shadow-lg shadow-green-200/70 hover:from-green-700 hover:to-emerald-700 hover:shadow-xl hover:shadow-green-200 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span>
                  {loading ? 'Signing in...' : 'Sign In'}
                </span>

                {!loading && (
                  <ArrowRight
                    size={19}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                )}
              </button>
            </form>

            {/* Trust note */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck size={15} className="text-green-500" />
              <span>Your account is protected with secure authentication.</span>
            </div>

            {/* Register */}
            <div className="mt-7 text-center">
              <p className="text-sm text-slate-500">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-bold text-green-600 hover:text-green-700 transition"
                >
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}