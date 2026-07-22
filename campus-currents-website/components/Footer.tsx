import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-warm-200 py-12 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Image
                src="/images/logo.png"
                alt="CampusCurrents"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="font-bold text-warm-950">
                Campus<span className="text-brand-red">Currents</span>
              </span>
            </div>
            <p className="text-sm text-text-muted max-w-xs">
              Real-time campus communication for San Sebastian College -
              Recoletos, Manila.
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-2" aria-label="Footer navigation">
            <a
              href="#features"
              className="text-sm text-text-muted hover:text-text-dark transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm text-text-muted hover:text-text-dark transition-colors"
            >
              How It Works
            </a>
            <a
              href="#team"
              className="text-sm text-text-muted hover:text-text-dark transition-colors"
            >
              Team
            </a>
            <a
              href="#faq"
              className="text-sm text-text-muted hover:text-text-dark transition-colors"
            >
              FAQ
            </a>
          </nav>

          {/* School */}
          <div className="text-center md:text-right">
            <p className="text-xs text-text-muted">A capstone project by</p>
            <p className="text-sm text-text-brown mt-1">SSC-R Manila - BSIT</p>
          </div>
        </div>

        {/* Privacy note */}
        <div className="mt-8 pt-6 border-t border-warm-200">
          <p className="text-xs text-text-muted text-center max-w-2xl mx-auto leading-relaxed">
            CampusCurrents collects only your school email, name, program, and
            year level for targeted notifications. Emergency contact numbers are
            optional. We do not sell or share personal data with third parties.
          </p>
        </div>

        <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted">
            © {currentYear} CampusCurrents. Built with care for Sebastinians.
          </p>
          <p className="text-xs text-text-muted italic">
            &ldquo;Caritas et Scientia&rdquo;
          </p>
        </div>
      </div>
    </footer>
  );
}
