"use client";

import { useState, useEffect } from 'react';
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
import GameModeSelector from '@/components/dashboard/GameModeSelector';
import GameArea from '@/components/dashboard/GameArea';
import GameControls from '@/components/dashboard/GameControls';
import GameTimer from '@/components/dashboard/GameTimer';
import GameResponse from '@/components/dashboard/GameResponse';

const TIMER_DURATION = 15;

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

  // Results
  const [differences, setDifferences] = useState<Difference[]>([]);
  const [revealing, setRevealing] = useState(false);
  const [logicSolution, setLogicSolution] = useState<string | null>(null);

  // UI State
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const hasContent = !!(images || singleImage || logicGame);

  // Timer Logic
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

  // Handle Timeout
  const handleTimeout = async () => {
    setIsTimerActive(false);
    setGameOver(true);
    setRevealing(true);

    try {
      if (gameMode === 'DIFF' && images) {
        const diffs = await getDifferences(images.original, images.modified);
        setDifferences(diffs);
      } else if (gameMode === 'WRONG' && singleImage) {
        const errors = await getErrors(singleImage);
        setDifferences(errors);
      } else if (gameMode === 'LOGIC' && logicGame) {
        setLogicSolution(cleanText(logicGame.solution) || "Time's up! The puzzle remains unsolved.");
      }
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
    setIsTimerActive(false);
    setFeedback(null);

    try {
      if (gameMode === 'DIFF') {
        if (!topic) topic = RANDOM_THEMES[Math.floor(Math.random() * RANDOM_THEMES.length)];
        const data = await generateDiffGame(topic);
        setImages(data);
      } else if (gameMode === 'WRONG') {
        if (!topic) topic = RANDOM_THEMES[Math.floor(Math.random() * RANDOM_THEMES.length)];
        const data = await generateWrongGame(topic);
        setSingleImage(data.image);
      } else {
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

  // Submit Answer
  const handleSubmit = async (guess: string) => {
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
          setFeedback({ type: 'info', message: 'Already discovered!' });
        } else {
          const points = gameMode === 'LOGIC' ? 10 : gameMode === 'DIFF' ? 1 : 2;
          setScore((s) => s + points);
          setFoundItems((prev) => [...prev, guess]);
          setFeedback({ type: 'success', message: cleanText(res.explanation) || 'Correct answer!' });

          // End game immediately for LOGIC mode
          if (gameMode === 'LOGIC') {
            setGameOver(true);
            setIsTimerActive(false);
            setLogicSolution(cleanText(res.explanation));
          }
        }
      } else {
        setFeedback({ type: 'error', message: cleanText(res?.explanation) || 'Not quite right. Try again.' });
      }
    } catch (e) {
      console.error('Error checking answer:', e);
      setFeedback({ type: 'error', message: 'Error verifying answer. Please try again.' });
    } finally {
      setChecking(false);
    }
  };

  // Give Up
  const handleGiveUp = async () => {
    setIsTimerActive(false);
    setGameOver(true);

    if (gameMode === 'LOGIC' && logicGame) {
      setLogicSolution(cleanText(logicGame.solution));
    } else {
      handleTimeout();
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
  };

  return (
    <div className="pt-14 px-4 pb-8 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-120px)]">
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

          {hasContent && (
            <>
              <GameTimer
                timer={timer}
                score={score}
                foundItems={foundItems}
                gameMode={gameMode}
                gameOver={gameOver}
              />

              {!gameOver && (
                <GameResponse
                  gameMode={gameMode}
                  checking={checking}
                  feedback={feedback}
                  onSubmit={handleSubmit}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
