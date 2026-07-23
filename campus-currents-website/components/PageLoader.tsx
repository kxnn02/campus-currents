"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

/**
 * Branded page load transition.
 * Shows the logo + a progress bar, then fades out revealing the page.
 */
export default function PageLoader() {
  const [loaded, setLoaded] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Mark as loaded after a brief branded moment
    const timer = setTimeout(() => setLoaded(true), 1200);
    // Remove from DOM after fade-out completes
    const hideTimer = setTimeout(() => setHidden(true), 1800);
    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (hidden) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-warm-100 transition-opacity duration-500 ${
        loaded ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        <Image
          src="/images/logo.png"
          alt="CampusCurrents"
          width={56}
          height={56}
          className="rounded-xl"
          priority
        />
        <span className="text-lg font-bold text-warm-950">
          Campus<span className="text-brand-red">Currents</span>
        </span>
        {/* Progress bar */}
        <div className="w-32 h-1 rounded-full bg-warm-200 overflow-hidden mt-2">
          <div className="h-full bg-brand-red rounded-full animate-loader" />
        </div>
      </div>
    </div>
  );
}
