import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { dashboardService } from '../../services/savedItemService';
import { useToast } from '../../context/ToastContext';

export default function Contact() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dashboardService.sendContactMessage(form);
      setSubmitted(true);
      showToast('Thank you! Your message has been sent to SecondLife team.', 'success');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      showToast('Could not send message. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const faqs = [
    { q: 'What items can I donate?', a: 'Clean clothes, books, working electronics, sound furniture, unopened non-perishable food, and home goods.' },
    { q: 'How does SecondLife verify organizations?', a: 'Organizations submit their tax or non-profit registration number, which our administrators review against public charity registers.' },
    { q: 'Do you charge any fees for delivery?', a: 'SecondLife is a free platform. Public handovers are arranged directly, and partner eco-vans are funded by grant partners.' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-extrabold tracking-widest text-[#15803D] uppercase">
          GET IN TOUCH
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900">
          Let's Make an Impact Together.
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Have a question about donating, requesting items, partnerships, or verification? Our community team is here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-slate-100 shadow-soft">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Send Us a Message</h3>

          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="text-base font-bold text-slate-900">Inquiry Sent Successfully</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Thank you for reaching out! A SecondLife representative will reply within 24 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-4 py-2 bg-emerald-50 text-[#15803D] text-xs font-bold rounded-xl"
              >
                Send Another Note
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Your Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 focus:bg-white"
                    placeholder="Your Full Name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 focus:bg-white"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Subject</label>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 focus:bg-white"
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Message</label>
                <textarea
                  rows={4}
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 focus:bg-white resize-none"
                  placeholder="Tell us about your donation, organization, or questions..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#15803D] hover:bg-[#0F5D28] text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Sending...' : 'Send Message'}
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>

        {/* Right Info & FAQ */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
            <h4 className="font-bold text-sm text-slate-900">Direct Contact</h4>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#15803D] flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <span>hello@secondlife.eco</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#15803D] flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <span>+1 (555) 019-2831</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#15803D] flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <span>Seattle, WA & Greater Pacific Northwest</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-3">
            <h4 className="font-bold text-sm text-slate-900 mb-2">Frequently Asked Questions</h4>
            {faqs.map((f, i) => (
              <div key={i} className="border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                <p className="text-xs font-bold text-slate-800">{f.q}</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
