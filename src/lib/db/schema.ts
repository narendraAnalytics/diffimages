import { pgTable, serial, text, integer, timestamp, varchar, json, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Main game sessions table
export const gameSessions = pgTable('game_sessions', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  gameMode: varchar('game_mode', { length: 10 }).notNull(), // 'DIFF' | 'WRONG' | 'LOGIC'
  subject: text('subject'), // Theme/topic of the game

  // Scoring
  score: integer('score').notNull().default(0),
  totalPossible: integer('total_possible'), // Total differences/errors in game
  foundCount: integer('found_count').notNull().default(0), // Items user found

  // Timing
  createdAt: timestamp('created_at').notNull().defaultNow(),
  endedAt: timestamp('ended_at').notNull(),
  timeRemaining: integer('time_remaining').notNull(), // Seconds left when game ended

  // Completion status
  completionStatus: varchar('completion_status', { length: 20 }).notNull(), // 'timeout' | 'completed' | 'given_up'

  // For LOGIC mode - text-based content (small size, no images)
  logicQuestion: text('logic_question'),
  logicSolution: text('logic_solution'),
  logicTitle: text('logic_title'),
}, (table) => ({
  userIdIdx: index('user_id_idx').on(table.userId),
  createdAtIdx: index('created_at_idx').on(table.createdAt),
}));

// Differences/errors revealed at game end
export const gameDifferences = pgTable('game_differences', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id').notNull().references(() => gameSessions.id, { onDelete: 'cascade' }),
  differenceId: integer('difference_id').notNull(), // 1, 2, 3, etc.
  description: text('description').notNull(),
  box2d: json('box_2d').notNull(), // [ymin, xmin, ymax, xmax] array
});

// User's correct answers during gameplay
export const userAnswers = pgTable('user_answers', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id').notNull().references(() => gameSessions.id, { onDelete: 'cascade' }),
  answerText: text('answer_text').notNull(),
  pointsAwarded: integer('points_awarded').notNull(),
  foundAt: timestamp('found_at').notNull().defaultNow(),
});

// Relations for nested queries
export const gameSessionsRelations = relations(gameSessions, ({ many }) => ({
  differences: many(gameDifferences),
  userAnswers: many(userAnswers),
}));

export const gameDifferencesRelations = relations(gameDifferences, ({ one }) => ({
  session: one(gameSessions, {
    fields: [gameDifferences.sessionId],
    references: [gameSessions.id],
  }),
}));

export const userAnswersRelations = relations(userAnswers, ({ one }) => ({
  session: one(gameSessions, {
    fields: [userAnswers.sessionId],
    references: [gameSessions.id],
  }),
}));

// TypeScript types for usage
export type GameSession = typeof gameSessions.$inferSelect;
export type NewGameSession = typeof gameSessions.$inferInsert;
export type GameDifference = typeof gameDifferences.$inferSelect;
export type NewGameDifference = typeof gameDifferences.$inferInsert;
export type UserAnswer = typeof userAnswers.$inferSelect;
export type NewUserAnswer = typeof userAnswers.$inferInsert;
