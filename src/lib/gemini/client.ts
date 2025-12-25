import { DiffGameData, WrongGameData, LogicGameData, CheckResponse, Difference } from './types';

export async function generateDiffGame(subject: string): Promise<DiffGameData> {
  const res = await fetch('/api/gemini/generate-diff', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subject }),
  });
  if (!res.ok) throw new Error('Failed to generate diff game');
  return res.json();
}

export async function generateWrongGame(subject: string): Promise<WrongGameData> {
  const res = await fetch('/api/gemini/generate-wrong', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subject }),
  });
  if (!res.ok) throw new Error('Failed to generate wrong game');
  return res.json();
}

export async function generateLogicGame(subject: string): Promise<LogicGameData> {
  const res = await fetch('/api/gemini/generate-logic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subject }),
  });
  if (!res.ok) throw new Error('Failed to generate logic game');
  return res.json();
}

export async function checkDifference(
  original: string,
  modified: string,
  userGuess: string,
  previousFound: string[]
): Promise<CheckResponse> {
  const res = await fetch('/api/gemini/check-difference', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ original, modified, userGuess, previousFound }),
  });
  if (!res.ok) throw new Error('Failed to check difference');
  return res.json();
}

export async function checkWrongness(
  image: string,
  userGuess: string,
  previousFound: string[]
): Promise<CheckResponse> {
  const res = await fetch('/api/gemini/check-wrong', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image, userGuess, previousFound }),
  });
  if (!res.ok) throw new Error('Failed to check wrong');
  return res.json();
}

export async function checkLogicAnswer(
  question: string,
  userGuess: string
): Promise<CheckResponse> {
  const res = await fetch('/api/gemini/check-logic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, userGuess }),
  });
  if (!res.ok) throw new Error('Failed to check logic answer');
  return res.json();
}

export async function getDifferences(
  original: string,
  modified: string
): Promise<Difference[]> {
  const res = await fetch('/api/gemini/get-differences', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ original, modified }),
  });
  if (!res.ok) throw new Error('Failed to get differences');
  return res.json();
}

export async function getErrors(image: string): Promise<Difference[]> {
  const res = await fetch('/api/gemini/get-errors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image }),
  });
  if (!res.ok) throw new Error('Failed to get errors');
  return res.json();
}
