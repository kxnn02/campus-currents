import Animate from "./Animate";

const technologies = [
  {
    name: "React Native",
    detail: "Expo SDK 54",
    category: "Mobile",
  },
  {
    name: "Supabase",
    detail: "Auth, Database, Realtime, Edge Functions",
    category: "Backend",
  },
  {
    name: "Next.js",
    detail: "Admin Dashboard + Landing Page",
    category: "Web",
  },
  {
    name: "WebSocket",
    detail: "Live feed and suspension updates",
    category: "Real-time",
  },
  {
    name: "Expo Push API",
    detail: "Two-phase delivery with receipt verification",
    category: "Notifications",
  },
  {
    name: "PostgreSQL",
    detail: "36 migrations, RLS policies, triggers",
    category: "Database",
  },
];

export default function TechStack() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-warm-50 to-warm-100" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <Animate className="max-w-2xl mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-warm-950">
            Built with production-grade tools
          </h2>
          <p className="mt-4 text-text-brown text-lg">
            Not a simple school project. A full-stack system with real-time data,
            push notifications, and enterprise-grade security.
          </p>
        </Animate>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {technologies.map((tech, i) => (
            <Animate key={i} delay={i * 0.06} y={16}>
              <div className="group flex items-start gap-4 p-5 rounded-xl bg-white border border-warm-200 hover:border-warm-300 hover:shadow-sm transition-all">
                <div className="shrink-0 w-2 h-2 rounded-full bg-brand-red mt-2" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-warm-950">
                      {tech.name}
                    </span>
                    <span className="text-[10px] font-medium text-text-muted bg-warm-150 px-2 py-0.5 rounded-full">
                      {tech.category}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">
                    {tech.detail}
                  </p>
                </div>
              </div>
            </Animate>
          ))}
        </div>
      </div>
    </section>
  );
}
