import React, { useState, useEffect, useRef } from 'react';
import { 
  generateDiffGame, 
  generateWrongGame, 
  generateLogicGame,
  checkDifference, 
  checkWrongness, 
  checkLogicAnswer,
  getDifference, 
  getWrongErrors, 
  Difference 
} from '../services/geminiService';
import { 
  Loader2, 
  Send, 
  CheckCircle, 
  XCircle, 
  Trophy, 
  Mic, 
  MicOff, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp,
  Image as ImageIcon,
  History,
  Info,
  Sparkles,
  Zap,
  Dice5,
  Maximize2,
  Minimize2,
  Brain,
  MessageSquare,
  ArrowRight,
  BookOpen,
  X
} from 'lucide-react';

const TIMER_DURATION = 15;
type GameMode = 'DIFF' | 'WRONG' | 'LOGIC';

const RANDOM_THEMES = [
  "A futuristic street market",
  "A cozy medieval tavern",
  "An underwater research base",
  "A steampunk workshop",
  "A magical library in the clouds",
  "A modern penthouse kitchen",
  "A quiet suburban garden",
  "An ancient Egyptian temple interior",
  "A bustling space station lobby",
  "A rustic forest cabin"
];

// Helper to clean up Markdown formatting (strip ** symbols)
const cleanText = (text: string | null | undefined): string => {
  if (!text) return "";
  return text.replace(/\*\*/g, "");
};

export const GameScreen: React.FC = () => {
  const [gameMode, setGameMode] = useState<GameMode>('DIFF');
  const [loading, setLoading] = useState(false);
  
  // Game Content
  const [images, setImages] = useState<{ original: string; modified: string } | null>(null);
  const [singleImage, setSingleImage] = useState<string | null>(null);
  const [logicGame, setLogicGame] = useState<{ title: string; question: string; solution: string } | null>(null);
  
  // Game State
  const [guess, setGuess] = useState('');
  const [promptSubject, setPromptSubject] = useState('');
  const [checking, setChecking] = useState(false);
  const [score, setScore] = useState(0);
  const [foundItems, setFoundItems] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);

  // Result / Game Over State
  const [gameOver, setGameOver] = useState(false);
  const [finalDifferences, setFinalDifferences] = useState<Difference[]>([]);
  const [revealing, setRevealing] = useState(false);
  const [isResultExpanded, setIsResultExpanded] = useState(true);
  const [isHoveringImage, setIsHoveringImage] = useState(false);
  const [isFullView, setIsFullView] = useState(false);
  const [logicSolution, setLogicSolution] = useState<string | null>(null);

  // Timer State
  const [timer, setTimer] = useState(TIMER_DURATION);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Voice State
  const [isListeningGuess, setIsListeningGuess] = useState(false);
  const [isListeningPrompt, setIsListeningPrompt] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Zoom & Pan State (for image modes)
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startPan = useRef({ x: 0, y: 0 });

  // --- Timer Logic ---
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    } else if (isTimerActive && timer === 0) {
       handleTimeout();
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  // Handle Escape key for full view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullView) {
        setIsFullView(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullView]);

  const handleTimeout = async () => {
      setIsTimerActive(false);
      setGameOver(true);
      setRevealing(true);
      setIsResultExpanded(true);
      setIsFullView(false); 
      
      try {
          if (gameMode === 'DIFF' && images) {
            const differences = await getDifference(images.original, images.modified);
            setFinalDifferences(differences);
          } else if (gameMode === 'WRONG' && singleImage) {
            const errors = await getWrongErrors(singleImage);
            setFinalDifferences(errors);
          } else if (gameMode === 'LOGIC' && logicGame) {
             setLogicSolution(cleanText(logicGame.solution) || "Time's up! The puzzle remains unsolved.");
          }
      } catch (e) {
          console.error(e);
      } finally {
          setRevealing(false);
      }
  };

  const formatTime = (seconds: number) => {
    return `00:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // --- Voice Logic ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        recognition.onend = () => { setIsListeningGuess(false); setIsListeningPrompt(false); };
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (isListeningPrompt) setPromptSubject((prev) => (prev ? `${prev} ${transcript}` : transcript));
          else if (isListeningGuess) setGuess((prev) => (prev ? `${prev} ${transcript}` : transcript));
        };
        recognitionRef.current = recognition;
      }
    }
  }, [isListeningPrompt, isListeningGuess]); 

  const toggleListeningPrompt = () => {
    if (!recognitionRef.current) return alert("Voice not supported");
    if (isListeningPrompt) { recognitionRef.current.stop(); setIsListeningPrompt(false); }
    else { setIsListeningGuess(false); setIsListeningPrompt(true); recognitionRef.current.start(); }
  };

  const toggleListeningGuess = () => {
    if (!recognitionRef.current) return alert("Voice not supported");
    if (isListeningGuess) { recognitionRef.current.stop(); setIsListeningGuess(false); }
    else { setIsListeningPrompt(false); setIsListeningGuess(true); recognitionRef.current.start(); }
  };

  // --- Zoom & Pan Handlers ---
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

  const handleEnd = () => { isDragging.current = false; };
  const resetZoom = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  // --- Game Logic ---
  const startGame = async () => {
    let subject = promptSubject.trim();
    
    setLoading(true);
    setGameOver(false);
    setFinalDifferences([]);
    setImages(null);
    setSingleImage(null);
    setLogicGame(null);
    setLogicSolution(null);
    setFoundItems([]);
    setGuess('');
    setTimer(TIMER_DURATION);
    setIsTimerActive(false);
    setFeedback(null);
    setIsFullView(false);
    resetZoom();
    
    try {
      if (gameMode === 'DIFF') {
        if (!subject) subject = RANDOM_THEMES[Math.floor(Math.random() * RANDOM_THEMES.length)];
        const data = await generateDiffGame(subject);
        setImages(data);
      } else if (gameMode === 'WRONG') {
        if (!subject) subject = RANDOM_THEMES[Math.floor(Math.random() * RANDOM_THEMES.length)];
        const data = await generateWrongGame(subject);
        setSingleImage(data.image);
      } else {
        const data = await generateLogicGame(subject);
        setLogicGame(data);
      }
      setIsTimerActive(true); 
    } catch (e) {
      alert("Failed to generate game. Try a different topic.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (gameOver || !guess || checking) return;
    
    setChecking(true);
    setFeedback(null);
    try {
      let res;
      if (gameMode === 'DIFF' && images) {
          res = await checkDifference(images.original, images.modified, guess, foundItems);
      } else if (gameMode === 'WRONG' && singleImage) {
          res = await checkWrongness(singleImage, guess, foundItems);
      } else if (gameMode === 'LOGIC' && logicGame) {
          res = await checkLogicAnswer(logicGame.question, guess);
      }

      if (res && res.correct) {
          if (res.alreadyFound) {
              setFeedback({ type: 'info', message: "Already discovered!" });
          } else {
              setScore(s => s + (gameMode === 'LOGIC' ? 10 : (gameMode === 'DIFF' ? 1 : 2))); 
              setFoundItems(prev => [...prev, guess]);
              setFeedback({ type: 'success', message: cleanText(res.explanation) || "Correct answer!" });
              setGuess('');
              
              if (gameMode === 'LOGIC') {
                  setGameOver(true);
                  setIsTimerActive(false);
                  setLogicSolution(cleanText(res.explanation));
              }
          }
      } else {
          setFeedback({ type: 'error', message: cleanText(res?.explanation) || "Not quite right. Try again." });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setChecking(false);
    }
  };

  const handleManualGiveUp = async () => {
      setIsTimerActive(false);
      setGameOver(true);
      if (gameMode === 'LOGIC' && logicGame) {
          setLogicSolution(cleanText(logicGame.solution));
      } else {
          handleTimeout();
      }
  };

  const handlePlayAgain = () => {
      setImages(null);
      setSingleImage(null);
      setLogicGame(null);
      setGuess('');
      setPromptSubject('');
      setFoundItems([]);
      setGameOver(false);
      setScore(0);
      setFinalDifferences([]);
      setIsResultExpanded(true);
      setIsHoveringImage(false);
      setIsFullView(false);
      setLogicSolution(null);
  };

  const hasContent = images || singleImage || logicGame;

  const renderImages = (containerClass: string, imgMaxHeight: string) => (
    <div 
        className={`${containerClass} cursor-move touch-none bg-[#fdfdfd] h-full flex items-center justify-center`}
        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
        onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
        onMouseUp={handleEnd}
        onMouseLeave={() => { handleEnd(); setIsHoveringImage(false); }}
        onMouseEnter={() => setIsHoveringImage(true)}
    >
        <div 
            className="w-full h-full flex items-center justify-center transition-transform duration-75 ease-linear origin-center"
            style={{ transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)` }}
        >
             {gameMode === 'DIFF' && images ? (
                 <div className="flex gap-2 p-4 max-w-full">
                    <div className="relative rounded-lg overflow-hidden border border-zinc-200 shadow-sm bg-white">
                        <img src={`data:image/png;base64,${images.original}`} alt="Original" className={`${imgMaxHeight} w-auto pointer-events-none select-none`} />
                        {gameOver && !revealing && !isHoveringImage && finalDifferences.map(diff => (
                            <div key={diff.id} className="absolute border-2 border-red-500 rounded-lg animate-pulse" style={{ top: `${diff.box_2d[0]/10}%`, left: `${diff.box_2d[1]/10}%`, width: `${(diff.box_2d[3]-diff.box_2d[1])/10}%`, height: `${(diff.box_2d[2]-diff.box_2d[0])/10}%` }}>
                                <div className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg border border-white/40">{diff.id}</div>
                            </div>
                        ))}
                    </div>
                    <div className="relative rounded-lg overflow-hidden border border-zinc-200 shadow-sm bg-white">
                        <img src={`data:image/png;base64,${images.modified}`} alt="Modified" className={`${imgMaxHeight} w-auto pointer-events-none select-none`} />
                        {gameOver && !revealing && !isHoveringImage && finalDifferences.map(diff => (
                            <div key={diff.id} className="absolute border-2 border-green-600 rounded-lg animate-pulse" style={{ top: `${diff.box_2d[0]/10}%`, left: `${diff.box_2d[1]/10}%`, width: `${(diff.box_2d[3]-diff.box_2d[1])/10}%`, height: `${(diff.box_2d[2]-diff.box_2d[0])/10}%` }}>
                                <div className="absolute -top-3 -right-3 w-6 h-6 bg-green-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg border border-white/40">{diff.id}</div>
                            </div>
                        ))}
                    </div>
                 </div>
             ) : singleImage ? (
                 <div className="p-4 max-w-full">
                    <div className="relative rounded-xl overflow-hidden border border-zinc-200 shadow-lg bg-white">
                        <img src={`data:image/png;base64,${singleImage}`} alt="What is wrong?" className={`${imgMaxHeight} w-auto pointer-events-none select-none`} />
                        {gameOver && !revealing && !isHoveringImage && finalDifferences.map(diff => (
                            <div key={diff.id} className="absolute border-2 border-amber-500 rounded-lg animate-pulse" style={{ top: `${diff.box_2d[0]/10}%`, left: `${diff.box_2d[1]/10}%`, width: `${(diff.box_2d[3]-diff.box_2d[1])/10}%`, height: `${(diff.box_2d[2]-diff.box_2d[0])/10}%` }}>
                                <div className="absolute -top-3 -right-3 w-6 h-6 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg border border-white/40">{diff.id}</div>
                            </div>
                        ))}
                    </div>
                 </div>
             ) : null}
        </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      
      {/* Immersive Full View Modal (Supports Image & Logic Reading View) */}
      {isFullView && hasContent && (
        <div className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col animate-in fade-in duration-300">
           <div className="h-14 flex items-center justify-between px-6 border-b border-white/10 shrink-0 bg-zinc-900/50 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <div className={`px-4 py-1.5 rounded-full font-mono font-bold text-sm bg-zinc-800 text-white border border-white/10 ${timer <= 5 ? 'text-red-400 border-red-500/50 animate-pulse' : ''}`}>
                        {formatTime(timer)}
                    </div>
                    {gameMode === 'LOGIC' && (
                        <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest border border-blue-500/20">
                            Reading Mode
                        </div>
                    )}
                </div>
                <button onClick={() => setIsFullView(false)} className="p-2 hover:bg-white/10 rounded-full text-white/80 transition-colors" title="Minimize"><Minimize2 size={24} /></button>
           </div>

           <div className="flex-1 relative overflow-hidden flex items-center justify-center">
                {gameMode === 'LOGIC' && logicGame ? (
                    <div className="max-w-3xl w-full mx-auto p-8 lg:p-16 animate-in zoom-in-95 duration-500 overflow-y-auto max-h-full no-scrollbar">
                        <div className="space-y-12">
                            <div className="text-center space-y-4">
                                <h2 className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.4em]">The Challenge</h2>
                                <h1 className="text-3xl lg:text-5xl font-bold text-white tracking-tight">{cleanText(logicGame.title)}</h1>
                            </div>
                            <div className="relative">
                                <div className="absolute -left-8 top-0 text-blue-500/20 select-none"><BookOpen size={64} /></div>
                                <p className="text-2xl lg:text-4xl text-zinc-300 font-serif leading-relaxed italic text-center">
                                    "{cleanText(logicGame.question)}"
                                </p>
                            </div>
                            {gameOver && logicSolution && (
                                <div className="mt-16 p-8 bg-zinc-900/50 border border-white/10 rounded-3xl animate-in slide-in-from-bottom-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-2xl bg-green-500/20 flex items-center justify-center text-green-500 border border-green-500/20">
                                            <CheckCircle size={20} />
                                        </div>
                                        <h3 className="text-xl font-bold text-white">The Solution</h3>
                                    </div>
                                    <p className="text-lg text-zinc-400 leading-relaxed">{cleanText(logicSolution)}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        {renderImages("flex-1", "max-h-[85vh]")}
                        <div className="absolute right-8 bottom-8 z-20 flex flex-row gap-2 p-2 bg-zinc-900/80 backdrop-blur border border-white/10 rounded-2xl shadow-2xl">
                            <button onClick={() => setZoom(z => Math.min(z + 0.5, 6))} className="p-3 hover:bg-white/10 rounded-xl text-white transition-colors" title="Zoom In"><ArrowRight size={24} className="-rotate-45" /></button>
                            <button onClick={() => setZoom(z => Math.max(z - 0.5, 1))} className="p-3 hover:bg-white/10 rounded-xl text-white transition-colors" title="Zoom Out"><ArrowRight size={24} className="rotate-135" /></button>
                            <div className="w-px bg-white/10 my-1 mx-2" />
                            <button onClick={resetZoom} className="p-3 hover:bg-white/10 rounded-xl text-white transition-colors" title="Reset View"><RotateCcw size={24} /></button>
                        </div>
                    </>
                )}
           </div>
        </div>
      )}

      {/* Left Column: Game Area */}
      <div className="flex-1 flex flex-col gap-6 h-full min-h-[500px]">
        <div className="flex items-center justify-between bg-white px-5 py-3 rounded-xl border border-zinc-200 shadow-sm">
            <div className="flex items-center gap-6">
                 <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Time Remaining</span>
                    <div className={`px-3 py-1 rounded-md font-mono font-bold text-sm border ${timer <= 5 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-zinc-50 text-zinc-900 border-zinc-200'}`}>
                        {formatTime(timer)}
                    </div>
                 </div>
                 <div className="flex items-center gap-2 border-l border-zinc-100 pl-6">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{gameMode === 'LOGIC' ? 'IQ Progress' : 'Found Items'}</span>
                    <div className="px-3 py-1 rounded-md font-mono font-bold text-sm bg-zinc-900 text-white">
                        {gameMode === 'LOGIC' && gameOver ? 'Complete' : foundItems.length}
                    </div>
                 </div>
            </div>
            <div className="flex items-center gap-2">
                <Trophy size={18} className="text-yellow-500" />
                <span className="font-bold text-zinc-900">{score} pts</span>
            </div>
        </div>

        <div className="relative flex-1 bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col group">
          {!hasContent ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-6">
                <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center border border-zinc-100 group-hover:scale-110 transition-transform duration-500">
                    <Brain className="text-zinc-400" size={32} />
                </div>
                <div className="space-y-2 max-w-sm">
                    <h3 className="text-xl font-bold text-zinc-900">Brain Training Hub</h3>
                    <p className="text-sm text-zinc-500">Select a mode to test your vision or logic. Gemini AI will generate a unique challenge just for you.</p>
                </div>
            </div>
          ) : gameMode === 'LOGIC' && logicGame ? (
            <div className="flex-1 flex items-center justify-center p-8 lg:p-12 bg-zinc-50/50 overflow-hidden">
               <div className={`max-w-2xl w-full bg-white rounded-3xl border border-zinc-200 shadow-xl overflow-hidden transition-all duration-700 flex flex-col max-h-full ${gameOver ? 'scale-95 opacity-50 grayscale-[0.5]' : 'scale-100 opacity-100'}`}>
                  <div className="p-6 border-b border-zinc-100 bg-zinc-900 text-white flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                            <Brain size={16} />
                         </div>
                         <h2 className="font-bold text-lg">{cleanText(logicGame.title)}</h2>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setIsFullView(true)}
                            className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors"
                            title="Open Reading Mode"
                        >
                            <BookOpen size={18} />
                        </button>
                      </div>
                  </div>
                  <div className="p-8 lg:p-10 overflow-y-auto no-scrollbar flex-1 flex flex-col items-center justify-center">
                      <p className="text-xl lg:text-2xl text-zinc-800 font-medium leading-relaxed font-serif italic text-center">
                         "{cleanText(logicGame.question)}"
                      </p>
                      <button 
                        onClick={() => setIsFullView(true)}
                        className="mt-8 text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:text-blue-500 transition-colors flex items-center gap-2"
                      >
                        <Maximize2 size={12} /> Enter Reading View
                      </button>
                  </div>
                  <div className="px-8 py-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between text-zinc-400 text-[10px] font-bold uppercase tracking-tighter shrink-0">
                      <span>Reasoning Required</span>
                      <span>Gemini Pro Reasoning</span>
                  </div>
               </div>
            </div>
          ) : (
            <>
                <div className="absolute right-4 bottom-4 z-20 flex flex-row gap-2 p-1.5 bg-white/95 backdrop-blur border border-zinc-200 rounded-xl shadow-md">
                    <button onClick={() => setZoom(z => Math.min(z + 0.5, 4))} className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-600 transition-colors" title="Zoom In"><ArrowRight size={20} className="-rotate-45" /></button>
                    <button onClick={() => setZoom(z => Math.max(z - 0.5, 1))} className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-600 transition-colors" title="Zoom Out"><ArrowRight size={20} className="rotate-135" /></button>
                    <div className="w-px bg-zinc-200 my-1 mx-1" />
                    <button onClick={resetZoom} className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-600 transition-colors" title="Reset View"><RotateCcw size={20} /></button>
                    <div className="w-px bg-zinc-200 my-1 mx-1" />
                    <button onClick={() => setIsFullView(true)} className="p-2 bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg transition-colors" title="Full Screen View"><Maximize2 size={20} /></button>
                </div>
                {renderImages("flex-1", "max-h-[60vh]")}
                {gameOver && !revealing && !isHoveringImage && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-10">
                        <div className="bg-zinc-900/80 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full backdrop-blur-sm animate-bounce">Hover to reveal image</div>
                    </div>
                )}
            </>
          )}
        </div>
      </div>

      {/* Right Column: Interaction Sidebar */}
      <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-zinc-100"><h3 className="font-bold text-sm flex items-center gap-2"><Sparkles size={16} className="text-blue-500" />Settings</h3></div>
            <div className="p-4 space-y-5">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Game Mode</label>
                    <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-100 rounded-lg">
                        {[
                          { id: 'DIFF' as GameMode, icon: <ImageIcon size={14} /> },
                          { id: 'WRONG' as GameMode, icon: <Zap size={14} /> },
                          { id: 'LOGIC' as GameMode, icon: <Brain size={14} /> }
                        ].map(mode => (
                          <button 
                            key={mode.id}
                            disabled={loading || (hasContent && !gameOver)}
                            onClick={() => { setGameMode(mode.id); setPromptSubject(''); }}
                            className={`flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-bold rounded-md transition-all ${gameMode === mode.id ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400 hover:text-zinc-600 disabled:opacity-50'}`}
                          >
                            {mode.icon}
                            {mode.id.charAt(0) + mode.id.slice(1).toLowerCase()}
                          </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Prompt Subject</label>
                    <div className="relative">
                        <input 
                            disabled={loading || (hasContent && !gameOver)}
                            value={promptSubject}
                            onChange={(e) => setPromptSubject(e.target.value)}
                            placeholder={gameMode === 'LOGIC' ? "Logic topic (Math, etc)" : "Scene topic..."}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-lg pl-3 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all disabled:opacity-50"
                        />
                        <button onClick={toggleListeningPrompt} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-all ${isListeningPrompt ? 'bg-red-500 text-white' : 'text-zinc-400 hover:bg-zinc-100'}`} title="Voice Input">{isListeningPrompt ? <MicOff size={14} /> : <Mic size={14} />}</button>
                    </div>
                </div>
                {!hasContent || gameOver ? (
                    <button 
                        onClick={startGame}
                        disabled={loading}
                        className="w-full bg-zinc-900 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-zinc-800 disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : <Dice5 size={16} />}
                        {gameOver ? 'New Challenge' : 'Generate'}
                    </button>
                ) : <div className="p-3 bg-green-50 text-green-700 border border-green-100 rounded-lg flex items-center justify-center gap-2 text-xs font-bold animate-pulse"><Zap size={12} /> Active Round</div>}
            </div>
        </div>

        {hasContent && (
            <div className="flex-1 flex flex-col gap-6 animate-in slide-in-from-right-4 duration-500">
                {!gameOver ? (
                    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-zinc-100 flex items-center justify-between"><h3 className="font-bold text-sm">Your Response</h3><button onClick={handleManualGiveUp} className="text-[10px] font-bold text-zinc-400 hover:text-red-500 uppercase">Give Up</button></div>
                        <div className="p-4 space-y-4">
                            <div className="relative">
                                <input 
                                    value={guess}
                                    onChange={(e) => setGuess(e.target.value)}
                                    placeholder={gameMode === 'LOGIC' ? "Enter answer..." : "What is wrong/different?"}
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg pl-3 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                                />
                                <button onClick={toggleListeningGuess} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-all ${isListeningGuess ? 'bg-red-500 text-white' : 'text-zinc-400'}`} title="Voice Input">{isListeningGuess ? <MicOff size={14} /> : <Mic size={14} />}</button>
                            </div>
                            <button onClick={handleSubmit} disabled={checking || !guess} className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-blue-500 disabled:opacity-50 flex items-center justify-center gap-2 transition-all">{checking ? <Loader2 className="animate-spin" size={16} /> : <ArrowRight size={16} />} Verify</button>
                        </div>
                        {feedback && (
                            <div className={`mx-4 mb-4 p-3 rounded-lg flex items-start gap-2 text-xs font-medium border animate-in fade-in zoom-in-95 ${
                                feedback.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 
                                feedback.type === 'error' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                            }`}>
                                {feedback.type === 'success' ? <CheckCircle size={14} className="shrink-0 mt-0.5" /> : feedback.type === 'error' ? <XCircle size={14} className="shrink-0 mt-0.5" /> : <Info size={14} className="shrink-0 mt-0.5" />}
                                <span>{cleanText(feedback.message)}</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-zinc-200 shadow-lg overflow-hidden flex flex-col animate-in slide-in-from-bottom-5">
                         <div className="p-4 bg-zinc-900 text-white flex items-center justify-between cursor-pointer" onClick={() => setIsResultExpanded(!isResultExpanded)}>
                            <div className="flex items-center gap-2"><Trophy size={16} className="text-yellow-400" /><h3 className="font-bold text-sm uppercase">Round Results</h3></div>
                            {isResultExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                        </div>
                        {isResultExpanded && (
                            <div className="p-4 space-y-4">
                                <div className="max-h-[300px] overflow-y-auto no-scrollbar space-y-2 pr-2">
                                    {revealing ? (
                                        <div className="flex flex-col items-center justify-center py-8 gap-3 text-zinc-400"><Loader2 className="animate-spin" size={20} /><span className="text-[10px] uppercase font-bold">Revealing...</span></div>
                                    ) : gameMode === 'LOGIC' ? (
                                        <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 space-y-3">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase"><MessageSquare size={12} /> The Solution</div>
                                            <p className="text-sm text-zinc-700 leading-relaxed font-medium">{cleanText(logicSolution)}</p>
                                            <button 
                                                onClick={() => setIsFullView(true)}
                                                className="w-full py-2 bg-white border border-zinc-200 rounded-lg text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 transition-colors"
                                            >
                                                Review with Question
                                            </button>
                                        </div>
                                    ) : (
                                        finalDifferences.map(diff => (
                                            <div key={diff.id} className="flex gap-3 items-start p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                                                <span className={`w-5 h-5 ${gameMode === 'DIFF' ? 'bg-zinc-900' : 'bg-amber-600'} text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5`}>{diff.id}</span>
                                                <p className="text-[11px] leading-relaxed text-zinc-600 font-medium">{diff.description}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <button onClick={handlePlayAgain} className="w-full border-2 border-zinc-900 text-zinc-900 rounded-lg py-3 text-xs font-bold hover:bg-zinc-900 hover:text-white transition-all uppercase tracking-widest">Restart</button>
                            </div>
                        )}
                    </div>
                )}

                {!gameOver && foundItems.length > 0 && (
                    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col flex-1 min-h-[150px]">
                        <div className="p-4 border-b border-zinc-100 flex items-center gap-2"><History size={16} className="text-zinc-400" /><h3 className="font-bold text-sm">Session History</h3></div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
                            {foundItems.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3 py-2 border-b border-zinc-50 last:border-0"><div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" /><span className="text-[11px] text-zinc-600 font-medium capitalize truncate">{item}</span></div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};