"use client";

import { AndroidLogo, AppleLogo, TestTube } from "@phosphor-icons/react";
import Animate from "./Animate";

export default function Download() {
  return (
    <section id="download" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-warm-50 to-warm-100" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <Animate>
          <div className="relative p-10 md:p-16 rounded-3xl bg-white border border-warm-200 shadow-lg">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-amber-bg border border-brand-amber/30 mb-6">
              <TestTube size={14} weight="fill" className="text-brand-amber" />
              <span className="text-xs text-amber-700 font-medium">
                Beta testing phase
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-warm-950">
              Help us shape CampusCurrents
            </h2>
            <p className="mt-4 text-text-brown text-lg max-w-xl mx-auto">
              We&apos;re looking for SSC-R Manila students to test the app, find bugs,
              and give feedback before the full launch. Your input directly
              improves the experience for every Sebastinian.
            </p>

            {/* Call to action context */}
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-red-light border border-brand-red/10">
              <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
              <span className="text-xs font-medium text-brand-red">
                Now accepting beta testers — your feedback shapes the app
              </span>
            </div>

            {/* What testers get */}
            <div className="mt-8 grid sm:grid-cols-3 gap-4 max-w-lg mx-auto text-left">
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-red mt-2 shrink-0" />
                <span className="text-sm text-text-brown">Early access to all features</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-red mt-2 shrink-0" />
                <span className="text-sm text-text-brown">Direct line to the dev team</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-red mt-2 shrink-0" />
                <span className="text-sm text-text-brown">Help shape the final product</span>
              </div>
            </div>

            {/* Download buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://drive.google.com/file/d/11SW5oN-PzmJ_NAfmFnQSAFma9er1RCkb/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 px-8 py-4 bg-brand-red rounded-2xl hover:bg-brand-red-dark hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md"
              >
                <AndroidLogo size={26} weight="fill" className="text-white" />
                <div className="text-left">
                  <div className="text-[10px] text-white/70 uppercase tracking-wide">
                    Get early access
                  </div>
                  <div className="text-lg font-semibold text-white">Android Beta</div>
                </div>
              </a>

              <div className="flex items-center gap-4 px-8 py-4 bg-warm-150 border border-warm-300 rounded-2xl opacity-60 cursor-not-allowed">
                <AppleLogo size={26} weight="fill" className="text-text-brown" />
                <div className="text-left">
                  <div className="text-[10px] text-text-muted uppercase tracking-wide">
                    Coming soon
                  </div>
                  <div className="text-lg font-semibold text-text-brown">iOS</div>
                </div>
              </div>
            </div>

            <p className="mt-8 text-xs text-text-muted">
              Requires Android 8.0+ and an SSC-R Google account for login
            </p>

            {/* QR Code for desktop users */}
            <div className="mt-8 pt-6 border-t border-warm-200 hidden md:flex flex-col items-center">
              <p className="text-xs text-text-muted mb-3">
                On desktop? Scan with your phone to download
              </p>
              <div className="w-32 h-32 rounded-2xl border border-warm-200 bg-white p-2.5 shadow-sm">
                <img
                  src="/images/qr-download.png"
                  alt="QR code to download CampusCurrents"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-[10px] text-text-muted mt-2">
                Scan to open the download page
              </p>
            </div>
          </div>
        </Animate>
      </div>
    </section>
  );
}
