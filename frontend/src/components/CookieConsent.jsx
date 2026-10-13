import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Cookie, X } from 'lucide-react';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    try {
      const savedConsent = localStorage.getItem(
        'secondlife_cookie_consent'
      );

      if (!savedConsent) {
        setShowBanner(true);
      }
    } catch (error) {
      console.error('Cookie consent error:', error);
    }
  }, []);

  const saveConsent = (type) => {
    try {
      localStorage.setItem(
        'secondlife_cookie_consent',
        JSON.stringify({
          type,
          necessary: true,
          timestamp: new Date().toISOString(),
        })
      );
    } catch (error) {
      console.error('Unable to save cookie preference:', error);
    }

    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        ease: 'easeOut',
      }}
      className="
        fixed
        bottom-4
        left-4
        right-4
        left-1/2 -translate-x-1/2
        bottom-6
        z-[9999]
        w-[calc(100%-2rem)]
        max-w-3xl
      "
    >
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 shrink-0 rounded-2xl bg-emerald-50 text-[#15803D] flex items-center justify-center">
              <Cookie className="w-5 h-5" />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-extrabold text-slate-900">
                  We value your privacy
                </h3>

                <button
                  type="button"
                  onClick={() => saveConsent('essential')}
                  className="
                    w-7 h-7 rounded-full
                    hover:bg-slate-100
                    text-slate-400
                    hover:text-slate-700
                    flex items-center justify-center
                    transition-colors
                  "
                  aria-label="Close cookie banner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                We use cookies to keep SecondLife secure, remember your
                preferences, and improve your experience. You can choose
                which cookies you want to allow.
              </p>
            </div>
          </div>
        </div>

        {/* Cookie Information */}
        <div className="px-5 pb-4">
          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3.5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Essential Cookies
                </p>

                <p className="text-[10px] text-slate-500 mt-0.5">
                  Required for login, security and basic functionality.
                </p>
              </div>

              <span className="
                shrink-0
                text-[9px]
                font-extrabold
                uppercase
                tracking-wider
                text-emerald-700
                bg-emerald-100
                px-2
                py-1
                rounded-full
              ">
                Always On
              </span>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-100 p-3.5 mt-2.5">
            <p className="text-xs font-bold text-slate-800">
              Optional Cookies
            </p>

            <p className="text-[10px] text-slate-500 mt-0.5">
              Help us understand usage and improve the platform.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="px-5 pb-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => saveConsent('all')}
              className="
                px-3 py-2.5
                bg-[#15803D]
                hover:bg-[#0F5D28]
                text-white
                rounded-xl
                text-[11px]
                font-bold
                transition-all
              "
            >
              Accept All
            </button>

            <button
              type="button"
              onClick={() => saveConsent('essential')}
              className="
                px-3 py-2.5
                bg-slate-100
                hover:bg-slate-200
                text-slate-700
                rounded-xl
                text-[11px]
                font-bold
                transition-all
              "
            >
              Essential Only
            </button>

            <button
              type="button"
              onClick={() => saveConsent('none')}
              className="
                px-3 py-2.5
                bg-white
                hover:bg-slate-50
                border border-slate-200
                text-slate-700
                rounded-xl
                text-[11px]
                font-bold
                transition-all
              "
            >
              Reject All
            </button>
          </div>

          <p className="text-[9px] text-slate-400 text-center mt-3">
            Your cookie preference is saved on this device.
          </p>
        </div>
      </div>
    </motion.div>
  );
}