const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    title: "Instant Alerts",
    description: "Push notifications delivered in seconds. Emergency alerts override silent mode so you never miss critical safety information.",
    accent: "from-red-500 to-orange-500",
    bgAccent: "bg-red-500/10",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    title: "Class Suspension Hub",
    description: "Know instantly whether classes are ON, SUSPENDED, or under monitoring. See source, reason, scope, and duration at a glance.",
    accent: "from-amber-500 to-yellow-500",
    bgAccent: "bg-amber-500/10",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
      </svg>
    ),
    title: "School Calendar",
    description: "Interactive monthly calendar with color-coded events. Tap any date to see announcements, suspensions, and events at a glance.",
    accent: "from-indigo-500 to-purple-500",
    bgAccent: "bg-indigo-500/10",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    title: "Emergency Response",
    description: "Full-screen emergency overlay with I'm Safe and Need Help buttons. Security team sees your response in real-time.",
    accent: "from-red-600 to-red-500",
    bgAccent: "bg-red-600/10",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Targeted Broadcasts",
    description: "Receive only what's relevant to you — filtered by program, year level, and department. No noise, just what matters.",
    accent: "from-teal-500 to-emerald-500",
    bgAccent: "bg-teal-500/10",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    ),
    title: "Real-time Updates",
    description: "Live WebSocket connection keeps your feed, status, and alerts updated instantly — no manual refresh needed.",
    accent: "from-blue-500 to-cyan-500",
    bgAccent: "bg-blue-500/10",
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-24 md:py-32 noise-bg">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-warm-950 via-warm-950/95 to-warm-950" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold text-brand-amber uppercase tracking-widest">
            Features
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">
            Everything you need to{" "}
            <span className="text-brand-amber">stay connected</span>
          </h2>
          <p className="mt-4 text-white/50 text-lg">
            Designed for the unique needs of SSC-R Manila students — from
            weather suspensions to campus emergencies.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group relative p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.05] transition-all duration-300"
            >
              <div
                className={`w-12 h-12 rounded-xl ${feature.bgAccent} flex items-center justify-center mb-4`}
              >
                <div className="text-white/90">{feature.icon}</div>
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
