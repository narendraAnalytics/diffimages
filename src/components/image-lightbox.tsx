"use client";

import { useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogOverlay, DialogPortal } from "@/components/ui/dialog";

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
        <div className="fixed inset-0 z-60 flex items-start justify-center p-4 md:p-8 pt-8 md:pt-12">
          {/* Close button - Fixed to viewport */}
          <button
            onClick={onClose}
            className="fixed top-4 right-4 md:top-8 md:right-8 z-[70]
                       w-12 h-12 rounded-full bg-white/10 backdrop-blur-md
                       hover:bg-white/20 transition-all duration-300
                       flex items-center justify-center group"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6 text-white group-hover:text-orange-500 transition-colors" />
          </button>

          {/* Previous button - Fixed to viewport */}
          <button
            onClick={() => onNavigate('prev')}
            className="fixed left-4 md:left-8 top-1/2 -translate-y-1/2 z-[70]
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

          {/* Next button - Fixed to viewport */}
          <button
            onClick={() => onNavigate('next')}
            className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-[70]
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

          {/* Content container - no scrolling needed, everything fits */}
          <div className="lightbox-content relative w-full max-w-6xl flex flex-col items-center justify-start py-4 px-4">
            {/* Image container */}
            <div className="relative w-full max-w-4xl max-h-[20vh] mb-4">
              <div className="relative w-full h-auto aspect-[4/3] rounded-lg overflow-hidden bg-black">
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

            {/* Title */}
            <div className="text-center pb-4">
              <h3 className="text-xl md:text-2xl font-bold text-white">
                {currentItem.title}
              </h3>
            </div>
          </div>

          {/* Keyboard shortcuts hint - Fixed to viewport */}
          <div className="hidden md:flex fixed bottom-8 left-8 gap-4 text-white/60 text-sm z-[70]">
            <span>← → Navigate</span>
            <span>ESC Close</span>
          </div>
        </div>
      </DialogPortal>
    </Dialog>
  );
}
