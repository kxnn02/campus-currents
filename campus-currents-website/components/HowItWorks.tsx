"use client";

import { DownloadSimple, UserCircle, CheckCircle } from "@phosphor-icons/react";
import Animate from "./Animate";

const steps = [
  {
    icon: DownloadSimple,
    title: "Download and Sign In",
    description:
      "Get the app on your Android phone. Sign in with your SSC-R Google account (@sscrmnl.edu.ph) for instant verification.",
  },
  {
    icon: UserCircle,
    title: "Complete Your Profile",
    description:
      "Set your program, year level, and emergency contact. This ensures you receive alerts relevant to your department.",
  },
  {
    icon: CheckCircle,
    title: "Stay Informed",
    description:
      "Receive instant push notifications for class suspensions, emergency alerts, school events, and campus announcements.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-warm-150" />
      <div className="absolute top-0 right-[-100px] w-[400px] h-[400px] bg-brand-red/5 warm-blob" aria-hidden="true" />
      <div className="absolute bottom-0 left-[-80px] w-[350px] h-[350px] bg-brand-amber/8 warm-blob" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <Animate className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-warm-950">
            Up and running in 3 minutes
          </h2>
          <p className="mt-4 text-text-brown text-lg">
            No complicated setup. Just sign in with your school credentials and
            you&apos;re good to go.
          </p>
        </Animate>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <Animate key={i} className="relative text-center" delay={i * 0.12} y={24}>
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px bg-warm-300" />
                )}

                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white border border-warm-200 shadow-sm mb-6">
                  <Icon size={28} weight="duotone" className="text-brand-red" />
                </div>

                <h3 className="text-lg font-semibold text-warm-950 mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  {step.description}
                </p>
              </Animate>
            );
          })}
        </div>
      </div>
    </section>
  );
}
