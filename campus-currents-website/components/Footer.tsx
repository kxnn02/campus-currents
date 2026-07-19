export default function Footer() {
  return (
    <footer className="relative border-t border-warm-200 py-12 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-brand-red flex items-center justify-center">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <span className="font-bold text-warm-950">
                Campus<span className="text-brand-red">Currents</span>
              </span>
            </div>
            <p className="text-sm text-text-muted max-w-xs">
              Real-time campus communication for San Sebastian College –
              Recoletos, Manila.
            </p>
          </div>

          {/* Links */}
          <div className="flex justify-center gap-8">
            <a href="#features" className="text-sm text-text-muted hover:text-text-dark transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-text-muted hover:text-text-dark transition-colors">
              How It Works
            </a>
            <a href="#download" className="text-sm text-text-muted hover:text-text-dark transition-colors">
              Download
            </a>
          </div>

          {/* School */}
          <div className="text-right">
            <p className="text-xs text-text-muted">
              A capstone project by
            </p>
            <p className="text-sm text-text-brown mt-1">
              SSC-R Manila — BSIT
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-warm-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted">
            © 2026 CampusCurrents. Built with care for Sebastinians.
          </p>
          <p className="text-xs text-text-muted italic">
            &ldquo;Caritas et Scientia&rdquo;
          </p>
        </div>
      </div>
    </footer>
  );
}
