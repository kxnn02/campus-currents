const steps = [
  {
    number: "01",
    title: "Download & Sign In",
    description:
      "Get the app on your Android phone. Sign in with your SSC-R Google account (@sscrmnl.edu.ph) for instant verification.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Complete Your Profile",
    description:
      "Set your program, year level, and emergency contact. This ensures you receive alerts relevant to your department.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Stay Informed",
    description:
      "Receive instant push notifications for class suspensions, emergency alerts, school events, and campus announcements.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-warm-150" />
      <div className="absolute top-0 right-[-100px] w-[400px] h-[400px] bg-brand-red/5 warm-blob" />
      <div className="absolute bottom-0 left-[-80px] w-[350px] h-[350px] bg-brand-amber/8 warm-blob" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold text-brand-red uppercase tracking-widest">
            Get Started
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-warm-950">
            Up and running in 3 minutes
          </h2>
          <p className="mt-4 text-text-brown text-lg">
            No complicated setup. Just sign in with your school credentials and
            you&apos;re good to go.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <div key={i} className="relative text-center">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px bg-warm-300" />
              )}

              {/* Icon */}
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white border border-warm-200 shadow-sm mb-6">
                <div className="text-brand-red">{step.icon}</div>
              </div>

              <div className="text-xs font-bold text-brand-amber mb-2">{step.number}</div>
              <h3 className="text-lg font-semibold text-warm-950 mb-3">{step.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
