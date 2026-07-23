import Header from "@/components/Header";
import Hero from "@/components/Hero";
import BeforeAfter from "@/components/BeforeAfter";
import Features from "@/components/Features";
import Screenshots from "@/components/Screenshots";
import HowItWorks from "@/components/HowItWorks";
import TechStack from "@/components/TechStack";
import Team from "@/components/Team";
import FAQ from "@/components/FAQ";
import Download from "@/components/Download";
import Footer from "@/components/Footer";
import PageLoader from "@/components/PageLoader";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Branded page load transition */}
      <PageLoader />

      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-brand-red focus:text-white focus:rounded-lg focus:text-sm focus:font-semibold"
      >
        Skip to content
      </a>
      <Header />
      <div id="main-content">
        <Hero />
        <BeforeAfter />
        <Features />
        <Screenshots />
        <HowItWorks />
        <TechStack />
        <Team />
        <FAQ />
        <Download />
      </div>
      <Footer />
    </main>
  );
}
