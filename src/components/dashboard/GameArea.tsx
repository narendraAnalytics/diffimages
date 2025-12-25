"use client";

import { useState, useRef } from 'react';
import { Brain, ArrowRight, RotateCcw, Maximize2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GameMode, DiffGameData, LogicGameData, Difference } from '@/lib/gemini/types';

interface GameAreaProps {
  gameMode: GameMode;
  images: DiffGameData | null;
  singleImage: string | null;
  logicGame: LogicGameData | null;
  gameOver: boolean;
  revealing: boolean;
  differences: Difference[];
}

const cleanText = (text: string | null | undefined): string => {
  if (!text) return "";
  return text.replace(/\*\*/g, "");
};

export default function GameArea({
  gameMode,
  images,
  singleImage,
  logicGame,
  gameOver,
  revealing,
  differences
}: GameAreaProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startPan = useRef({ x: 0, y: 0 });

  const hasContent = images || singleImage || logicGame;

  // Zoom & Pan handlers
  const handleStart = (clientX: number, clientY: number) => {
    isDragging.current = true;
    startPos.current = { x: clientX, y: clientY };
    startPan.current = { ...pan };
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging.current) return;
    const deltaX = (clientX - startPos.current.x) / zoom;
    const deltaY = (clientY - startPos.current.y) / zoom;
    setPan({ x: startPan.current.x + deltaX, y: startPan.current.y + deltaY });
  };

  const handleEnd = () => {
    isDragging.current = false;
  };

  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <Card className="bg-white/80 backdrop-blur-md border-white/20 shadow-lg h-full min-h-[600px] flex flex-col overflow-hidden">
      {!hasContent ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
          <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center border border-zinc-100 mb-6">
            <Brain className="w-8 h-8 text-zinc-400" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 mb-2">Ready to Challenge Your Brain?</h3>
          <p className="text-sm text-zinc-500 max-w-sm">
            Select a game mode and click Generate to start your AI-powered brain training session.
          </p>
        </div>
      ) : gameMode === 'LOGIC' && logicGame ? (
        <div className="flex-1 flex items-center justify-center p-8 bg-zinc-50/50">
          <div className="max-w-2xl w-full bg-white rounded-2xl border border-zinc-200 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-zinc-100 bg-zinc-900 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <Brain className="w-5 h-5" />
                </div>
                <h2 className="font-bold text-lg">{cleanText(logicGame.title)}</h2>
              </div>
            </div>
            <div className="p-8 lg:p-10">
              <p className="text-xl lg:text-2xl text-zinc-800 font-medium leading-relaxed font-serif italic text-center">
                "{cleanText(logicGame.question)}"
              </p>
            </div>
            <div className="px-8 py-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between text-zinc-400 text-xs font-bold uppercase">
              <span>Reasoning Required</span>
              <span>Gemini AI</span>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Image Display Area */}
          <div
            className="flex-1 cursor-move touch-none bg-zinc-50 flex items-center justify-center relative overflow-hidden"
            onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
            onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
            onMouseUp={handleEnd}
            onMouseLeave={() => { handleEnd(); setIsHovering(false); }}
            onMouseEnter={() => setIsHovering(true)}
          >
            <div
              className="transition-transform duration-75 ease-linear"
              style={{ transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)` }}
            >
              {gameMode === 'DIFF' && images ? (
                <div className="flex gap-4 p-4">
                  {/* Original Image */}
                  <div className="relative rounded-lg overflow-hidden border border-zinc-200 shadow-sm bg-white">
                    <img
                      src={`data:image/png;base64,${images.original}`}
                      alt="Original"
                      className="max-h-[500px] w-auto pointer-events-none select-none"
                    />
                    {gameOver && !revealing && !isHovering && differences.map(diff => (
                      <div
                        key={diff.id}
                        className="absolute border-2 border-red-500 rounded-lg animate-pulse"
                        style={{
                          top: `${diff.box_2d[0] / 10}%`,
                          left: `${diff.box_2d[1] / 10}%`,
                          width: `${(diff.box_2d[3] - diff.box_2d[1]) / 10}%`,
                          height: `${(diff.box_2d[2] - diff.box_2d[0]) / 10}%`
                        }}
                      >
                        <div className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                          {diff.id}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Modified Image */}
                  <div className="relative rounded-lg overflow-hidden border border-zinc-200 shadow-sm bg-white">
                    <img
                      src={`data:image/png;base64,${images.modified}`}
                      alt="Modified"
                      className="max-h-[500px] w-auto pointer-events-none select-none"
                    />
                    {gameOver && !revealing && !isHovering && differences.map(diff => (
                      <div
                        key={diff.id}
                        className="absolute border-2 border-green-600 rounded-lg animate-pulse"
                        style={{
                          top: `${diff.box_2d[0] / 10}%`,
                          left: `${diff.box_2d[1] / 10}%`,
                          width: `${(diff.box_2d[3] - diff.box_2d[1]) / 10}%`,
                          height: `${(diff.box_2d[2] - diff.box_2d[0]) / 10}%`
                        }}
                      >
                        <div className="absolute -top-3 -right-3 w-6 h-6 bg-green-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                          {diff.id}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : singleImage ? (
                <div className="p-4">
                  <div className="relative rounded-xl overflow-hidden border border-zinc-200 shadow-lg bg-white">
                    <img
                      src={`data:image/png;base64,${singleImage}`}
                      alt="What is wrong?"
                      className="max-h-[500px] w-auto pointer-events-none select-none"
                    />
                    {gameOver && !revealing && !isHovering && differences.map(diff => (
                      <div
                        key={diff.id}
                        className="absolute border-2 border-amber-500 rounded-lg animate-pulse"
                        style={{
                          top: `${diff.box_2d[0] / 10}%`,
                          left: `${diff.box_2d[1] / 10}%`,
                          width: `${(diff.box_2d[3] - diff.box_2d[1]) / 10}%`,
                          height: `${(diff.box_2d[2] - diff.box_2d[0]) / 10}%`
                        }}
                      >
                        <div className="absolute -top-3 -right-3 w-6 h-6 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                          {diff.id}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Hover Hint */}
            {gameOver && !revealing && !isHovering && (images || singleImage) && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-10">
                <div className="bg-zinc-900/80 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full backdrop-blur-sm animate-bounce">
                  Hover to reveal image
                </div>
              </div>
            )}
          </div>

          {/* Zoom Controls */}
          {(images || singleImage) && (
            <div className="absolute bottom-4 right-4 z-20 flex gap-2 p-2 bg-white/95 backdrop-blur border border-zinc-200 rounded-xl shadow-md">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setZoom(z => Math.min(z + 0.5, 4))}
                title="Zoom In"
              >
                <ArrowRight className="w-4 h-4 -rotate-45" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setZoom(z => Math.max(z - 0.5, 1))}
                title="Zoom Out"
              >
                <ArrowRight className="w-4 h-4 rotate-135" />
              </Button>
              <div className="w-px bg-zinc-200 my-1" />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={resetZoom}
                title="Reset Zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
