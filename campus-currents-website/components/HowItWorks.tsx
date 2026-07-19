const steps = [
  {
    number: "01",
    title: "Download & Sign In",
    description:
      "Get the app on your Android phone. Sign in with your SSC-R Google account (@sscrmnl.edu.ph) for instant verification.",
  },
  {
    number: "02",
    title: "Complete Your Profile",
    description:
      "Set your program, year level, and emergency contact. This ensures you receive alerts relevant to your department.",
  },
  {
    number: "03",
    title: "Stay Informed",
    description:
      "Receive instant push notifications for class suspensions, emergency alerts, school events, and campus announcements.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 md:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-warm-950 to-warm-950" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-amber/5 rounded-full blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold text-brand-amber uppercase tracking-widest">
            Get Started
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">
            Up and running in{" "}
            <span className="text-brand-amber">3 minutes</span>
          </h2>
          <p className="mt-4 text-white/50 text-lg">
            No complicated setup. Just sign in with your school credentials and
            you&#39;re good to go.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <div key={i} className="relative text-center">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-white/10 to-transparent" />
              )}

              {/* Number badge */}
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-red/20 to-brand-amber/20 border border-white/10 mb-6">
                <span className="text-xl font-bold bg-gradient-to-r from-brand-amber to-brand-amber-light bg-clip-text text-transparent">
                  {step.number}
                </span>
              </div>

              <h3 className="text-lg font-semibold mb-3">{step.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
