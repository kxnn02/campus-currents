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
    image: null,
  },
  {
    name: "Marvin Miranda",
    role: "UI/UX Designer & QA",
    initials: "MM",
    image: null,
  },
  {
    name: "Andrei Baguisa",
    role: "Documentation & QA",
    initials: "AB",
    image: null,
  },
  {
    name: "Jheniel Maglinte",
    role: "Documentation & QA",
    initials: "JM",
    image: null,
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

        {/* Bento-style grid — large cards with overlaid info */}
        <div className="grid grid-cols-6 md:grid-cols-12 gap-4 max-w-5xl mx-auto auto-rows-[180px] md:auto-rows-[220px]">
          {team.map((member, i) => {
            // First member gets a large card spanning more columns
            const spanClass =
              i === 0
                ? "col-span-6 md:col-span-5 row-span-2"
                : i === 1
                ? "col-span-3 md:col-span-4"
                : i === 2
                ? "col-span-3 md:col-span-3"
                : i === 3
                ? "col-span-3 md:col-span-4"
                : "col-span-3 md:col-span-3";

            return (
              <Animate
                key={i}
                className={spanClass}
                delay={i * 0.08}
              >
                <div className="relative w-full h-full rounded-2xl overflow-hidden group cursor-default">
                  {/* Background — image or gradient placeholder */}
                  {member.image ? (
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes={i === 0 ? "500px" : "300px"}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-warm-200 via-warm-150 to-warm-100 flex items-center justify-center">
                      <span className="text-5xl md:text-6xl font-bold text-brand-red/20 select-none">
                        {member.initials}
                      </span>
                    </div>
                  )}

                  {/* Gradient overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Name & role — bottom-left */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                    <p className="text-white font-bold text-sm md:text-base leading-tight drop-shadow-sm">
                      {member.name}
                    </p>
                    <p className="text-white/80 text-xs md:text-sm mt-1 drop-shadow-sm">
                      {member.role}
                    </p>
                  </div>
                </div>
              </Animate>
            );
          })}
        </div>
      </div>
    </section>
  );
}
