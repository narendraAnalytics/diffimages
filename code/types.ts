export enum ViewState {
  GAME = 'GAME',
  EDITOR = 'EDITOR',
  LIVE = 'LIVE',
}

export interface GameSession {
  originalImage: string; // base64
  modifiedImage: string; // base64
  differenceDescription: string;
  isCorrect: boolean | null;
  loading: boolean;
  score: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  isFinal?: boolean;
}

export interface AudioPacket {
    data: string; // base64
    mimeType: string;
}
