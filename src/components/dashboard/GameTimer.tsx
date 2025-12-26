"use client";

import { Card } from '@/components/ui/card';
import { GameMode } from '@/lib/gemini/types';

interface GameTimerProps {
  foundItems: string[];
  gameMode: GameMode;
  gameOver: boolean;
}

export default function GameTimer({ foundItems, gameMode, gameOver }: GameTimerProps) {
  return (
    <Card className="bg-white/80 backdrop-blur-md border-white/20 shadow-lg p-4">
      <div>
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">
          {gameMode === 'LOGIC' ? 'Status' : 'Found Items'}
        </label>
        <div className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-center font-mono font-bold text-lg">
          {gameMode === 'LOGIC' && gameOver ? 'Complete' : foundItems.length}
        </div>
      </div>
    </Card>
  );
}
