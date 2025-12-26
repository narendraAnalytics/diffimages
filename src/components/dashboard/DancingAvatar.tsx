"use client";

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';

interface DancingAvatarProps {
  show: boolean;
  onComplete?: () => void;
}

export default function DancingAvatar({ show, onComplete }: DancingAvatarProps) {
  const { user } = useUser();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (show && user?.imageUrl) {
      setIsVisible(true);
      setIsAnimating(true);

      // Animation duration: 4 seconds
      const animationTimer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => {
          setIsVisible(false);
          onComplete?.();
        }, 500);
      }, 4000);

      return () => clearTimeout(animationTimer);
    }
  }, [show, user, onComplete]);

  if (!isVisible || !user?.imageUrl) return null;

  return (
    <div
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${
        isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
      }`}
    >
      <div className={`relative ${isAnimating ? 'animate-dance' : ''}`}>
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 rounded-full blur-xl opacity-60 animate-pulse" />

        {/* Avatar */}
        <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-2xl">
          <Image
            src={user.imageUrl}
            alt="Celebration avatar"
            fill
            className="object-cover"
          />
        </div>

        {/* Sparkles */}
        <div className="absolute -top-2 -right-2 text-2xl animate-spin-slow">✨</div>
        <div className="absolute -bottom-2 -left-2 text-2xl animate-bounce">⭐</div>
      </div>
    </div>
  );
}
