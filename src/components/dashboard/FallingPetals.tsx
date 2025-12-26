"use client";

import { useEffect, useState } from 'react';

interface FallingPetalsProps {
  show: boolean;
  gameMode: 'DIFF' | 'WRONG' | 'LOGIC';
}

interface Petal {
  id: number;
  x: number;
  delay: number;
  duration: number;
  color: string;
}

const PETAL_COLORS = [
  'text-orange-400',
  'text-pink-400',
  'text-rose-400',
  'text-blue-400',
  'text-purple-400',
  'text-emerald-400',
];

export default function FallingPetals({ show, gameMode }: FallingPetalsProps) {
  const [petals, setPetals] = useState<Petal[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show && (gameMode === 'DIFF' || gameMode === 'WRONG')) {
      setIsVisible(true);

      const newPetals: Petal[] = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 3 + Math.random() * 2,
        color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
      }));

      setPetals(newPetals);

      const timer = setTimeout(() => {
        setIsVisible(false);
        setPetals([]);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [show, gameMode]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="absolute -top-10 animate-fall"
          style={{
            left: `${petal.x}%`,
            animationDelay: `${petal.delay}s`,
            animationDuration: `${petal.duration}s`,
          }}
        >
          <div
            className={`${petal.color} animate-spin-gentle text-2xl opacity-80`}
            style={{
              animationDelay: `${petal.delay}s`,
              animationDuration: `${petal.duration * 0.6}s`,
            }}
          >
            🌸
          </div>
        </div>
      ))}
    </div>
  );
}
