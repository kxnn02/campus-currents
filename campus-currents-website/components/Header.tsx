"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Focus trap: close menu on Escape, trap focus inside
  useEffect(() => {
    if (!mobileMenuOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        toggleRef.current?.focus();
      }

      // Trap focus inside menu
      if (e.key === "Tab" && menuRef.current) {
        const focusable = menuRef.current.querySelectorAll<HTMLElement>(
          'a, button, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-warm-300/50 backdrop-blur-xl bg-warm-100/80">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/logo.png"
            alt="CampusCurrents Logo"
            width={36}
            height={36}
            className="rounded-lg"
          />
          <span className="text-lg font-bold tracking-tight text-warm-950">
            Campus<span className="text-brand-red">Currents</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
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
            href="#download"
            className="text-sm font-semibold text-white bg-brand-red px-5 py-2.5 rounded-full hover:bg-brand-red-dark shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
          >
            Get Early Access
          </a>
        </nav>

        <button
          ref={toggleRef}
          className="md:hidden text-text-muted hover:text-text-dark focus-visible:outline-2 focus-visible:outline-brand-red focus-visible:outline-offset-2 rounded"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
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

      {mobileMenuOpen && (
        <div
          ref={menuRef}
          id="mobile-menu"
          role="navigation"
          aria-label="Mobile navigation"
          className="md:hidden border-t border-warm-300/50 bg-warm-100/95 backdrop-blur-xl px-6 py-6 space-y-4"
        >
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
            href="#team"
            className="block text-text-brown hover:text-text-dark"
            onClick={() => setMobileMenuOpen(false)}
          >
            Team
          </a>
          <a
            href="#download"
            className="block text-center font-semibold text-white bg-brand-red px-5 py-3 rounded-full"
            onClick={() => setMobileMenuOpen(false)}
          >
            Get Early Access
          </a>
        </div>
      )}
    </header>
  );
}
