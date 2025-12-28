"use client";

import { useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface InfographicItem {
  id: string;
  title: string;
  image: string;
  demoUrl: string | null;
  rotation: number;
  animationDelay: number;
}

interface ImageLightboxProps {
  items: InfographicItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export default function ImageLightbox({
  items,
  currentIndex,
  isOpen,
  onClose,
  onNavigate
}: ImageLightboxProps) {
  const currentItem = items[currentIndex];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          onNavigate('prev');
          break;
        case 'ArrowRight':
          e.preventDefault();
          onNavigate('next');
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onNavigate, onClose]);

  if (!currentItem) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        {/* Custom overlay with animation */}
        <DialogOverlay className="fixed inset-0 bg-black/90 z-60 lightbox-overlay" />

        {/* Content */}
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 md:p-8">
          <div className="lightbox-content relative w-full max-w-6xl max-h-[90vh] flex flex-col items-center justify-center">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-0 right-0 md:top-4 md:right-4 z-10
                         w-12 h-12 rounded-full bg-white/10 backdrop-blur-md
                         hover:bg-white/20 transition-all duration-300
                         flex items-center justify-center group"
              aria-label="Close lightbox"
            >
              <X className="w-6 h-6 text-white group-hover:text-orange-500 transition-colors" />
            </button>

            {/* Previous button */}
            <button
              onClick={() => onNavigate('prev')}
              className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2
                         w-12 h-12 md:w-14 md:h-14 rounded-full
                         bg-gradient-to-r from-orange-500 to-pink-500
                         hover:from-orange-600 hover:to-pink-600
                         shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50
                         hover:scale-110 transition-all duration-300
                         flex items-center justify-center group"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </button>

            {/* Next button */}
            <button
              onClick={() => onNavigate('next')}
              className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2
                         w-12 h-12 md:w-14 md:h-14 rounded-full
                         bg-gradient-to-r from-orange-500 to-pink-500
                         hover:from-orange-600 hover:to-pink-600
                         shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50
                         hover:scale-110 transition-all duration-300
                         flex items-center justify-center group"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </button>

            {/* Image container */}
            <div className="relative w-full max-w-4xl max-h-[70vh] mb-6">
              <div className="relative w-full h-full aspect-[4/3] rounded-lg overflow-hidden bg-black">
                <Image
                  src={currentItem.image}
                  alt={currentItem.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 80vw"
                  className="object-contain"
                  priority
                />
              </div>

              {/* Image counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2
                              px-4 py-2 rounded-full bg-black/60 backdrop-blur-md">
                <p className="text-sm text-white font-medium">
                  {currentIndex + 1} / {items.length}
                </p>
              </div>
            </div>

            {/* Title and Live Demo button */}
            <div className="flex flex-col items-center gap-4">
              <h3 className="text-2xl md:text-3xl font-bold text-white text-center">
                {currentItem.title}
              </h3>

              {/* Live Demo button - disabled if no URL */}
              {currentItem.demoUrl ? (
                <a
                  href={currentItem.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button
                    className="bg-gradient-to-r from-orange-500 to-pink-500
                               hover:from-orange-600 hover:to-pink-600
                               text-white font-semibold px-8 py-6 text-lg
                               shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50
                               hover:scale-105 transition-all duration-300
                               flex items-center gap-2"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Live Demo
                  </Button>
                </a>
              ) : (
                <Button
                  disabled
                  className="bg-gradient-to-r from-gray-500 to-gray-600
                             text-white font-semibold px-8 py-6 text-lg
                             opacity-50 cursor-not-allowed
                             flex items-center gap-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  Live Demo (Coming Soon)
                </Button>
              )}
            </div>

            {/* Keyboard shortcuts hint */}
            <div className="hidden md:flex absolute bottom-4 left-4 gap-4 text-white/60 text-sm">
              <span>← → Navigate</span>
              <span>ESC Close</span>
            </div>
          </div>
        </div>
      </DialogPortal>
    </Dialog>
  );
}
