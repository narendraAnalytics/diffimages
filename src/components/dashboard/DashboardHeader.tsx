"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DancingAvatar from './DancingAvatar';

interface DashboardHeaderProps {
  timer?: number;
  timerZone?: 'green' | 'orange' | 'red';
  score?: number;
  hasContent?: boolean;
  gameOver?: boolean;
  revealing?: boolean;
}

export default function DashboardHeader({
  timer = 0,
  timerZone = 'green',
  score = 0,
  hasContent = false,
  gameOver = false,
  revealing = false
}: DashboardHeaderProps) {
  const [showAvatar, setShowAvatar] = useState(false);

  useEffect(() => {
    if (gameOver && !revealing) {
      setShowAvatar(true);
    }
  }, [gameOver, revealing]);

  const formatTime = (seconds: number) => {
    return `00:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="hover:bg-orange-100 transition-colors">
              <Home className="w-6 h-6 text-orange-600" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold bg-linear-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
            DiffGen Dashboard
          </h1>
        </div>

        {/* Right: Timer + Score (only when game active) */}
        {hasContent && (
          <div className="flex items-center gap-4">
            {/* Timer - Circular Clock */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-zinc-400 uppercase">Time</span>

              {/* Circular Clock Container */}
              <div className="relative">
                {/* SVG Progress Ring */}
                <svg
                  className="transform -rotate-90 transition-all duration-300"
                  width="64"
                  height="64"
                  viewBox="0 0 64 64"
                >
                  {/* Background Circle (track) */}
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    className={`transition-all duration-300 ${
                      timerZone === 'red'
                        ? 'stroke-red-100'
                        : timerZone === 'orange'
                        ? 'stroke-orange-100'
                        : 'stroke-green-100'
                    }`}
                    strokeWidth="4"
                    fill="none"
                  />

                  {/* Progress Circle (animated) */}
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    className={`transition-all duration-300 ${
                      timerZone === 'red'
                        ? 'stroke-red-500 animate-pulse'
                        : timerZone === 'orange'
                        ? 'stroke-orange-500'
                        : 'stroke-green-500'
                    }`}
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - timer / 75)}`}
                    style={{
                      transition: 'stroke-dashoffset 1s linear'
                    }}
                  />
                </svg>

                {/* Center Time Text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`font-mono font-bold text-sm transition-all duration-300 ${
                    timerZone === 'red'
                      ? 'text-red-600'
                      : timerZone === 'orange'
                      ? 'text-orange-600'
                      : 'text-green-600'
                  }`}>
                    {formatTime(timer)}
                  </span>
                </div>

                {/* Shadow/Glow Effect */}
                <div className={`absolute inset-0 -z-10 rounded-full transition-all duration-300 ${
                  timerZone === 'red'
                    ? 'shadow-lg shadow-red-500/30'
                    : timerZone === 'orange'
                    ? 'shadow-md shadow-orange-500/20'
                    : ''
                }`} />
              </div>
            </div>

            {/* Score */}
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="font-bold text-base text-zinc-900">{score} pts</span>
            </div>
          </div>
        )}
      </div>

      <DancingAvatar
        show={showAvatar}
        onComplete={() => setShowAvatar(false)}
      />
    </header>
  );
}
