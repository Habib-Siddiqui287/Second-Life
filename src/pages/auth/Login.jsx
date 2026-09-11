import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Mail, Lock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(email, password);
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
      console.error("Login status:", err.response?.status);
      console.error("Login response:", err.response?.data);
      const status = err.response?.status;
      let errMsg = 'Invalid credentials. Please verify your email and password.';

      if (!err.response) {
        errMsg = 'Unable to connect to SecondLife server. Please check your network or verify the backend is running.';
      } else if (status === 404 || status === 405) {
        errMsg = `Backend API endpoint unreachable on this domain (HTTP ${status}). If testing locally, please open http://localhost:5173. For production, connect a deployed backend service.`;
      } else if (err.response?.data?.error) {
        errMsg = err.response.data.error;
      } else if (err.response?.data?.detail) {
        errMsg = err.response.data.detail;
      } else if (status === 500) {
        errMsg = 'Server encountered an internal error. Please try again or check backend logs.';
      }

      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Demo accounts helper for quick evaluation
  const setDemoUser = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-soft">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-extrabold text-slate-900">Welcome Back</h2>
        <p className="text-xs text-slate-500 mt-1">
          Continue giving things a second life.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700">Password</label>
            <Link to="/forgot-password" className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800">
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#15803D] hover:bg-[#0F5D28] text-white rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
        >
          {loading ? 'Authenticating...' : 'Sign In'}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Demo Credentials Quick Switcher */}
      <div className="mt-6 pt-5 border-t border-slate-100">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center mb-2.5">
          Quick Demo Credentials
        </div>
        <div className="grid grid-cols-3 gap-1.5 text-[10px]">
          <button
            type="button"
            onClick={() => setDemoUser('mamoon@secondlife.eco', 'password123')}
            className="p-1.5 bg-emerald-50 text-[#15803D] font-bold rounded-lg hover:bg-emerald-100 text-center"
          >
            Donor Account
          </button>
          <button
            type="button"
            onClick={() => setDemoUser('alex.rivera@secondlife.eco', 'password123')}
            className="p-1.5 bg-teal-50 text-teal-800 font-bold rounded-lg hover:bg-teal-100 text-center"
          >
            Receiver Account
          </button>
          <button
            type="button"
            onClick={() => setDemoUser('admin@secondlife.eco', 'password123')}
            className="p-1.5 bg-slate-100 text-slate-800 font-bold rounded-lg hover:bg-slate-200 text-center"
          >
            Admin Account
          </button>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-slate-500">
        Don't have an account yet?{' '}
        <Link to="/register" className="font-bold text-[#15803D] hover:underline">
          Create Account
        </Link>
      </div>
    </div>
  );
}
