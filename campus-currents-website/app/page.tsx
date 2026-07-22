import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Screenshots from "@/components/Screenshots";
import HowItWorks from "@/components/HowItWorks";
import TechStack from "@/components/TechStack";
import Team from "@/components/Team";
import FAQ from "@/components/FAQ";
import Download from "@/components/Download";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Features />
      <Screenshots />
      <HowItWorks />
      <TechStack />
      <Team />
      <FAQ />
      <Download />
      <Footer />
    </main>
  );
}
