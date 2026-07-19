export default function Download() {
  return (
    <section id="download" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-warm-950 via-brand-red/5 to-warm-950" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-red/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-brand-amber/8 rounded-full blur-[80px]" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        {/* Card */}
        <div className="relative p-12 md:p-16 rounded-3xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] backdrop-blur-sm">
          {/* Animated border glow */}
          <div className="absolute -inset-px rounded-3xl animated-border opacity-20" />
          <div className="absolute inset-0 rounded-3xl bg-warm-950/90" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-300 font-medium">
                Available now on Android
              </span>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Get CampusCurrents
            </h2>
            <p className="mt-4 text-white/50 text-lg max-w-xl mx-auto">
              Download the app today and never miss another class suspension
              announcement or campus emergency alert.
            </p>

            {/* Download buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://expo.dev/accounts/kxnn02/projects/campus-currents/builds"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 px-8 py-4 bg-white rounded-2xl hover:bg-white/95 hover:scale-105 transition-all shadow-xl shadow-white/5"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#3DDC84">
                  <path d="M17.523 2.78l1.753-1.753a.35.35 0 00-.495-.495L16.97 2.34C15.41 1.571 13.75 1.15 12 1.15c-1.75 0-3.41.42-4.97 1.19L5.22.53a.35.35 0 00-.495.495L6.477 2.78C3.785 4.466 2 7.33 2 10.6h20c0-3.27-1.785-6.134-4.477-7.82zM8.5 7.9a1 1 0 110-2 1 1 0 010 2zm7 0a1 1 0 110-2 1 1 0 010 2zM2 11.6v8.4a2 2 0 002 2h1v3a1.5 1.5 0 003 0v-3h8v3a1.5 1.5 0 003 0v-3h1a2 2 0 002-2v-8.4H2z" />
                </svg>
                <div className="text-left">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wide">
                    Download for
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    Android
                  </div>
                </div>
              </a>

              <div className="flex items-center gap-4 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl opacity-60 cursor-not-allowed">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <div className="text-left">
                  <div className="text-[10px] text-white/40 uppercase tracking-wide">
                    Coming soon
                  </div>
                  <div className="text-lg font-semibold text-white/60">
                    iOS
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-8 text-xs text-white/30">
              Requires Android 8.0+ • SSC-R Google account required for login
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
