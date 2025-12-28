"use client";

import Image from "next/image";

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
      className="relative group cursor-pointer animate-on-scroll opacity-0 translate-y-8 transition-all duration-500"
      style={{
        transitionDelay: `${item.animationDelay}ms`,
        // Set CSS variable for rotation animation
        ['--rotation' as string]: `${item.rotation}deg`
      }}
      onClick={onClick}
    >
      {/* Clothespin decoration */}
      <div className="clothespin" />

      {/* Polaroid frame - Reduced height for more compact look */}
      <div
        className="polaroid-card bg-white p-2.5 pb-8 rounded-2xl shadow-lg
                   hover:shadow-2xl hover:scale-105 hover:rotate-0
                   transition-all duration-300 ease-out"
        style={{ transform: `rotate(${item.rotation}deg)` }}
      >
        {/* Image container with shorter aspect ratio (3:2 instead of 4:3) */}
        <div className="relative w-full aspect-[3/2] rounded-lg overflow-hidden bg-gray-100">
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            loading="lazy"
          />
        </div>

        {/* Title at bottom of polaroid */}
        <div className="mt-2.5 text-center">
          <h3 className="text-sm font-medium text-gray-800 line-clamp-2">
            {item.title}
          </h3>
        </div>
      </div>
    </div>
  );
}
