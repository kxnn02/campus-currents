import Animate from "./Animate";

const team = [
  {
    name: "Kenneth Clein Fernandez",
    role: "Project Manager, Lead Developer, Fullstack",
    initials: "KF",
  },
  {
    name: "Chi Leyco",
    role: "Backend Developer, QA",
    initials: "CL",
  },
  {
    name: "Marvin Miranda",
    role: "UI/UX Designer, QA",
    initials: "MM",
  },
  {
    name: "Andrei Baguisa",
    role: "Documentation, QA",
    initials: "AB",
  },
  {
    name: "Jheniel Maglinte",
    role: "Documentation, QA",
    initials: "JM",
  },
];

export default function Team() {
  return (
    <section id="team" className="relative py-24 md:py-32">
      <div className="absolute inset-0 bg-warm-150" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <Animate className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-warm-950">
            The team behind CampusCurrents
          </h2>
          <p className="mt-4 text-text-brown text-lg">
            BSIT students at San Sebastian College - Recoletos, Manila.
            Built as a capstone project with real-world impact.
          </p>
        </Animate>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-4xl mx-auto">
          {team.map((member, i) => (
            <Animate key={i} className="text-center" delay={i * 0.08}>
              <div className="w-16 h-16 mx-auto rounded-2xl bg-white border border-warm-200 shadow-sm flex items-center justify-center mb-3">
                <span className="text-lg font-bold text-brand-red">
                  {member.initials}
                </span>
              </div>
              <p className="text-sm font-semibold text-warm-950 leading-tight">
                {member.name}
              </p>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                {member.role}
              </p>
            </Animate>
          ))}
        </div>
      </div>
    </section>
  );
}
