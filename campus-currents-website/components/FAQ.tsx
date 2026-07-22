"use client";

import { useState } from "react";
import { CaretDown } from "@phosphor-icons/react";
import Animate from "./Animate";

const faqs = [
  {
    question: "Who can use CampusCurrents?",
    answer:
      "Any student, faculty, or staff member of SSC-R Manila with a valid @sscrmnl.edu.ph Google account. Guest accounts are also available for non-school email users who need campus updates.",
  },
  {
    question: "What devices are supported?",
    answer:
      "Currently available on Android 8.0 and above. iOS support is planned for a future release. The admin dashboard works on any modern web browser.",
  },
  {
    question: "How fast are emergency notifications?",
    answer:
      "Emergency alerts are delivered via push notification in under 3 seconds. They override silent mode on Android, ensuring you receive critical safety information immediately.",
  },
  {
    question: "What data does the app collect?",
    answer:
      "Only your school email, name, program, year level, and an optional emergency contact number. This data is used exclusively for targeted notifications and emergency accountability. We do not sell or share personal data.",
  },
  {
    question: "Can I choose which notifications I receive?",
    answer:
      "You can mute routine notification channels (General, Events, Academic) in your notification preferences. Emergency and Important alerts cannot be muted for your safety.",
  },
];

function FAQItem({ item }: { item: typeof faqs[0] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-warm-200 last:border-0">
      <button
        className="w-full flex items-center justify-between py-5 text-left group"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="text-sm font-semibold text-warm-950 pr-4 group-hover:text-brand-red transition-colors">
          {item.question}
        </span>
        <CaretDown
          size={18}
          weight="bold"
          className={`text-text-muted shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div className={`faq-content ${isOpen ? "open" : ""}`}>
        <div>
          <p className="text-sm text-text-muted leading-relaxed pb-5">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  return (
    <section id="faq" className="relative py-24 md:py-32">
      <div className="absolute inset-0 bg-warm-100" />

      <div className="relative z-10 mx-auto max-w-3xl px-6">
        <Animate className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-warm-950">
            Common questions
          </h2>
        </Animate>

        <Animate y={16}>
          <div className="bg-white rounded-2xl border border-warm-200 shadow-sm px-6">
            {faqs.map((faq, i) => (
              <FAQItem key={i} item={faq} />
            ))}
          </div>
        </Animate>
      </div>
    </section>
  );
}
