import React from 'react';
import { ShieldCheck, Recycle, Heart, Users, CheckCircle2 } from 'lucide-react';

export default function About() {
  const values = [
    { title: 'Waste Diversion', desc: 'Millions of functional items are discarded into landfills every year. We redirect them back to productive community cycles.' },
    { title: 'Radical Access', desc: 'No financial paywalls. Essential tools, furniture, clothing, and technology are shared freely to empower people.' },
    { title: 'Verified Trust', desc: 'All charitable organizations are thoroughly vetted so donors know their contributions reach verified community programs.' },
    { title: 'Ecological Responsibility', desc: 'Local community handovers minimize transportation carbon emissions, supporting neighborhood-scale circularity.' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-extrabold tracking-widest text-[#15803D] uppercase">
          OUR STORY & PHILOSOPHY
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Giving Useful Things a Second Life.
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          SecondLife was founded on a simple conviction: good things shouldn't go to waste when communities right around us can put them to immediate, life-changing use.
        </p>
      </div>

      {/* Grid of Values */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {values.map((v, i) => (
          <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#15803D] flex items-center justify-center font-extrabold text-sm">
              0{i + 1}
            </div>
            <h3 className="font-bold text-base text-slate-900">{v.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{v.desc}</p>
          </div>
        ))}
      </div>

      {/* Impact & Mission Banner */}
      <div className="bg-emerald-50 rounded-3xl p-8 sm:p-12 border border-emerald-100/80 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 space-y-4">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
            Circular Economy in Action
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Small Contributions. Real Social Impact.
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            By connecting neighbors, local shelters, student groups, and non-profits on a single unified platform, SecondLife eliminates friction in donation logistics, making community sharing second nature.
          </p>
        </div>
        <div className="w-full md:w-72 aspect-square rounded-2xl bg-white p-6 shadow-sm flex items-center justify-center">
          <img src="/images/secondlife_hero.jpeg" alt="Sustainability" className="w-full h-full object-contain" />
        </div>
      </div>
    </div>
  );
}
