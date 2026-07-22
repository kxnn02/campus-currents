"use client";

import { useState } from "react";
import Animate from "./Animate";

const technologies = [
  {
    name: "React Native",
    detail: "Cross-platform mobile app (Expo SDK 54)",
    category: "Mobile",
  },
  {
    name: "Supabase",
    detail: "Secure login, database, and real-time sync",
    category: "Backend",
  },
  {
    name: "Next.js",
    detail: "Admin dashboard and this landing page",
    category: "Web",
  },
  {
    name: "WebSocket",
    detail: "Live updates — no need to refresh",
    category: "Real-time",
  },
  {
    name: "Push Notifications",
    detail: "Instant alerts with delivery verification",
    category: "Notifications",
  },
  {
    name: "PostgreSQL",
    detail: "36 database migrations with row-level security",
    category: "Database",
  },
];

export default function TechStack() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section id="tech-stack" className="relative py-24 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-warm-50 to-warm-100" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <Animate className="max-w-2xl mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-warm-950">
            How we built it
          </h2>
          <p className="mt-4 text-text-brown text-lg">
            Not a simple school project. A full-stack system with real-time data,
            instant push alerts, and enterprise-grade security.
          </p>
        </Animate>

        {/* Collapsible on mobile, always visible on desktop */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${!expanded ? "max-h-[280px] sm:max-h-none overflow-hidden" : ""}`}>
          {technologies.map((tech, i) => (
            <Animate key={i} delay={i * 0.06} y={16}>
              <div className="group flex items-start gap-4 p-5 rounded-xl bg-white border border-warm-200 hover:border-warm-300 hover:shadow-sm transition-all">
                <div className="shrink-0 w-2 h-2 rounded-full bg-brand-red mt-2" aria-hidden="true" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-warm-950">
                      {tech.name}
                    </span>
                    <span className="text-[10px] font-medium text-text-muted bg-warm-150 px-2 py-0.5 rounded-full">
                      {tech.category}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">
                    {tech.detail}
                  </p>
                </div>
              </div>
            </Animate>
          ))}
        </div>

        {/* Show more button — only visible on mobile */}
        {!expanded && (
          <div className="sm:hidden mt-4 text-center">
            <button
              onClick={() => setExpanded(true)}
              className="text-sm font-medium text-brand-red hover:text-brand-red-dark transition-colors"
            >
              Show all technologies ↓
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
