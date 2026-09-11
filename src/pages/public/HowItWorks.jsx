import React from 'react';
import { Link } from 'react-router-dom';
import { Package, RefreshCw, Truck, Sparkles, CheckCircle, ShieldCheck, Heart, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Donate',
      desc: 'Have useful items you no longer need? Take clear photos, describe their condition honestly, and specify if you prefer local pickup or eco-courier drop-off.',
      items: ['Photograph your item clearly', 'Choose category & condition', 'Set pickup location or radius']
    },
    {
      num: '02',
      title: 'Match',
      desc: 'Our intelligent rule-based engine evaluates proximity, needed categories, and receiver preferences to pair your item with the highest-impact recipient.',
      items: ['Rule-based proximity scoring', 'Verified organization priority', 'Direct community requests']
    },
    {
      num: '03',
      title: 'Deliver',
      desc: 'Once you approve a request, a Connection is scheduled with an agreed time window, address, and live handover tracking status.',
      items: ['Scheduled pickup slots', 'Eco electric van dispatch for bulky goods', 'In-app handover status confirmation']
    },
    {
      num: '04',
      title: 'Impact',
      desc: 'Every completed exchange updates your personal circular impact ledger: calculating kilograms of waste diverted and CO2 emissions saved from landfill.',
      items: ['Waste diverted dashboard', 'Lives touched metrics', 'Official non-profit tax receipts']
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-extrabold tracking-widest text-[#15803D] uppercase">
          HOW SECONDLIFE WORKS
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          From Something Unused to Something Meaningful.
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Giving a second life to quality goods should be simple, transparent, and rewarding. Here is how our circular exchange platform operates from start to finish.
        </p>
      </div>

      {/* 4 Step Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {steps.map((s) => (
          <div key={s.num} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-extrabold text-[#15803D]">{s.num}</span>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full">
                Step {s.num}
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">{s.title}</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{s.desc}</p>
            <ul className="space-y-2 pt-2 border-t border-slate-50">
              {s.items.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Safety & Trust */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-soft">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <ShieldCheck className="w-10 h-10 text-[#15803D] mx-auto" />
          <h2 className="text-2xl font-extrabold text-slate-900">Safety & Trust First</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            All participating non-profit organizations must submit official registration and license documents for manual administrative verification before receiving prioritized donations. Private user information is protected, and handovers follow strict community safety protocols.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-8">
        <Link
          to="/register"
          className="inline-flex items-center gap-2 px-8 py-4 bg-[#15803D] hover:bg-[#0F5D28] text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-700/20 hover:scale-105 transition-all"
        >
          <span>Get Started Today</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
