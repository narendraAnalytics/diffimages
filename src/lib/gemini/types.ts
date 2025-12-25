export type GameMode = 'DIFF' | 'WRONG' | 'LOGIC';

export interface Difference {
  id: number;
  description: string;
  box_2d: [number, number, number, number]; // ymin, xmin, ymax, xmax (0-1000)
}

export interface DiffGameData {
  original: string;
  modified: string;
}

export interface WrongGameData {
  image: string;
}

export interface LogicGameData {
  title: string;
  question: string;
  solution: string;
}

export interface CheckResponse {
  correct: boolean;
  explanation: string;
  alreadyFound?: boolean;
}
