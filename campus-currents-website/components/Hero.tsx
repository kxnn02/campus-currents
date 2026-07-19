export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden noise-bg pt-20">
      {/* Background gradients */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-red/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-amber/8 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-red/5 rounded-full blur-[160px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 md:py-32 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left: Copy */}
        <div className="text-center lg:text-left">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-white/70 font-medium">
              Now available for SSC-R Manila students
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] animate-fade-in-up animate-delay-100">
            Stay Informed.
            <br />
            <span className="bg-gradient-to-r from-brand-amber to-brand-amber-light bg-clip-text text-transparent">
              Stay Safe.
            </span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-white/60 max-w-lg mx-auto lg:mx-0 leading-relaxed animate-fade-in-up animate-delay-200">
            Real-time class suspension alerts, emergency notifications, and
            campus updates — all in one app built for Sebastinians.
          </p>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start animate-fade-in-up animate-delay-300">
            <a
              href="#download"
              className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-brand-red to-brand-red-dark rounded-2xl font-semibold text-white shadow-xl shadow-brand-red/20 hover:shadow-brand-red/40 hover:scale-105 transition-all"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download for Android
            </a>
            <a
              href="#features"
              className="flex items-center gap-2 px-6 py-4 text-white/70 hover:text-white transition-colors font-medium"
            >
              Learn more
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M7 17l9.2-9.2M17 17V7H7" />
              </svg>
            </a>
          </div>

          {/* Social proof */}
          <div className="mt-12 flex items-center gap-6 justify-center lg:justify-start animate-fade-in-up animate-delay-400">
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-amber">12,000+</div>
              <div className="text-xs text-white/40 mt-1">Students</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-amber">Instant</div>
              <div className="text-xs text-white/40 mt-1">Alerts</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-amber">24/7</div>
              <div className="text-xs text-white/40 mt-1">Monitoring</div>
            </div>
          </div>
        </div>

        {/* Right: Phone mockup */}
        <div className="relative flex justify-center lg:justify-end animate-fade-in-up animate-delay-300">
          <div className="relative float-animation">
            {/* Phone frame */}
            <div className="relative w-[280px] md:w-[320px] h-[580px] md:h-[640px] rounded-[3rem] border-[8px] border-white/10 bg-gradient-to-b from-warm-900 to-warm-950 shadow-2xl glow-red overflow-hidden">
              {/* Status bar */}
              <div className="absolute top-0 left-0 right-0 h-8 bg-warm-950/80 flex items-center justify-center">
                <div className="w-20 h-5 rounded-full bg-warm-950" />
              </div>

              {/* App content mock */}
              <div className="absolute inset-0 pt-10 px-4 pb-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-white">Feed</span>
                  <div className="w-6 h-6 rounded-full bg-white/10" />
                </div>

                {/* Cards */}
                <div className="space-y-3">
                  {/* Emergency card */}
                  <div className="rounded-xl bg-gradient-to-r from-red-900/40 to-red-800/20 border border-red-500/20 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1.5 h-6 rounded-full bg-red-500" />
                      <span className="text-[10px] font-bold text-red-300">EMERGENCY</span>
                    </div>
                    <p className="text-xs text-white/80 font-medium">Lockdown Drill — July 15, 2:00 PM</p>
                    <p className="text-[10px] text-white/50 mt-1">Follow safety protocols immediately.</p>
                  </div>

                  {/* Important card */}
                  <div className="rounded-xl bg-gradient-to-r from-amber-900/30 to-amber-800/10 border border-amber-500/20 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1.5 h-6 rounded-full bg-amber-500" />
                      <span className="text-[10px] font-bold text-amber-300">IMPORTANT</span>
                    </div>
                    <p className="text-xs text-white/80 font-medium">Classes Suspended — Habagat</p>
                    <p className="text-[10px] text-white/50 mt-1">Per Manila LGU directive, all classes suspended.</p>
                  </div>

                  {/* Routine card */}
                  <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1.5 h-6 rounded-full bg-indigo-400" />
                      <span className="text-[10px] font-medium text-white/60">SSC-R Admin</span>
                    </div>
                    <p className="text-xs text-white/80 font-medium">Foundation Day 2026 — Save the Date!</p>
                    <p className="text-[10px] text-white/50 mt-1">Join us on August 28 for celebration.</p>
                  </div>

                  {/* Another routine card */}
                  <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1.5 h-6 rounded-full bg-indigo-400" />
                      <span className="text-[10px] font-medium text-white/60">IT Dept</span>
                    </div>
                    <p className="text-xs text-white/80 font-medium">BSIT Seminar: AI in Industry</p>
                    <p className="text-[10px] text-white/50 mt-1">Tomorrow, 10 AM at the AVR.</p>
                  </div>
                </div>

                {/* Bottom nav */}
                <div className="absolute bottom-3 left-4 right-4 flex justify-around items-center py-2 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="w-4 h-4 rounded bg-brand-amber/80" />
                    <span className="text-[8px] text-brand-amber">Feed</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="w-4 h-4 rounded bg-white/20" />
                    <span className="text-[8px] text-white/40">Status</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="w-4 h-4 rounded bg-white/20" />
                    <span className="text-[8px] text-white/40">Calendar</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="w-4 h-4 rounded bg-white/20" />
                    <span className="text-[8px] text-white/40">Profile</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-brand-amber/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-brand-red/15 rounded-full blur-3xl" />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
        <span className="text-xs">Scroll</span>
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 6l4 4 4-4" />
        </svg>
      </div>
    </section>
  );
}
