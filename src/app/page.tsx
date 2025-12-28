import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import HowItWorksSection from "@/components/how-it-works-section";
import SectionSeparator from "@/components/section-separator";
import FeaturesSection from "@/components/features-section";
import AboutSection from "@/components/about-section";
import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="w-full min-h-screen">
      {/* Navbar - now transparent and overlaid */}
      <Navbar />

      {/* Hero Section with Video Background */}
      <HeroSection />

      {/* Other sections */}
      <main className="relative z-10">
        {/* How It Works Section */}
        <HowItWorksSection />

        {/* Animated Wave Separator */}
        <SectionSeparator />

        {/* Features Section */}
        <FeaturesSection />

        {/* Animated Wave Separator */}
        <SectionSeparator />

        {/* About Section - Previous Projects Gallery */}
        <AboutSection />

        {/* Animated Wave Separator */}
        <SectionSeparator />

        {/* Contact Section */}
        <ContactSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
