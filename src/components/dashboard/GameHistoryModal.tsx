'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Trophy, Clock, ChevronDown, ChevronUp, Brain, Images, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GameMode } from '@/lib/gemini/types';

interface GameHistoryEntry {
  id: number;
  gameMode: GameMode;
  subject: string;
  score: number;
  totalPossible: number;
  foundCount: number;
  createdAt: string;
  endedAt: string;
  timeRemaining: number;
  completionStatus: 'timeout' | 'completed' | 'given_up';
  logicQuestion?: string;
  logicSolution?: string;
  logicTitle?: string;
  differences: Array<{
    differenceId: number;
    description: string;
    box2d: [number, number, number, number];
  }>;
  userAnswers: Array<{
    answerText: string;
    pointsAwarded: number;
    foundAt: string;
  }>;
}

interface GameHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLOR_PALETTE = [
  'bg-linear-to-br from-orange-400 to-pink-500',
  'bg-linear-to-br from-blue-400 to-indigo-600',
  'bg-linear-to-br from-emerald-400 to-teal-600',
  'bg-linear-to-br from-purple-400 to-indigo-600',
  'bg-linear-to-br from-rose-400 to-pink-600',
  'bg-linear-to-br from-amber-400 to-orange-600',
  'bg-linear-to-br from-cyan-400 to-blue-600',
  'bg-linear-to-br from-violet-400 to-purple-600',
];

export default function GameHistoryModal({ isOpen, onClose }: GameHistoryModalProps) {
  const [history, setHistory] = useState<GameHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/history');
      const data = await response.json();
      setHistory(data.sessions || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getModeIcon = (mode: GameMode) => {
    switch (mode) {
      case 'DIFF':
        return <Images className="w-5 h-5" />;
      case 'WRONG':
        return <AlertCircle className="w-5 h-5" />;
      case 'LOGIC':
        return <Brain className="w-5 h-5" />;
    }
  };

  const getModeColor = (mode: GameMode) => {
    switch (mode) {
      case 'DIFF':
        return 'from-orange-500 to-pink-500';
      case 'WRONG':
        return 'from-pink-500 to-rose-500';
      case 'LOGIC':
        return 'from-blue-500 to-purple-500';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-6 border-b border-orange-200/50 shrink-0 bg-white/80 backdrop-blur-md shadow-sm">
        <h2 className="text-zinc-800 font-bold text-sm tracking-widest uppercase flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-500" />
          Game History
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-zinc-600 hover:bg-zinc-100 rounded-full"
        >
          <X className="w-6 h-6" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-12">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto" />
                <p className="text-zinc-600 text-sm">Loading your game history...</p>
              </div>
            </div>
          ) : history.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center mb-6">
                <Trophy className="w-10 h-10 text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold text-zinc-800 mb-2">No Games Yet</h3>
              <p className="text-zinc-600 max-w-md">
                Start playing to build your game history. Your completed games will appear here!
              </p>
            </div>
          ) : (
            // History List
            <div className="space-y-4">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white/80 backdrop-blur-sm border border-orange-200/50 rounded-2xl overflow-hidden hover:border-orange-300 hover:shadow-lg transition-all"
                >
                  {/* Summary Row */}
                  <div
                    className="p-6 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        {/* Mode Badge */}
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getModeColor(entry.gameMode)} flex items-center justify-center text-white shadow-lg`}>
                          {getModeIcon(entry.gameMode)}
                        </div>

                        {/* Game Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-zinc-800 font-bold text-lg">
                              {entry.gameMode === 'LOGIC' ? entry.logicTitle || 'Logic Puzzle' : entry.subject}
                            </h3>
                            <span className="text-xs font-bold text-zinc-600 uppercase px-2 py-1 bg-zinc-100 rounded">
                              {entry.gameMode}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-zinc-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(entry.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Trophy className="w-4 h-4 text-yellow-500" />
                              {entry.score} pts
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {entry.foundCount}/{entry.totalPossible} found
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Expand Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-zinc-600 hover:text-zinc-800 hover:bg-zinc-100"
                      >
                        {expandedId === entry.id ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedId === entry.id && (
                    <div className="border-t border-orange-200/50 p-6 bg-gradient-to-br from-orange-50/50 to-pink-50/50 space-y-6 animate-in slide-in-from-top-4 duration-300">
                      {/* Logic Question & Solution */}
                      {entry.logicQuestion && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Question</h4>
                          <p className="text-zinc-800 text-lg italic font-serif">"{entry.logicQuestion}"</p>
                        </div>
                      )}

                      {entry.logicSolution && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest">Solution</h4>
                          <p className="text-zinc-700 leading-relaxed">{entry.logicSolution}</p>
                        </div>
                      )}

                      {/* Differences/Errors */}
                      {entry.differences.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-zinc-600 uppercase tracking-widest">
                            All {entry.gameMode === 'DIFF' ? 'Differences' : 'Errors'}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {entry.differences.map((diff, index) => (
                              <div
                                key={diff.differenceId}
                                className="flex gap-3 items-start p-4 bg-white/60 rounded-xl border border-orange-200/50 shadow-sm"
                              >
                                <span
                                  className={`w-8 h-8 shrink-0 ${
                                    COLOR_PALETTE[index % COLOR_PALETTE.length]
                                  } text-white rounded-lg flex items-center justify-center text-sm font-bold`}
                                >
                                  {diff.differenceId}
                                </span>
                                <p className="text-sm text-zinc-700 leading-relaxed">
                                  {diff.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* User Answers */}
                      {entry.userAnswers.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-green-600 uppercase tracking-widest">
                            Your Correct Answers
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {entry.userAnswers.map((answer, index) => (
                              <div
                                key={index}
                                className="px-3 py-2 bg-green-100 border border-green-300 rounded-lg text-green-700 text-sm font-medium"
                              >
                                {answer.answerText} (+{answer.pointsAwarded} pts)
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
