"use client";

import {
  Bell,
  Clock,
  CalendarBlank,
  ShieldCheck,
  UsersThree,
  Lightning,
} from "@phosphor-icons/react";
import Animate from "./Animate";

const features = [
  {
    icon: Bell,
    title: "Instant Alerts",
    description:
      "Push notifications in seconds. Emergency alerts override silent mode so you never miss critical safety information.",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-100",
  },
  {
    icon: Clock,
    title: "Class Suspension Hub",
    description:
      "Know instantly whether classes are ON, SUSPENDED, or under monitoring - with source, reason, and duration at a glance.",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
  {
    icon: CalendarBlank,
    title: "School Calendar",
    description:
      "Interactive monthly calendar with color-coded events. Tap any date to see announcements, suspensions, and events.",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
  },
  {
    icon: ShieldCheck,
    title: "Emergency Response",
    description:
      "Full-screen emergency overlay with I'm Safe and Need Help buttons. Security sees your response in real-time.",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-100",
  },
  {
    icon: UsersThree,
    title: "Targeted Broadcasts",
    description:
      "Receive only what's relevant to you - filtered by program, year level, and department. No noise, just what matters.",
    color: "text-teal-600",
    bg: "bg-teal-50",
    border: "border-teal-100",
  },
  {
    icon: Lightning,
    title: "Real-time Updates",
    description:
      "Live WebSocket connection keeps your feed, status, and alerts updated instantly - no manual refresh needed.",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-24 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-warm-100 to-warm-50" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <Animate className="max-w-2xl mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-warm-950">
            Everything you need to stay connected
          </h2>
          <p className="mt-4 text-text-brown text-lg">
            Designed for the unique needs of SSC-R Manila students - from
            weather suspensions to campus emergencies.
          </p>
        </Animate>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <Animate key={i} delay={i * 0.08} y={24}>
                <div
                  className={`group relative p-6 rounded-2xl bg-white border ${feature.border} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden`}
                >
                  {/* Subtle gradient accent on hover */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${feature.bg} rounded-2xl`} />
                  <div className="relative">
                    <div
                      className={`w-11 h-11 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}
                    >
                      <Icon size={22} weight="duotone" className={feature.color} />
                    </div>
                    <h3 className="text-base font-semibold text-warm-950 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-text-muted leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Animate>
            );
          })}
        </div>
      </div>
    </section>
  );
}
