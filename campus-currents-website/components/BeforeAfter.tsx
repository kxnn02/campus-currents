"use client";

import { X, Check } from "@phosphor-icons/react";
import Animate from "./Animate";

const comparisons = [
  {
    before: "200+ GC messages to scroll for one suspension update",
    after: "One push notification, filtered to your level",
  },
  {
    before: "Hear about suspensions from friends, not the school",
    after: "Official alerts delivered in under 3 seconds",
  },
  {
    before: "No idea if it applies to your year level or program",
    after: "Scoped by program, year level, and department",
  },
  {
    before: "Miss critical alerts when phone is on silent",
    after: "Emergency tier overrides silent mode on Android",
  },
  {
    before: "Events buried in Facebook posts you never see",
    after: "Color-coded school calendar with everything in one place",
  },
];

export default function BeforeAfter() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="absolute inset-0 bg-warm-100" />

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <Animate className="max-w-2xl mb-14">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-warm-950">
            The problem we solved
          </h2>
          <p className="mt-4 text-text-brown text-lg">
            How campus communication works today versus what we built.
          </p>
        </Animate>

        {/* Comparison table - clean, no colored cards */}
        <Animate delay={0.1}>
          <div className="rounded-2xl border border-warm-200 bg-white overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-2 border-b border-warm-200">
              <div className="px-6 py-4 border-r border-warm-200">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                  Without CampusCurrents
                </span>
              </div>
              <div className="px-6 py-4">
                <span className="text-xs font-semibold text-brand-red uppercase tracking-wide">
                  With CampusCurrents
                </span>
              </div>
            </div>

            {/* Comparison rows */}
            {comparisons.map((row, i) => (
              <div
                key={i}
                className={`grid grid-cols-2 ${i < comparisons.length - 1 ? "border-b border-warm-200" : ""}`}
              >
                <div className="px-6 py-5 border-r border-warm-200 flex items-start gap-3">
                  <X size={16} weight="bold" className="text-warm-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-text-muted leading-relaxed">
                    {row.before}
                  </span>
                </div>
                <div className="px-6 py-5 flex items-start gap-3">
                  <Check size={16} weight="bold" className="text-brand-red shrink-0 mt-0.5" />
                  <span className="text-sm text-warm-950 leading-relaxed">
                    {row.after}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Animate>
      </div>
    </section>
  );
}
