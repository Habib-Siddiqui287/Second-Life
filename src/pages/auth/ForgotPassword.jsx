import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { authService } from '../../services/authService';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-soft">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-extrabold text-slate-900">Reset Password</h2>
        <p className="text-xs text-slate-500 mt-1">
          Enter your registered email to receive reset instructions.
        </p>
      </div>

      {submitted ? (
        <div className="text-center space-y-4 py-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h3 className="font-bold text-sm text-slate-900">Reset Link Dispatched</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            If an account matches <strong>{email}</strong>, you will receive an email shortly with recovery steps.
          </p>
          <Link
            to="/login"
            className="inline-block px-5 py-2.5 bg-emerald-50 text-[#15803D] rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
      ) : (
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
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#15803D] hover:bg-[#0F5D28] text-white rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <div className="text-center pt-2">
            <Link to="/login" className="text-xs font-bold text-slate-500 hover:text-slate-800">
              Return to Login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
