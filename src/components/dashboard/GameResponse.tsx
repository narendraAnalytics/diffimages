"use client";

import { useState } from 'react';
import { useVoiceRecognition } from '@/lib/hooks/useVoiceRecognition';
import { Loader2, ArrowRight, Mic, MicOff, CheckCircle, XCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { GameMode } from '@/lib/gemini/types';

interface GameResponseProps {
  gameMode: GameMode;
  checking: boolean;
  feedback: { type: 'success' | 'error' | 'info'; message: string } | null;
  onSubmit: (guess: string) => void;
}

export default function GameResponse({ gameMode, checking, feedback, onSubmit }: GameResponseProps) {
  const [guess, setGuess] = useState('');

  // Voice recognition hook
  const { isListening, toggleListening, isSupported } = useVoiceRecognition((transcript) => {
    setGuess((prev) => (prev ? `${prev} ${transcript}` : transcript));
  });

  const handleSubmit = () => {
    if (!guess.trim()) return;
    onSubmit(guess);
    if (feedback?.type === 'success') {
      setGuess('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-md border-white/20 shadow-lg p-4">
      <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">Your Response</h3>

      <div className="space-y-4">
        <div className="relative">
          <Input
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={gameMode === 'LOGIC' ? 'Enter your answer...' : 'What is different/wrong?'}
            className="bg-zinc-50 border-zinc-200 pr-10 focus-visible:ring-orange-500/20"
          />
          {isSupported && (
            <button
              onClick={toggleListening}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-all ${
                isListening ? 'bg-red-500 text-white' : 'text-zinc-400 hover:bg-zinc-100'
              }`}
              title="Voice Input"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={checking || !guess.trim()}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all"
        >
          {checking ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <ArrowRight className="w-4 h-4 mr-2" />
              Verify Answer
            </>
          )}
        </Button>

        {/* Feedback */}
        {feedback && (
          <div
            className={`p-3 rounded-lg flex items-start gap-2 text-sm border animate-in fade-in zoom-in-95 duration-300 ${
              feedback.type === 'success'
                ? 'bg-green-50 text-green-700 border-green-100'
                : feedback.type === 'error'
                ? 'bg-red-50 text-red-700 border-red-100'
                : 'bg-blue-50 text-blue-700 border-blue-100'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            ) : feedback.type === 'error' ? (
              <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <span className="leading-relaxed">{feedback.message}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
