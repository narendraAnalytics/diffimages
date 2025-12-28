"use client";

import { useEffect, useRef, useState } from 'react';
import { Projector, Sparkles } from 'lucide-react';
import PolaroidCard from './polaroid-card';
import ImageLightbox from './image-lightbox';

interface InfographicItem {
  id: string;
  title: string;
  image: string;
  demoUrl: string | null;
  rotation: number;
  animationDelay: number;
}

// Infographics data - all 8 projects
const infographics: InfographicItem[] = [
  {
    id: 'content-ai',
    title: 'Content AI Generation',
    image: '/infographics/contentaigeneration.png',
    demoUrl: null, // User will add later
    rotation: -2,
    animationDelay: 0
  },
  {
    id: 'india-trade',
    title: 'India Trade Analysis',
    image: '/infographics/IndiaTradeAnalysis.png',
    demoUrl: null,
    rotation: 1,
    animationDelay: 100
  },
  {
    id: 'ai-agent',
    title: 'Professional AI Agent',
    image: '/infographics/ProfessionalAIAgent.png',
    demoUrl: null,
    rotation: -1,
    animationDelay: 200
  },
  {
    id: 'photo-shoot',
    title: 'Professional Photo Shoot',
    image: '/infographics/ProfessionalPhotoShoot.png',
    demoUrl: null,
    rotation: 2,
    animationDelay: 300
  },
  {
    id: 'read-with-me',
    title: 'Read With ME',
    image: '/infographics/ReadWithME.png',
    demoUrl: null,
    rotation: -2,
    animationDelay: 400
  },
  {
    id: 'real-estate',
    title: 'Real Estate Investment',
    image: '/infographics/Real Estate Investment.png',
    demoUrl: null,
    rotation: 1,
    animationDelay: 500
  },
  {
    id: 'snapcook',
    title: 'SnapCook',
    image: '/infographics/snapcook.png',
    demoUrl: null,
    rotation: -1,
    animationDelay: 600
  },
  {
    id: 'stepwise',
    title: 'StepWise',
    image: '/infographics/stepwise.png',
    demoUrl: null,
    rotation: 2,
    animationDelay: 700
  }
];

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Intersection Observer for scroll animations (matching features-section pattern)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-8');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    const elements = sectionRef.current?.querySelectorAll('.animate-on-scroll');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handleCardClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsLightboxOpen(true);
  };

  const handleLightboxClose = () => {
    setIsLightboxOpen(false);
    setSelectedImageIndex(null);
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (selectedImageIndex === null) return;

    const newIndex = direction === 'prev'
      ? (selectedImageIndex - 1 + infographics.length) % infographics.length
      : (selectedImageIndex + 1) % infographics.length;

    setSelectedImageIndex(newIndex);
  };

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative w-full py-24 px-6 md:px-12 lg:px-24
                 bg-gradient-to-br from-green-50/30 via-emerald-50/20 to-teal-50/30
                 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header with Projector icon and gradient title */}
        <div className="text-center mb-16 animate-on-scroll opacity-0 translate-y-8 transition-all duration-500">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <Projector className="w-12 h-12 text-green-500 animate-breathe" />
              <Sparkles className="w-6 h-6 text-emerald-500 absolute -top-1 -right-1 animate-pulse animate-spin-slow" />
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
              Our Previous Projects
            </span>
          </h2>

          <p className="text-lg md:text-xl text-zinc-600 max-w-3xl mx-auto">
            Explore our portfolio of innovative AI-powered applications and creative solutions
          </p>
        </div>

        {/* Grid with hanging wire decoration */}
        <div className="relative hanging-wire pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {infographics.map((item, index) => (
              <PolaroidCard
                key={item.id}
                item={item}
                onClick={() => handleCardClick(index)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImageIndex !== null && (
        <ImageLightbox
          items={infographics}
          currentIndex={selectedImageIndex}
          isOpen={isLightboxOpen}
          onClose={handleLightboxClose}
          onNavigate={handleNavigate}
        />
      )}
    </section>
  );
}
