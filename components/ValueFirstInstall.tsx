"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function ValueFirstInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone;

    if (isStandalone) return;

    const dismissedAt = localStorage.getItem("hmc_pwa_dismissed_at");
    if (dismissedAt) {
      const daysPassed = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysPassed < 45) return;
    }

    const ua = window.navigator.userAgent.toLowerCase();
    const isApple = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isApple);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    const handleCalculationDone = () => setShowPrompt(true);
    window.addEventListener("hmc_calculation_complete", handleCalculationDone);

    const timer = setTimeout(() => setShowPrompt(true), 60000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("hmc_calculation_complete", handleCalculationDone);
      clearTimeout(timer);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      setShowPrompt(false);
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("hmc_pwa_dismissed_at", Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <div
      role="region"
      aria-label="App installation prompt"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40 bg-slate-900/95 border border-slate-800 text-white p-4 rounded-2xl shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom duration-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-xl shrink-0">
            📊
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-100">Keep HomeMoney Calc on your phone?</h4>
            <p className="text-xs text-slate-400">Save calculations & use offline anytime.</p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-slate-400 hover:text-slate-200 text-lg leading-none p-1 transition"
          aria-label="Close"
        >
          ×
        </button>
      </div>
      {isIOS ? (
        <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-300 space-y-1.5">
          <p className="text-slate-400 font-medium">To install on iPhone:</p>
          <div className="flex items-center gap-2">
            <span className="text-blue-400 font-bold">1.</span>
            <span>Tap Safari&apos;s <strong>Share</strong> button (<strong>⎋ / [↑]</strong>) below</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-400 font-bold">2.</span>
            <span>Select <strong>Add to Home Screen (+)</strong></span>
          </div>
        </div>
      ) : (
        <div className="mt-3.5 flex gap-2">
          <button
            onClick={handleDismiss}
            className="flex-1 py-2 px-3 border border-slate-700 hover:bg-slate-800 rounded-lg text-xs font-medium text-slate-300 transition"
          >
            Not now
          </button>
          <button
            onClick={handleInstall}
            className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-semibold text-white shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-1.5"
          >
            📲 Add to Phone
          </button>
        </div>
      )}
    </div>
  );
}
