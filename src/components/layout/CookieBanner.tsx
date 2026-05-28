"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function CookieBanner() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check local storage to see if cookies have already been accepted
    const hasConsent = localStorage.getItem("reanswer-cookie-consent");
    if (!hasConsent) {
      // Delay showing the banner slightly for a smoother entry feel
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("reanswer-cookie-consent", "true");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-md z-50 overflow-hidden shadow-2xl rounded-2xl border border-slate-800 bg-slate-900/95 backdrop-blur-md text-white p-5 md:p-6"
        >
          {/* Subtle glowing radial background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.15),transparent_60%)] pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 flex items-center justify-center shadow-inner">
                <Cookie size={20} className="animate-pulse" />
              </div>
              <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-200">
                {t("cookie.title")}
              </h4>
              <button
                onClick={() => setIsVisible(false)}
                className="ml-auto text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800/50"
                title={t("cookie.dismiss")}
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              {t("cookie.text")}{" "}
              <Link
                href="/privacy"
                className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4 decoration-indigo-400/50 hover:decoration-indigo-300 transition-colors"
              >
                {t("common.privacyPolicy")}
              </Link>
              .
            </p>

            <div className="flex gap-3 justify-end items-center mt-1">
              <button
                onClick={() => setIsVisible(false)}
                className="text-xs font-semibold text-slate-400 hover:text-white transition-colors px-3 py-2 rounded-xl hover:bg-slate-800/30"
              >
                {t("cookie.dismiss")}
              </button>
              <button
                onClick={handleAccept}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95 border border-indigo-500/30 cursor-pointer"
              >
                {t("cookie.accept")}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
