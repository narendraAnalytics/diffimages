'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db/client';
import { gameSessions, gameDifferences, userAnswers } from '@/lib/db/schema';
import { GameMode, Difference } from '@/lib/gemini/types';

export interface SaveGameSessionParams {
  gameMode: GameMode;
  subject: string;
  score: number;
  foundItems: string[];
  timeRemaining: number;
  completionStatus: 'timeout' | 'completed' | 'given_up';

  // LOGIC mode - text-based content only
  logicQuestion?: string;
  logicSolution?: string;
  logicTitle?: string;

  // Revealed answers
  differences?: Difference[];
}

export async function saveGameSession(params: SaveGameSessionParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Calculate points per item based on game mode
    const pointsPerItem = params.gameMode === 'LOGIC' ? 10 : params.gameMode === 'DIFF' ? 1 : 2;

    // Insert game session
    const [session] = await db.insert(gameSessions).values({
      userId,
      gameMode: params.gameMode,
      subject: params.subject,
      score: params.score,
      totalPossible: params.differences?.length || (params.gameMode === 'LOGIC' ? 1 : 0),
      foundCount: params.foundItems.length,
      endedAt: new Date(),
      timeRemaining: params.timeRemaining,
      completionStatus: params.completionStatus,
      logicQuestion: params.logicQuestion,
      logicSolution: params.logicSolution,
      logicTitle: params.logicTitle,
    }).returning();

    // Insert differences if applicable
    if (params.differences && params.differences.length > 0) {
      await db.insert(gameDifferences).values(
        params.differences.map(diff => ({
          sessionId: session.id,
          differenceId: diff.id,
          description: diff.description,
          box2d: diff.box_2d,
        }))
      );
    }

    // Insert user answers
    if (params.foundItems.length > 0) {
      await db.insert(userAnswers).values(
        params.foundItems.map(answer => ({
          sessionId: session.id,
          answerText: answer,
          pointsAwarded: pointsPerItem,
        }))
      );
    }

    return { success: true, sessionId: session.id };
  } catch (error) {
    console.error('Error saving game session:', error);
    return { success: false, error: 'Failed to save game session' };
  }
}
