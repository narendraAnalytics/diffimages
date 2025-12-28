"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";

interface InfographicItem {
  id: string;
  title: string;
  image: string;
  demoUrl: string | null;
  rotation: number;
  animationDelay: number;
}

interface PolaroidCardProps {
  item: InfographicItem;
  onClick: () => void;
}

export default function PolaroidCard({ item, onClick }: PolaroidCardProps) {
  return (
    <div
      className="relative group animate-on-scroll opacity-0 translate-y-8 transition-all duration-500"
      style={{
        transitionDelay: `${item.animationDelay}ms`,
        // Set CSS variable for rotation animation
        ['--rotation' as string]: `${item.rotation}deg`
      }}
    >
      {/* Clothespin decoration */}
      <div className="clothespin" />

      {/* Polaroid frame - Reduced height for more compact look */}
      <div
        className="polaroid-card animate-breeze bg-white p-2.5 pb-6 rounded-2xl shadow-lg
                   hover:shadow-2xl hover:scale-105 hover:rotate-0
                   transition-all duration-300 ease-out"
        style={{
          transform: `rotate(${item.rotation}deg)`,
          ['--breeze-duration' as string]: `${3.5 + (item.animationDelay / 1000)}s`
        }}
      >
        {/* Image container - Click to open lightbox */}
        <div
          className="relative w-full aspect-[3/2] rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
          onClick={onClick}
        >
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            loading="lazy"
          />
        </div>

        {/* Title and Live Demo button at bottom of polaroid */}
        <div className="mt-2.5 text-center space-y-2">
          <h3 className="text-sm font-medium text-gray-800 line-clamp-2">
            {item.title}
          </h3>

          {/* Live Demo button */}
          {item.demoUrl && (
            <a
              href={item.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold
                         bg-gradient-to-r from-orange-500 to-pink-500
                         hover:from-orange-600 hover:to-pink-600
                         text-white rounded-full
                         shadow-md hover:shadow-lg
                         transition-all duration-300 hover:scale-105"
            >
              <ExternalLink className="w-3 h-3" />
              Live Demo
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
