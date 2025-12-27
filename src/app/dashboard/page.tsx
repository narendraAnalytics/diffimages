"use client";

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { GameMode, DiffGameData, LogicGameData, Difference } from '@/lib/gemini/types';
import {
  generateDiffGame,
  generateWrongGame,
  generateLogicGame,
  checkDifference,
  checkWrongness,
  checkLogicAnswer,
  getDifferences,
  getErrors
} from '@/lib/gemini/client';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import GameModeSelector from '@/components/dashboard/GameModeSelector';
import GameArea from '@/components/dashboard/GameArea';
import GameControls from '@/components/dashboard/GameControls';
import GameResponse from '@/components/dashboard/GameResponse';
import GameHistoryModal from '@/components/dashboard/GameHistoryModal';
import { BeepGenerator } from '@/lib/audio/beepGenerator';
import { saveGameSession } from '@/app/actions/save-game-session';

const TIMER_DURATION = 75;

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

const cleanText = (text: string | null | undefined): string => {
  if (!text) return "";
  return text.replace(/\*\*/g, "");
};

export default function DashboardPage() {
  // Game Mode
  const [gameMode, setGameMode] = useState<GameMode>('DIFF');

  // Game Content
  const [images, setImages] = useState<DiffGameData | null>(null);
  const [singleImage, setSingleImage] = useState<string | null>(null);
  const [logicGame, setLogicGame] = useState<LogicGameData | null>(null);

  // Game State
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [score, setScore] = useState(0);
  const [foundItems, setFoundItems] = useState<string[]>([]);
  const [timer, setTimer] = useState(TIMER_DURATION);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [timerZone, setTimerZone] = useState<'green' | 'orange' | 'red'>('green');

  // Results
  const [differences, setDifferences] = useState<Difference[]>([]);
  const [revealing, setRevealing] = useState(false);
  const [logicSolution, setLogicSolution] = useState<string | null>(null);

  // Click-to-Find Feature
  const [gameAnswers, setGameAnswers] = useState<Difference[]>([]);  // Pre-fetched bounding boxes
  const [foundIds, setFoundIds] = useState<number[]>([]);             // IDs found via clicking
  const [livePoints, setLivePoints] = useState<{value: number, id: number} | null>(null); // Live points animation
  const [wrongClickToast, setWrongClickToast] = useState<string | null>(null); // Wrong click toast message

  // UI State
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [showScrollNotification, setShowScrollNotification] = useState(false);

  // Track current subject for database saves
  const [currentSubject, setCurrentSubject] = useState<string>('');

  // Audio System
  const beepGeneratorRef = useRef<BeepGenerator | null>(null);

  const hasContent = !!(images || singleImage || logicGame);

  // Initialize Audio System
  useEffect(() => {
    beepGeneratorRef.current = new BeepGenerator();
    return () => {
      beepGeneratorRef.current?.destroy();
    };
  }, []);

  const playBeeps = (count: number) => {
    beepGeneratorRef.current?.playBeeps(count);
  };

  // Show live points animation
  const showLivePoints = (points: number) => {
    const id = Date.now();
    setLivePoints({ value: points, id });

    // Auto-hide after 2 seconds
    setTimeout(() => {
      setLivePoints(prev => prev?.id === id ? null : prev);
    }, 2000);
  };

  // Handle image click (for click-to-find feature)
  const handleImageClick = (clickId: number, description: string) => {
    if (clickId > 0) {
      // Correct click
      beepGeneratorRef.current?.playSuccessChime(); // 3-tone success sound

      const points = gameMode === 'DIFF' ? 1 : 2; // Same as typing
      setScore(s => s + points);
      setFoundIds(prev => [...prev, clickId]);
      setFeedback({
        type: 'success',
        message: `✓ Found: ${description} (+${points} points)`
      });

      // Show live points animation
      showLivePoints(points);

      // Check if all found (click-based completion)
      if (foundIds.length + 1 >= gameAnswers.length) {
        setFeedback({
          type: 'success',
          message: 'Amazing! You found everything!'
        });
        handleTimeout(); // End game
      }
    } else if (clickId === -1) {
      // Already found
      setFeedback({ type: 'info', message: description });
    } else {
      // Wrong click (clickId === -2)
      beepGeneratorRef.current?.playBeep(400, 100, 0.2); // Short error beep

      // Penalty for wrong click
      const penalty = gameMode === 'DIFF' ? -1 : -2; // Lose points for wrong guess
      setScore(s => Math.max(0, s + penalty)); // Don't go below 0

      // Show toast overlay instead of bottom feedback
      setWrongClickToast(description);
      setTimeout(() => setWrongClickToast(null), 2000);

      // Show live points animation (negative)
      showLivePoints(penalty);
    }
  };

  // Auto-hide scroll notification after 4 seconds
  useEffect(() => {
    if (showScrollNotification) {
      const timeout = setTimeout(() => {
        setShowScrollNotification(false);
      }, 4000); // 4 seconds

      return () => clearTimeout(timeout);
    }
  }, [showScrollNotification]);

  // Timer Logic with Sound
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => {
          const newTime = t - 1;

          // Zone transitions and sound triggers
          if (newTime === 30) {
            setTimerZone('orange');
            playBeeps(2); // Enter orange zone: 2 beeps
          } else if (newTime === 15) {
            setTimerZone('red');
            playBeeps(2); // Enter red zone: 2 beeps
          } else if (newTime < 15 && newTime > 0) {
            playBeeps(1); // Continuous beeping in red zone
          } else if (newTime === 0) {
            playBeeps(1); // Final beep
          }

          return newTime;
        });
      }, 1000);
    } else if (isTimerActive && timer === 0) {
      handleTimeout();
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer]);


  // Handle Timeout
  const handleTimeout = async () => {
    setIsTimerActive(false);
    setGameOver(true);
    setRevealing(true);
    setShowScrollNotification(true); // Show scroll notification

    try {
      let revealedDifferences: Difference[] = [];

      if (gameMode === 'DIFF' && images) {
        const diffs = await getDifferences(images.original, images.modified);
        setDifferences(diffs);
        revealedDifferences = diffs;
      } else if (gameMode === 'WRONG' && singleImage) {
        const errors = await getErrors(singleImage);
        setDifferences(errors);
        revealedDifferences = errors;
      } else if (gameMode === 'LOGIC' && logicGame) {
        setLogicSolution(cleanText(logicGame.solution) || "Time's up! The puzzle remains unsolved.");
      }

      // Prepare items for database storage (mode-specific)
      const clickedItems = foundIds.map(id => {
        const answer = gameAnswers.find(a => a.id === id);
        return `[Click] ${answer?.description || 'Unknown'}`;
      });

      // Save to database
      await saveGameSession({
        gameMode,
        subject: currentSubject,
        score: score, // Current score (no retroactive points for DIFF/WRONG)
        foundItems: gameMode === 'LOGIC' ? foundItems : clickedItems, // LOGIC: typed answers, DIFF/WRONG: clicked items only
        timeRemaining: timer,
        completionStatus: 'timeout',
        logicQuestion: logicGame?.question,
        logicSolution: logicGame?.solution,
        logicTitle: logicGame?.title,
        differences: revealedDifferences,
      });
    } catch (e) {
      console.error('Error getting answers:', e);
    } finally {
      setRevealing(false);
    }
  };

  // Start Game
  const handleStartGame = async (subject: string) => {
    let topic = subject.trim();

    setLoading(true);
    setGameOver(false);
    setDifferences([]);
    setImages(null);
    setSingleImage(null);
    setLogicGame(null);
    setLogicSolution(null);
    setFoundItems([]);
    setScore(0);
    setTimer(TIMER_DURATION);
    setTimerZone('green');
    setIsTimerActive(false);
    setFeedback(null);

    try {
      if (gameMode === 'DIFF') {
        if (!topic) topic = RANDOM_THEMES[Math.floor(Math.random() * RANDOM_THEMES.length)];
        setCurrentSubject(topic);
        const data = await generateDiffGame(topic);
        setImages(data);

        // Pre-fetch bounding box answers for click detection
        try {
          const answers = await getDifferences(data.original, data.modified);
          setGameAnswers(answers);
        } catch (e) {
          console.error('Failed to pre-fetch answers:', e);
          setGameAnswers([]); // Graceful degradation - typing still works
        }
      } else if (gameMode === 'WRONG') {
        if (!topic) topic = RANDOM_THEMES[Math.floor(Math.random() * RANDOM_THEMES.length)];
        setCurrentSubject(topic);
        const data = await generateWrongGame(topic);
        setSingleImage(data.image);

        // Pre-fetch bounding box answers for click detection
        try {
          const errors = await getErrors(data.image);
          setGameAnswers(errors);
        } catch (e) {
          console.error('Failed to pre-fetch errors:', e);
          setGameAnswers([]);
        }
      } else {
        setCurrentSubject(topic || 'Logic Puzzle');
        const data = await generateLogicGame(topic);
        setLogicGame(data);
      }
      setIsTimerActive(true);
    } catch (e) {
      console.error('Error starting game:', e);
      setFeedback({ type: 'error', message: 'Failed to generate game. Please try again.' });
    } finally {
      setLoading(false);
    }
  };


  // Submit Answer - LOGIC mode only
  const handleSubmit = async (guess: string) => {
    const trimmedGuess = guess.trim();
    if (!trimmedGuess || checking || gameOver || gameMode !== 'LOGIC' || !logicGame) return;

    setChecking(true);
    setFeedback(null);

    try {
      const res = await checkLogicAnswer(logicGame.question, trimmedGuess);

      if (res && res.correct) {
        if (res.alreadyFound) {
          setFeedback({ type: 'info', message: 'Already discovered!' });
        } else {
          setScore((s) => s + 10);
          setFoundItems((prev) => [...prev, trimmedGuess]);
          setFeedback({ type: 'success', message: cleanText(res.explanation) || 'Correct answer!' });

          // End game immediately for LOGIC mode
          setGameOver(true);
          setIsTimerActive(false);
          setLogicSolution(cleanText(res.explanation));

          // Save to database
          await saveGameSession({
            gameMode: 'LOGIC',
            subject: currentSubject,
            score: score + 10,
            foundItems: [...foundItems, trimmedGuess],
            timeRemaining: timer,
            completionStatus: 'completed',
            logicQuestion: logicGame.question,
            logicSolution: cleanText(res.explanation),
            logicTitle: logicGame.title,
          });
        }
      } else {
        setFeedback({ type: 'error', message: cleanText(res?.explanation) || 'Not quite right. Try again.' });
      }
    } catch (error) {
      console.error('Submit error:', error);
      setFeedback({ type: 'error', message: 'Failed to check answer.' });
    } finally {
      setChecking(false);
    }
  };

  // Give Up
  const handleGiveUp = async () => {
    setIsTimerActive(false);
    setGameOver(true);
    setRevealing(true);

    try {
      let revealedDifferences: Difference[] = [];

      if (gameMode === 'DIFF' && images) {
        const diffs = await getDifferences(images.original, images.modified);
        setDifferences(diffs);
        revealedDifferences = diffs;
      } else if (gameMode === 'WRONG' && singleImage) {
        const errors = await getErrors(singleImage);
        setDifferences(errors);
        revealedDifferences = errors;
      } else if (gameMode === 'LOGIC' && logicGame) {
        setLogicSolution(cleanText(logicGame.solution));
      }

      // Prepare items for database storage (mode-specific)
      const clickedItems = foundIds.map(id => {
        const answer = gameAnswers.find(a => a.id === id);
        return `[Click] ${answer?.description || 'Unknown'}`;
      });

      // Save to database with given_up status
      await saveGameSession({
        gameMode,
        subject: currentSubject,
        score,
        foundItems: gameMode === 'LOGIC' ? foundItems : clickedItems, // LOGIC: typed answers, DIFF/WRONG: clicked items only
        timeRemaining: timer,
        completionStatus: 'given_up',
        logicQuestion: logicGame?.question,
        logicSolution: gameMode === 'LOGIC' ? cleanText(logicGame?.solution) : undefined,
        logicTitle: logicGame?.title,
        differences: revealedDifferences,
      });
    } catch (e) {
      console.error('Error:', e);
    } finally {
      setRevealing(false);
    }
  };

  // Play Again
  const handlePlayAgain = () => {
    setImages(null);
    setSingleImage(null);
    setLogicGame(null);
    setFoundItems([]);
    setGameOver(false);
    setScore(0);
    setDifferences([]);
    setLogicSolution(null);
    setFeedback(null);
    setTimer(TIMER_DURATION);
    setGameAnswers([]);
    setFoundIds([]);
    setLivePoints(null);
  };

  return (
    <>
      {/* Live points animation - appears near score */}
      {livePoints && (
        <div className={`fixed top-24 right-8 z-50 text-4xl font-bold animate-in zoom-in-95 fade-in duration-300 ${
          livePoints.value > 0 ? 'text-green-500' : 'text-red-500'
        }`}>
          {livePoints.value > 0 ? '+' : ''}{livePoints.value}
        </div>
      )}

      <DashboardHeader
        timer={timer}
        timerZone={timerZone}
        score={score}
        hasContent={hasContent}
        gameOver={gameOver}
        revealing={revealing}
        onHistoryClick={() => setShowHistory(true)}
        showScrollNotification={showScrollNotification}
      />
      <div className="pt-14 px-4 pb-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-120px)] pb-32">
        {/* Left: Game Area */}
        <div className="flex-1 mt-5 relative">
          {/* Toggle Button - Only show when game is active */}
          {hasContent && (
            <button
              onClick={() => setIsSidebarVisible(!isSidebarVisible)}
              className="absolute top-2 right-2 z-10 p-2 rounded-lg bg-white/80 backdrop-blur-md border border-white/20 shadow-lg hover:bg-white/90 transition-all duration-300 hover:scale-110"
              title={isSidebarVisible ? "Hide controls" : "Show controls"}
            >
              {isSidebarVisible ? (
                <ChevronRight className="w-5 h-5 text-zinc-700" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-zinc-700" />
              )}
            </button>
          )}

          <GameArea
            gameMode={gameMode}
            images={images}
            singleImage={singleImage}
            logicGame={logicGame}
            gameOver={gameOver}
            revealing={revealing}
            differences={differences}
            logicSolution={logicSolution}
            onPlayAgain={handlePlayAgain}
            gameAnswers={gameAnswers}
            foundIds={foundIds}
            foundItems={foundItems}
            onImageClick={handleImageClick}
            wrongClickMessage={wrongClickToast}
          />
        </div>

        {/* Right: Controls Sidebar */}
        <div className={`w-full lg:w-96 space-y-6 mt-10 transition-all duration-300 ${
          isSidebarVisible ? 'block' : 'hidden'
        }`}>
          <GameModeSelector
            gameMode={gameMode}
            setGameMode={setGameMode}
            disabled={loading || (hasContent && !gameOver)}
          />

          <GameControls
            gameMode={gameMode}
            loading={loading}
            hasContent={!!hasContent}
            gameOver={gameOver}
            onStartGame={handleStartGame}
            onGiveUp={handleGiveUp}
          />
        </div>
      </div>
    </div>

    {/* Sticky Bottom Input - LOGIC mode only */}
    {hasContent && !gameOver && gameMode === 'LOGIC' && (
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="lg:ml-auto lg:w-96">
            <GameResponse
              gameMode={gameMode}
              checking={checking}
              feedback={feedback}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    )}

    {/* History Modal */}
    <GameHistoryModal
      isOpen={showHistory}
      onClose={() => setShowHistory(false)}
    />
    </>
  );
}
