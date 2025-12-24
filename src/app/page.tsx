import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero-section";

export default function Home() {
  return (
    <div className="w-full min-h-screen">
      {/* Navbar - now transparent and overlaid */}
      <Navbar />

      {/* Hero Section with Video Background */}
      <HeroSection />

      {/* Other sections */}
      <main className="relative z-10">
        {/* Future content sections */}
      </main>
    </div>
  );
}
