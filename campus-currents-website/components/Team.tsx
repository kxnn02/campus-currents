import Image from "next/image";
import Animate from "./Animate";

const team = [
  {
    name: "Kenneth Clein Fernandez",
    role: "Project Manager & Lead Developer",
    initials: "KF",
    image: "/images/ken-portrait.jpg",
  },
  {
    name: "Chi Leyco",
    role: "Backend Developer & QA",
    initials: "CL",
    image: "/images/leyco-portrait.jpg",
  },
  {
    name: "Marvin Miranda",
    role: "UI/UX Designer & QA",
    initials: "MM",
    image: "/images/marvin-portrait.jpg",
  },
  {
    name: "Andrei Baguisa",
    role: "Documentation & QA",
    initials: "AB",
    image: "/images/andrei-portrait.jpg",
  },
  {
    name: "Jheniel Maglinte",
    role: "Documentation & QA",
    initials: "JM",
    image: "/images/jheniel-portrait.jpg",
  },
];

export default function Team() {
  return (
    <section id="team" className="relative py-24 md:py-32">
      <div className="absolute inset-0 bg-warm-150" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <Animate className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-warm-950">
            Meet the team
          </h2>
          <p className="mt-4 text-text-brown text-lg">
            BSIT students at San Sebastian College - Recoletos, Manila.
            Built as a Software Engineering project with real-world impact.
          </p>
        </Animate>

        {/* Top row — 3 members */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-6">
          {team.slice(0, 3).map((member, i) => (
            <Animate key={i} delay={i * 0.08}>
              <div className="group relative rounded-2xl overflow-hidden cursor-default aspect-[3/4]">
                {member.image ? (
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 90vw, 320px"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-warm-200 via-warm-150 to-warm-100 flex items-center justify-center">
                    <span className="text-6xl font-bold text-brand-red/20 select-none">
                      {member.initials}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-white font-bold text-base leading-tight drop-shadow-sm">
                    {member.name}
                  </p>
                  <p className="text-white/75 text-sm mt-1 drop-shadow-sm">
                    {member.role}
                  </p>
                </div>
              </div>
            </Animate>
          ))}
        </div>

        {/* Bottom row — 2 members, centered */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {team.slice(3).map((member, i) => (
            <Animate key={i + 3} delay={(i + 3) * 0.08}>
              <div className="group relative rounded-2xl overflow-hidden cursor-default aspect-[3/4]">
                {member.image ? (
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 90vw, 320px"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-warm-200 via-warm-150 to-warm-100 flex items-center justify-center">
                    <span className="text-6xl font-bold text-brand-red/20 select-none">
                      {member.initials}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-white font-bold text-base leading-tight drop-shadow-sm">
                    {member.name}
                  </p>
                  <p className="text-white/75 text-sm mt-1 drop-shadow-sm">
                    {member.role}
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
