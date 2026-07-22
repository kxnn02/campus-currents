import Animate from "./Animate";

const screens = [
  {
    title: "Notification Feed",
    description: "Filtered announcements with tier-based priority",
    placeholder: "Feed",
  },
  {
    title: "Suspension Status",
    description: "Real-time class suspension monitoring",
    placeholder: "Status",
  },
  {
    title: "Emergency Overlay",
    description: "Full-screen safety response system",
    placeholder: "Emergency",
  },
  {
    title: "School Calendar",
    description: "Month view with color-coded events",
    placeholder: "Calendar",
  },
  {
    title: "Profile",
    description: "Academic info and notification preferences",
    placeholder: "Profile",
  },
];

export default function Screenshots() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-warm-50" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <Animate className="max-w-2xl mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-warm-950">
            Built for every scenario
          </h2>
          <p className="mt-4 text-text-brown text-lg">
            From routine announcements to campus emergencies, every screen
            is purpose-built.
          </p>
        </Animate>

        <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-6 -mx-6 px-6 scrollbar-hide">
          {screens.map((screen, i) => (
            <Animate key={i} className="snap-center shrink-0 w-[220px] md:w-[260px]" delay={i * 0.1}>
              <div className="relative w-full aspect-[9/19] rounded-[2rem] border-[6px] border-warm-900 bg-warm-150 shadow-xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center px-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center mx-auto mb-3">
                      <span className="text-brand-red font-bold text-sm">
                        {screen.placeholder.charAt(0)}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-warm-800">
                      {screen.placeholder}
                    </p>
                    <p className="text-[10px] text-text-muted mt-1">
                      Screenshot coming soon
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-center">
                <p className="text-sm font-semibold text-warm-950">
                  {screen.title}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  {screen.description}
                </p>
              </div>
            </Animate>
          ))}
        </div>
      </div>
    </section>
  );
}
