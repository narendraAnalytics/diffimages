"use client";

import { Image as ImageIcon, Zap, Brain } from 'lucide-react';
import { GameMode } from '@/lib/gemini/types';
import { Card } from '@/components/ui/card';

interface GameModeSelectorProps {
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
  disabled: boolean;
}

const modes = [
  {
    id: 'DIFF' as GameMode,
    icon: ImageIcon,
    title: 'Spot the Difference',
    description: '2 images with hidden differences',
    gradient: 'from-orange-500 to-pink-500'
  },
  {
    id: 'WRONG' as GameMode,
    icon: Zap,
    title: "What's Wrong",
    description: 'Find logical errors in the scene',
    gradient: 'from-pink-500 to-rose-500'
  },
  {
    id: 'LOGIC' as GameMode,
    icon: Brain,
    title: 'Logic Puzzle',
    description: 'Test your IQ and reasoning',
    gradient: 'from-blue-500 to-purple-500'
  }
];

export default function GameModeSelector({ gameMode, setGameMode, disabled }: GameModeSelectorProps) {
  return (
    <Card className="bg-white/80 backdrop-blur-md border-white/20 shadow-lg p-4">
      <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">Game Mode</h3>
      <div className="grid grid-cols-3 gap-2">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isActive = gameMode === mode.id;

          return (
            <button
              key={mode.id}
              disabled={disabled}
              onClick={() => setGameMode(mode.id)}
              className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? `bg-linear-to-r ${mode.gradient} text-white shadow-lg`
                  : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100 disabled:opacity-50'
              } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-bold text-center leading-tight">
                {mode.id.charAt(0) + mode.id.slice(1).toLowerCase()}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-3 p-3 bg-zinc-50 rounded-lg">
        <p className="text-xs text-zinc-600 text-center">
          {modes.find(m => m.id === gameMode)?.description}
        </p>
      </div>
    </Card>
  );
}
