const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    title: "Instant Alerts",
    description: "Push notifications delivered in seconds. Emergency alerts override silent mode so you never miss critical safety information.",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-100",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    title: "Class Suspension Hub",
    description: "Know instantly whether classes are ON, SUSPENDED, or under monitoring — with source, reason, and duration at a glance.",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
    title: "School Calendar",
    description: "Interactive monthly calendar with color-coded events. Tap any date to see announcements, suspensions, and events.",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    title: "Emergency Response",
    description: "Full-screen emergency overlay with I'm Safe and Need Help buttons. Security sees your response in real-time.",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-100",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Targeted Broadcasts",
    description: "Receive only what's relevant to you — filtered by program, year level, and department. No noise, just what matters.",
    color: "text-teal-600",
    bg: "bg-teal-50",
    border: "border-teal-100",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "Real-time Updates",
    description: "Live WebSocket connection keeps your feed, status, and alerts updated instantly — no manual refresh needed.",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-24 md:py-32">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-warm-100 to-warm-50" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold text-brand-red uppercase tracking-widest">
            Features
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-warm-950">
            Everything you need to stay connected
          </h2>
          <p className="mt-4 text-text-brown text-lg">
            Designed for the unique needs of SSC-R Manila students — from
            weather suspensions to campus emergencies.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <div
              key={i}
              className={`group relative p-6 rounded-2xl bg-white border ${feature.border} shadow-sm hover:shadow-md transition-all duration-300`}
            >
              <div
                className={`w-11 h-11 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}
              >
                <div className={feature.color}>{feature.icon}</div>
              </div>
              <h3 className="text-base font-semibold text-warm-950 mb-2">{feature.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
