"use client";

import { useEffect, useRef, useState } from "react";

interface ParallaxBlobProps {
  className: string;
  speed?: number; // 0.5 = moves at half scroll speed (slower), 1.5 = faster
}

/**
 * Decorative blob with scroll-based parallax.
 * Uses transform: translateY for GPU-accelerated movement.
 * Disabled on reduced-motion and mobile.
 */
export default function ParallaxBlob({ className, speed = 0.5 }: ParallaxBlobProps) {
  const [offset, setOffset] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Skip on mobile or reduced motion
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.matchMedia("(max-width: 768px)");
    if (mq.matches || mobile.matches) return;

    let ticking = false;

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          setOffset(window.scrollY * (speed - 1) * 0.3);
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [speed]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ transform: `translateY(${offset}px)` }}
      aria-hidden="true"
    />
  );
}
