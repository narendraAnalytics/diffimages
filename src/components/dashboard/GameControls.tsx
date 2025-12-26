"use client";

import { useState } from 'react';
import { useVoiceRecognition } from '@/lib/hooks/useVoiceRecognition';
import { Loader2, Dice5, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { GameMode } from '@/lib/gemini/types';

interface GameControlsProps {
  gameMode: GameMode;
  loading: boolean;
  hasContent: boolean;
  gameOver: boolean;
  onStartGame: (subject: string) => void;
  onGiveUp: () => void;
}

export default function GameControls({
  gameMode,
  loading,
  hasContent,
  gameOver,
  onStartGame,
  onGiveUp
}: GameControlsProps) {
  const [subject, setSubject] = useState('');

  // Voice recognition hook
  const { isListening, toggleListening, isSupported } = useVoiceRecognition((transcript) => {
    setSubject((prev) => (prev ? `${prev} ${transcript}` : transcript));
  });

  const handleStart = () => {
    onStartGame(subject);
  };

  return (
    <Card className="bg-white/80 backdrop-blur-md border-white/20 shadow-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Settings</h3>
        {hasContent && !gameOver && (
          <button
            onClick={onGiveUp}
            className="text-xs font-bold text-red-500 hover:text-red-600 uppercase transition-colors"
          >
            Give Up
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-zinc-600 mb-2 block">
            {gameMode === 'LOGIC' ? 'Logic Topic (Optional)' : 'Scene Subject (Optional)'}
          </label>
          <div className="relative">
            <Input
              disabled={loading || (hasContent && !gameOver)}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={gameMode === 'LOGIC' ? 'Math, riddles, etc...' : 'A futuristic city...'}
              className="bg-zinc-50 border-zinc-200 pr-10 focus-visible:ring-orange-500/20"
            />
            {isSupported && (
              <button
                onClick={toggleListening}
                disabled={loading || (hasContent && !gameOver)}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-all ${
                  isListening ? 'bg-red-500 text-white' : 'text-zinc-400 hover:bg-zinc-100'
                }`}
                title="Voice Input"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {!hasContent || gameOver ? (
          <Button
            onClick={handleStart}
            disabled={loading}
            className="w-full bg-linear-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Dice5 className="w-4 h-4 mr-2" />
                {gameOver ? 'New Challenge' : 'Generate Game'}
              </>
            )}
          </Button>
        ) : (
          <div className="p-3 bg-green-50 text-green-700 border border-green-100 rounded-lg flex items-center justify-center gap-2 text-xs font-bold">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Game Active
          </div>
        )}
      </div>
    </Card>
  );
}
