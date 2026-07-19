"use client";

import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-warm-300/50 backdrop-blur-xl bg-warm-100/80">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-red flex items-center justify-center shadow-sm">
            <svg
              width="18"
              height="18"
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
          <span className="text-lg font-bold tracking-tight text-warm-950">
            Campus<span className="text-brand-red">Currents</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
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
            href="#download"
            className="text-sm font-semibold text-white bg-brand-red px-5 py-2.5 rounded-full hover:bg-brand-red-dark shadow-sm hover:shadow-md transition-all"
          >
            Download App
          </a>
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-text-muted hover:text-text-dark"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileMenuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-warm-300/50 bg-warm-100/95 backdrop-blur-xl px-6 py-6 space-y-4">
          <a
            href="#features"
            className="block text-text-brown hover:text-text-dark"
            onClick={() => setMobileMenuOpen(false)}
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="block text-text-brown hover:text-text-dark"
            onClick={() => setMobileMenuOpen(false)}
          >
            How It Works
          </a>
          <a
            href="#download"
            className="block text-center font-semibold text-white bg-brand-red px-5 py-3 rounded-full"
            onClick={() => setMobileMenuOpen(false)}
          >
            Download App
          </a>
        </div>
      )}
    </header>
  );
}
