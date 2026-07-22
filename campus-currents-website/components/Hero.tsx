import Animate from "./Animate";
import InteractivePhone from "./InteractivePhone";
import PhoneErrorBoundary from "./PhoneErrorBoundary";

export default function Hero() {
  return (
    <section className="relative min-h-[100dvh] flex items-center overflow-hidden pt-20">
      {/* Warm atmospheric blobs */}
      <div className="absolute top-[-100px] left-[-50px] w-[500px] h-[500px] bg-brand-red/8 warm-blob" aria-hidden="true" />
      <div className="absolute bottom-[-100px] right-[-80px] w-[450px] h-[450px] bg-brand-amber/10 warm-blob" aria-hidden="true" />
      <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-warm-200 warm-blob" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 md:py-24 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left: Copy */}
        <Animate className="text-center lg:text-left" trigger="animate">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-amber-bg border border-brand-amber/30 shadow-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-brand-amber animate-pulse" />
            <span className="text-xs text-text-brown font-medium">
              Now recruiting beta testers at SSC-R Manila
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-[1.1] text-warm-950">
            Stay Informed.
            <br />
            <span className="text-brand-red">Stay Safe.</span>
          </h1>

          <p className="mt-6 text-lg text-text-brown max-w-lg mx-auto lg:mx-0 leading-relaxed">
            Real-time class suspension alerts, emergency notifications, and
            campus updates - all in one app built for Sebastinians.
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <a
              href="#download"
              className="group flex items-center gap-3 px-8 py-4 bg-brand-red rounded-2xl font-semibold text-white shadow-lg shadow-brand-red/15 hover:shadow-brand-red/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Try the Beta
            </a>
            <a
              href="#features"
              className="flex items-center gap-2 px-6 py-4 text-text-brown hover:text-text-dark transition-colors font-medium"
            >
              See what we built
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </a>
          </div>

          {/* Social proof */}
          <div className="mt-8 flex items-center gap-3 justify-center lg:justify-start">
            <div className="flex -space-x-2">
              {["KF", "CL", "MM", "AB", "JM"].map((initials, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-warm-150 border-2 border-white flex items-center justify-center"
                >
                  <span className="text-[9px] font-bold text-brand-red">{initials}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-text-muted">
              <span className="font-semibold text-text-brown">15+ beta testers</span> at SSC-R Manila
            </p>
          </div>
        </Animate>

        {/* Right: Interactive phone mockup */}
        <Animate className="relative flex justify-center lg:justify-end" trigger="animate" delay={0.2} y={0} scale={0.95}>
          <div className="relative float-animation">
            <PhoneErrorBoundary>
              <InteractivePhone defaultTab="status" />
            </PhoneErrorBoundary>
          </div>
        </Animate>
      </div>
    </section>
  );
}
