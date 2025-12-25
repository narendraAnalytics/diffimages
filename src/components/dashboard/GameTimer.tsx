"use client";

import { Trophy } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { GameMode } from '@/lib/gemini/types';

interface GameTimerProps {
  timer: number;
  score: number;
  foundItems: string[];
  gameMode: GameMode;
  gameOver: boolean;
}

export default function GameTimer({ timer, score, foundItems, gameMode, gameOver }: GameTimerProps) {
  const formatTime = (seconds: number) => {
    return `00:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <Card className="bg-white/80 backdrop-blur-md border-white/20 shadow-lg p-4">
      <div className="space-y-3">
        {/* Timer */}
        <div>
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">
            Time Remaining
          </label>
          <div
            className={`px-4 py-2 rounded-lg font-mono font-bold text-lg text-center border ${
              timer <= 5
                ? 'bg-red-50 text-red-600 border-red-200 animate-pulse'
                : 'bg-zinc-50 text-zinc-900 border-zinc-200'
            }`}
          >
            {formatTime(timer)}
          </div>
        </div>

        {/* Score */}
        <div>
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">
            Score
          </label>
          <div className="flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="font-bold text-lg">{score} pts</span>
          </div>
        </div>

        {/* Found Items */}
        <div>
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">
            {gameMode === 'LOGIC' ? 'Status' : 'Found Items'}
          </label>
          <div className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-center font-mono font-bold text-lg">
            {gameMode === 'LOGIC' && gameOver ? 'Complete' : foundItems.length}
          </div>
        </div>
      </div>
    </Card>
  );
}
