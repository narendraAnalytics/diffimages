"use client";

import { useState } from 'react';
import { ChevronDown, ChevronUp, RotateCcw, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GameMode, Difference } from '@/lib/gemini/types';

interface GameResultsProps {
  gameMode: GameMode;
  revealing: boolean;
  differences: Difference[];
  logicSolution: string | null;
  onPlayAgain: () => void;
}

const cleanText = (text: string | null | undefined): string => {
  if (!text) return "";
  return text.replace(/\*\*/g, "");
};

export default function GameResults({
  gameMode,
  revealing,
  differences,
  logicSolution,
  onPlayAgain
}: GameResultsProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Card className="bg-white/80 backdrop-blur-md border-white/20 shadow-lg overflow-hidden">
      {/* Header */}
      <div
        className="bg-zinc-900 text-white p-4 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-sm font-bold uppercase tracking-wider">Game Results</h3>
        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {revealing ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3 text-zinc-400">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              <span className="text-xs uppercase font-bold">Revealing answers...</span>
            </div>
          ) : gameMode === 'LOGIC' ? (
            <div className="space-y-4">
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                <div className="flex items-center gap-2 mb-3 text-blue-600">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">The Solution</span>
                </div>
                <p className="text-sm text-zinc-700 leading-relaxed">
                  {cleanText(logicSolution)}
                </p>
              </div>
            </div>
          ) : (
            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {differences.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-4">No results to display</p>
              ) : (
                differences.map((diff) => (
                  <div
                    key={diff.id}
                    className="flex gap-3 items-start p-3 bg-zinc-50 rounded-lg border border-zinc-100"
                  >
                    <span
                      className={`w-6 h-6 shrink-0 ${
                        gameMode === 'DIFF' ? 'bg-zinc-900' : 'bg-amber-600'
                      } text-white rounded-full flex items-center justify-center text-xs font-bold`}
                    >
                      {diff.id}
                    </span>
                    <p className="text-xs leading-relaxed text-zinc-600 font-medium">
                      {diff.description}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Play Again Button */}
          <Button
            onClick={onPlayAgain}
            className="w-full border-2 border-zinc-900 bg-transparent text-zinc-900 hover:bg-zinc-900 hover:text-white font-bold transition-all"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Play Again
          </Button>
        </div>
      )}
    </Card>
  );
}
