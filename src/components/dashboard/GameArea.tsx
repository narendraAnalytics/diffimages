"use client";

import { useState, useRef, useEffect } from 'react';
import { Brain, ArrowRight, RotateCcw, MessageSquare, Loader2, Maximize2, Minimize2, X, BookOpen } from 'lucide-react';
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
  logicSolution: string | null;
  onPlayAgain: () => void;
}

const COLOR_PALETTE = [
  'bg-linear-to-br from-orange-400 to-pink-500',
  'bg-linear-to-br from-blue-400 to-indigo-600',
  'bg-linear-to-br from-emerald-400 to-teal-600',
  'bg-linear-to-br from-purple-400 to-indigo-600',
  'bg-linear-to-br from-rose-400 to-pink-600',
  'bg-linear-to-br from-amber-400 to-orange-600',
  'bg-linear-to-br from-cyan-400 to-blue-600',
  'bg-linear-to-br from-fuchsia-400 to-purple-600',
];

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
  differences,
  logicSolution,
  onPlayAgain
}: GameAreaProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isFullView, setIsFullView] = useState(false);
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

  // Handle Escape key
  const handleKeyDown = (e: React.KeyboardEvent | KeyboardEvent) => {
    if (e.key === 'Escape' && isFullView) {
      setIsFullView(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isFullView]);

  const renderImages = (imgMaxHeight: string) => (
    <div
      className="transition-transform duration-75 ease-linear"
      style={{ transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)` }}
    >
      {gameMode === 'DIFF' && images ? (
        <div className="flex gap-4 p-4">
          <div className="relative rounded-lg overflow-hidden border border-zinc-200 shadow-sm bg-white">
            <img
              src={`data:image/png;base64,${images.original}`}
              alt="Original"
              className={`${imgMaxHeight} w-auto pointer-events-none select-none`}
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
          <div className="relative rounded-lg overflow-hidden border border-zinc-200 shadow-sm bg-white">
            <img
              src={`data:image/png;base64,${images.modified}`}
              alt="Modified"
              className={`${imgMaxHeight} w-auto pointer-events-none select-none`}
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
              className={`${imgMaxHeight} w-auto pointer-events-none select-none`}
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
  );

  return (
    <>
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
              <div className="p-6 border-b border-zinc-100 bg-zinc-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <Brain className="w-5 h-5" />
                  </div>
                  <h2 className="font-bold text-lg">{cleanText(logicGame.title)}</h2>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white/80 hover:bg-white/10"
                  onClick={() => setIsFullView(true)}
                  title="Reading Mode"
                >
                  <BookOpen className="w-5 h-5" />
                </Button>
              </div>
              <div className="p-8 lg:p-10 flex flex-col items-center">
                <p className="text-xl lg:text-2xl text-zinc-800 font-medium leading-relaxed font-serif italic text-center">
                  "{cleanText(logicGame.question)}"
                </p>
                <button 
                  onClick={() => setIsFullView(true)}
                  className="mt-6 text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:text-blue-500 transition-colors flex items-center gap-2"
                >
                  <Maximize2 className="w-3 h-3" /> Enter Reading View
                </button>
              </div>
              <div className="px-8 py-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between text-zinc-400 text-xs font-bold uppercase">
                <span>Reasoning Required</span>
                <span>Gemini AI</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col relative overflow-hidden">
            <div
              className="flex-1 cursor-move touch-none bg-zinc-50 flex items-start justify-center pt-10"
              onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
              onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
              onMouseUp={handleEnd}
              onMouseLeave={() => { handleEnd(); setIsHovering(false); }}
              onMouseEnter={() => setIsHovering(true)}
            >
              {renderImages("max-h-[500px]")}
            </div>

            {/* Hover Hint */}
            {gameOver && !revealing && !isHovering && (images || singleImage) && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-10">
                <div className="bg-zinc-900/80 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full backdrop-blur-sm animate-bounce">
                  Hover to reveal image
                </div>
              </div>
            )}

            {/* Zoom Controls */}
            {(images || singleImage) && (
              <div className="absolute top-4 right-4 z-20 flex gap-2 p-2 bg-white/95 backdrop-blur border border-zinc-200 rounded-xl shadow-md">
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
                <div className="w-px bg-zinc-200 my-1" />
                <Button
                  size="icon-sm"
                  className="bg-zinc-900 hover:bg-zinc-800 text-white"
                  onClick={() => setIsFullView(true)}
                  title="Full View"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}
        
        {/* Game Results Integration */}
        {gameOver && (
          <div className="border-t border-zinc-100 bg-white/50 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                  Game Results
                </h3>
                <Button
                  size="sm"
                  onClick={onPlayAgain}
                  className="bg-linear-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold border-none shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-105 transition-all duration-300"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Play Again
                </Button>
              </div>

              {revealing ? (
                <div className="flex flex-col items-center justify-center py-8 gap-3 text-zinc-400">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                  <span className="text-xs uppercase font-bold">Revealing answers...</span>
                </div>
              ) : gameMode === 'LOGIC' ? (
                <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-blue-600 uppercase mb-1 block">The Solution</span>
                    <p className="text-zinc-700 leading-relaxed font-medium">
                      {cleanText(logicSolution)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {differences.length === 0 ? (
                    <p className="col-span-2 text-sm text-zinc-500 text-center py-8 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                      No results to display
                    </p>
                  ) : (
                    differences.map((diff, index) => (
                      <div
                        key={diff.id}
                        className="flex gap-4 items-start p-4 bg-white rounded-xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <span
                          className={`w-8 h-8 shrink-0 ${
                            COLOR_PALETTE[index % COLOR_PALETTE.length]
                          } text-white rounded-lg flex items-center justify-center text-sm font-bold shadow-sm`}
                        >
                          {diff.id}
                        </span>
                        <p className="text-sm leading-relaxed text-zinc-600 font-medium">
                          {diff.description}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Full View Modal Overlay */}
      {isFullView && hasContent && (
        <div className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col animate-in fade-in duration-300">
          <div className="h-14 flex items-center justify-between px-6 border-b border-white/10 shrink-0 bg-zinc-900/50 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <h2 className="text-white font-bold text-sm tracking-widest uppercase flex items-center gap-2">
                <Brain className="w-4 h-4 text-blue-400" />
                {gameMode === 'LOGIC' ? 'Reading Mode' : 'Immersive View'}
              </h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullView(false)}
              className="text-white/80 hover:bg-white/10 rounded-full"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          <div className="flex-1 relative overflow-hidden flex items-center justify-center">
            {gameMode === 'LOGIC' && logicGame ? (
              <div className="max-w-4xl w-full mx-auto p-8 lg:p-16 animate-in zoom-in-95 duration-500 overflow-y-auto max-h-full custom-scrollbar">
                <div className="space-y-12">
                  <div className="text-center space-y-4">
                    <h2 className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.4em]">The Challenge</h2>
                    <h1 className="text-3xl lg:text-5xl font-bold text-white tracking-tight leading-tight">{cleanText(logicGame.title)}</h1>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-12 top-0 text-blue-500/10 select-none hidden lg:block">
                      <BookOpen size={80} />
                    </div>
                    <p className="text-2xl lg:text-4xl text-zinc-300 font-serif leading-relaxed italic text-center px-4">
                      "{cleanText(logicGame.question)}"
                    </p>
                  </div>
                  {gameOver && logicSolution && (
                    <div className="mt-16 p-10 bg-zinc-900/50 border border-white/10 rounded-3xl animate-in slide-in-from-bottom-8">
                      <div className="flex items-center gap-4 mb-6 text-blue-400">
                        <MessageSquare className="w-6 h-6" />
                        <h3 className="text-2xl font-bold">The Solution</h3>
                      </div>
                      <p className="text-xl text-zinc-400 leading-relaxed">{cleanText(logicSolution)}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div
                className="flex-1 w-full h-full cursor-move touch-none flex items-center justify-center"
                onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
                onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
                onMouseUp={handleEnd}
              >
                {renderImages("max-h-[85vh]")}
                <div className="absolute right-8 bottom-8 z-20 flex flex-row gap-2 p-2 bg-zinc-900/80 backdrop-blur border border-white/10 rounded-2xl shadow-2xl">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10"
                    onClick={() => setZoom(z => Math.min(z + 0.5, 6))}
                    title="Zoom In"
                  >
                    <ArrowRight className="w-6 h-6 -rotate-45" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10"
                    onClick={() => setZoom(z => Math.max(z - 0.5, 1))}
                    title="Zoom Out"
                  >
                    <ArrowRight className="w-6 h-6 rotate-135" />
                  </Button>
                  <div className="w-px bg-white/10 my-1 mx-2" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10"
                    onClick={resetZoom}
                    title="Reset View"
                  >
                    <RotateCcw className="w-6 h-6" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
