import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Globe, Mail, Shield, RefreshCw } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 pt-16 pb-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Col 1: Brand */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#0F5D28] flex items-center justify-center text-white font-extrabold text-sm">
                SL
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-slate-900 text-lg leading-tight tracking-tight">
                  Second<span className="text-[#15803D]">Life</span>
                </span>
                <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                  GIVE THINGS A SECOND LIFE
                </span>
              </div>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed">
              Empowering sustainable communities through circular resource-sharing. Every pre-loved item given a second life diverts waste and helps someone in need.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-500 font-medium">
              <li><Link to="/categories" className="hover:text-[#15803D] transition-colors">All Categories</Link></li>
              <li><Link to="/how-it-works" className="hover:text-[#15803D] transition-colors">How It Works</Link></li>
              <li><Link to="/about" className="hover:text-[#15803D] transition-colors">Our Mission & Impact</Link></li>
              <li><Link to="/register" className="hover:text-[#15803D] transition-colors">Join as a Donor</Link></li>
              <li><Link to="/register" className="hover:text-[#15803D] transition-colors">Join as a Receiver</Link></li>
            </ul>
          </div>

          {/* Col 3: Categories */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Categories
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-500 font-medium">
              <li><Link to="/categories?category=clothes" className="hover:text-[#15803D] transition-colors">Clothes & Apparel</Link></li>
              <li><Link to="/categories?category=books" className="hover:text-[#15803D] transition-colors">Books & Educational</Link></li>
              <li><Link to="/categories?category=electronics" className="hover:text-[#15803D] transition-colors">Electronics & Gadgets</Link></li>
              <li><Link to="/categories?category=furniture" className="hover:text-[#15803D] transition-colors">Furniture & Home</Link></li>
              <li><Link to="/categories?category=food" className="hover:text-[#15803D] transition-colors">Non-Perishable Food</Link></li>
            </ul>
          </div>

          {/* Col 4: Trust & Contact */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Connect
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Questions or partnerships? Reach our community support team.
            </p>
            <div className="flex flex-col gap-2 text-xs text-slate-600 font-medium">
              <span className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-600" />
                hello@secondlife.eco
              </span>
              <span className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" />
                Seattle, WA • Greater Pacific Northwest
              </span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <div>
            &copy; {new Date().getFullYear()} SecondLife Circular Platform. All rights reserved.
          </div>
          <div className="flex gap-6">
            <Link to="/about" className="hover:text-slate-600">Privacy Policy</Link>
            <Link to="/about" className="hover:text-slate-600">Terms of Service</Link>
            <Link to="/contact" className="hover:text-slate-600">Safety Guidelines</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
