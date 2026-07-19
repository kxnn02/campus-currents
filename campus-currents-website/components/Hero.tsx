export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Warm atmospheric blobs (like Figma registration screens) */}
      <div className="absolute top-[-100px] left-[-50px] w-[500px] h-[500px] bg-brand-red/8 warm-blob" />
      <div className="absolute bottom-[-100px] right-[-80px] w-[450px] h-[450px] bg-brand-amber/10 warm-blob" />
      <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-warm-200 warm-blob" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 md:py-28 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left: Copy */}
        <div className="text-center lg:text-left">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-warm-300 shadow-sm mb-8 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-text-brown font-medium">
              Now available for SSC-R Manila students
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-warm-950 animate-fade-in-up animate-delay-100">
            Stay Informed.
            <br />
            <span className="text-brand-red">
              Stay Safe.
            </span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-text-brown max-w-lg mx-auto lg:mx-0 leading-relaxed animate-fade-in-up animate-delay-200">
            Real-time class suspension alerts, emergency notifications, and
            campus updates — all in one app built for Sebastinians.
          </p>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start animate-fade-in-up animate-delay-300">
            <a
              href="#download"
              className="group flex items-center gap-3 px-8 py-4 bg-brand-red rounded-2xl font-semibold text-white shadow-lg shadow-brand-red/15 hover:shadow-brand-red/25 hover:scale-[1.02] transition-all"
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
              className="flex items-center gap-2 px-6 py-4 text-text-brown hover:text-text-dark transition-colors font-medium"
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
                <path d="M6 9l6 6 6-6" />
              </svg>
            </a>
          </div>

          {/* Social proof */}
          <div className="mt-12 flex items-center gap-6 justify-center lg:justify-start animate-fade-in-up animate-delay-400">
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-red">12,000+</div>
              <div className="text-xs text-text-muted mt-1">Students</div>
            </div>
            <div className="w-px h-8 bg-warm-300" />
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-red">Instant</div>
              <div className="text-xs text-text-muted mt-1">Alerts</div>
            </div>
            <div className="w-px h-8 bg-warm-300" />
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-red">24/7</div>
              <div className="text-xs text-text-muted mt-1">Monitoring</div>
            </div>
          </div>
        </div>

        {/* Right: Phone mockup */}
        <div className="relative flex justify-center lg:justify-end animate-fade-in-up animate-delay-300">
          <div className="relative float-animation">
            {/* Phone frame */}
            <div className="relative w-[280px] md:w-[300px] h-[560px] md:h-[600px] rounded-[3rem] border-[8px] border-warm-900 bg-warm-50 shadow-2xl shadow-warm-900/10 overflow-hidden">
              {/* Status bar */}
              <div className="absolute top-0 left-0 right-0 h-7 bg-warm-950 flex items-center justify-center">
                <div className="w-16 h-4 rounded-full bg-warm-900" />
              </div>

              {/* App content mock */}
              <div className="absolute inset-0 pt-9 px-3 pb-3 bg-warm-100">
                {/* Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-sm font-bold text-warm-950">Feed</span>
                  <div className="w-5 h-5 rounded-full bg-warm-300" />
                </div>

                {/* Filter chips */}
                <div className="flex gap-1.5 mb-3 px-1">
                  <div className="px-2.5 py-1 rounded-full bg-brand-red/10 border border-brand-red/20">
                    <span className="text-[9px] font-medium text-brand-red">All</span>
                  </div>
                  <div className="px-2.5 py-1 rounded-full bg-white border border-warm-200">
                    <span className="text-[9px] text-text-muted">Emergency</span>
                  </div>
                  <div className="px-2.5 py-1 rounded-full bg-white border border-warm-200">
                    <span className="text-[9px] text-text-muted">Important</span>
                  </div>
                </div>

                {/* Cards */}
                <div className="space-y-2.5">
                  {/* Emergency card */}
                  <div className="rounded-xl bg-white border border-warm-200 p-3 shadow-sm">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-1 h-5 rounded-full bg-red-500" />
                      <span className="text-[9px] font-bold text-red-600">EMERGENCY</span>
                      <span className="text-[8px] text-text-muted ml-auto">2h ago</span>
                    </div>
                    <p className="text-[11px] text-warm-950 font-semibold">Lockdown Drill — July 15</p>
                    <p className="text-[9px] text-text-muted mt-0.5">Follow safety protocols immediately.</p>
                  </div>

                  {/* Important card */}
                  <div className="rounded-xl bg-white border border-warm-200 p-3 shadow-sm">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-1 h-5 rounded-full bg-amber-500" />
                      <span className="text-[9px] font-bold text-amber-600">IMPORTANT</span>
                      <span className="text-[8px] text-text-muted ml-auto">4h ago</span>
                    </div>
                    <p className="text-[11px] text-warm-950 font-semibold">Classes Suspended — Habagat</p>
                    <p className="text-[9px] text-text-muted mt-0.5">Per Manila LGU, all classes suspended.</p>
                  </div>

                  {/* Routine card */}
                  <div className="rounded-xl bg-white border border-warm-200 p-3 shadow-sm">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-1 h-5 rounded-full bg-indigo-400" />
                      <span className="text-[9px] text-text-muted">SSC-R Admin</span>
                      <span className="text-[8px] text-text-muted ml-auto">6h ago</span>
                    </div>
                    <p className="text-[11px] text-warm-950 font-semibold">Foundation Day 2026</p>
                    <p className="text-[9px] text-text-muted mt-0.5">Join us August 28 for celebration.</p>
                  </div>

                  {/* Another card */}
                  <div className="rounded-xl bg-white border border-warm-200 p-3 shadow-sm">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-1 h-5 rounded-full bg-indigo-400" />
                      <span className="text-[9px] text-text-muted">IT Dept</span>
                    </div>
                    <p className="text-[11px] text-warm-950 font-semibold">BSIT Seminar: AI in Industry</p>
                  </div>
                </div>

                {/* Bottom nav */}
                <div className="absolute bottom-2 left-3 right-3 flex justify-around items-center py-2 rounded-2xl bg-white border border-warm-200 shadow-sm">
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="w-3.5 h-3.5 rounded bg-brand-red" />
                    <span className="text-[7px] font-medium text-brand-red">Feed</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="w-3.5 h-3.5 rounded bg-warm-300" />
                    <span className="text-[7px] text-text-muted">Status</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="w-3.5 h-3.5 rounded bg-warm-300" />
                    <span className="text-[7px] text-text-muted">Calendar</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="w-3.5 h-3.5 rounded bg-warm-300" />
                    <span className="text-[7px] text-text-muted">Profile</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
