"use client";

import { useState, useEffect, useRef } from "react";
import Animate from "./Animate";
import InteractivePhone from "./InteractivePhone";
import PhoneErrorBoundary from "./PhoneErrorBoundary";

const features = [
  {
    icon: "📋",
    title: "Notification Feed",
    description: "Filtered announcements with tier-based priority and pinned posts",
  },
  {
    icon: "🎓",
    title: "Suspension Status",
    description: "Real-time class suspension monitoring with upcoming alerts and history",
  },
  {
    icon: "📅",
    title: "School Calendar",
    description: "Interactive month view with color-coded events, suspensions, and announcements",
  },
  {
    icon: "👤",
    title: "Profile & Preferences",
    description: "Academic info, notification settings, and quick access to support",
  },
];

export default function Screenshots() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Lazy-load: only mount InteractivePhone when section is near viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="app-preview" className="relative py-24 md:py-32 overflow-hidden" ref={sectionRef}>
      <div className="absolute inset-0 bg-warm-50" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <Animate className="max-w-2xl mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-warm-950">
            Explore the app
          </h2>
          <p className="mt-4 text-text-brown text-lg">
            From routine announcements to campus emergencies, every screen
            is purpose-built. Try it yourself — tap the tabs below.
          </p>
        </Animate>

        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Interactive phone — lazy loaded */}
          <Animate className="shrink-0" delay={0.1}>
            {isVisible ? (
              <PhoneErrorBoundary>
                <InteractivePhone defaultTab="feed" />
              </PhoneErrorBoundary>
            ) : (
              <div className="w-[280px] md:w-[300px] h-[560px] md:h-[600px] rounded-[3rem] border-[8px] border-warm-900 bg-warm-150 animate-pulse" />
            )}
          </Animate>

          {/* Feature list */}
          <div className="flex-1 grid sm:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <Animate key={i} delay={0.1 + i * 0.1}>
                <div className="p-5 rounded-2xl border border-warm-200 bg-white/60 backdrop-blur-sm">
                  <span className="text-2xl mb-3 block" aria-hidden="true">{feature.icon}</span>
                  <p className="text-sm font-semibold text-warm-950">
                    {feature.title}
                  </p>
                  <p className="text-xs text-text-muted mt-1.5 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Animate>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
